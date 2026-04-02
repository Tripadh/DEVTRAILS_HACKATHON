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

const USE_MOCK = true
const inMemoryUsers = [...demoUsers]

function buildSession(user) {
  return {
    token: `demo-token-${user.id}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleLabel: roleDisplayMap[user.role] || user.role,
      company: user.company || null,
      workerCompanyId: user.workerCompanyId || null,
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

  const response = await apiClient.post('/auth/login', payload)
  return response.data
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

  const response = await apiClient.post('/auth/signup', payload)
  return response.data
}

export async function fetchRoleOptions() {
  if (USE_MOCK) {
    await sleep(100)
    return roleOptions
  }

  const response = await apiClient.get('/roles')
  return response.data
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

  const response = await apiClient.get('/dashboard', { params: { role } })
  return response.data
}

export async function fetchPayouts() {
  if (USE_MOCK) {
    await sleep()
    return payouts
  }

  const response = await apiClient.get('/payouts')
  return response.data
}

export async function simulateTrigger() {
  if (USE_MOCK) {
    await sleep()
    return {
      message:
        'Heavy rain detected in your zone. ₹400 payout initiated to ravi@upi',
    }
  }

  const response = await apiClient.post('/triggers/simulate')
  return response.data
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

  const response = await apiClient.post('/workers/register', payload)
  return response.data
}

export async function fetchPlans() {
  if (USE_MOCK) {
    await sleep(100)
    return plans
  }

  const response = await apiClient.get('/plans')
  return response.data
}

export async function fetchAlerts() {
  if (USE_MOCK) {
    await sleep(100)
    return alerts
  }

  const response = await apiClient.get('/alerts')
  return response.data
}

export async function fetchAiSnapshot() {
  if (USE_MOCK) {
    await sleep(100)
    return aiSnapshot
  }

  const response = await apiClient.get('/ai/summary')
  return response.data
}
