import WorkerDashboardPage from './WorkerDashboardPage'
import OpsDashboardPage from './OpsDashboardPage'
import InsurerDashboardPage from './InsurerDashboardPage'

function DashboardPage({ user }) {
  if (user.role === 'ops') {
    return <OpsDashboardPage user={user} />
  }

  if (user.role === 'insurer') {
    return <InsurerDashboardPage user={user} />
  }

  return <WorkerDashboardPage user={user} />
}

export default DashboardPage
