import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Mail, CheckCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';

export default function TabMessages({ incident }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', incident.id],
    queryFn: () => base44.entities.MessageLog.filter({ incident_id: String(incident.id) }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MessageLog.create({
      ...data,
      incident_id: String(incident.id),
      sent_at: new Date().toISOString(),
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['messages', incident.id] }); setShowModal(false); setForm({}); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{messages.length} message(s)</p>
        <Button size="sm" onClick={() => { setForm({ from_user: '', to_user: '', subject: '', body: '', priority: 'Normal' }); setShowModal(true); }}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Log Notification
        </Button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Sent</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">From</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">To</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Subject</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Priority</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-500">Ack</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-slate-400"><Mail className="w-5 h-5 mx-auto mb-1 text-slate-300" />No messages logged</td></tr>
            ) : messages.map(m => (
              <tr key={m.id} className="border-b border-slate-50">
                <td className="px-4 py-2.5 text-slate-500 text-xs">{m.sent_at ? format(new Date(m.sent_at), 'MMM d, HH:mm') : '—'}</td>
                <td className="px-4 py-2.5 text-slate-700">{m.from_user}</td>
                <td className="px-4 py-2.5 text-slate-700">{m.to_user}</td>
                <td className="px-4 py-2.5 font-medium">{m.subject}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-medium ${m.priority === 'High' ? 'text-red-600' : 'text-slate-500'}`}>{m.priority}</span>
                </td>
                <td className="px-4 py-2.5">
                  {m.acknowledged ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-300" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Log Notification</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>From</Label><Input value={form.from_user || ''} onChange={e => setForm(p => ({ ...p, from_user: e.target.value }))} className="mt-1" /></div>
              <div><Label>To</Label><Input value={form.to_user || ''} onChange={e => setForm(p => ({ ...p, to_user: e.target.value }))} className="mt-1" /></div>
            </div>
            <div><Label>Subject</Label><Input value={form.subject || ''} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="mt-1" /></div>
            <div><Label>Message</Label><Textarea value={form.body || ''} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} className="mt-1" rows={3} /></div>
            <div><Label>Priority</Label>
              <Select value={form.priority || 'Normal'} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button size="sm" onClick={() => createMutation.mutate(form)} disabled={!form.subject || !form.from_user || !form.to_user}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}