import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const STEPS = ['Basic Info', 'Description', 'Severity & Risk', 'Consequences', 'Follow-up'];
const CATEGORIES = ['Environmental', 'Health & Safety', 'Equipment Failure', 'Operational', 'Quality', 'Security', 'Near Miss', 'Other'];
const SEVERITIES = ['Critical', 'High', 'Medium', 'Low', 'Negligible'];
const RISKS = ['Very High', 'High', 'Medium', 'Low', 'Very Low'];
const PLANTS = ['North Sea Platform Alpha', 'Offshore Vessel MV Explorer', 'South Terminal', 'Processing Plant East', 'Fabrication Yard'];
const LOCATIONS = ['Pump Station B-3, Lower Deck', 'Engine Room, Main Deck', 'Port Side Crane Zone', 'Compression Module C', 'Welding Bay 3', 'Restricted Zone C, Upper Deck', 'Chemical Storage Area D', 'Accommodation Block A, Level 3', 'Platform Leg 4, Elevation +15m', 'Tank Farm', 'Electrical Room ER-3', 'Loading Dock Access Road', 'Zone B, Production Deck', 'Turbine Hall', 'Quality Laboratory', 'Separation Module', 'Main Assembly Area', 'High Pressure Section'];
const PERSONS = ['Erik Hansen', 'Maria Johansen', 'Lars Pettersen', 'Henrik Dahl', 'Kari Olsen', 'Sven Eriksen', 'Bj\u00f8rn Madsen', 'Anders Berg', 'Ole Svendsen', 'Ingrid Larsen', 'Magnus Hauge', 'Marta Jensen', 'Petter Holm'];
const DEPARTMENTS = ['Operations', 'Maintenance', 'HSE', 'Process Safety', 'Quality Assurance', 'Marine Operations', 'Lifting Operations', 'Construction', 'Security', 'Logistics', 'Electrical', 'Instrumentation', 'Facilities', 'Process Operations', 'Storage Operations'];
const CONSEQUENCE_TYPES = ['Environmental Spill', 'Injury', 'Equipment Damage', 'Property Damage', 'Operational Delay', 'Nonconformance', 'Near Miss Potential', 'Other'];

export default function CreateIncident() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', event_date: '', plant: '', location: '', category: '', reported_by: '', responsible: '', department: '',
    description: '', immediate_cause: '', conditions: '',
    severity: 'Medium', risk_factor: 'Medium',
    consequences: [],
    root_cause_required: false, next_due_date: '', target_date: '',
    status: 'Open',
  });
  const [tempConsequence, setTempConsequence] = useState({ type: '', description: '', severity: 'Medium' });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const createMutation = useMutation({
    mutationFn: async () => {
      const { consequences, root_cause_required, ...incidentData } = form;
      incidentData.reported_date = new Date().toISOString().split('T')[0];
      const incident = await base44.entities.Incident.create(incidentData);
      // Create consequences
      for (const c of consequences) {
        await base44.entities.Consequence.create({ ...c, incident_id: String(incident.id) });
      }
      // Create root cause record
      await base44.entities.RootCause.create({ incident_id: String(incident.id), required: root_cause_required, completed: false, categories: [] });
      return incident;
    },
    onSuccess: (incident) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      navigate(`/Incidents/${incident.id}`);
    },
  });

  const addConsequence = () => {
    if (tempConsequence.type && tempConsequence.description) {
      set('consequences', [...form.consequences, { ...tempConsequence }]);
      setTempConsequence({ type: '', description: '', severity: 'Medium' });
    }
  };

  const canNext = () => {
    if (step === 0) return form.title && form.category;
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title="Create Incident" subtitle="Register a new incident">
        <Button variant="outline" size="sm" onClick={() => navigate('/Incidents')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
        </Button>
      </PageHeader>

      <div className="max-w-3xl mx-auto p-6">
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => i <= step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === step ? 'bg-slate-900 text-white' : i < step ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {i < step ? <Check className="w-3 h-3" /> : <span className="w-4 text-center">{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-200" />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Brief incident title" className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Event Date</Label><Input type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} className="mt-1" /></div>
                <div><Label>Category *</Label>
                  <Select value={form.category} onValueChange={v => set('category', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Plant / Site</Label>
                  <Select value={form.plant} onValueChange={v => set('plant', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select plant / site" /></SelectTrigger>
                    <SelectContent>{PLANTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Location</Label>
                  <Select value={form.location} onValueChange={v => set('location', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select location" /></SelectTrigger>
                    <SelectContent>{LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Reported By</Label>
                  <Select value={form.reported_by} onValueChange={v => set('reported_by', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select person" /></SelectTrigger>
                    <SelectContent>{PERSONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Responsible Person</Label>
                  <Select value={form.responsible} onValueChange={v => set('responsible', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select person" /></SelectTrigger>
                    <SelectContent>{PERSONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Department</Label>
                <Select value={form.department} onValueChange={v => set('department', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 1: Description */}
          {step === 1 && (
            <div className="space-y-4">
              <div><Label>What happened?</Label><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5} placeholder="Describe the incident in detail..." className="mt-1" /></div>
              <div><Label>Immediate Cause</Label><Textarea value={form.immediate_cause} onChange={e => set('immediate_cause', e.target.value)} rows={3} placeholder="What was the immediate cause?" className="mt-1" /></div>
              <div><Label>Conditions</Label><Textarea value={form.conditions} onChange={e => set('conditions', e.target.value)} rows={2} placeholder="Conditions at time of event" className="mt-1" /></div>
            </div>
          )}

          {/* Step 2: Severity */}
          {step === 2 && (
            <div className="space-y-4">
              <div><Label>Severity</Label>
                <Select value={form.severity} onValueChange={v => set('severity', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{SEVERITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Risk Factor</Label>
                <Select value={form.risk_factor} onValueChange={v => set('risk_factor', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{RISKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Consequences */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Add any consequences resulting from this incident.</p>
              {form.consequences.length > 0 && (
                <div className="space-y-2">
                  {form.consequences.map((c, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 text-sm">
                      <div><span className="font-medium">{c.type}</span> — {c.description}</div>
                      <button onClick={() => set('consequences', form.consequences.filter((_, j) => j !== i))} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <Select value={tempConsequence.type} onValueChange={v => setTempConsequence(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Consequence type" /></SelectTrigger>
                  <SelectContent>{CONSEQUENCE_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Input value={tempConsequence.description} onChange={e => setTempConsequence(p => ({ ...p, description: e.target.value }))} placeholder="Description" />
                <Button variant="outline" size="sm" onClick={addConsequence} disabled={!tempConsequence.type || !tempConsequence.description}>Add Consequence</Button>
              </div>
            </div>
          )}

          {/* Step 4: Follow-up */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <Label>Root Cause Analysis Required?</Label>
                <Switch checked={form.root_cause_required} onCheckedChange={v => set('root_cause_required', v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Next Due Date</Label><Input type="date" value={form.next_due_date} onChange={e => set('next_due_date', e.target.value)} className="mt-1" /></div>
                <div><Label>Target Date</Label><Input type="date" value={form.target_date} onChange={e => set('target_date', e.target.value)} className="mt-1" /></div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button size="sm" onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="bg-slate-900 hover:bg-slate-800">
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                {createMutation.isPending ? 'Creating...' : 'Create Incident'}
                <Check className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}