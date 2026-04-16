import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Printer, FileText, Link2, Bell, Users, History, ClipboardList, Shield, Cloud, AlertTriangle, CheckSquare, Search } from 'lucide-react';
import IncidentSummary from '@/components/incident/IncidentSummary';
import TabDescription from '@/components/incident/TabDescription';
import TabConsequences from '@/components/incident/TabConsequences';
import TabRootCause from '@/components/incident/TabRootCause';
import TabActions from '@/components/incident/TabActions';
import TabEnvironment from '@/components/incident/TabEnvironment';
import TabConnections from '@/components/incident/TabConnections';
import TabMessages from '@/components/incident/TabMessages';
import TabOwnership from '@/components/incident/TabOwnership';
import TabChangelog from '@/components/incident/TabChangelog';
import TabInvestigation from '@/components/incident/TabInvestigation';

const STATUSES = ['Draft', 'Open', 'In Progress', 'Awaiting Review', 'Completed', 'Closed', 'Cancelled'];

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('description');

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: async () => {
      const list = await base44.entities.Incident.filter({ id });
      return list[0];
    },
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status) => base44.entities.Incident.update(id, {
      status,
      ...(status === 'Closed' ? { closed_date: new Date().toISOString().split('T')[0], closed_by: 'Current User' } : {}),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incident', id] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-slate-500">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <p>Incident not found</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/Incidents')}>Back to list</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Action bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/Incidents')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <span className="text-sm text-slate-400">INC-{String(incident.id).slice(-6)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={incident.status} onValueChange={(v) => statusMutation.mutate(v)}>
            <SelectTrigger className="h-8 text-xs w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="text-xs"><Printer className="w-3.5 h-3.5 mr-1" /> Print</Button>
        </div>
      </div>

      {/* Summary */}
      <IncidentSummary incident={incident} />

      {/* Tabs */}
      <div className="px-6 py-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white border border-slate-200 p-0.5 h-auto flex-wrap">
            <TabsTrigger value="description" className="text-xs gap-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><FileText className="w-3.5 h-3.5" /> Description</TabsTrigger>
            <TabsTrigger value="consequences" className="text-xs gap-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><AlertTriangle className="w-3.5 h-3.5" /> Consequences</TabsTrigger>
            <TabsTrigger value="investigation" className="text-xs gap-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><Search className="w-3.5 h-3.5" /> Investigation</TabsTrigger>
            <TabsTrigger value="rootcause" className="text-xs gap-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><Shield className="w-3.5 h-3.5" /> Root Cause</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs gap-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><CheckSquare className="w-3.5 h-3.5" /> Actions</TabsTrigger>
            <TabsTrigger value="environment" className="text-xs gap-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><Cloud className="w-3.5 h-3.5" /> Environment</TabsTrigger>
            <TabsTrigger value="connections" className="text-xs gap-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><Link2 className="w-3.5 h-3.5" /> Connections</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs gap-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><Bell className="w-3.5 h-3.5" /> RDL</TabsTrigger>
            <TabsTrigger value="ownership" className="text-xs gap-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><Users className="w-3.5 h-3.5" /> Ownership</TabsTrigger>
            <TabsTrigger value="changelog" className="text-xs gap-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><History className="w-3.5 h-3.5" /> Changelog</TabsTrigger>
          </TabsList>

          <div className="mt-4 bg-white rounded-xl border border-slate-200 p-6">
            <TabsContent value="description"><TabDescription incident={incident} /></TabsContent>
            <TabsContent value="consequences"><TabConsequences incident={incident} /></TabsContent>
            <TabsContent value="rootcause"><TabRootCause incident={incident} /></TabsContent>
            <TabsContent value="actions"><TabActions incident={incident} /></TabsContent>
            <TabsContent value="environment"><TabEnvironment incident={incident} /></TabsContent>
            <TabsContent value="connections"><TabConnections incident={incident} /></TabsContent>
            <TabsContent value="messages"><TabMessages incident={incident} /></TabsContent>
            <TabsContent value="ownership"><TabOwnership incident={incident} /></TabsContent>
            <TabsContent value="investigation"><TabInvestigation incident={incident} /></TabsContent>
            <TabsContent value="changelog"><TabChangelog incident={incident} /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
