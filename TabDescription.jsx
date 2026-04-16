import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Plus, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function TabDescription({ incident }) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState(incident.description || '');
  const [comments, setComments] = useState(incident.comments || '');
  const [newNote, setNewNote] = useState('');

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Incident.update(incident.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incident', incident.id] }),
  });

  const addNote = () => {
    if (!newNote.trim()) return;
    const notes = [...(incident.notes || []), { text: newNote, author: 'Current User', timestamp: new Date().toISOString() }];
    saveMutation.mutate({ notes });
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Incident Description</label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} placeholder="Describe what happened..." className="text-sm" />
        <div className="mt-2 flex justify-end">
          <Button size="sm" variant="outline" onClick={() => saveMutation.mutate({ description })} disabled={saveMutation.isPending}>
            <Save className="w-3.5 h-3.5 mr-1" /> Save Description
          </Button>
        </div>
      </div>

      {/* Comments */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Comments</label>
        <Textarea value={comments} onChange={e => setComments(e.target.value)} rows={3} placeholder="Additional comments..." className="text-sm" />
        <div className="mt-2 flex justify-end">
          <Button size="sm" variant="outline" onClick={() => saveMutation.mutate({ comments })} disabled={saveMutation.isPending}>
            <Save className="w-3.5 h-3.5 mr-1" /> Save Comments
          </Button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          <MessageSquare className="w-4 h-4 inline mr-1" />Notes
        </label>
        <div className="space-y-2 mb-3">
          {(incident.notes || []).map((note, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">{note.author}</span>
                <span className="text-xs text-slate-400">{note.timestamp ? format(new Date(note.timestamp), 'MMM d, yyyy HH:mm') : ''}</span>
              </div>
              <p className="text-slate-600">{note.text}</p>
            </div>
          ))}
          {(!incident.notes || incident.notes.length === 0) && (
            <p className="text-sm text-slate-400">No notes yet.</p>
          )}
        </div>
        <div className="flex gap-2">
          <Input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." className="text-sm" onKeyDown={e => e.key === 'Enter' && addNote()} />
          <Button size="sm" onClick={addNote} disabled={!newNote.trim()}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}