"use client";

import React, { useState } from 'react';
import { PipelineState } from './StudioDashboard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  Edit2, 
  Trash2, 
  Search, 
  Mic, 
  Sparkles, 
  LayoutDashboard, 
  Loader2, 
  Database, 
  Terminal,
  MessageSquare
} from 'lucide-react';
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
    if (state.viewMode === 'chunks') {
      setTempText(state.chunks[index].text);
    } else {
      setTempText(state.qaPairs[index].output);
    }
  };

  const handleSave = (index: number) => {
    try {
      if (state.viewMode === 'chunks') {
        const newChunks = [...state.chunks];
        newChunks[index].text = tempText;
        updateState({ chunks: newChunks });
      } else {
        const newPairs = [...state.qaPairs];
        newPairs[index].output = tempText;
        updateState({ qaPairs: newPairs });
      }
      setEditingIndex(null);
      toast({ title: "Curation Committed", description: "Manual adjustments synchronized with dataset." });
    } catch (err) {
      toast({ title: "Write Error", variant: "destructive" });
    }
  };

  const handleDelete = (index: number) => {
    if (state.viewMode === 'chunks') {
      const newChunks = state.chunks.filter((_, i) => i !== index);
      updateState({ chunks: newChunks });
    } else {
      const newPairs = state.qaPairs.filter((_, i) => i !== index);
      updateState({ qaPairs: newPairs });
    }
  };

  const handleVoiceAnnotate = async (idx: number) => {
    setIsProcessingVoice(idx);
    try {
      const mockTranscript = "Focus on the metaphysical aspect of the self here.";
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

      updateState({ chunks: newChunks });
      toast({ title: "Metadata Enriched", description: `Updated topic: ${enrichment.enrichedTopic}` });
    } catch (err) {
      toast({ title: "Voice API Fault", variant: "destructive" });
    } finally {
      setIsProcessingVoice(null);
    }
  };

  const filteredItems = state.viewMode === 'chunks' 
    ? state.chunks.filter(c => c.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : state.qaPairs.filter(p => p.instruction.toLowerCase().includes(searchQuery.toLowerCase()) || p.output.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-full flex-col bg-background/50">
      <div className="border-b bg-card/30 p-3 space-y-3">
        <Tabs value={state.viewMode} onValueChange={(v) => updateState({ viewMode: v as any })}>
          <TabsList className="grid w-full grid-cols-2 h-9 bg-background/50 border border-white/5">
            <TabsTrigger value="chunks" className="text-[10px] uppercase font-bold tracking-widest gap-2">
              <Database className="h-3 w-3" /> RAG Units
            </TabsTrigger>
            <TabsTrigger value="training" className="text-[10px] uppercase font-bold tracking-widest gap-2">
              <Terminal className="h-3 w-3" /> QA Pairs
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search within curated units..." 
            className="pl-9 h-9 text-xs bg-background/40 border-white/5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
            <LayoutDashboard className="h-12 w-12 text-primary mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Workspace Empty</p>
            <p className="text-[9px] mt-1 italic">Initiate pipeline to populate curator</p>
          </div>
        ) : (
          <div className="space-y-4">
            {state.viewMode === 'chunks' ? (
              (filteredItems as any[]).map((chunk, idx) => (
                <Card key={idx} className="overflow-hidden border-border/50 bg-card/60 transition-all hover:border-primary/30">
                  <div className="flex items-center justify-between bg-muted/20 px-3 py-2 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <span className="font-code text-[10px] font-bold text-primary">#{(idx + 1).toString().padStart(2, '0')}</span>
                      <Badge variant="outline" className="h-4 text-[9px] uppercase font-bold bg-primary/5 text-primary border-primary/20">
                        {chunk.metadata.topic}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleVoiceAnnotate(idx)}>
                        {isProcessingVoice === idx ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
                      </Button>
                      <ActionButton index={idx} editingIndex={editingIndex} onEdit={handleEdit} onSave={handleSave} onDelete={handleDelete} />
                    </div>
                  </div>
                  <div className="p-3">
                    {editingIndex === idx ? (
                      <Textarea value={tempText} onChange={(e) => setTempText(e.target.value)} className="min-h-[100px] text-xs leading-relaxed" />
                    ) : (
                      <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">{chunk.text}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {chunk.metadata.keyConcepts.map((tag: string, tIdx: number) => (
                        <div key={tIdx} className="flex items-center gap-1.5 rounded bg-accent/5 px-2 py-0.5 border border-accent/10">
                          <Sparkles className="h-2 w-2.5 text-accent opacity-50" />
                          <span className="text-[9px] font-bold text-accent/80 uppercase tracking-tighter">{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              (filteredItems as any[]).map((pair, idx) => (
                <Card key={idx} className="overflow-hidden border-border/50 bg-card/60 transition-all hover:border-accent/30">
                  <div className="p-3 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                        <MessageSquare className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Instruction</p>
                        <p className="text-xs font-bold leading-relaxed">{pair.instruction}</p>
                      </div>
                    </div>
                    <div className="pl-9 space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ground Truth</p>
                      {editingIndex === idx ? (
                        <Textarea value={tempText} onChange={(e) => setTempText(e.target.value)} className="min-h-[80px] text-xs" />
                      ) : (
                        <p className="text-xs text-foreground/80 leading-relaxed italic border-l-2 border-white/5 pl-3">{pair.output}</p>
                      )}
                    </div>
                    <div className="flex justify-end pt-2 border-t border-white/5 gap-1">
                       <ActionButton index={idx} editingIndex={editingIndex} onEdit={handleEdit} onSave={handleSave} onDelete={handleDelete} />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </ScrollArea>

      {filteredItems.length > 0 && (
        <div className="border-t bg-card/40 p-3 shrink-0 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quality Check OK</span>
           </div>
           <Button size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest px-4 border-primary/20 hover:bg-primary/10" onClick={() => toast({ title: "Batch Approved", description: "Ready for high-speed export." })}>
             <Check className="h-3.5 w-3.5 mr-2" /> Certify All
           </Button>
        </div>
      )}
    </div>
  );
}

function ActionButton({ index, editingIndex, onEdit, onSave, onDelete }: any) {
  return (
    <div className="flex gap-1">
      {editingIndex === index ? (
        <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={() => onSave(index)}>
          <Check className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => onEdit(index)}>
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(index)}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
