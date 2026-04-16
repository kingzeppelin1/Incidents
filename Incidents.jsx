import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, AlertCircle, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isBefore } from 'date-fns';
import { CATEGORY_ICONS } from '@/lib/constants';

const STATUS_FILTERS = ['All', 'Draft', 'Open', 'In Progress', 'Awaiting Review', 'Completed', 'Closed', 'Cancelled'];

export default function Incidents() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Incident.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidents'] }),
  });

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this incident?')) {
      deleteMutation.mutate(id);
    }
  };

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-updated_date', 200),
  });

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      const matchSearch = !search || inc.title?.toLowerCase().includes(search.toLowerCase()) || inc.description?.toLowerCase().includes(search.toLowerCase()) || inc.responsible?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || inc.status === statusFilter;
      const matchCategory = categoryFilter === 'All' || inc.category === categoryFilter;
      const matchSeverity = severityFilter === 'All' || inc.severity === severityFilter;
      return matchSearch && matchStatus && matchCategory && matchSeverity;
    });
  }, [incidents, search, statusFilter, categoryFilter, severityFilter]);

  const isOverdue = (inc) => inc.next_due_date && isBefore(new Date(inc.next_due_date), new Date()) && !['Closed', 'Cancelled', 'Completed'].includes(inc.status);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title="Incidents" subtitle={`${incidents.length} total incidents`}>
        <Button onClick={() => navigate('/CreateIncident')} className="bg-slate-900 hover:bg-slate-800 text-sm">
          <Plus className="w-4 h-4 mr-1.5" /> New Incident
        </Button>
      </PageHeader>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search incidents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {['Environmental', 'Health & Safety', 'Equipment Failure', 'Operational', 'Quality', 'Security', 'Near Miss', 'Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Severity</SelectItem>
                {['Critical', 'High', 'Medium', 'Low', 'Negligible'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Quick status chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500 w-8"></th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Severity</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Risk</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Responsible</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Event Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Department</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td colSpan={9} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-slate-400">No incidents found</td></tr>
                ) : (
                  filtered.map((inc) => (
                    <tr key={inc.id} onClick={() => navigate(`/Incidents/${inc.id}`)} className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        {isOverdue(inc) && <AlertCircle className="w-4 h-4 text-red-500" />}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800 max-w-[280px] truncate">{inc.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">INC-{String(inc.id).slice(-6)}</div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge value={inc.status} type="status" /></td>
                      <td className="px-4 py-3">
                        <span className="text-xs">{CATEGORY_ICONS[inc.category] || '📋'} {inc.category}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge value={inc.severity} type="severity" /></td>
                      <td className="px-4 py-3"><StatusBadge value={inc.risk_factor} type="risk" /></td>
                      <td className="px-4 py-3 text-slate-600">{inc.responsible || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{inc.event_date ? format(new Date(inc.event_date), 'MMM d, yyyy') : '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{inc.department || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={(e) => handleDelete(e, inc.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                      </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}