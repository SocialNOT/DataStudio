
"use client";

import React, { useState, useEffect } from 'react';
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
  History, 
  Settings, 
  Bell, 
  Moon, 
  Sun,
  LogIn,
  Layers,
  Database,
  Terminal,
  Activity,
  Cloud,
  Network,
  ShieldCheck,
  Users
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type LogEntry = {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'ai';
};

export type ChunkStatus = 'draft' | 'verified' | 'flagged';

export type ChunkMetadata = {
  topic: string;
  keyConcepts: string[];
  author?: string;
  source?: string;
  language?: string;
  period?: string;
  domain?: string;
  status: ChunkStatus;
  annotatorNote?: string;
};

export type QaPair = {
  instruction: string;
  output: string;
  status: ChunkStatus;
};

export type GraphData = {
  nodes: { id: string; label: string; type: string }[];
  edges: { source: string; target: string; relation: string }[];
};

export type QualityMetrics = {
  duplicationRate: number;
  avgTokenDensity: number;
  conceptCoverage: number;
  semanticCoherence: number;
};

export type PipelineState = {
  datasetId: string;
  rawText: string;
  processedText: string;
  chunks: { text: string; metadata: ChunkMetadata }[];
  qaPairs: QaPair[];
  graph: GraphData;
  viewMode: 'chunks' | 'training' | 'graph' | 'metrics';
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  fileName?: string;
  fileType?: string;
  datasetName: string;
  version: string;
  globalMetadata: Partial<ChunkMetadata>;
  logs: LogEntry[];
  embeddingModel: string;
  qualityMetrics: QualityMetrics;
};

export default function StudioDashboard() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { toast } = useToast();
  
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const [state, setState] = useState<PipelineState>({
    datasetId: Math.random().toString(36).substr(2, 9),
    rawText: '',
    processedText: '',
    chunks: [],
    qaPairs: [],
    graph: { nodes: [], edges: [] },
    viewMode: 'chunks',
    status: 'idle',
    datasetName: 'Untitled Dataset',
    version: '1.0.0',
    globalMetadata: {
      language: 'english',
      domain: 'Knowledge Base',
      status: 'draft'
    },
    logs: [],
    embeddingModel: 'bge-large-en-v1.5',
    qualityMetrics: {
      duplicationRate: 0,
      avgTokenDensity: 0,
      conceptCoverage: 0,
      semanticCoherence: 0,
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      addLog('Mitsara Neural Engine initialized. Ingestion factory ready.', 'info');
    }
  }, [mounted]);

  const handleSignIn = async () => {
    if (auth) {
      try {
        await signInAnonymously(auth);
        addLog("Anonymous session initiated.", "success");
      } catch (err) {
        toast({ title: "Auth Error", variant: "destructive" });
      }
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

  const handleSaveToCloud = async () => {
    if (!user) {
      toast({ title: "Auth Required", description: "Connect node to persist data.", variant: "destructive" });
      return;
    }

    addLog("Synchronizing local state with Deployment Vault...", "info");

    try {
      const datasetRef = doc(db, 'datasets', state.datasetId);
      const versionRef = doc(db, 'datasets', state.datasetId, 'versions', state.version);

      setDoc(datasetRef, {
        id: state.datasetId,
        name: state.datasetName,
        ownerId: user.uid,
        currentVersion: state.version,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true }).catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: datasetRef.path,
          operation: 'update',
          requestResourceData: { name: state.datasetName }
        }));
      });

      setDoc(versionRef, {
        version: state.version,
        datasetId: state.datasetId,
        status: 'published',
        chunkCount: state.chunks.length,
        qaCount: state.qaPairs.length,
        createdAt: serverTimestamp(),
      }, { merge: true });

      addLog("Cloud synchronization complete. Shards persisted.", "success");
      toast({ title: "Session Persisted", description: `Dataset ${state.datasetName} saved to vault.` });
    } catch (err) {
      addLog("Failed to write to cloud vault.", "error");
      toast({ title: "Sync Fault", variant: "destructive" });
    }
  };

  const PanelHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="h-10 border-b border-white/5 bg-muted/5 flex items-center gap-2 px-4 shrink-0">
      <span className="text-primary/70">{icon}</span>
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">{title}</h2>
    </div>
  );

  if (!mounted) return <div className="h-screen w-screen bg-background" />;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 items-center justify-between border-b bg-card/50 px-6 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 animate-pulse-ring rounded-lg bg-primary/20 group-hover:bg-primary/40 transition-colors" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              <BrainCircuit className="h-5 w-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="font-headline text-base font-bold tracking-tight">Mitsara <span className="text-primary glow-text">Studio</span></h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Layers className="h-2.5 w-2.5 text-primary/50" />
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                {state.datasetName} <span className="text-primary/70">v{state.version}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 rounded-full bg-muted/10 border border-white/5">
              <Metric label="Chunks" value={state.chunks.length} icon={<Database className="h-2.5 w-2.5" />} />
              <Metric label="Instructions" value={state.qaPairs.length} icon={<Terminal className="h-2.5 w-2.5" />} />
              <Metric label="Health" value={state.chunks.length > 0 ? `${Math.round(state.qualityMetrics.semanticCoherence * 100)}%` : '0%'} icon={<Activity className="h-2.5 w-2.5" color="#10b981" />} />
           </div>

           <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg border border-white/5">
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
             <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase tracking-widest gap-2 text-primary hover:bg-primary/10" onClick={handleSaveToCloud}>
                 <Cloud className="h-3 w-3" /> Save Session
               </Button>
               <div className="flex items-center gap-3 pl-4 border-l border-white/5 group cursor-pointer" onClick={() => setSettingsOpen(true)}>
                 <div className="text-right">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Node Status</p>
                   <p className="text-xs font-bold text-green-500">Authorized</p>
                 </div>
                 <div className="h-8 w-8 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px]">
                   {user.displayName?.[0] || user.email?.[0] || 'A'}
                 </div>
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
             <PanelHeader icon={<Upload className="h-3.5 w-3.5" />} title="1. Ingestion Engine" />
             <UploadPanel state={state} updateState={updateState} />
          </div>
          <div className="workspace-panel bg-background/20">
             <PanelHeader icon={<Cog className="h-3.5 w-3.5" />} title="2. Intelligence Layer" />
             <ProcessingPanel state={state} updateState={updateState} />
          </div>
          <div className="workspace-panel bg-background/20 border-l border-white/5 col-span-1">
             <PanelHeader icon={<Eye className="h-3.5 w-3.5" />} title="3. Curation Hub" />
             <PreviewPanel state={state} updateState={updateState} />
          </div>
          <div className="workspace-panel bg-background/20 border-l border-white/5">
             <PanelHeader icon={<Share2 className="h-3.5 w-3.5" />} title="4. Deployment Vault" />
             <ExportPanel state={state} updateState={updateState} />
          </div>
        </div>

        <div className="col-span-2 border-l border-white/5 bg-card/10 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-muted/10 flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <History className="h-3 w-3" /> Ingestion Record
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
                    {log.timestamp.toLocaleTimeString()}
                  </p>
                  <p className="text-[11px] font-body leading-tight text-foreground/80 mt-1">{log.message}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

function Metric({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/80">{label}:</span>
      <span className="text-[11px] font-code font-bold text-foreground">{value}</span>
    </div>
  );
}
