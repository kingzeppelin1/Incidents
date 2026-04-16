import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { History } from 'lucide-react';

export default function TabChangelog({ incident }) {
  const { data: entries = [] } = useQuery({
    queryKey: ['changelog', incident.id],
    queryFn: () => base44.entities.ChangelogEntry.filter({ incident_id: String(incident.id) }, '-created_date'),
  });

  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">System audit trail for this incident.</p>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Date/Time</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Changed By</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Field</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Old Value</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">New Value</th>

            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-400"><History className="w-5 h-5 mx-auto mb-1 text-slate-300" />No history recorded</td></tr>
            ) : entries.map(e => (
              <tr key={e.id} className="border-b border-slate-50">
                <td className="px-4 py-2.5 text-slate-500 text-xs font-mono">{e.changed_at ? format(new Date(e.changed_at), 'MMM d, HH:mm') : e.created_date ? format(new Date(e.created_date), 'MMM d, HH:mm') : '—'}</td>
                <td className="px-4 py-2.5 text-slate-700">{e.changed_by}</td>
                <td className="px-4 py-2.5 font-medium">{e.field}</td>
                <td className="px-4 py-2.5 text-red-600 text-xs">{e.old_value || '—'}</td>
                <td className="px-4 py-2.5 text-emerald-600 text-xs">{e.new_value || '—'}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}