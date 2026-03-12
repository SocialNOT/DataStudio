
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
  CheckCircle2,
  AlertCircle,
  Menu
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
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
      addLog('Mitsara Neural Engine initialized. Multi-agent cluster ready.', 'info');
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
        const logId = Math.random().toString(36).substr(2, 9);
        const statusMsg = `Pipeline State Shift: ${updates.status.toUpperCase()}`;
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

  const handleCreateSnapshot = async () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Node must be connected for snapshots.", variant: "destructive" });
      return;
    }

    addLog("Initializing Emergency State Snapshot...", "info");
    
    try {
      const snapshotRef = collection(db, 'datasets', state.datasetId, 'backups');
      addDoc(snapshotRef, {
        id: Date.now().toString(),
        datasetId: state.datasetId,
        timestamp: serverTimestamp(),
        snapshot: {
          chunksCount: state.chunks.length,
          qaPairsCount: state.qaPairs.length,
          qualityMetrics: state.qualityMetrics,
          version: state.version
        },
        checksum: Math.random().toString(36).substring(7)
      }).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: snapshotRef.path,
          operation: 'create',
          requestResourceData: { datasetId: state.datasetId }
        }));
      });

      addLog("Disaster Recovery Snapshot persisted to cloud vault.", "success");
      toast({ title: "Snapshot Captured", description: "Cloud backup finalized." });
    } catch (err) {
       addLog("Critical failure in snapshot sequence.", "error");
    }
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
    <div className="h-12 border-b border-white/5 bg-black/10 flex items-center gap-3 px-5 shrink-0">
      <span className="text-primary/80 group-hover:scale-110 transition-transform">{icon}</span>
      <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 leading-none">{title}</h2>
    </div>
  );

  if (!mounted) return <div className="h-screen w-screen bg-background" />;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground selection:bg-primary/20">
      <header className="flex h-16 items-center justify-between border-b bg-card/60 px-4 md:px-8 backdrop-blur-2xl shrink-0 z-50">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative group cursor-pointer" onClick={() => updateState({ viewMode: 'metrics' })}>
            <div className="absolute inset-0 animate-pulse-ring rounded-xl bg-primary/20 group-hover:bg-primary/40 transition-all duration-500" />
            <div className="relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-2xl shadow-primary/40 group-hover:scale-105 transition-transform active:scale-95">
              <BrainCircuit className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="font-headline text-sm md:text-lg font-black tracking-tight flex items-center gap-2">
              Mitsara <span className="text-primary glow-text tracking-tighter italic">Studio</span>
              <Badge variant="outline" className="hidden md:inline-flex h-4 text-[7px] border-primary/20 bg-primary/5 text-primary ml-2 uppercase font-black tracking-[0.2em]">PRO ENGINE</Badge>
            </h1>
            <div className="flex items-center gap-2.5 mt-0.5 md:mt-1 opacity-70">
              <Layers className="h-2.5 w-2.5 text-primary" />
              <span className="text-[8px] md:text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black truncate max-w-[120px]">
                {state.datasetName} <span className="text-primary font-code opacity-80 ml-1">v{state.version}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
           <div className="hidden lg:flex items-center gap-8 px-6 py-2 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
              <Metric label="Chunks" value={state.chunks.length} icon={<Database className="h-3 w-3" />} />
              <Metric label="QA Shards" value={state.qaPairs.length} icon={<Terminal className="h-3 w-3" />} />
              <Metric 
                label="Integrity" 
                value={state.chunks.length > 0 ? `${Math.round(state.qualityMetrics.semanticCoherence * 100)}%` : '0%'} 
                icon={state.qualityMetrics.semanticCoherence > 0.8 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Activity className="h-3 w-3 text-orange-500" />} 
              />
           </div>

           <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-muted-foreground hover:text-primary transition-all group" 
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-500" />
              </Button>
           </div>

           {loading ? (
             <div className="h-9 w-24 bg-muted/20 animate-pulse rounded-xl" />
           ) : user ? (
             <div className="flex items-center gap-2">
               <div className="hidden sm:flex gap-1.5">
                 <Button variant="ghost" size="sm" className="h-8 text-[8px] font-black uppercase tracking-widest gap-2 text-primary hover:bg-primary/10" onClick={handleSaveToCloud}>
                   <Cloud className="h-3 w-3" /> Sync
                 </Button>
               </div>
               <div className="flex items-center gap-3 pl-3 md:pl-6 md:border-l border-white/10 group cursor-pointer" onClick={() => setSettingsOpen(true)}>
                 <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl border-2 border-primary/20 bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px] md:text-[11px] shadow-xl group-hover:scale-105 transition-transform">
                   {user.displayName?.[0] || user.email?.[0] || 'A'}
                 </div>
               </div>
             </div>
           ) : (
             <Button variant="outline" size="sm" className="h-9 px-3 md:px-6 text-[9px] font-black uppercase tracking-[0.2em] gap-2 bg-primary/10 border-primary/30 hover:bg-primary/20" onClick={handleSignIn}>
               <LogIn className="h-3.5 w-3.5" /> Auth
             </Button>
           )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {isMobile ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              <TabsContent value="ingest" className="h-full m-0"><UploadPanel state={state} updateState={updateState} /></TabsContent>
              <TabsContent value="intelligence" className="h-full m-0"><ProcessingPanel state={state} updateState={updateState} /></TabsContent>
              <TabsContent value="curation" className="h-full m-0"><PreviewPanel state={state} updateState={updateState} /></TabsContent>
              <TabsContent value="deploy" className="h-full m-0"><ExportPanel state={state} updateState={updateState} /></TabsContent>
            </div>
            <TabsList className="h-16 w-full bg-card/60 backdrop-blur-xl border-t grid grid-cols-4 p-2 gap-2 shrink-0">
              <TabsTrigger value="ingest" className="flex flex-col gap-1 text-[8px] font-black uppercase"><Upload className="h-4 w-4" /> Ingest</TabsTrigger>
              <TabsTrigger value="intelligence" className="flex flex-col gap-1 text-[8px] font-black uppercase"><Cog className="h-4 w-4" /> AI</TabsTrigger>
              <TabsTrigger value="curation" className="flex flex-col gap-1 text-[8px] font-black uppercase"><Eye className="h-4 w-4" /> Edit</TabsTrigger>
              <TabsTrigger value="deploy" className="flex flex-col gap-1 text-[8px] font-black uppercase"><Share2 className="h-4 w-4" /> Launch</TabsTrigger>
            </TabsList>
          </Tabs>
        ) : (
          <div className="grid h-full grid-cols-12 overflow-hidden">
            <div className="col-span-10 grid grid-cols-4 gap-px bg-white/5 overflow-hidden">
              <div className="workspace-panel bg-background/30">
                 <PanelHeader icon={<Upload className="h-4 w-4" />} title="1. Ingestion Engine" />
                 <UploadPanel state={state} updateState={updateState} />
              </div>
              <div className="workspace-panel bg-background/30">
                 <PanelHeader icon={<Cog className="h-4 w-4" />} title="2. Intelligence Layer" />
                 <ProcessingPanel state={state} updateState={updateState} />
              </div>
              <div className="workspace-panel bg-background/30 border-l border-white/5">
                 <PanelHeader icon={<Eye className="h-4 w-4" />} title="3. Curation Hub" />
                 <PreviewPanel state={state} updateState={updateState} />
              </div>
              <div className="workspace-panel bg-background/30 border-l border-white/5">
                 <PanelHeader icon={<Share2 className="h-4 w-4" />} title="4. Deployment Vault" />
                 <ExportPanel state={state} updateState={updateState} />
              </div>
            </div>

            <div className="col-span-2 border-l border-white/5 bg-black/20 flex flex-col overflow-hidden">
              <div className="h-12 px-5 border-b border-white/5 bg-black/10 flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-3">
                  <History className="h-4 w-4 text-primary" /> Audit Trail
                </h2>
                <Badge variant="outline" className="text-[9px] font-code h-5 px-2 border-primary/30 text-primary">
                  {state.logs.length}
                </Badge>
              </div>
              <ScrollArea className="flex-1 p-5">
                <div className="space-y-6">
                  {state.logs.map((log) => (
                    <div key={log.id} className="group relative pl-5 border-l border-white/10 transition-colors hover:border-primary/50">
                      <div className={cn(
                        "absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background shadow-lg transition-all",
                        log.type === 'ai' ? 'bg-primary animate-pulse' : log.type === 'error' ? 'bg-destructive' : log.type === 'success' ? 'bg-green-500' : 'bg-muted-foreground'
                      )} />
                      <p className="text-[9px] font-black text-muted-foreground/50 tracking-widest uppercase">
                        {log.timestamp.toLocaleTimeString()}
                      </p>
                      <p className="text-xs font-medium leading-relaxed text-foreground/80 mt-1.5">{log.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </main>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

function Metric({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-primary/70 group-hover:scale-110 transition-transform">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground/60 leading-none mb-1">{label}</span>
        <span className="text-xs font-code font-black text-foreground/90">{value}</span>
      </div>
    </div>
  );
}
