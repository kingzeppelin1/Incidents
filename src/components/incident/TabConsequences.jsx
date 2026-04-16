import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = ['Environmental Spill', 'Injury', 'Equipment Damage', 'Property Damage', 'Operational Delay', 'Nonconformance', 'Near Miss Potential', 'Other'];
const STATUSES = ['Registered', 'Assessed', 'In Progress', 'Resolved', 'Closed'];
const SEVERITIES = ['Critical', 'High', 'Medium', 'Low', 'Negligible'];

export default function TabConsequences({ incident }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const { data: consequences = [] } = useQuery({
    queryKey: ['consequences', incident.id],
    queryFn: () => base44.entities.Consequence.filter({ incident_id: String(incident.id) }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Consequence.create({ ...data, incident_id: String(incident.id) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['consequences', incident.id] }); setShowModal(false); setForm({}); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Consequence.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['consequences', incident.id] }); setSelected(null); },
  });

  const openNew = () => { setForm({ type: '', description: '', severity: 'Medium', status: 'Registered' }); setShowModal(true); };
  const openDetail = (c) => { setSelected(c); setForm({ ...c }); };

  const save = () => {
    if (selected) updateMutation.mutate({ id: selected.id, data: form });
    else createMutation.mutate(form);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{consequences.length} consequence(s) recorded</p>
        <Button size="sm" onClick={openNew}><Plus className="w-3.5 h-3.5 mr-1" /> Add Consequence</Button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Type</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Description</th>
            </tr>
          </thead>
          <tbody>
            {consequences.length === 0 ? (
              <tr><td colSpan={2} className="text-center py-8 text-slate-400">No consequences recorded</td></tr>
            ) : consequences.map(c => (
              <tr key={c.id} onClick={() => openDetail(c)} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                <td className="px-4 py-2.5 font-medium">{c.type}</td>
                <td className="px-4 py-2.5 text-slate-600 max-w-[200px] truncate">{c.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Dialog open={showModal || !!selected} onOpenChange={v => { if (!v) { setShowModal(false); setSelected(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected ? 'Edit Consequence' : 'Add Consequence'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Type</Label>
              <Select value={form.type || ''} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={3} /></div>
            <div><Label>Outcome</Label><Textarea value={form.outcome || ''} onChange={e => setForm(p => ({ ...p, outcome: e.target.value }))} className="mt-1" rows={2} placeholder="Describe the outcome or result..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Status</Label>
                <Select value={form.status || 'Registered'} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Severity</Label>
                <Select value={form.severity || 'Medium'} onValueChange={v => setForm(p => ({ ...p, severity: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{SEVERITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Owner</Label><Input value={form.owner || ''} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} className="mt-1" /></div>
              <div><Label>Target Date</Label><Input type="date" value={form.target_date || ''} onChange={e => setForm(p => ({ ...p, target_date: e.target.value }))} className="mt-1" /></div>
            </div>
            {/* Environmental-specific fields */}
            {form.type === 'Environmental Spill' && (
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <p className="text-xs font-medium text-slate-500 uppercase">Environmental Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Discharged To</Label><Input value={form.discharged_to || ''} onChange={e => setForm(p => ({ ...p, discharged_to: e.target.value }))} className="mt-1" /></div>
                  <div><Label>Spilled Material</Label><Input value={form.spilled_material || ''} onChange={e => setForm(p => ({ ...p, spilled_material: e.target.value }))} className="mt-1" /></div>
                  <div><Label>Quantity</Label><Input type="number" value={form.quantity || ''} onChange={e => setForm(p => ({ ...p, quantity: parseFloat(e.target.value) }))} className="mt-1" /></div>
                  <div><Label>Unit</Label><Input value={form.unit || ''} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className="mt-1" placeholder="e.g. liters" /></div>
                  <div><Label>Area Affected</Label><Input value={form.area_affected || ''} onChange={e => setForm(p => ({ ...p, area_affected: e.target.value }))} className="mt-1" /></div>
                  <div><Label>Contained Area</Label><Input value={form.contained_area || ''} onChange={e => setForm(p => ({ ...p, contained_area: e.target.value }))} className="mt-1" /></div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => { setShowModal(false); setSelected(null); }}>Cancel</Button>
              <Button size="sm" onClick={save} disabled={!form.type || !form.description}>{selected ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
