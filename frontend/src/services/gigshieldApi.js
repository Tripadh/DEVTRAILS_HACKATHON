import {
  aiSnapshot,
  alerts,
  coverageByRole,
  demoUsers,
  demoWorker,
  payouts,
  plans,
  roleDisplayMap,
  roleOptions,
} from '../data/mockData'
import apiClient from './apiClient'

const sleep = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const inMemoryUsers = [...demoUsers]
const INR_FORMATTER = new Intl.NumberFormat('en-IN')

function unwrapData(response) {
  return response?.data?.data ?? response?.data
}

function formatCurrencyInr(value = 0) {
  return `INR ${INR_FORMATTER.format(Number(value || 0))}`
}

function statusFromEventType(eventType) {
  if (eventType === 'RAIN' || eventType === 'HEAT') {
    return 'Triggered'
  }

  return 'Safe'
}

function decisionFromEventType(eventType) {
  if (eventType === 'RAIN' || eventType === 'HEAT') {
    return 'Auto Approve'
  }

  return 'Hold'
}

function normalizeRole(roleOrPlatform) {
  const value = String(roleOrPlatform || '').toLowerCase()

  if (value === 'operations') {
    return 'ops'
  }

  if (value === 'insurance') {
    return 'insurer'
  }

  if (roleDisplayMap[value]) {
    return value
  }

  return 'worker'
}

function buildSession(user, token = null) {
  const normalizedRole = normalizeRole(user.role || user.platform)

  return {
    token: token || `demo-token-${user.id}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizedRole,
      roleLabel: roleDisplayMap[normalizedRole] || normalizedRole,
      company: user.company || null,
      workerCompanyId: user.workerCompanyId || null,
      location: user.location || null,
      platform: user.platform || normalizedRole,
    },
  }
}

function mapAuthSession(apiData, fallbackRole = 'worker') {
  const role = normalizeRole(fallbackRole || apiData?.user?.platform)
  const backendUser = apiData?.user || {}

  return {
    token: apiData?.token,
    user: {
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      role,
      roleLabel: roleDisplayMap[role] || role,
      company: null,
      workerCompanyId: null,
      location: backendUser.location || null,
      platform: backendUser.platform || role,
    },
  }
}

export async function loginUser(payload) {
  if (USE_MOCK) {
    await sleep()

    const user = inMemoryUsers.find(
      (entry) =>
        entry.email.toLowerCase() === payload.email.toLowerCase() &&
        entry.password === payload.password,
    )

    if (!user) {
      throw new Error('Invalid email or password')
    }

    if (user.role !== payload.role) {
      throw new Error('Selected role does not match your account role')
    }

    return buildSession(user)
  }

  const response = await apiClient.post('/auth/login', {
    email: payload.email,
    password: payload.password,
  })
  const apiData = unwrapData(response)

  return mapAuthSession(apiData, payload.role)
}

export async function signupUser(payload) {
  if (USE_MOCK) {
    await sleep()

    const emailExists = inMemoryUsers.some(
      (entry) => entry.email.toLowerCase() === payload.email.toLowerCase(),
    )

    if (emailExists) {
      throw new Error('Account already exists for this email')
    }

    if (payload.role === 'worker') {
      if (!payload.company) {
        throw new Error('Please select worker company')
      }

      if (!payload.workerCompanyId) {
        throw new Error('Please enter company worker ID')
      }

      const workerIdExists = inMemoryUsers.some(
        (entry) =>
          entry.role === 'worker' &&
          entry.company === payload.company &&
          entry.workerCompanyId === payload.workerCompanyId,
      )

      if (workerIdExists) {
        throw new Error('This company worker ID is already mapped')
      }
    }

    const user = {
      id: `usr-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      company: payload.role === 'worker' ? payload.company : null,
      workerCompanyId:
        payload.role === 'worker' ? payload.workerCompanyId : null,
    }

    inMemoryUsers.push(user)
    return buildSession(user)
  }

  const response = await apiClient.post('/auth/register', {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    location: payload.location || payload.company || 'Bengaluru',
    platform: normalizeRole(payload.role || payload.platform),
  })
  const apiData = unwrapData(response)

  return mapAuthSession(apiData, payload.role)
}

export async function fetchRoleOptions() {
  if (USE_MOCK) {
    await sleep(100)
  }

  return roleOptions
}

export async function fetchDashboard(role) {
  if (USE_MOCK) {
    await sleep()

    return {
      worker: demoWorker,
      coverageStatus: coverageByRole[role] || 'Inactive',
      totalPayouts: 'INR 1,200',
      liveAlerts: alerts,
      aiDecision: aiSnapshot.decision,
    }
  }

  const [profileRes, payoutRes] = await Promise.all([
    apiClient.get('/auth/profile'),
    apiClient.get('/payouts/total'),
  ])

  let latestWeather = null
  let weatherLogs = []

  try {
    const latestRes = await apiClient.get('/weather/latest')
    latestWeather = unwrapData(latestRes)
  } catch {
    latestWeather = null
  }

  try {
    const logsRes = await apiClient.get('/weather/logs', { params: { limit: 6 } })
    weatherLogs = unwrapData(logsRes) || []
  } catch {
    weatherLogs = []
  }

  const profileData = unwrapData(profileRes)
  const payoutData = unwrapData(payoutRes)
  const user = profileData?.user || {}
  const normalizedRole = normalizeRole(role || user.platform)
  const coverageStatus = coverageByRole[normalizedRole] || 'Active'

  const liveAlerts = weatherLogs.map((item) => ({
    id: item.id,
    type: item.eventType,
    status: statusFromEventType(item.eventType),
    zone: user.location || '-',
    payout: item.eventType === 'NORMAL' ? 'INR 0' : 'INR 400',
  }))

  return {
    worker: {
      name: user.name || 'Gig Worker',
      zone: user.location || '-',
    },
    coverageStatus,
    totalPayouts: formatCurrencyInr(payoutData?.totalAmount),
    liveAlerts,
    aiDecision: decisionFromEventType(latestWeather?.eventType),
  }
}

export async function fetchPayouts() {
  if (USE_MOCK) {
    await sleep()
    return payouts
  }

  const [historyRes, profileRes] = await Promise.all([
    apiClient.get('/payouts/history'),
    apiClient.get('/auth/profile'),
  ])
  const payoutRows = unwrapData(historyRes) || []
  const profileData = unwrapData(profileRes)
  const zone = profileData?.user?.location || '-'

  return payoutRows.map((item) => ({
    id: item.id,
    event: item.reason || 'Disruption',
    zone,
    amount: formatCurrencyInr(item.amount),
    status: item.status === 'paid' ? 'Auto Approved' : 'Processing',
  }))
}

export async function simulateTrigger(location) {
  if (USE_MOCK) {
    await sleep()
    return {
      message:
        'Heavy rain detected in your zone. INR 400 payout initiated to your account.',
    }
  }

  let workerLocation = location

  if (!workerLocation) {
    const profileRes = await apiClient.get('/auth/profile')
    const profileData = unwrapData(profileRes)
    workerLocation = profileData?.user?.location
  }

  if (!workerLocation) {
    throw new Error('Location is missing for weather trigger')
  }

  await apiClient.post('/weather/check', { location: workerLocation })
  const triggerRes = await apiClient.post('/payouts/trigger')
  const result = unwrapData(triggerRes) || triggerRes?.data || {}

  if (!result.payout) {
    return {
      message: result.message || 'No payout triggered for current weather conditions.',
    }
  }

  return {
    message: `Payout triggered: ${formatCurrencyInr(result.amount)} (${result.riskLevel || 'medium'} risk).`,
  }
}

export async function registerWorker(payload) {
  if (USE_MOCK) {
    await sleep()
    return {
      success: true,
      message: 'Worker successfully onboarded',
      data: payload,
    }
  }

  const response = await apiClient.post('/auth/register', {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    location: payload.location,
    platform: normalizeRole(payload.platform || 'worker'),
  })

  const responseData = unwrapData(response)
  return {
    success: true,
    message: 'Worker successfully onboarded',
    data: responseData?.user,
  }
}

export async function fetchPlans() {
  if (USE_MOCK) {
    await sleep(100)
    return plans
  }

  return plans
}

export async function fetchAlerts() {
  if (USE_MOCK) {
    await sleep(100)
    return alerts
  }

  const [logsRes, profileRes] = await Promise.all([
    apiClient.get('/weather/logs', { params: { limit: 20 } }),
    apiClient.get('/auth/profile'),
  ])

  const logs = unwrapData(logsRes) || []
  const profileData = unwrapData(profileRes)
  const zone = profileData?.user?.location || '-'

  return logs.map((item) => ({
    id: item.id,
    type: item.eventType,
    status: statusFromEventType(item.eventType),
    zone,
    payout: item.eventType === 'NORMAL' ? 'INR 0' : 'INR 400',
  }))
}

export async function fetchAiSnapshot() {
  if (USE_MOCK) {
    await sleep(100)
    return aiSnapshot
  }

  const payoutRes = await apiClient.get('/payouts/total')
  let latestWeather = null

  try {
    const latestWeatherRes = await apiClient.get('/weather/latest')
    latestWeather = unwrapData(latestWeatherRes)
  } catch {
    latestWeather = null
  }

  const payoutData = unwrapData(payoutRes)
  const eventType = latestWeather?.eventType || 'NORMAL'

  return {
    workerRisk: eventType === 'HEAT' ? 'High Risk' : eventType === 'RAIN' ? 'Medium Risk' : 'Low Risk',
    zoneSeverity: eventType === 'NORMAL' ? 'Low' : 'High',
    fraudCheck: 'Passed',
    payoutConfidence: Number(payoutData?.totalAmount || 0) > 0 ? '92%' : '68%',
    decision: decisionFromEventType(eventType),
  }
}
