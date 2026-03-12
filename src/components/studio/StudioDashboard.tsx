
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import UploadPanel from './UploadPanel';
import ProcessingPanel from './ProcessingPanel';
import PreviewPanel from './PreviewPanel';
import ExportPanel from './ExportPanel';
import { BrainCircuit, Upload, Cog, Eye, Share2, Activity, History } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export type LogEntry = {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'ai';
};

export type PipelineState = {
  rawText: string;
  processedText: string;
  chunks: { text: string; metadata: any }[];
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  fileName?: string;
  fileType?: string;
  logs: LogEntry[];
};

export default function StudioDashboard() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<PipelineState>({
    rawText: '',
    processedText: '',
    chunks: [],
    status: 'idle',
    logs: [],
  });

  useEffect(() => {
    setMounted(true);
    setState(prev => ({
      ...prev,
      logs: [{ 
        id: 'init', 
        timestamp: new Date(), 
        message: 'Mitsara Engine v1.0 initialized. Ready for ingestion.', 
        type: 'info' 
      }]
    }));
  }, []);

  const updateState = (updates: Partial<PipelineState>) => {
    setState((prev) => {
      const newState = { ...prev, ...updates };
      
      if (updates.status && updates.status !== prev.status) {
        const logId = Math.random().toString(36).substr(2, 9);
        const statusMsg = `Pipeline state changed: ${updates.status.toUpperCase()}`;
        newState.logs = [
          { 
            id: logId, 
            timestamp: new Date(), 
            message: statusMsg, 
            type: updates.status === 'error' ? 'error' : updates.status === 'completed' ? 'success' : 'info' 
          },
          ...prev.logs
        ];
      }
      
      return newState;
    });
  };

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setState(prev => ({
      ...prev,
      logs: [
        { id: Math.random().toString(36).substr(2, 9), timestamp: new Date(), message, type },
        ...prev.logs
      ]
    }));
  };

  const PanelHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="h-10 border-b border-white/5 bg-muted/5 flex items-center gap-2 px-4 shrink-0">
      <span className="text-primary/70">{icon}</span>
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">{title}</h2>
    </div>
  );

  const AuditTrail = () => (
    <div className="col-span-2 border-l border-white/5 bg-card/10 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-muted/10 flex items-center justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          <History className="h-3 w-3" /> Audit Trail
        </h2>
        <Badge variant="outline" className="text-[9px] font-code h-4 px-1.5 border-primary/20 text-primary">
          {state.logs.length}
        </Badge>
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {state.logs.map((log) => (
            <div key={log.id} className="group relative pl-4 border-l border-white/10 transition-colors hover:border-primary/30">
              <div className={`absolute left-[-4.5px] top-1 h-2 w-2 rounded-full border-2 border-background shadow-sm ${
                log.type === 'ai' ? 'bg-primary animate-pulse' : log.type === 'error' ? 'bg-destructive' : log.type === 'success' ? 'bg-green-500' : 'bg-muted-foreground'
              }`} />
              <p className="text-[9px] font-code text-muted-foreground/60">
                {mounted ? log.timestamp.toLocaleTimeString() : '--:--:--'}
              </p>
              <p className="text-[11px] font-body leading-tight text-foreground/80 mt-1">{log.message}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  if (!mounted) return <div className="h-screen w-screen bg-background" />;

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4 shrink-0">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-lg font-bold">Mitsara</h1>
        </header>
        <Tabs defaultValue="upload" className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <TabsContent value="upload" className="m-0 h-full overflow-y-auto"><UploadPanel state={state} updateState={updateState} /></TabsContent>
            <TabsContent value="process" className="m-0 h-full overflow-y-auto"><ProcessingPanel state={state} updateState={updateState} /></TabsContent>
            <TabsContent value="preview" className="m-0 h-full overflow-hidden"><PreviewPanel state={state} updateState={updateState} /></TabsContent>
            <TabsContent value="export" className="m-0 h-full overflow-y-auto"><ExportPanel state={state} updateState={updateState} /></TabsContent>
          </div>
          <TabsList className="h-16 w-full rounded-none border-t bg-card/80 backdrop-blur-md p-1 grid grid-cols-4 shrink-0">
            <TabsTrigger value="upload" className="flex flex-col gap-1 py-2 text-[10px]"><Upload className="h-4 w-4" />Source</TabsTrigger>
            <TabsTrigger value="process" className="flex flex-col gap-1 py-2 text-[10px]"><Cog className="h-4 w-4" />Process</TabsTrigger>
            <TabsTrigger value="preview" className="flex flex-col gap-1 py-2 text-[10px]"><Eye className="h-4 w-4" />Editor</TabsTrigger>
            <TabsTrigger value="export" className="flex flex-col gap-1 py-2 text-[10px]"><Share2 className="h-4 w-4" />Deploy</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 items-center justify-between border-b bg-card/50 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse-ring rounded-lg bg-primary/20" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <BrainCircuit className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h1 className="font-headline text-base font-bold tracking-tight">Mitsara <span className="text-primary glow-text">Studio</span></h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-70">Ingestion Command Center</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-l border-white/5 pl-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Session ID</p>
              <p className="text-xs font-code text-primary leading-none">MITSARA_INGEST_PROD</p>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-green-500/20 blur-sm rounded-full animate-pulse" />
               <Activity className="h-4 w-4 text-green-500 relative" />
            </div>
          </div>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-12 overflow-hidden">
        <div className="col-span-10 grid grid-cols-4 gap-px bg-white/5 overflow-hidden">
          <div className="workspace-panel bg-background/20">
             <PanelHeader icon={<Upload className="h-3.5 w-3.5" />} title="1. Source" />
             <UploadPanel state={state} updateState={updateState} />
          </div>
          <div className="workspace-panel bg-background/20">
             <PanelHeader icon={<Cog className="h-3.5 w-3.5" />} title="2. Process" />
             <ProcessingPanel state={state} updateState={updateState} />
          </div>
          <div className="workspace-panel bg-background/20 border-l border-white/5 col-span-1">
             <PanelHeader icon={<Eye className="h-3.5 w-3.5" />} title="3. Editor" />
             <PreviewPanel state={state} updateState={updateState} />
          </div>
          <div className="workspace-panel bg-background/20 border-l border-white/5">
             <PanelHeader icon={<Share2 className="h-3.5 w-3.5" />} title="4. Deploy" />
             <ExportPanel state={state} updateState={updateState} />
          </div>
        </div>
        <AuditTrail />
      </div>
    </div>
  );
}
