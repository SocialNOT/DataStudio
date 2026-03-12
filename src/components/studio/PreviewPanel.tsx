"use client";

import React, { useState } from 'react';
import { PipelineState } from './StudioDashboard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Check, Edit2, Save, Trash2, Info, Search, Mic, Wand2, Sparkles, LayoutPanelLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PreviewPanelProps {
  state: PipelineState;
  updateState: (updates: Partial<PipelineState>) => void;
}

export default function PreviewPanel({ state, updateState }: PreviewPanelProps) {
  const { toast } = useToast();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempText, setTempText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState<number | null>(null);

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

  const handleVoiceAnnotate = (idx: number) => {
    if (isRecording === idx) {
      setIsRecording(null);
      toast({ title: "Recording Saved", description: "AI is processing your voice annotation for metadata enrichment." });
    } else {
      setIsRecording(idx);
      toast({ title: "Recording...", description: "Describe this chunk to add metadata via voice." });
    }
  };

  const filteredChunks = state.chunks.filter(c => 
    c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.metadata.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col bg-background/50">
      <div className="border-b bg-card/30 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search chunks or concepts..." 
            className="pl-9 h-9 text-xs bg-background/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {!state.chunks.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <div className="relative mb-6">
               <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse" />
               <LayoutPanelLeft className="h-12 w-12 text-primary relative" />
            </div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Editor Standby</p>
            <p className="text-[10px] text-muted-foreground mt-1">Run pipeline to generate interactive chunks</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChunks.map((chunk, idx) => (
              <Card key={idx} className="group relative overflow-hidden border-border/50 bg-card/60 transition-all hover:bg-card/80 hover:border-primary/30">
                {/* Header Actions */}
                <div className="flex items-center justify-between border-b border-border/30 bg-muted/20 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-code text-[10px] font-bold text-primary/70">#{String(idx + 1).padStart(2, '0')}</span>
                    <Badge variant="outline" className="h-4 rounded-sm border-primary/20 bg-primary/5 text-[9px] uppercase tracking-tighter text-primary">
                      {chunk.metadata.topic}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className={`h-7 w-7 transition-colors ${isRecording === idx ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-muted-foreground hover:text-primary'}`}
                      onClick={() => handleVoiceAnnotate(idx)}
                    >
                      <Mic className="h-3.5 w-3.5" />
                    </Button>
                    {editingIndex === idx ? (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={() => handleSave(idx)}>
                        <Check className="h-3.5 w-3.5" />
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
                
                <div className="p-3">
                  {editingIndex === idx ? (
                    <Textarea 
                      value={tempText} 
                      onChange={(e) => setTempText(e.target.value)}
                      className="min-h-[100px] font-body text-xs leading-relaxed bg-background/50 border-primary/20 focus:ring-primary/30"
                    />
                  ) : (
                    <p className="font-body text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">{chunk.text}</p>
                  )}
                  
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {chunk.metadata.keyConcepts.map((concept: string, cIdx: number) => (
                      <div key={cIdx} className="group/tag flex items-center gap-1.5 rounded bg-accent/5 px-2 py-0.5 border border-accent/10 transition-colors hover:bg-accent/10">
                        <Sparkles className="h-2.5 w-2.5 text-accent opacity-50" />
                        <span className="text-[9px] font-medium text-accent/80">{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {state.chunks.length > 0 && (
        <div className="border-t bg-card/40 p-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="flex -space-x-1.5">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-5 w-5 rounded-full border border-background bg-muted text-[8px] flex items-center justify-center font-bold">AI</div>
                 ))}
               </div>
               <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Ensemble Review</span>
            </div>
            <Button size="sm" variant="accent" className="h-7 text-[10px] gap-2 uppercase tracking-widest px-3">
              <Check className="h-3 w-3" /> Batch Approve
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}