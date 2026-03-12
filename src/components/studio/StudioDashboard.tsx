
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
  Moon, 
  Sun,
  LogIn,
  Layers,
  Database,
  Terminal,
  Activity,
  Cloud,
  CheckCircle2,
  Menu,
  ShieldCheck,
  Globe,
  Cpu
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';

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
  const [activeTab, setActiveTab] = useState('ingest');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { toast } = useToast();
  
  const { user } = useUser();
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
    datasetName: 'Mitsara Dataset',
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
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    if (mounted) {
      addLog('Mitsara Neural Engine synchronized. Indian Tricolor protocol active.', 'info');
    }
  }, [mounted]);

  const handleSignIn = async () => {
    if (auth) {
      try {
        await signInAnonymously(auth);
        addLog("Secure node authentication successful.", "success");
      } catch (err) {
        toast({ title: "Auth Error", description: "Cluster handshake failed.", variant: "destructive" });
      }
    }
  };

  const updateState = (updates: Partial<PipelineState>) => {
    setState((prev) => {
      const newState = { ...prev, ...updates };
      if (updates.status && updates.status !== prev.status) {
        newState.logs = [
          { 
            id: Math.random().toString(36).substr(2, 9), 
            timestamp: new Date(), 
            message: `Pipeline Shift: ${updates.status.toUpperCase()}`, 
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
      setDoc(datasetRef, {
        id: state.datasetId,
        name: state.datasetName,
        ownerId: user.uid,
        currentVersion: state.version,
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: datasetRef.path,
          operation: 'update',
          requestResourceData: { name: state.datasetName }
        }));
      });
      addLog("Cloud synchronization complete. Shards persisted.", "success");
      toast({ title: "Session Persisted" });
    } catch (err) {
      addLog("Failed to write to cloud vault.", "error");
    }
  };

  const PanelHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="h-12 border-b border-white/5 bg-black/10 flex items-center gap-3 px-5 shrink-0">
      <span className="text-primary group-hover:scale-110 transition-transform">{icon}</span>
      <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground leading-none">{title}</h2>
    </div>
  );

  if (!mounted) return null;

  return (
    <div className="flex flex-col overflow-hidden bg-background text-foreground h-[100dvh] w-screen">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b bg-card/60 px-4 md:px-8 backdrop-blur-2xl shrink-0 z-50">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="relative group cursor-pointer" onClick={() => updateState({ viewMode: 'metrics' })}>
            <div className="absolute inset-0 animate-pulse-ring rounded-xl bg-primary/20" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
              <BrainCircuit className="h-5 w-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="font-headline text-sm md:text-lg font-black tracking-tight flex items-center gap-2">
              Mitsara <span className="text-primary glow-text">Studio</span>
              <div className="h-1.5 w-1.5 rounded-full tricolor-gradient animate-pulse" />
            </h1>
            <div className="flex items-center gap-2 mt-0.5 opacity-70">
              <span className="text-[8px] md:text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black truncate max-w-[120px]">
                {state.datasetName} <span className="text-primary">v{state.version}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
           <div className="hidden lg:flex items-center gap-8 px-6 py-2 rounded-2xl bg-black/5 border border-white/5">
              <Metric label="Chunks" value={state.chunks.length} icon={<Database className="h-3 w-3" />} />
              <Metric label="QA Shards" value={state.qaPairs.length} icon={<Terminal className="h-3 w-3" />} />
              <Metric 
                label="Health" 
                value={state.chunks.length > 0 ? `${Math.round(state.qualityMetrics.semanticCoherence * 100)}%` : '0%'} 
                icon={<Activity className="h-3 w-3 text-secondary" />} 
              />
           </div>

           <div className="flex items-center gap-1.5 bg-black/5 p-1 rounded-xl border border-white/5">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={toggleTheme}>
                {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary transition-all group" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-500" />
              </Button>
           </div>

           {user ? (
             <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="hidden sm:flex h-8 text-[8px] font-black uppercase tracking-widest gap-2 text-primary hover:bg-primary/10" onClick={handleSaveToCloud}>
                 <Cloud className="h-3 w-3" /> Sync
               </Button>
               <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl border-2 border-primary/20 bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px] cursor-pointer" onClick={() => setSettingsOpen(true)}>
                 {user.displayName?.[0] || user.email?.[0] || 'A'}
               </div>
             </div>
           ) : (
             <Button variant="outline" size="sm" className="h-9 px-3 md:px-6 text-[9px] font-black uppercase tracking-widest gap-2 bg-primary/10 border-primary/30" onClick={handleSignIn}>
               <LogIn className="h-3.5 w-3.5" /> Auth
             </Button>
           )}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-hidden relative">
        {isMobile ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              <TabsContent value="ingest" className="h-full m-0 p-0"><UploadPanel state={state} updateState={updateState} /></TabsContent>
              <TabsContent value="intelligence" className="h-full m-0 p-0"><ProcessingPanel state={state} updateState={updateState} /></TabsContent>
              <TabsContent value="curation" className="h-full m-0 p-0"><PreviewPanel state={state} updateState={updateState} /></TabsContent>
              <TabsContent value="deploy" className="h-full m-0 p-0"><ExportPanel state={state} updateState={updateState} /></TabsContent>
            </div>
            <TabsList className="h-16 w-full bg-card/60 backdrop-blur-xl border-t grid grid-cols-4 p-2 gap-2 shrink-0">
              <TabsTrigger value="ingest" className="flex flex-col gap-1 text-[8px] font-black uppercase data-[state=active]:bg-primary/20"><Upload className="h-4 w-4" /> Source</TabsTrigger>
              <TabsTrigger value="intelligence" className="flex flex-col gap-1 text-[8px] font-black uppercase data-[state=active]:bg-primary/20"><Cog className="h-4 w-4" /> AI</TabsTrigger>
              <TabsTrigger value="curation" className="flex flex-col gap-1 text-[8px] font-black uppercase data-[state=active]:bg-primary/20"><Eye className="h-4 w-4" /> Hub</TabsTrigger>
              <TabsTrigger value="deploy" className="flex flex-col gap-1 text-[8px] font-black uppercase data-[state=active]:bg-primary/20"><Share2 className="h-4 w-4" /> Vault</TabsTrigger>
            </TabsList>
          </Tabs>
        ) : (
          <div className="grid h-full grid-cols-12 overflow-hidden bg-white/5">
            <div className="col-span-10 grid grid-cols-4 gap-px bg-white/5">
              <div className="workspace-panel bg-card/20"><PanelHeader icon={<Upload className="h-4 w-4" />} title="Ingestion" /><UploadPanel state={state} updateState={updateState} /></div>
              <div className="workspace-panel bg-card/20"><PanelHeader icon={<Cog className="h-4 w-4" />} title="Intelligence" /><ProcessingPanel state={state} updateState={updateState} /></div>
              <div className="workspace-panel bg-card/20 border-l border-white/5"><PanelHeader icon={<Eye className="h-4 w-4" />} title="Curation" /><PreviewPanel state={state} updateState={updateState} /></div>
              <div className="workspace-panel bg-card/20 border-l border-white/5"><PanelHeader icon={<Share2 className="h-4 w-4" />} title="Vault" /><ExportPanel state={state} updateState={updateState} /></div>
            </div>
            <div className="col-span-2 border-l border-white/5 bg-black/10 flex flex-col overflow-hidden">
              <div className="h-12 px-5 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                  <History className="h-4 w-4 text-primary" /> Audit
                </h2>
                <Badge variant="outline" className="text-[9px] font-code h-5 border-primary/30 text-primary">{state.logs.length}</Badge>
              </div>
              <ScrollArea className="flex-1 p-5">
                <div className="space-y-6">
                  {state.logs.map((log) => (
                    <div key={log.id} className="group relative pl-5 border-l border-white/10">
                      <div className={cn(
                        "absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                        log.type === 'ai' ? 'bg-primary animate-pulse' : log.type === 'error' ? 'bg-destructive' : log.type === 'success' ? 'bg-secondary' : 'bg-muted-foreground'
                      )} />
                      <p className="text-[9px] font-black text-muted-foreground/50 tracking-widest uppercase">{log.timestamp.toLocaleTimeString()}</p>
                      <p className="text-[10px] font-medium leading-relaxed text-foreground/80 mt-1">{log.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 md:h-10 border-t bg-card/60 backdrop-blur-3xl px-4 md:px-8 flex items-center justify-between shrink-0 z-50 overflow-hidden">
        <div className="flex items-center gap-4 md:gap-8">
           <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Neural Engine: Synced</span>
           </div>
           <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-8">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">IKS Protocol: 01-Active</span>
           </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
           <div className="hidden md:flex items-center gap-2">
              <Globe className="h-3 w-3 text-secondary" />
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Region: IN-CENTRAL-01</span>
           </div>
           <div className="flex items-center gap-2 group cursor-help">
              <div className="h-4 w-4 rounded bg-primary/10 flex items-center justify-center">
                 <Cpu className="h-2.5 w-2.5 text-primary" />
              </div>
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-primary/80 group-hover:text-primary transition-colors">Bharata AI Infrastructure</span>
           </div>
        </div>
      </footer>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

function Metric({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-primary group-hover:scale-110 transition-transform">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground/60 leading-none mb-1">{label}</span>
        <span className="text-xs font-code font-black text-foreground/90">{value}</span>
      </div>
    </div>
  );
}
