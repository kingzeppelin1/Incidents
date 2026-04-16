import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IncidentsByCategory({ incidents }) {
  const data = incidents.reduce((acc, inc) => {
    const cat = inc.category || 'Other';
    const existing = acc.find(d => d.category === cat);
    if (existing) existing.count++;
    else acc.push({ category: cat, count: 1 });
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Incidents by Category</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={110} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Bar dataKey="count" fill="#475569" radius={[0, 4, 4, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}