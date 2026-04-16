import React from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { RISK_FACTOR_CONFIG, CATEGORY_ICONS } from '@/lib/constants';
import { format } from 'date-fns';
import { Calendar, MapPin, User, Building2 } from 'lucide-react';

export default function IncidentSummary({ incident }) {
  const riskScore = RISK_FACTOR_CONFIG[incident.risk_factor]?.score || 0;

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-400">INC-{String(incident.id).slice(-6)}</span>
            <StatusBadge value={incident.status} type="status" />
            <StatusBadge value={incident.severity} type="severity" />
            {incident.risk_factor && <StatusBadge value={incident.risk_factor} type="risk" />}
          </div>
          <h1 className="text-xl font-semibold text-slate-900">{incident.title}</h1>
        </div>
        {/* Risk score */}
        {riskScore > 0 && (
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${RISK_FACTOR_CONFIG[incident.risk_factor]?.color || 'bg-slate-100'}`}>
              {riskScore}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">RISK</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-3 text-sm">
        <Field icon={Building2} label="Plant / Site" value={incident.plant} />
        <Field icon={MapPin} label="Location" value={incident.location} />
        <Field icon={User} label="Responsible Position" value={incident.responsible} />
        <Field icon={Calendar} label="Event Date" value={incident.event_date ? format(new Date(incident.event_date), 'MMM d, yyyy') : null} />
        <Field label="Category" value={incident.category ? `${CATEGORY_ICONS[incident.category] || ''} ${incident.category}` : null} />
        <Field label="Reported By" value={incident.reported_by} />

        <Field label="Conditions" value={incident.conditions} />
        <Field label="Department" value={incident.department} />
        <Field label="Next Due" value={incident.next_due_date ? format(new Date(incident.next_due_date), 'MMM d, yyyy') : null} />
        <Field label="Max. Target Date" value={incident.target_date ? format(new Date(incident.target_date), 'MMM d, yyyy') : null} />
        <Field label="Reported Date" value={incident.reported_date ? format(new Date(incident.reported_date), 'MMM d, yyyy') : null} />
        <Field label="Actual Risk" value={incident.severity} />
        <Field label="Potential Risk" value={incident.risk_factor} />
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-slate-400 text-xs mb-0.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </div>
      <div className="text-slate-700 font-medium text-xs">{value || '\u2014'}</div>
    </div>
  );
}
