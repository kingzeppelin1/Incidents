import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Link2 } from 'lucide-react';
import { format } from 'date-fns';

const OBJECT_TYPES = ['Work Order', 'Material', 'Document', 'Purchase Order', 'Work History', 'Related Incident', 'Asset', 'Audit Finding', 'Permit'];

export default function TabConnections({ incident }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});

  const { data: connections = [] } = useQuery({
    queryKey: ['connections', incident.id],
    queryFn: () => base44.entities.Connection.filter({ incident_id: String(incident.id) }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Connection.create({ ...data, incident_id: String(incident.id) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['connections', incident.id] }); setShowModal(false); setForm({}); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{connections.length} linked object(s)</p>
        <Button size="sm" onClick={() => { setForm({ object_type: '', reference_id: '', description: '', owner: '' }); setShowModal(true); }}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Link Object
        </Button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Type</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Reference ID</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Description</th>
            </tr>
          </thead>
          <tbody>
            {connections.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8 text-slate-400"><Link2 className="w-5 h-5 mx-auto mb-1 text-slate-300" />No linked objects</td></tr>
            ) : connections.map(c => (
              <tr key={c.id} className="border-b border-slate-50">
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">{c.object_type}</span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{c.reference_id}</td>
                <td className="px-4 py-2.5 text-slate-600">{c.description || '\u2014'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Link Object</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Object Type</Label>
              <Select value={form.object_type || ''} onValueChange={v => setForm(p => ({ ...p, object_type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{OBJECT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Reference ID</Label><Input value={form.reference_id || ''} onChange={e => setForm(p => ({ ...p, reference_id: e.target.value }))} className="mt-1" placeholder="e.g. WO-12345" /></div>
            <div><Label>Description</Label><Input value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1" /></div>
            <div><Label>Owner</Label><Input value={form.owner || ''} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} className="mt-1" /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button size="sm" onClick={() => createMutation.mutate(form)} disabled={!form.object_type || !form.reference_id}>Create Link</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
