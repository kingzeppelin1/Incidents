import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { ROOT_CAUSE_CATEGORIES } from '@/lib/constants';

export default function TabRootCause({ incident }) {
  const queryClient = useQueryClient();

  const { data: rootCauses = [] } = useQuery({
    queryKey: ['rootcause', incident.id],
    queryFn: () => base44.entities.RootCause.filter({ incident_id: String(incident.id) }),
  });

  const rc = rootCauses[0] || null;
  const [form, setForm] = useState({ required: false, completed: false, categories: [], description: '' });

  useEffect(() => {
    if (rc) setForm({ required: rc.required || false, completed: rc.completed || false, categories: rc.categories || [], description: rc.description || '' });
  }, [rc]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (rc) return base44.entities.RootCause.update(rc.id, data);
      return base44.entities.RootCause.create({ ...data, incident_id: String(incident.id) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rootcause', incident.id] }),
  });

  const toggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) ? prev.categories.filter(c => c !== cat) : [...prev.categories, cat],
    }));
  };

  return (
    <div className="space-y-6">
      {incident.immediate_cause && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs font-medium text-slate-500 mb-1">Immediate Cause</p>
          <p className="text-sm text-slate-800">{incident.immediate_cause}</p>
        </div>
      )}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <Switch checked={form.required} onCheckedChange={v => setForm(p => ({ ...p, required: v }))} />
          <Label className="text-sm">Root Cause Analysis Required</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.completed} onCheckedChange={v => setForm(p => ({ ...p, completed: v }))} />
          <Label className="text-sm">Root Cause Analysis Done</Label>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-3 block">Root Cause Categories</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ROOT_CAUSE_CATEGORIES.map(cat => (
            <label key={cat} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm">
              <Checkbox checked={form.categories.includes(cat)} onCheckedChange={() => toggleCategory(cat)} />
              <span className="text-slate-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Root Cause Description</label>
        <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={5} placeholder="Describe the root cause analysis findings..." className="text-sm" />
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
          <Save className="w-3.5 h-3.5 mr-1" /> Save Root Cause
        </Button>
      </div>
    </div>
  );
}