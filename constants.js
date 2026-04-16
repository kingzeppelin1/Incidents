export const SEVERITY_CONFIG = {
  Critical: { color: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
  High: { color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  Medium: { color: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  Low: { color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  Negligible: { color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
};

export const STATUS_CONFIG = {
  Draft: { color: 'bg-slate-100 text-slate-700 border-slate-200' },
  Open: { color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'In Progress': { color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  'Awaiting Review': { color: 'bg-amber-100 text-amber-800 border-amber-200' },
  Completed: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  Closed: { color: 'bg-slate-100 text-slate-600 border-slate-200' },
  Cancelled: { color: 'bg-red-50 text-red-600 border-red-200' },
};

export const ACTION_STATUS_CONFIG = {
  Open: { color: 'bg-blue-100 text-blue-800' },
  'In Progress': { color: 'bg-indigo-100 text-indigo-800' },
  Waiting: { color: 'bg-amber-100 text-amber-800' },
  Completed: { color: 'bg-emerald-100 text-emerald-800' },
  Verified: { color: 'bg-teal-100 text-teal-800' },
  Cancelled: { color: 'bg-red-50 text-red-600' },
};

export const CONSEQUENCE_STATUS_CONFIG = {
  Registered: { color: 'bg-slate-100 text-slate-700' },
  Assessed: { color: 'bg-blue-100 text-blue-800' },
  'In Progress': { color: 'bg-indigo-100 text-indigo-800' },
  Resolved: { color: 'bg-emerald-100 text-emerald-800' },
  Closed: { color: 'bg-slate-100 text-slate-600' },
};

export const PRIORITY_CONFIG = {
  Critical: { color: 'bg-red-100 text-red-800' },
  High: { color: 'bg-orange-100 text-orange-800' },
  Medium: { color: 'bg-amber-100 text-amber-800' },
  Low: { color: 'bg-blue-100 text-blue-800' },
};

export const CATEGORY_ICONS = {
  Environmental: '🌿',
  'Health & Safety': '⚕️',
  'Equipment Failure': '⚙️',
  Operational: '🏭',
  Quality: '✅',
  Security: '🔒',
  'Near Miss': '⚠️',
  Other: '📋',
};

export const ROOT_CAUSE_CATEGORIES = [
  'Communication',
  'Defense / Barrier failure',
  'Design',
  'Error enforcing conditions',
  'Hardware / Equipment',
  'Housekeeping',
  'Incompatible goals',
  'Maintenance management',
  'Organization',
  'Procedures',
  'Training',
  'Human factors',
  'External factors',
  'Other',
];

export const RISK_FACTOR_CONFIG = {
  'Very High': { color: 'bg-red-500 text-white', score: 5 },
  High: { color: 'bg-orange-500 text-white', score: 4 },
  Medium: { color: 'bg-amber-500 text-white', score: 3 },
  Low: { color: 'bg-blue-500 text-white', score: 2 },
  'Very Low': { color: 'bg-slate-400 text-white', score: 1 },
};