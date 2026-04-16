import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/shared/StatusBadge';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

export default function RecentIncidents({ incidents }) {
  const recent = [...incidents].sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date)).slice(0, 8);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Recently Updated</h3>
        <Link to="/Incidents" className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {recent.map((inc) => (
          <Link
            key={inc.id}
            to={`/Incidents/${inc.id}`}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate group-hover:text-slate-900">
                {inc.title}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {inc.category} · {inc.event_date ? format(new Date(inc.event_date), 'MMM d, yyyy') : 'No date'}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <StatusBadge value={inc.severity} type="severity" />
              <StatusBadge value={inc.status} type="status" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}