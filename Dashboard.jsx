import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import IncidentsByCategory from '@/components/dashboard/IncidentsByCategory';
import SeverityDistribution from '@/components/dashboard/SeverityDistribution';
import RecentIncidents from '@/components/dashboard/RecentIncidents';
import { AlertTriangle, Clock, Flame, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-updated_date', 100),
  });

  const { data: actions = [] } = useQuery({
    queryKey: ['actions'],
    queryFn: () => base44.entities.CorrectiveAction.list('-created_date', 200),
  });

  const openIncidents = incidents.filter(i => !['Closed', 'Cancelled', 'Completed'].includes(i.status));
  const overdueActions = actions.filter(a => a.target_date && new Date(a.target_date) < new Date() && !['Completed', 'Verified', 'Cancelled'].includes(a.status));
  const highSeverity = incidents.filter(i => ['Critical', 'High'].includes(i.severity) && !['Closed', 'Cancelled'].includes(i.status));

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title="Dashboard" subtitle="Incident management overview" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Open Incidents" value={openIncidents.length} icon={AlertTriangle} color="bg-blue-600" subtitle="Active & in progress" />
          <StatCard title="Overdue Actions" value={overdueActions.length} icon={Clock} color="bg-amber-500" subtitle="Past target date" />
          <StatCard title="High Severity" value={highSeverity.length} icon={Flame} color="bg-red-500" subtitle="Critical & high" />
          <StatCard title="Closed This Month" value={incidents.filter(i => i.status === 'Closed' && i.closed_date && new Date(i.closed_date).getMonth() === new Date().getMonth()).length} icon={CheckCircle} color="bg-emerald-600" subtitle="Resolved incidents" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <IncidentsByCategory incidents={incidents} />
          <SeverityDistribution incidents={incidents} />
        </div>

        {/* Recent */}
        <RecentIncidents incidents={incidents} />
      </div>
    </div>
  );
}