export const roleOptions = [
  { id: 'worker', label: 'Worker' },
  { id: 'ops', label: 'Operations' },
  { id: 'insurer', label: 'Insurer' },
]

export const roleDisplayMap = {
  worker: 'Worker',
  ops: 'Operations',
  insurer: 'Insurer',
}

export const workerCompanyOptions = [
  'Zepto',
  'Swiggy',
  'Zomato',
  'Blinkit',
  'Uber Eats',
]

export const demoUsers = [
  {
    id: 'usr-1',
    name: 'Ravi Kumar',
    email: 'ravi@gigshield.app',
    password: 'demo1234',
    role: 'worker',
    company: 'Zomato',
    workerCompanyId: 'ZOM-7782',
    location: 'Bengaluru',
  },
  {
    id: 'usr-2',
    name: 'Nisha Patel',
    email: 'ops@gigshield.app',
    password: 'demo1234',
    role: 'ops',
  },
  {
    id: 'usr-3',
    name: 'Arjun Rao',
    email: 'insurer@gigshield.app',
    password: 'demo1234',
    role: 'insurer',
  },
]

export const demoWorker = {
  name: 'Ravi Kumar',
  occupation: 'Delivery Rider',
  city: 'Bengaluru',
  zone: 'South Bengaluru',
  dailyIncome: 800,
  shift: 'Day',
  upi: 'ravi@upi',
}

export const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'INR 29/week',
    triggerCoverage: '3 core triggers',
    range: 'INR 25-35',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 'INR 49/week',
    triggerCoverage: 'All 5 triggers',
    range: 'INR 40-60',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'INR 79/week',
    triggerCoverage: 'All + priority coverage',
    range: 'INR 70-90',
  },
]

export const alerts = [
  {
    id: 'rain',
    type: 'Heavy Rain',
    status: 'Triggered',
    zone: 'Bengaluru South',
    payout: 'INR 400',
  },
  {
    id: 'heat',
    type: 'Extreme Heat',
    status: 'Safe',
    zone: 'Hyderabad Central',
    payout: 'INR 0',
  },
  {
    id: 'curfew',
    type: 'Curfew',
    status: 'No Alert',
    zone: 'Chennai North',
    payout: 'INR 0',
  },
  {
    id: 'flood',
    type: 'Flood',
    status: 'Monitoring',
    zone: 'Bengaluru East',
    payout: 'INR 500',
  },
  {
    id: 'cyclone',
    type: 'Cyclone',
    status: 'No Alert',
    zone: 'Visakhapatnam',
    payout: 'INR 0',
  },
]

export const payouts = [
  {
    id: 'pay-1',
    event: 'Heavy Rain',
    zone: 'Bengaluru South',
    amount: 'INR 400',
    status: 'Auto Approved',
  },
  {
    id: 'pay-2',
    event: 'Flood Alert',
    zone: 'Bengaluru East',
    amount: 'INR 500',
    status: 'Processing',
  },
  {
    id: 'pay-3',
    event: 'Heat Alert',
    zone: 'Hyderabad',
    amount: 'INR 300',
    status: 'Eligible',
  },
]

export const aiSnapshot = {
  workerRisk: 'Medium Risk',
  zoneSeverity: 'High',
  fraudCheck: 'Passed',
  payoutConfidence: '92%',
  decision: 'Auto Approve',
}

export const coverageByRole = {
  worker: 'Active',
  ops: 'Active',
  insurer: 'Inactive',
}
