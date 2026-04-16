import React from 'react';
import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG, SEVERITY_CONFIG, ACTION_STATUS_CONFIG, CONSEQUENCE_STATUS_CONFIG, PRIORITY_CONFIG, RISK_FACTOR_CONFIG } from '@/lib/constants';

const CONFIG_MAP = {
  status: STATUS_CONFIG,
  severity: SEVERITY_CONFIG,
  action: ACTION_STATUS_CONFIG,
  consequence: CONSEQUENCE_STATUS_CONFIG,
  priority: PRIORITY_CONFIG,
  risk: RISK_FACTOR_CONFIG,
};

export default function StatusBadge({ value, type = 'status', className = '' }) {
  if (!value) return null;
  const config = CONFIG_MAP[type]?.[value] || { color: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      {type === 'severity' && config.dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`} />
      )}
      {value}
    </span>
  );
}
