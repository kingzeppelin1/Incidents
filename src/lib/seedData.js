const STORE_PREFIX = 'incidents_app_';
const SEED_KEY = STORE_PREFIX + '_seeded';

function setStore(entityName, data) {
  localStorage.setItem(STORE_PREFIX + entityName, JSON.stringify(data));
}

export function seedIfEmpty() {
  if (localStorage.getItem(SEED_KEY)) return;

  const now = new Date();
  const d = (daysAgo) => new Date(now.getTime() - daysAgo * 86400000).toISOString().split('T')[0];

  const incidents = [
    {
      id: 1001, title: 'Hydraulic oil leak on main deck crane', status: 'Open', category: 'Environmental',
      severity: 'High', risk_factor: 'High', plant: 'North Sea Platform Alpha',
      location: 'Port Side Crane Zone', responsible: 'Erik Hansen', reported_by: 'Maria Johansen',
      department: 'Marine Operations', event_date: d(3), reported_date: d(3),
      description: 'Hydraulic oil leak detected at crane base joint. Approximately 15 liters spilled on deck before containment.',
      immediate_cause: 'Worn hydraulic hose fitting on crane pivot assembly.',
      conditions: 'Clear weather, moderate wind', next_due_date: d(-4),
      created_date: d(3), updated_date: d(1),
    },
    {
      id: 1002, title: 'Near miss: dropped object from scaffold', status: 'In Progress', category: 'Health & Safety',
      severity: 'Critical', risk_factor: 'Very High', plant: 'Offshore Vessel MV Explorer',
      location: 'Engine Room, Main Deck', responsible: 'Lars Pettersen', reported_by: 'Henrik Dahl',
      department: 'Construction', event_date: d(5), reported_date: d(5),
      description: 'A scaffold clamp fell from 8m height, landing 2m from a worker below. No injury occurred.',
      immediate_cause: 'Improperly secured scaffold clamp.',
      conditions: 'Indoor, stable conditions', next_due_date: d(-2),
      created_date: d(5), updated_date: d(0),
    },
    {
      id: 1003, title: 'Compressor trip due to high vibration', status: 'Awaiting Review', category: 'Equipment Failure',
      severity: 'Medium', risk_factor: 'Medium', plant: 'Processing Plant East',
      location: 'Compression Module C', responsible: 'Kari Olsen', reported_by: 'Sven Eriksen',
      department: 'Operations', event_date: d(10), reported_date: d(10),
      description: 'Gas compressor C-201 tripped on high vibration alarm. Production reduced by 15% during shutdown.',
      immediate_cause: 'Bearing wear on drive shaft.',
      conditions: 'Normal operations', next_due_date: d(5),
      created_date: d(10), updated_date: d(2),
    },
    {
      id: 1004, title: 'Chemical storage labelling deficiency', status: 'Completed', category: 'Quality',
      severity: 'Low', risk_factor: 'Low', plant: 'South Terminal',
      location: 'Chemical Storage Area D', responsible: 'Anders Berg', reported_by: 'Ingrid Larsen',
      department: 'HSE', event_date: d(20), reported_date: d(20),
      description: 'Several chemical containers found without proper hazard labels in storage area D.',
      immediate_cause: 'New delivery received without full labelling check.',
      conditions: 'Routine inspection', closed_date: d(5), closed_by: 'Anders Berg',
      created_date: d(20), updated_date: d(5),
    },
    {
      id: 1005, title: 'Unauthorized vessel approach to platform', status: 'Closed', category: 'Security',
      severity: 'Medium', risk_factor: 'High', plant: 'North Sea Platform Alpha',
      location: 'Platform Leg 4, Elevation +15m', responsible: 'Ole Svendsen', reported_by: 'Magnus Hauge',
      department: 'Security', event_date: d(30), reported_date: d(30),
      description: 'Fishing vessel entered 500m exclusion zone without radio contact. Vessel redirected by standby vessel.',
      immediate_cause: 'Fishing vessel operating without AIS transponder active.',
      conditions: 'Good visibility, calm sea', closed_date: d(25), closed_by: 'Ole Svendsen',
      created_date: d(30), updated_date: d(25),
    },
    {
      id: 1006, title: 'Welding fume exposure incident', status: 'Open', category: 'Health & Safety',
      severity: 'High', risk_factor: 'High', plant: 'Fabrication Yard',
      location: 'Welding Bay 3', responsible: 'Marta Jensen', reported_by: 'Petter Holm',
      department: 'Construction', event_date: d(2), reported_date: d(2),
      description: 'Two workers reported headaches and nausea after welding operations. Ventilation system found partially blocked.',
      immediate_cause: 'Blocked extraction duct reducing ventilation capacity by 60%.',
      conditions: 'Indoor welding bay, restricted ventilation',
      created_date: d(2), updated_date: d(0),
    },
    {
      id: 1007, title: 'Pressure relief valve failed to operate during test', status: 'In Progress', category: 'Equipment Failure',
      severity: 'Critical', risk_factor: 'Very High', plant: 'Processing Plant East',
      location: 'High Pressure Section', responsible: 'Erik Hansen', reported_by: 'Lars Pettersen',
      department: 'Process Safety', event_date: d(7), reported_date: d(7),
      description: 'PSV-4501 did not lift at set pressure during scheduled function test. Valve removed for inspection.',
      immediate_cause: 'Internal corrosion buildup preventing valve stem movement.',
      conditions: 'Controlled test environment',
      created_date: d(7), updated_date: d(1),
    },
    {
      id: 1008, title: 'Slip and fall on wet deck surface', status: 'Draft', category: 'Near Miss',
      severity: 'Low', risk_factor: 'Low', plant: 'Offshore Vessel MV Explorer',
      location: 'Accommodation Block A, Level 3', responsible: 'Henrik Dahl', reported_by: 'Kari Olsen',
      department: 'Facilities', event_date: d(1), reported_date: d(1),
      description: 'Worker slipped on wet surface near accommodation entrance. No injury. Area lacked anti-slip coating.',
      immediate_cause: 'Missing anti-slip coating on deck plate.',
      conditions: 'Rain, moderate wind',
      created_date: d(1), updated_date: d(0),
    },
    {
      id: 1009, title: 'Electrical fault in transformer room', status: 'Open', category: 'Operational',
      severity: 'Medium', risk_factor: 'Medium', plant: 'South Terminal',
      location: 'Electrical Room ER-3', responsible: 'Sven Eriksen', reported_by: 'Anders Berg',
      department: 'Electrical', event_date: d(4), reported_date: d(4),
      description: 'Ground fault alarm on transformer T-3. Inspection revealed damaged cable insulation due to rodent activity.',
      immediate_cause: 'Rodent damage to cable insulation.',
      conditions: 'Normal operations',
      created_date: d(4), updated_date: d(1),
    },
    {
      id: 1010, title: 'Loading arm gasket failure', status: 'Completed', category: 'Environmental',
      severity: 'Medium', risk_factor: 'Medium', plant: 'South Terminal',
      location: 'Loading Dock Access Road', responsible: 'Magnus Hauge', reported_by: 'Ole Svendsen',
      department: 'Storage Operations', event_date: d(15), reported_date: d(15),
      description: 'Gasket failure on marine loading arm resulted in minor product spill during transfer operations.',
      immediate_cause: 'Aged gasket material beyond replacement interval.',
      conditions: 'Calm, dry', closed_date: d(8), closed_by: 'Magnus Hauge',
      created_date: d(15), updated_date: d(8),
    },
  ];

  const actions = [
    { id: 2001, incident_id: '1001', description: 'Replace all hydraulic hoses on crane assembly', action_type: 'Corrective', owner: 'Erik Hansen', department: 'Marine Operations', status: 'Open', priority: 'High', target_date: d(-1), created_date: d(3), updated_date: d(1) },
    { id: 2002, incident_id: '1001', description: 'Implement monthly hydraulic system inspection checklist', action_type: 'Preventive', owner: 'Maria Johansen', department: 'Marine Operations', status: 'In Progress', priority: 'Medium', target_date: d(10), created_date: d(3), updated_date: d(1) },
    { id: 2003, incident_id: '1002', description: 'Conduct scaffold safety briefing for all crew', action_type: 'Corrective', owner: 'Lars Pettersen', department: 'Construction', status: 'Completed', priority: 'Critical', target_date: d(0), created_date: d(5), updated_date: d(1) },
    { id: 2004, incident_id: '1003', description: 'Overhaul compressor bearings and align drive shaft', action_type: 'Corrective', owner: 'Kari Olsen', department: 'Maintenance', status: 'In Progress', priority: 'High', target_date: d(3), created_date: d(10), updated_date: d(2) },
    { id: 2005, incident_id: '1006', description: 'Clear ventilation duct blockage and verify airflow', action_type: 'Corrective', owner: 'Marta Jensen', department: 'Facilities', status: 'Open', priority: 'Critical', target_date: d(-1), created_date: d(2), updated_date: d(0) },
    { id: 2006, incident_id: '1007', description: 'Replace PSV-4501 with new certified valve', action_type: 'Corrective', owner: 'Erik Hansen', department: 'Process Safety', status: 'In Progress', priority: 'Critical', target_date: d(2), created_date: d(7), updated_date: d(1) },
    { id: 2007, incident_id: '1007', description: 'Review all PSV test records for overdue inspections', action_type: 'Investigation', owner: 'Lars Pettersen', department: 'Process Safety', status: 'Open', priority: 'High', target_date: d(5), created_date: d(7), updated_date: d(1) },
  ];

  const consequences = [
    { id: 3001, incident_id: '1001', type: 'Environmental Spill', description: 'Hydraulic oil spill on deck, approximately 15 liters', severity: 'Medium', status: 'Resolved', discharged_to: 'Deck containment', spilled_material: 'Hydraulic oil', quantity: 15, unit: 'liters', created_date: d(3), updated_date: d(1) },
    { id: 3002, incident_id: '1002', type: 'Near Miss Potential', description: 'Dropped object could have caused serious head injury', severity: 'Critical', status: 'Assessed', created_date: d(5), updated_date: d(3) },
    { id: 3003, incident_id: '1003', type: 'Operational Delay', description: 'Production reduction of 15% for 8 hours', severity: 'Medium', status: 'Registered', created_date: d(10), updated_date: d(10) },
    { id: 3004, incident_id: '1006', type: 'Injury', description: 'Two workers with mild symptoms (headache, nausea)', severity: 'High', status: 'In Progress', created_date: d(2), updated_date: d(0) },
    { id: 3005, incident_id: '1010', type: 'Environmental Spill', description: 'Minor product spill at loading dock', severity: 'Low', status: 'Resolved', discharged_to: 'Containment bund', spilled_material: 'Diesel', quantity: 5, unit: 'liters', created_date: d(15), updated_date: d(8) },
  ];

  const rootCauses = [
    { id: 4001, incident_id: '1001', required: true, completed: false, categories: ['Hardware / Equipment', 'Maintenance management'], description: '', created_date: d(3), updated_date: d(3) },
    { id: 4002, incident_id: '1002', required: true, completed: false, categories: ['Procedures', 'Training'], description: 'Scaffold erection team did not follow proper securing procedures.', created_date: d(5), updated_date: d(3) },
    { id: 4003, incident_id: '1003', required: true, completed: true, categories: ['Hardware / Equipment', 'Maintenance management'], description: 'Bearing wear not detected during last maintenance window. Vibration monitoring threshold was set too high.', created_date: d(10), updated_date: d(5) },
    { id: 4004, incident_id: '1007', required: true, completed: false, categories: ['Hardware / Equipment', 'Maintenance management', 'Procedures'], description: '', created_date: d(7), updated_date: d(7) },
  ];

  const investigations = [
    { id: 5001, incident_id: '1002', type: 'Company Investigation', status: 'In Progress', initiated_by: 'Lars Pettersen', initiated_date: d(4), report_due_date: d(-3), team_members: [{ name: 'Lars Pettersen', role: 'Investigation Leader', is_independent: false }, { name: 'Kari Olsen', role: 'HSE Representative', is_independent: false }, { name: 'Ingrid Larsen', role: 'Independent Member', is_independent: true }], summary: '', regulatory_reporting_required: false, notes: 'High potential severity - full investigation required.', created_date: d(4), updated_date: d(1) },
    { id: 5002, incident_id: '1007', type: 'Local Investigation', status: 'Initiated', initiated_by: 'Erik Hansen', initiated_date: d(6), report_due_date: d(0), team_members: [{ name: 'Erik Hansen', role: 'Investigation Leader', is_independent: false }, { name: 'Magnus Hauge', role: 'Technical Expert', is_independent: false }], summary: '', regulatory_reporting_required: true, regulatory_reported_date: d(6), notes: 'PSV failure is a reportable event.', created_date: d(6), updated_date: d(1) },
  ];

  const changelog = [
    { id: 6001, incident_id: '1001', changed_by: 'Maria Johansen', field: 'status', old_value: 'Draft', new_value: 'Open', changed_at: d(3) + 'T08:30:00Z', created_date: d(3), updated_date: d(3) },
    { id: 6002, incident_id: '1002', changed_by: 'Henrik Dahl', field: 'status', old_value: 'Open', new_value: 'In Progress', changed_at: d(4) + 'T10:15:00Z', created_date: d(4), updated_date: d(4) },
    { id: 6003, incident_id: '1002', changed_by: 'Lars Pettersen', field: 'severity', old_value: 'High', new_value: 'Critical', changed_at: d(4) + 'T14:00:00Z', created_date: d(4), updated_date: d(4) },
    { id: 6004, incident_id: '1003', changed_by: 'Kari Olsen', field: 'status', old_value: 'In Progress', new_value: 'Awaiting Review', changed_at: d(3) + 'T09:00:00Z', created_date: d(3), updated_date: d(3) },
    { id: 6005, incident_id: '1005', changed_by: 'Ole Svendsen', field: 'status', old_value: 'Completed', new_value: 'Closed', changed_at: d(25) + 'T16:00:00Z', created_date: d(25), updated_date: d(25) },
  ];

  setStore('Incident', incidents);
  setStore('CorrectiveAction', actions);
  setStore('Consequence', consequences);
  setStore('RootCause', rootCauses);
  setStore('Connection', []);
  setStore('MessageLog', []);
  setStore('ChangelogEntry', changelog);
  setStore('Investigation', investigations);

  localStorage.setItem(STORE_PREFIX + '_id_counter', '7000');
  localStorage.setItem(SEED_KEY, 'true');
}
