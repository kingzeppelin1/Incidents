import React from 'react';
import { format } from 'date-fns';
import { User, Calendar } from 'lucide-react';

export default function TabOwnership({ incident }) {
  const fields = [
    { label: 'Created By', value: incident.created_by, date: incident.created_date },
    { label: 'Reported By', value: incident.reported_by, date: incident.reported_date },
    { label: 'Responsible', value: incident.responsible },
    { label: 'Closed By', value: incident.closed_by, date: incident.closed_date },
    { label: 'Root Cause Set By', value: incident.root_cause_set_by },
    { label: 'Verified By', value: incident.verified_by },
    { label: 'Approved By', value: incident.approved_by },
  ];

  return (
    <div className="space-y-1">
      <p className="text-sm text-slate-500 mb-4">Accountability and ownership tracking for this incident.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((f, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-400">{f.label}</div>
              <div className="text-sm font-medium text-slate-800">{f.value || '—'}</div>
            </div>
            {f.date && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3 h-3" />
                {format(new Date(f.date), 'MMM d, yyyy')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}