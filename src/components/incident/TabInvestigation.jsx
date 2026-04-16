import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/shared/StatusBadge';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = ['Local Investigation', 'Company Investigation'];
const STATUSES = ['Initiated', 'In Progress', 'Report Pending', 'Report Sent', 'Completed', 'Cancelled'];
const PERSONS = ['Erik Hansen', 'Maria Johansen', 'Lars Pettersen', 'Henrik Dahl', 'Kari Olsen', 'Sven Eriksen', 'Bj\u00f8rn Madsen', 'Anders Berg', 'Ole Svendsen', 'Ingrid Larsen', 'Magnus Hauge', 'Marta Jensen', 'Petter Holm'];
const TEAM_ROLES = ['Investigation Leader', 'HSE Representative', 'Technical Expert', 'Operations Representative', 'Independent Member', 'Observer'];

const emptyForm = () => ({
  type: '',
  status: 'Initiated',
  initiated_by: '',
  initiated_date: new Date().toISOString().split('T')[0],
  report_due_date: '',
  report_sent_date: '',
  team_members: [],
  summary: '',
  report_url: '',
  regulatory_reporting_required: false,
  regulatory_reported_date: '',
  notes: '',
});

export default function TabInvestigation({ incident }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [newMember, setNewMember] = useState({ name: '', role: '', is_independent: false });

  const { data: investigations = [] } = useQuery({
    queryKey: ['investigations', incident.id],
    queryFn: () => base44.entities.Investigation.filter({ incident_id: String(incident.id) }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Investigation.create({ ...data, incident_id: String(incident.id) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['investigations', incident.id] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Investigation.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['investigations', incident.id] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Investigation.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['investigations', incident.id] }),
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const openNew = () => { setForm(emptyForm()); setSelected(null); setShowModal(true); };
  const openEdit = (inv) => { setForm({ ...inv }); setSelected(inv); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setSelected(null); };

  const save = () => {
    if (selected) updateMutation.mutate({ id: selected.id, data: form });
    else createMutation.mutate(form);
  };

  const addMember = () => {
    if (newMember.name && newMember.role) {
      set('team_members', [...(form.team_members || []), { ...newMember }]);
      setNewMember({ name: '', role: '', is_independent: false });
    }
  };

  const removeMember = (i) => set('team_members', form.team_members.filter((_, idx) => idx !== i));

  const hasIndependent = (members) => (members || []).some(m => m.is_independent);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-slate-500">{investigations.length} investigation(s) registered</p>
          {investigations.length > 0 && !investigations.some(inv => (inv.team_members || []).some(m => m.is_independent)) && (
            <p className="text-xs text-amber-600 mt-0.5">\u26A0 No independent member on any investigation team</p>
          )}
        </div>
        <Button size="sm" onClick={openNew}><Plus className="w-3.5 h-3.5 mr-1" /> Initiate Investigation</Button>
      </div>

      {investigations.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-sm">No investigations initiated for this incident</p>
          <p className="text-xs mt-1">Incidents with potential severity level 3+ should be investigated</p>
        </div>
      ) : (
        <div className="space-y-3">
          {investigations.map(inv => (
            <div
              key={inv.id}
              onClick={() => openEdit(inv)}
              className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{inv.type}</span>
                    <StatusBadge value={inv.status} type="investigation" />
                    {inv.regulatory_reporting_required && (
                      <span className="text-xs bg-red-50 text-red-700 border border-red-200 rounded px-1.5 py-0.5">Regulatory</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Initiated by {inv.initiated_by || '\u2014'} \u00B7 {inv.initiated_date ? format(new Date(inv.initiated_date), 'MMM d, yyyy') : '\u2014'}
                    {inv.report_due_date && ` \u00B7 Report due ${format(new Date(inv.report_due_date), 'MMM d, yyyy')}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{(inv.team_members || []).length} member(s)</span>
                  {!hasIndependent(inv.team_members) && (
                    <span className="text-amber-600">No independent member</span>
                  )}
                </div>
              </div>
              {inv.summary && <p className="text-xs text-slate-600 mt-2 line-clamp-2">{inv.summary}</p>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={v => { if (!v) closeModal(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? 'Edit Investigation' : 'Initiate Investigation'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Type & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type *</Label>
                <Select value={form.type || ''} onValueChange={v => set('type', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Status</Label>
                <Select value={form.status || 'Initiated'} onValueChange={v => set('status', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Initiated by & dates */}
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Initiated By</Label>
                <Select value={form.initiated_by || ''} onValueChange={v => set('initiated_by', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select person" /></SelectTrigger>
                  <SelectContent>{PERSONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Initiated Date</Label><Input type="date" value={form.initiated_date || ''} onChange={e => set('initiated_date', e.target.value)} className="mt-1" /></div>
              <div><Label>Report Due Date</Label><Input type="date" value={form.report_due_date || ''} onChange={e => set('report_due_date', e.target.value)} className="mt-1" /></div>
            </div>

            {/* Team members */}
            <div className="border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label>Investigation Team</Label>
                {!hasIndependent(form.team_members) && form.team_members?.length > 0 && (
                  <span className="text-xs text-amber-600">\u26A0 Add at least one independent member</span>
                )}
              </div>
              {(form.team_members || []).map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-slate-50 rounded px-2 py-1.5">
                  <span className="font-medium">{m.name}</span>
                  <span className="text-slate-500">\u00B7</span>
                  <span className="text-slate-500">{m.role}</span>
                  {m.is_independent && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-1">Independent</span>}
                  <button onClick={() => removeMember(i)} className="ml-auto text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <div className="flex items-end gap-2 pt-1">
                <div className="flex-1">
                  <Select value={newMember.name} onValueChange={v => setNewMember(p => ({ ...p, name: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Name" /></SelectTrigger>
                    <SelectContent>{PERSONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={newMember.role} onValueChange={v => setNewMember(p => ({ ...p, role: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Role" /></SelectTrigger>
                    <SelectContent>{TEAM_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                  <Switch checked={newMember.is_independent} onCheckedChange={v => setNewMember(p => ({ ...p, is_independent: v }))} />
                  Independent
                </div>
                <Button variant="outline" size="sm" onClick={addMember} disabled={!newMember.name || !newMember.role}><UserPlus className="w-3.5 h-3.5" /></Button>
              </div>
            </div>

            {/* Summary */}
            <div><Label>Summary / Findings</Label><Textarea value={form.summary || ''} onChange={e => set('summary', e.target.value)} rows={3} className="mt-1" placeholder="Key findings and conclusions (use roles/IP instead of names)..." /></div>

            {/* Report */}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Report URL</Label><Input value={form.report_url || ''} onChange={e => set('report_url', e.target.value)} className="mt-1" placeholder="Link to report document" /></div>
              <div><Label>Report Sent Date</Label><Input type="date" value={form.report_sent_date || ''} onChange={e => set('report_sent_date', e.target.value)} className="mt-1" /></div>
            </div>

            {/* Regulatory */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <Label>Regulatory Reporting Required?</Label>
                <p className="text-xs text-slate-500 mt-0.5">Must be reported to authorities (e.g. Sj\u00F8fartsdirektoratet)</p>
              </div>
              <Switch checked={!!form.regulatory_reporting_required} onCheckedChange={v => set('regulatory_reporting_required', v)} />
            </div>
            {form.regulatory_reporting_required && (
              <div><Label>Regulatory Reported Date</Label><Input type="date" value={form.regulatory_reported_date || ''} onChange={e => set('regulatory_reported_date', e.target.value)} className="mt-1" /></div>
            )}

            {/* Notes */}
            <div><Label>Notes</Label><Textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2} className="mt-1" /></div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {selected && (
                <Button variant="destructive" size="sm" onClick={() => { deleteMutation.mutate(selected.id); closeModal(); }}>Delete</Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={closeModal}>Cancel</Button>
                <Button size="sm" onClick={save} disabled={!form.type || createMutation.isPending || updateMutation.isPending}>
                  {selected ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
