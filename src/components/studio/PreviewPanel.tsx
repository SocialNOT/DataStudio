
"use client";

import React, { useState } from 'react';
import { PipelineState } from './StudioDashboard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Check, Edit2, Trash2, Search, Mic, Sparkles, LayoutDashboard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { voiceToMetadata } from '@/ai/flows/voice-to-metadata';

interface PreviewPanelProps {
  state: PipelineState;
  updateState: (updates: Partial<PipelineState>) => void;
}

export default function PreviewPanel({ state, updateState }: PreviewPanelProps) {
  const { toast } = useToast();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempText, setTempText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState<number | null>(null);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setTempText(state.chunks[index].text);
  };

  const handleSave = (index: number) => {
    try {
      const newChunks = [...state.chunks];
      newChunks[index].text = tempText;
      updateState({ 
        chunks: newChunks,
        logs: [{ 
          id: Math.random().toString(36).substr(2, 9), 
          timestamp: new Date(), 
          message: `Manually modified chunk #${index + 1} content.`, 
          type: 'info' 
        }, ...state.logs]
      });
      setEditingIndex(null);
      toast({ title: "Chunk Saved", description: "Your manual edits have been committed." });
    } catch (err) {
      toast({ title: "Save Error", variant: "destructive" });
    }
  };

  const handleDelete = (index: number) => {
    const newChunks = state.chunks.filter((_, i) => i !== index);
    updateState({ 
      chunks: newChunks,
      logs: [{ 
        id: Math.random().toString(36).substr(2, 9), 
        timestamp: new Date(), 
        message: `Removed chunk #${index + 1} from dataset.`, 
        type: 'info' 
      }, ...state.logs]
    });
  };

  const handleVoiceAnnotate = async (idx: number) => {
    setIsProcessingVoice(idx);
    toast({ title: "Voice Capture Active", description: "Recording context for metadata refinement..." });

    try {
      // Simulate captured audio transcript
      const mockTranscript = "This section is actually related to early historical interpretations of ethics.";
      
      const enrichment = await voiceToMetadata({ 
        transcript: mockTranscript,
        currentMetadata: state.chunks[idx].metadata
      });

      const newChunks = [...state.chunks];
      newChunks[idx].metadata = {
        ...newChunks[idx].metadata,
        topic: enrichment.enrichedTopic,
        keyConcepts: [...new Set([...newChunks[idx].metadata.keyConcepts, ...enrichment.additionalConcepts])]
      };

      updateState({ 
        chunks: newChunks,
        logs: [{ 
          id: Math.random().toString(36).substr(2, 9), 
          timestamp: new Date(), 
          message: `Enriched metadata for chunk #${idx + 1} via voice transcription.`, 
          type: 'ai' 
        }, ...state.logs]
      });

      toast({ title: "Enrichment Success", description: `Updated topic to: ${enrichment.enrichedTopic}` });
    } catch (err) {
      toast({ title: "Voice Pipeline Fault", variant: "destructive" });
    } finally {
      setIsProcessingVoice(null);
    }
  };

  const filteredChunks = state.chunks.filter(c => 
    c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.metadata.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.metadata.keyConcepts.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-full flex-col bg-background/50">
      <div className="border-b bg-card/30 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search chunks, topics, or tags..." 
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
               <LayoutDashboard className="h-12 w-12 text-primary relative" />
            </div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Editor Standby</p>
            <p className="text-[10px] text-muted-foreground mt-1">Initialize pipeline to start dataset curation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChunks.map((chunk, idx) => (
              <Card key={idx} className="group relative overflow-hidden border-border/50 bg-card/60 transition-all hover:bg-card/80 hover:border-primary/30">
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
                      className={`h-7 w-7 transition-colors ${isProcessingVoice === idx ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:text-primary'}`}
                      onClick={() => handleVoiceAnnotate(idx)}
                      disabled={isProcessingVoice !== null}
                    >
                      {isProcessingVoice === idx ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
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
                   <div key={i} className="h-5 w-5 rounded-full border border-background bg-primary/20 text-[8px] flex items-center justify-center font-bold text-primary uppercase">Iks</div>
                 ))}
               </div>
               <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Ensemble Check</span>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-[10px] gap-2 uppercase tracking-widest px-3 border-primary/20 hover:bg-primary/5" onClick={() => toast({ title: "Dataset Approved", description: "Batch ready for vector deployment." })}>
              <Check className="h-3 w-3" /> Approve All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
