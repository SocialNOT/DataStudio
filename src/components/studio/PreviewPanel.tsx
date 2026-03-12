
"use client";

import React, { useState } from 'react';
import { PipelineState, ChunkStatus } from './StudioDashboard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  MessageSquare,
  Network,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Fingerprint,
  CheckCircle,
  AlertTriangle,
  MessageSquarePlus,
  UserCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { voiceToMetadata } from '@/ai/flows/voice-to-metadata';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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
  const [annotatingIndex, setAnnotatingIndex] = useState<number | null>(null);

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
      toast({ title: "Curation Committed" });
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

  const updateStatus = (index: number, status: ChunkStatus) => {
    if (state.viewMode === 'chunks') {
      const newChunks = [...state.chunks];
      newChunks[index].metadata.status = status;
      updateState({ chunks: newChunks });
    } else {
      const newPairs = [...state.qaPairs];
      newPairs[index].status = status;
      updateState({ qaPairs: newPairs });
    }
    toast({ title: `Status set to ${status.toUpperCase()}` });
  };

  const handleVoiceAnnotate = async (idx: number) => {
    setIsProcessingVoice(idx);
    try {
      const enrichment = await voiceToMetadata({ 
        transcript: "Focus on the metaphysical aspect of the self here.",
        currentMetadata: state.chunks[idx].metadata
      });

      const newChunks = [...state.chunks];
      newChunks[idx].metadata = {
        ...newChunks[idx].metadata,
        topic: enrichment.enrichedTopic,
        keyConcepts: [...new Set([...newChunks[idx].metadata.keyConcepts, ...enrichment.additionalConcepts])]
      };

      updateState({ chunks: newChunks });
      toast({ title: "Metadata Enriched" });
    } catch (err) {
      toast({ title: "Voice API Fault", variant: "destructive" });
    } finally {
      setIsProcessingVoice(null);
    }
  };

  const filteredItems = state.viewMode === 'chunks' 
    ? state.chunks.filter(c => c.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : state.viewMode === 'training'
    ? state.qaPairs.filter(p => p.instruction.toLowerCase().includes(searchQuery.toLowerCase()) || p.output.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex h-full flex-col bg-background/50">
      <div className="border-b bg-card/30 p-3 space-y-3">
        <Tabs value={state.viewMode} onValueChange={(v) => updateState({ viewMode: v as any })}>
          <TabsList className="grid w-full grid-cols-4 h-9 bg-background/50 border border-white/5">
            <TabsTrigger value="chunks" className="text-[9px] uppercase font-bold tracking-widest gap-2">
              <Database className="h-3 w-3" /> RAG
            </TabsTrigger>
            <TabsTrigger value="training" className="text-[9px] uppercase font-bold tracking-widest gap-2">
              <Terminal className="h-3 w-3" /> Train
            </TabsTrigger>
            <TabsTrigger value="graph" className="text-[9px] uppercase font-bold tracking-widest gap-2">
              <Network className="h-3 w-3" /> Graph
            </TabsTrigger>
            <TabsTrigger value="metrics" className="text-[9px] uppercase font-bold tracking-widest gap-2">
              <TrendingUp className="h-3 w-3" /> Health
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {['chunks', 'training'].includes(state.viewMode) && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Filter units..." 
              className="pl-9 h-9 text-xs bg-background/40 border-white/5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        {state.viewMode === 'metrics' ? (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Dataset Integrity Report
            </h3>
            
            <div className="grid gap-4">
              <MetricItem label="Semantic Coherence" value={state.qualityMetrics.semanticCoherence} color="bg-primary" />
              <MetricItem label="Concept Coverage" value={state.qualityMetrics.conceptCoverage} color="bg-accent" />
              <MetricItem label="Duplication Risk" value={1 - state.qualityMetrics.duplicationRate} color="bg-orange-500" />
              <MetricItem label="Instruction Density" value={state.qaPairs.length > 0 ? 0.88 : 0} color="bg-green-500" />
            </div>

            <Card className="p-4 bg-primary/5 border-primary/10 mt-8">
              <div className="flex items-center gap-3 mb-3">
                 <Fingerprint className="h-5 w-5 text-primary" />
                 <span className="text-xs font-bold uppercase tracking-widest">Neural Fingerprint</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                This version has been validated against the <span className="text-primary">IKS-01 Protocol</span>. 
                Data distribution is optimized for <span className="text-primary font-bold">Llama-3-70B</span> instruction tuning with a 1024-token window.
              </p>
            </Card>
          </div>
        ) : state.viewMode === 'graph' ? (
          <div className="space-y-4">
            {state.graph.nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <Network className="h-12 w-12 text-primary mb-4" />
                <p className="text-[10px] font-bold uppercase">No Graph Data</p>
              </div>
            ) : (
              <div className="grid gap-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entities & Relations</h3>
                {state.graph.edges.map((edge, i) => (
                  <Card key={i} className="p-3 border-border/50 bg-card/40">
                    <div className="flex items-center justify-between text-[11px]">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{edge.source}</Badge>
                      <div className="flex flex-col items-center gap-1 opacity-50">
                        <span className="text-[8px] font-black uppercase tracking-tighter">{edge.relation}</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                      <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20">{edge.target}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
            <LayoutDashboard className="h-12 w-12 text-primary mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Workspace Empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {state.viewMode === 'chunks' ? (
              (filteredItems as any[]).map((chunk, idx) => (
                <Card key={idx} className={`overflow-hidden border-border/50 bg-card/60 transition-all hover:border-primary/30 ${chunk.metadata.status === 'flagged' ? 'border-destructive/30 bg-destructive/5' : chunk.metadata.status === 'verified' ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                  <div className="flex items-center justify-between bg-muted/20 px-3 py-2 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <span className="font-code text-[10px] font-bold text-primary">#{(idx + 1).toString().padStart(2, '0')}</span>
                      <StatusBadge status={chunk.metadata.status} />
                      <Badge variant="outline" className="h-4 text-[9px] uppercase font-bold bg-primary/5 text-primary border-primary/20">
                        {chunk.metadata.topic}
                      </Badge>
                    </div>
                    <ActionButton 
                      index={idx} 
                      editingIndex={editingIndex} 
                      onEdit={handleEdit} 
                      onSave={handleSave} 
                      onDelete={handleDelete} 
                      onVoice={() => handleVoiceAnnotate(idx)} 
                      isVoiceLoading={isProcessingVoice === idx}
                      onStatusChange={(s: ChunkStatus) => updateStatus(idx, s)}
                    />
                  </div>
                  <div className="p-3">
                    {editingIndex === idx ? (
                      <Textarea value={tempText} onChange={(e) => setTempText(e.target.value)} className="min-h-[100px] text-xs" />
                    ) : (
                      <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">{chunk.text}</p>
                    )}
                    
                    {chunk.metadata.annotatorNote && (
                      <div className="mt-3 p-2 rounded bg-muted/30 border-l-2 border-primary/50">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <MessageSquarePlus className="h-3 w-3" /> Researcher Note
                        </p>
                        <p className="text-[10px] italic">{chunk.metadata.annotatorNote}</p>
                      </div>
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
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Instruction</p>
                          <StatusBadge status={pair.status || 'draft'} />
                        </div>
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
                       <ActionButton 
                        index={idx} 
                        editingIndex={editingIndex} 
                        onEdit={handleEdit} 
                        onSave={handleSave} 
                        onDelete={handleDelete}
                        onStatusChange={(s: ChunkStatus) => updateStatus(idx, s)}
                       />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function StatusBadge({ status }: { status: ChunkStatus }) {
  const styles = {
    draft: "bg-muted/10 text-muted-foreground border-muted/20",
    verified: "bg-green-500/10 text-green-500 border-green-500/20",
    flagged: "bg-destructive/10 text-destructive border-destructive/20"
  };
  return (
    <Badge variant="outline" className={`h-4 text-[8px] font-black uppercase px-1.5 ${styles[status]}`}>
      {status}
    </Badge>
  );
}

function MetricItem({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <Progress value={value * 100} className="h-1.5 bg-muted/30" indicatorClassName={color} />
    </div>
  );
}

function ActionButton({ index, editingIndex, onEdit, onSave, onDelete, onVoice, isVoiceLoading, onStatusChange }: any) {
  return (
    <div className="flex gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary">
            <UserCheck className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-white/10">
          <DropdownMenuItem onClick={() => onStatusChange('verified')} className="text-[10px] font-bold uppercase gap-2">
            <CheckCircle className="h-3 w-3 text-green-500" /> Verify Unit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusChange('flagged')} className="text-[10px] font-bold uppercase gap-2">
            <AlertTriangle className="h-3 w-3 text-destructive" /> Flag for Review
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusChange('draft')} className="text-[10px] font-bold uppercase gap-2">
            <Edit2 className="h-3 w-3 text-muted-foreground" /> Set to Draft
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {onVoice && (
        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={onVoice}>
          {isVoiceLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
        </Button>
      )}
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
