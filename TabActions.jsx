import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ROOT_CAUSE_CATEGORIES } from '@/lib/constants';
import { format } from 'date-fns';

const ACTION_TYPES = ['Corrective', 'Preventive', 'Improvement', 'Investigation', 'Other'];
const STATUSES = ['Open', 'In Progress', 'Waiting', 'Completed', 'Verified', 'Cancelled'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

export default function TabActions({ incident }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const { data: actions = [] } = useQuery({
    queryKey: ['actions', incident.id],
    queryFn: () => base44.entities.CorrectiveAction.filter({ incident_id: String(incident.id) }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CorrectiveAction.create({ ...data, incident_id: String(incident.id) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['actions', incident.id] }); setShowModal(false); setForm({}); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CorrectiveAction.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['actions', incident.id] }); setSelected(null); },
  });

  const openNew = () => { setForm({ description: '', action_type: 'Corrective', owner: '', status: 'Open', priority: 'Medium', department: '', target_date: '' }); setShowModal(true); };
  const openDetail = (a) => { setSelected(a); setForm({ ...a }); };
  const save = () => { if (selected) updateMutation.mutate({ id: selected.id, data: form }); else createMutation.mutate(form); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{actions.length} action(s)</p>
        <Button size="sm" onClick={openNew}><Plus className="w-3.5 h-3.5 mr-1" /> Add Action</Button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Description</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Type</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Owner</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Priority</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Target Date</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Target</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {actions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-slate-400">No actions yet</td></tr>
            ) : actions.map(a => (
              <tr key={a.id} onClick={() => openDetail(a)} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                <td className="px-4 py-2.5 font-medium max-w-[250px] truncate">{a.description}</td>
                <td className="px-4 py-2.5 text-slate-600">{a.action_type}</td>
                <td className="px-4 py-2.5 text-slate-600">{a.owner || '—'}</td>
                <td className="px-4 py-2.5"><StatusBadge value={a.priority} type="priority" /></td>
                <td className="px-4 py-2.5 text-slate-500">{a.target_date ? format(new Date(a.target_date), 'MMM d, yyyy') : '—'}</td>
                <td className="px-4 py-2.5 text-slate-600 max-w-[200px]">{a.target_categories?.length ? a.target_categories.join(', ') : '—'}</td>
                <td className="px-4 py-2.5"><StatusBadge value={a.status} type="action" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showModal || !!selected} onOpenChange={v => { if (!v) { setShowModal(false); setSelected(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected ? 'Edit Action' : 'New Corrective Action'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Description</Label><Textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label>
                <Select value={form.action_type || 'Corrective'} onValueChange={v => setForm(p => ({ ...p, action_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{ACTION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Priority</Label>
                <Select value={form.priority || 'Medium'} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Owner</Label><Input value={form.owner || ''} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} className="mt-1" /></div>
              <div><Label>Department</Label><Input value={form.department || ''} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Target Date</Label><Input type="date" value={form.target_date || ''} onChange={e => setForm(p => ({ ...p, target_date: e.target.value }))} className="mt-1" /></div>
              <div><Label>Status</Label>
                <Select value={form.status || 'Open'} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Target (Root Cause Categories)</Label>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {ROOT_CAUSE_CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer text-sm">
                    <Checkbox
                      checked={(form.target_categories || []).includes(cat)}
                      onCheckedChange={() => {
                        const cats = form.target_categories || [];
                        setForm(p => ({ ...p, target_categories: cats.includes(cat) ? cats.filter(c => c !== cat) : [...cats, cat] }));
                      }}
                    />
                    <span className="text-slate-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            {selected && (
              <>
                <div><Label>Completion Note</Label><Textarea value={form.completion_note || ''} onChange={e => setForm(p => ({ ...p, completion_note: e.target.value }))} className="mt-1" rows={2} /></div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.linked_to_root_cause || false} onCheckedChange={v => setForm(p => ({ ...p, linked_to_root_cause: v }))} />
                  <Label className="text-sm">Linked to root cause</Label>
                </div>
                <div><Label>Work Order Ref</Label><Input value={form.work_order_ref || ''} onChange={e => setForm(p => ({ ...p, work_order_ref: e.target.value }))} className="mt-1" /></div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => { setShowModal(false); setSelected(null); }}>Cancel</Button>
              <Button size="sm" onClick={save} disabled={!form.description || !form.owner}>{selected ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}