import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export default function TabEnvironment({ incident }) {
  const queryClient = useQueryClient();
  // Store environment data in incident.conditions as JSON or use flat fields
  const [env, setEnv] = useState({
    location: incident.location || '',
    asset: incident.plant || '',
    contractor: '',
    operation_type: '',
    weather: '',
    wind: '',
    sea_state: '',
    current: '',
    position: '',
    in_transit: false,
    temperature: '',
    remarks: '',
  });

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.Incident.update(incident.id, {
      location: env.location,
      plant: env.asset,
      conditions: `Weather: ${env.weather}, Wind: ${env.wind}, Sea: ${env.sea_state}, Temp: ${env.temperature}. ${env.remarks}`,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incident', incident.id] }),
  });

  const set = (field, value) => setEnv(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Record the operational and environmental conditions at the time of the incident.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>Location</Label><Input value={env.location} onChange={e => set('location', e.target.value)} className="mt-1" /></div>
        <div><Label>Asset / Vessel / Site</Label><Input value={env.asset} onChange={e => set('asset', e.target.value)} className="mt-1" /></div>
        <div><Label>Contractor / Third Party</Label><Input value={env.contractor} onChange={e => set('contractor', e.target.value)} className="mt-1" /></div>
        <div><Label>Operation Type</Label><Input value={env.operation_type} onChange={e => set('operation_type', e.target.value)} className="mt-1" /></div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs font-medium text-slate-500 uppercase mb-3">Weather & Conditions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><Label>Weather</Label><Input value={env.weather} onChange={e => set('weather', e.target.value)} className="mt-1" placeholder="e.g. Clear, Rain" /></div>
          <div><Label>Wind</Label><Input value={env.wind} onChange={e => set('wind', e.target.value)} className="mt-1" placeholder="e.g. 15 knots NW" /></div>
          <div><Label>Sea State</Label><Input value={env.sea_state} onChange={e => set('sea_state', e.target.value)} className="mt-1" placeholder="e.g. Moderate" /></div>
          <div><Label>Current</Label><Input value={env.current} onChange={e => set('current', e.target.value)} className="mt-1" /></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><Label>Position</Label><Input value={env.position} onChange={e => set('position', e.target.value)} className="mt-1" /></div>
        <div><Label>Temperature</Label><Input value={env.temperature} onChange={e => set('temperature', e.target.value)} className="mt-1" placeholder="e.g. 22°C" /></div>
        <div className="flex items-center gap-3 pt-6">
          <Switch checked={env.in_transit} onCheckedChange={v => set('in_transit', v)} />
          <Label>In Transit / Voyage</Label>
        </div>
      </div>

      <div><Label>Remarks</Label><Textarea value={env.remarks} onChange={e => set('remarks', e.target.value)} className="mt-1" rows={3} /></div>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="w-3.5 h-3.5 mr-1" /> Save Environment
        </Button>
      </div>
    </div>
  );
}