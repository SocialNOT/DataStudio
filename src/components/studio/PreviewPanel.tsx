"use client";

import React, { useState } from 'react';
import { PipelineState } from './StudioDashboard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Check, Edit2, Save, Trash2, Info, Search } from 'lucide-react';

interface PreviewPanelProps {
  state: PipelineState;
  updateState: (updates: Partial<PipelineState>) => void;
}

export default function PreviewPanel({ state, updateState }: PreviewPanelProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempText, setTempText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setTempText(state.chunks[index].text);
  };

  const handleSave = (index: number) => {
    const newChunks = [...state.chunks];
    newChunks[index].text = tempText;
    updateState({ chunks: newChunks });
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const newChunks = state.chunks.filter((_, i) => i !== index);
    updateState({ chunks: newChunks });
  };

  const filteredChunks = state.chunks.filter(c => 
    c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.metadata.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-muted/5 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search chunks or concepts..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {!state.chunks.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
            <Info className="h-12 w-12 mb-4" />
            <p className="text-sm font-medium">No processed chunks available.<br/>Run the pipeline to generate datasets.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-medium text-muted-foreground">Showing {filteredChunks.length} of {state.chunks.length} Chunks</span>
              <div className="flex gap-2">
                <Badge variant="secondary" className="font-code text-[10px]">{state.chunks.length} Total</Badge>
              </div>
            </div>

            {filteredChunks.map((chunk, idx) => (
              <Card key={idx} className="group overflow-hidden border-border/60 bg-card hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
                  <div className="flex items-center gap-3">
                    <span className="font-code text-xs font-bold text-primary">#{idx + 1}</span>
                    <Badge variant="outline" className="bg-background font-headline text-[10px] uppercase tracking-wider">{chunk.metadata.topic}</Badge>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {editingIndex === idx ? (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={() => handleSave(idx)}>
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(idx)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(idx)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4">
                  {editingIndex === idx ? (
                    <Textarea 
                      value={tempText} 
                      onChange={(e) => setTempText(e.target.value)}
                      className="min-h-[120px] font-body text-sm leading-relaxed"
                    />
                  ) : (
                    <p className="font-body text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{chunk.text}</p>
                  )}
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {chunk.metadata.keyConcepts.map((concept: string, cIdx: number) => (
                      <Badge key={cIdx} variant="secondary" className="rounded-md bg-accent/10 text-accent border-accent/20 text-[10px]">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {state.chunks.length > 0 && (
        <div className="border-t bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Verified</span>
              </div>
              <span>|</span>
              <span>Last active: Just now</span>
            </div>
            <Button size="sm" variant="outline" className="h-8 gap-2">
              <Check className="h-3 w-3" /> Mark All Verified
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
