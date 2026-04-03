import {
  aiSnapshot,
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
const mockOtpChallenges = new Map()
const INR_FORMATTER = new Intl.NumberFormat('en-IN')
const LAST_LOCATION_KEY = 'gigshield_last_tracking_location'

function unwrapData(response) {
  return response?.data?.data ?? response?.data
}

function formatCurrencyInr(value = 0) {
  return `INR ${INR_FORMATTER.format(Number(value || 0))}`
}

function statusFromEventType(eventType) {
  if (eventType === 'RAIN' || eventType === 'HEAT' || eventType === 'FLOOD' || eventType === 'CYCLONE' || eventType === 'CURFEW') {
    return 'Triggered'
  }

  return 'Safe'
}

function decisionFromEventType(eventType) {
  if (eventType === 'RAIN' || eventType === 'HEAT' || eventType === 'FLOOD' || eventType === 'CYCLONE' || eventType === 'CURFEW') {
    return 'Auto Approve'
  }

  return 'Hold'
}

function decisionActionFromEventType(eventType) {
  if (eventType === 'RAIN' || eventType === 'HEAT' || eventType === 'FLOOD' || eventType === 'CYCLONE' || eventType === 'CURFEW') {
    return 'PAYOUT'
  }

  return 'HOLD'
}

function decisionReasonFromEventType(eventType) {
  if (eventType === 'RAIN') {
    return 'Heavy rain detected'
  }

  if (eventType === 'HEAT') {
    return 'Heat threshold reached'
  }

  if (eventType === 'FLOOD') {
    return 'Flood conditions detected'
  }

  if (eventType === 'CYCLONE') {
    return 'Cyclone wind threshold reached'
  }

  if (eventType === 'CURFEW') {
    return 'Curfew restriction active'
  }

  return 'No trigger conditions met'
}

function calculateRiskProfile(weather = {}) {
  const rainfall = Number(weather.rainfall || 0)
  const temperature = Number(weather.temperature || 0)

  if (rainfall > 60) {
    return {
      level: 'High',
      reason: 'Heavy rain activity detected in your area.',
    }
  }

  if (temperature > 40) {
    return {
      level: 'Medium',
      reason: 'Temperature is above the heat threshold.',
    }
  }

  return {
    level: 'Low',
    reason: 'Weather conditions are currently stable.',
  }
}

function calculateWeeklyPremium(riskLevel) {
  if (riskLevel === 'High') return 60
  if (riskLevel === 'Medium') return 45
  return 30
}

function buildPolicySummary(riskProfile, weather = {}) {
  const eventType = weather.eventType || 'NORMAL'
  const latestTriggerMessage =
    eventType === 'RAIN'
      ? 'Heavy rain detected → payout triggered'
      : eventType === 'HEAT'
        ? 'Heat threshold reached → payout triggered'
        : 'No active trigger right now'

  return {
    policy: {
      title: 'Your Insurance Policy',
      status: 'Active',
      coverageAmount: '₹800 per event',
      triggers: ['Rain', 'Heat', 'Flood', 'Cyclone', 'Curfew'],
    },
    riskProfile,
    premium: {
      weeklyAmount: `₹${calculateWeeklyPremium(riskProfile.level)}`,
      coverageSource: 'Covered by Partner',
    },
    triggerMessage: latestTriggerMessage,
  }
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
      phone: user.phone || null,
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
      phone: backendUser.phone || null,
      location: backendUser.location || null,
      platform: backendUser.platform || role,
    },
  }
}

function generateMockOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function readLastTrackingLocation() {
  try {
    const raw = window.localStorage.getItem(LAST_LOCATION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
      return parsed
    }
  } catch {
    return null
  }

  return null
}

function buildTriggerRows(weather = {}, zone = '-', now = new Date()) {
  const rainfall = Number(weather.rainfall || 0)
  const temperature = Number(weather.temperature || 0)
  const humidity = Number(weather.humidity || 0)
  const windSpeed = Number(weather.windSpeed || 0)
  const hour = now.getHours()

  const rainTriggered = weather.eventType === 'RAIN' || rainfall >= 60
  const heatTriggered = weather.eventType === 'HEAT' || temperature >= 42
  const floodTriggered = weather.eventType === 'FLOOD' || (rainfall >= 80 && humidity >= 85)
  const cycloneTriggered = weather.eventType === 'CYCLONE' || (windSpeed >= 25 && humidity >= 80)
  const curfewTriggered = weather.eventType === 'CURFEW' || hour >= 20 || hour < 5

  return [
    {
      id: 'rain',
      type: 'Heavy Rain',
      status: rainTriggered ? 'Triggered' : rainfall >= 40 ? 'Monitoring' : 'Safe',
      zone,
      payout: rainTriggered ? 'INR 400' : 'INR 0',
    },
    {
      id: 'heat',
      type: 'Extreme Heat',
      status: heatTriggered ? 'Triggered' : temperature >= 38 ? 'Monitoring' : 'Safe',
      zone,
      payout: heatTriggered ? 'INR 300' : 'INR 0',
    },
    {
      id: 'flood',
      type: 'Flood',
      status: floodTriggered ? 'Triggered' : rainfall >= 65 ? 'Monitoring' : 'Safe',
      zone,
      payout: floodTriggered ? 'INR 500' : 'INR 0',
    },
    {
      id: 'cyclone',
      type: 'Cyclone',
      status: cycloneTriggered ? 'Triggered' : windSpeed >= 18 ? 'Monitoring' : 'Safe',
      zone,
      payout: cycloneTriggered ? 'INR 600' : 'INR 0',
    },
    {
      id: 'curfew',
      type: 'Curfew',
      status: curfewTriggered ? 'Triggered' : 'Monitoring',
      zone,
      payout: curfewTriggered ? 'INR 400' : 'INR 0',
    },
  ]
}

export async function requestLoginOtp(phone) {
  if (USE_MOCK) {
    await sleep(150)

    const otp = generateMockOtp()
    mockOtpChallenges.set(phone, otp)
    console.log(`[GigShield OTP] ${phone}: ${otp} (mock mode)`)

    return {
      phone,
      expiresIn: 120,
      message: 'OTP sent successfully',
    }
  }

  const response = await apiClient.post('/auth/request-otp', { phone })
  return unwrapData(response)
}

export async function verifyLoginOtp(phone, otp) {
  if (USE_MOCK) {
    await sleep(150)

    const storedOtp = mockOtpChallenges.get(phone)

    if (!storedOtp) {
      throw new Error('OTP has expired. Please request a new one')
    }

    if (storedOtp !== otp) {
      throw new Error('Invalid OTP')
    }

    mockOtpChallenges.delete(phone)

    return buildSession({
      id: `otp-${phone}`,
      name: `Gig Worker ${String(phone).slice(-4) || '0000'}`,
      email: null,
      role: 'worker',
      phone,
      company: null,
      workerCompanyId: null,
      location: 'Bengaluru',
      platform: 'worker',
    })
  }

  const response = await apiClient.post('/auth/verify-otp', { phone, otp })
  const apiData = unwrapData(response)

  return mapAuthSession(apiData, apiData?.user?.platform || 'worker')
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

export async function fetchWorkers() {
  if (USE_MOCK) {
    await sleep(120)

    return demoUsers
      .filter((entry) => entry.role === 'worker')
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        location: entry.location,
      }))
  }

  const response = await apiClient.get('/auth/workers')
  const workers = unwrapData(response)
  return Array.isArray(workers) ? workers : []
}

export async function deleteWorker(workerId) {
  if (USE_MOCK) {
    await sleep(120)
    const index = inMemoryUsers.findIndex((entry) => String(entry.id) === String(workerId))

    if (index === -1) {
      throw new Error('Worker not found')
    }

    const [deletedWorker] = inMemoryUsers.splice(index, 1)
    return {
      id: deletedWorker.id,
      name: deletedWorker.name,
      location: deletedWorker.location,
    }
  }

  const response = await apiClient.delete(`/auth/workers/${workerId}`)
  return unwrapData(response)
}

export async function fetchDashboard(role, sessionUser = null) {
  if (USE_MOCK) {
    await sleep()

    const mockWeather = {
      temperature: 32,
      rainfall: 18,
      eventType: 'RAIN',
    }
    const mockWorker = {
      ...demoWorker,
      name: sessionUser?.name || demoWorker.name,
      city: sessionUser?.location || demoWorker.city,
      location: sessionUser?.location || demoWorker.city,
      zone: sessionUser?.location || demoWorker.zone || 'Bengaluru',
    }
    const riskProfile = calculateRiskProfile(mockWeather)
    const insuranceSummary = buildPolicySummary(riskProfile, mockWeather)

    return {
      worker: mockWorker,
      coverageStatus: coverageByRole[role] || 'Inactive',
      totalPayouts: 'INR 1,200',
      liveAlerts: alerts,
      aiDecision: aiSnapshot.decision,
      decisionAction: decisionActionFromEventType(mockWeather.eventType),
      aiDecisionReason: decisionReasonFromEventType(mockWeather.eventType),
      latestPayout: {
        event: 'Heavy Rain Disruption',
        amount: 'INR 400',
        status: 'Paid',
      },
      ...insuranceSummary,
      weather: mockWeather,
    }
  }

  const [profileResult, payoutResult, payoutHistoryResult] = await Promise.allSettled([
    apiClient.get('/auth/profile'),
    apiClient.get('/payouts/total'),
    apiClient.get('/payouts/history', { params: { limit: 1 } }),
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

  const profileData = profileResult.status === 'fulfilled' ? unwrapData(profileResult.value) : null
  const payoutData = payoutResult.status === 'fulfilled' ? unwrapData(payoutResult.value) : null
  const payoutHistory = payoutHistoryResult.status === 'fulfilled' ? unwrapData(payoutHistoryResult.value) : []
  const user = profileData?.user || {}
  const normalizedRole = normalizeRole(role || user.platform)
  const coverageStatus = coverageByRole[normalizedRole] || 'Active'
  const riskProfile = calculateRiskProfile(latestWeather || {})
  const insuranceSummary = buildPolicySummary(riskProfile, latestWeather || {})

  const latestPayoutRow = Array.isArray(payoutHistory) && payoutHistory.length > 0 ? payoutHistory[0] : null

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
    totalPayouts: formatCurrencyInr(payoutData?.totalAmount || 0),
    decisionAction: decisionActionFromEventType(latestWeather?.eventType),
    aiDecisionReason: decisionReasonFromEventType(latestWeather?.eventType),
    latestPayout: latestPayoutRow
      ? {
          event: latestPayoutRow.reason || 'Disruption',
          amount: formatCurrencyInr(latestPayoutRow.amount || 0),
          status: latestPayoutRow.status === 'paid' ? 'Paid' : 'Processing',
        }
      : {
          event: 'No payout yet',
          amount: 'INR 0',
          status: 'Pending',
        },
    ...insuranceSummary,
    liveAlerts,
    aiDecision: decisionFromEventType(latestWeather?.eventType),
    weather: latestWeather ? {
      temperature: latestWeather.temperature || 0,
      humidity: latestWeather.humidity || 0,
      rainfall: latestWeather.rainfall || 0,
      eventType: latestWeather.eventType || 'NORMAL',
    } : {
      temperature: 0,
      humidity: 0,
      rainfall: 0,
      eventType: 'NORMAL',
    },
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
      payout: true,
      amount: 400,
      riskLevel: 'medium',
      source: 'demo',
      message:
        'Heavy rain detected in your zone. INR 400 payout initiated to your account.',
    }
  }

  let workerLocation = location

  if (!workerLocation) {
    const lastTracking = readLastTrackingLocation()
    if (lastTracking) {
      workerLocation = `${lastTracking.lat},${lastTracking.lng}`
    }
  }

  if (!workerLocation) {
    const profileRes = await apiClient.get('/auth/profile')
    const profileData = unwrapData(profileRes)
    workerLocation = profileData?.user?.location
  }

  if (!workerLocation) {
    throw new Error('Location is missing for weather trigger')
  }

  const weatherRes = await apiClient.post('/weather/check', { location: workerLocation })
  const weatherResult = unwrapData(weatherRes) || weatherRes?.data || {}
  const triggerRes = await apiClient.post('/payouts/trigger')
  const result = unwrapData(triggerRes) || triggerRes?.data || {}

  if (!result.payout) {
    return {
      payout: false,
      amount: 0,
      riskLevel: result.riskLevel || 'low',
      source: weatherResult?.fallback ? 'demo' : 'live',
      message: result.message || 'No payout triggered for current weather conditions.',
    }
  }

  return {
    payout: true,
    amount: Number(result.amount || 0),
    riskLevel: result.riskLevel || 'medium',
    source: weatherResult?.fallback ? 'demo' : 'live',
    message: `Payout triggered: ${formatCurrencyInr(result.amount)} (${result.riskLevel || 'medium'} risk).`,
  }
}

export async function activateCoverage({ planName, upiId, location }) {
  if (USE_MOCK) {
    await sleep()
    return {
      payout: true,
      amount: 400,
      riskLevel: 'medium',
      message: `${planName || 'Coverage'} activated for ${upiId || 'your UPI ID'} and processed through the ML payout flow.`,
    }
  }

  let workerLocation = location

  if (!workerLocation) {
    const profileRes = await apiClient.get('/auth/profile')
    const profileData = unwrapData(profileRes)
    workerLocation = profileData?.user?.location
  }

  if (!workerLocation) {
    throw new Error('Location is missing for coverage activation')
  }

  await apiClient.post('/weather/check', { location: workerLocation })
  const triggerRes = await apiClient.post('/payouts/trigger', {
    planName,
    upiId,
  })
  const result = unwrapData(triggerRes) || triggerRes?.data || {}

  return {
    payout: Boolean(result.payout),
    amount: Number(result.amount || 0),
    riskLevel: result.riskLevel || 'low',
    message: result.message || 'Coverage activation completed.',
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
    return buildTriggerRows(
      {
        rainfall: 82,
        temperature: 44,
        humidity: 91,
        windSpeed: 32,
        eventType: 'FLOOD',
      },
      demoWorker.zone,
    )
  }

  const [latestRes, profileRes] = await Promise.all([
    apiClient.get('/weather/latest'),
    apiClient.get('/auth/profile'),
  ])

  const latestWeather = unwrapData(latestRes) || {}
  const profileData = unwrapData(profileRes)
  const zone = profileData?.user?.location || demoWorker.zone || '-'

  return buildTriggerRows(latestWeather, zone)
}

export async function fetchAiSnapshot() {
  if (USE_MOCK) {
    await sleep(100)
    return {
      ...aiSnapshot,
      workerName: demoWorker.name,
      workerLocation: demoWorker.city,
      upcomingWarnings: [
        {
          id: 'curfew',
          title: 'Upcoming Curfew Watch',
          window: '8:00 PM - 5:00 AM',
          detail: 'Keep routes light and avoid late trips in the zone.',
          severity: 'High',
        },
        {
          id: 'rain',
          title: 'Heavy Rain Alert',
          window: 'Next 2-4 hours',
          detail: 'Rainfall may cross payout threshold for the worker area.',
          severity: 'High',
        },
        {
          id: 'heat',
          title: 'Heat Watch',
          window: 'Afternoon peak',
          detail: 'Hydration and reduced exposure are recommended.',
          severity: 'Medium',
        },
      ],
      userSummary: 'Demo worker in Bengaluru with active payout coverage and moderate risk.',
    }
  }

  const [payoutRes, profileRes, weatherLogsRes] = await Promise.allSettled([
    apiClient.get('/payouts/total'),
    apiClient.get('/auth/profile'),
    apiClient.get('/weather/logs', { params: { limit: 5 } }),
  ])

  let latestWeather = null
  let profileData = null
  let weatherLogs = []

  try {
    const latestWeatherRes = await apiClient.get('/weather/latest')
    latestWeather = unwrapData(latestWeatherRes)
  } catch {
    latestWeather = null
  }

  if (profileRes.status === 'fulfilled') {
    profileData = unwrapData(profileRes.value)
  }

  if (weatherLogsRes.status === 'fulfilled') {
    weatherLogs = unwrapData(weatherLogsRes.value) || []
  }

  const payoutData = payoutRes.status === 'fulfilled' ? unwrapData(payoutRes.value) : null
  const user = profileData?.user || {}
  const eventType = latestWeather?.eventType || 'NORMAL'
  const workerLocation = user.location || demoWorker.city
  const workerName = user.name || 'Gig Worker'
  const workerRisk = eventType === 'HEAT' ? 'High Risk' : eventType === 'RAIN' ? 'Medium Risk' : 'Low Risk'

  const weatherHistoryAlerts = weatherLogs
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title:
        item.eventType === 'CURFEW'
          ? 'Curfew Watch'
          : item.eventType === 'FLOOD'
            ? 'Flood Watch'
            : item.eventType === 'CYCLONE'
              ? 'Cyclone Watch'
              : item.eventType === 'HEAT'
                ? 'Heat Watch'
                : 'Rain Watch',
      window: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recently logged',
      detail: `${item.eventType || 'NORMAL'} signal recorded for ${workerLocation}.`,
      severity: item.eventType === 'NORMAL' ? 'Low' : 'High',
    }))

  const upcomingWarnings = [
    {
      id: 'curfew',
      title: 'Upcoming Curfew Watch',
      window: '8:00 PM - 5:00 AM',
      detail: `Late trips in ${workerLocation} may be restricted during curfew hours.`,
      severity: 'High',
    },
    {
      id: 'rain',
      title: 'Rain Alert',
      window: 'Next 2-4 hours',
      detail: `Rain activity can trigger payouts for the worker zone in ${workerLocation}.`,
      severity: eventType === 'RAIN' ? 'High' : 'Medium',
    },
    {
      id: 'heat',
      title: 'Heat Watch',
      window: 'Afternoon peak',
      detail: `Heat stress may increase in ${workerLocation} during the day shift.`,
      severity: eventType === 'HEAT' ? 'High' : 'Medium',
    },
    {
      id: 'cyclone',
      title: 'Cyclone / Storm Check',
      window: 'Weather station feed',
      detail: `Watch for wind and humidity spikes around ${workerLocation}.`,
      severity: latestWeather?.eventType === 'CYCLONE' ? 'High' : 'Low',
    },
  ]

  return {
    workerName,
    workerLocation,
    userSummary: `${workerName} in ${workerLocation} has ${workerRisk.toLowerCase()} conditions and active payout monitoring.`,
    workerRisk,
    zoneSeverity: eventType === 'NORMAL' ? 'Low' : 'High',
    fraudCheck: 'Passed',
    payoutConfidence: Number(payoutData?.totalAmount || 0) > 0 ? '92%' : '68%',
    decision: decisionFromEventType(eventType),
    upcomingWarnings,
    recentSignals: weatherHistoryAlerts,
    currentAdvisory:
      eventType === 'CURFEW'
        ? 'Curfew active right now for the selected zone.'
        : eventType === 'FLOOD'
          ? 'Flood conditions require route review.'
          : eventType === 'CYCLONE'
            ? 'Cyclone warning requires immediate weather monitoring.'
            : eventType === 'HEAT'
              ? 'Heat threshold is currently elevated.'
              : eventType === 'RAIN'
                ? 'Rain activity is active for payout monitoring.'
                : 'No active disruption right now.',
  }
}
