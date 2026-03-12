
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import UploadPanel from './UploadPanel';
import ProcessingPanel from './ProcessingPanel';
import PreviewPanel from './PreviewPanel';
import ExportPanel from './ExportPanel';
import SettingsModal from './SettingsModal';
import { 
  BrainCircuit, 
  Upload, 
  Cog, 
  Eye, 
  Share2, 
  Activity, 
  History, 
  Settings, 
  Bell, 
  Moon, 
  Sun,
  LogIn,
  Layers
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';

export type LogEntry = {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'ai';
};

export type ChunkMetadata = {
  topic: string;
  keyConcepts: string[];
  author?: string;
  source?: string;
  language?: string;
  period?: string;
  domain?: string;
};

export type PipelineState = {
  rawText: string;
  processedText: string;
  chunks: { text: string; metadata: ChunkMetadata }[];
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  fileName?: string;
  fileType?: string;
  datasetName: string;
  version: string;
  globalMetadata: Partial<ChunkMetadata>;
  logs: LogEntry[];
};

export default function StudioDashboard() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const { user, loading } = useUser();
  const auth = useAuth();

  const [state, setState] = useState<PipelineState>({
    rawText: '',
    processedText: '',
    chunks: [],
    status: 'idle',
    datasetName: 'Untitled Dataset',
    version: '1.0.0',
    globalMetadata: {
      language: 'english',
      domain: 'Knowledge Base',
    },
    logs: [],
  });

  useEffect(() => {
    setMounted(true);
    setState(prev => ({
      ...prev,
      logs: [{ 
        id: 'init', 
        timestamp: new Date(), 
        message: 'Mitsara Engine v1.1 initialized. Ingestion core ready.', 
        type: 'info' 
      }]
    }));
  }, []);

  const handleSignIn = async () => {
    if (auth) {
      await signInAnonymously(auth);
      addLog("Anonymous session initiated.", "success");
    }
  };

  const updateState = (updates: Partial<PipelineState>) => {
    setState((prev) => {
      const newState = { ...prev, ...updates };
      
      if (updates.status && updates.status !== prev.status) {
        const logId = Math.random().toString(36).substr(2, 9);
        const statusMsg = `Pipeline shift: ${updates.status.toUpperCase()}`;
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 items-center justify-between border-b bg-card/50 px-6 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 animate-pulse-ring rounded-lg bg-primary/20 group-hover:bg-primary/40 transition-colors" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              <BrainCircuit className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h1 className="font-headline text-base font-bold tracking-tight">Mitsara <span className="text-primary glow-text">Studio</span></h1>
            <div className="flex items-center gap-2 mt-0.5 opacity-70">
              <Layers className="h-2.5 w-2.5 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">{state.datasetName} v{state.version}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg border border-white/5 mr-4">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground relative">
                <Bell className="h-3.5 w-3.5" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-primary rounded-full" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-3.5 w-3.5 animate-[spin_10s_linear_infinite]" />
              </Button>
           </div>

           {loading ? (
             <div className="h-8 w-24 bg-muted animate-pulse rounded-lg" />
           ) : user ? (
             <div className="flex items-center gap-3 pl-4 border-l border-white/5 group cursor-pointer" onClick={() => setSettingsOpen(true)}>
               <div className="text-right">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Status</p>
                 <p className="text-xs font-bold text-green-500">Active Node</p>
               </div>
               <div className="h-8 w-8 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px]">
                 {user.displayName?.[0] || user.email?.[0] || 'A'}
               </div>
             </div>
           ) : (
             <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase tracking-widest gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10" onClick={handleSignIn}>
               <LogIn className="h-3 w-3" /> Connect Node
             </Button>
           )}
        </div>
      </header>

      <div className="grid flex-1 grid-cols-12 overflow-hidden">
        <div className="col-span-10 grid grid-cols-4 gap-px bg-white/5 overflow-hidden">
          <div className="workspace-panel bg-background/20">
             <PanelHeader icon={<Upload className="h-3.5 w-3.5" />} title="1. Ingestion" />
             <UploadPanel state={state} updateState={updateState} />
          </div>
          <div className="workspace-panel bg-background/20">
             <PanelHeader icon={<Cog className="h-3.5 w-3.5" />} title="2. Intelligence" />
             <ProcessingPanel state={state} updateState={updateState} />
          </div>
          <div className="workspace-panel bg-background/20 border-l border-white/5 col-span-1">
             <PanelHeader icon={<Eye className="h-3.5 w-3.5" />} title="3. Curation" />
             <PreviewPanel state={state} updateState={updateState} />
          </div>
          <div className="workspace-panel bg-background/20 border-l border-white/5">
             <PanelHeader icon={<Share2 className="h-3.5 w-3.5" />} title="4. Delivery" />
             <ExportPanel state={state} updateState={updateState} />
          </div>
        </div>
        <AuditTrail />
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
