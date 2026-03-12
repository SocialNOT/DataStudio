
"use client";

import React, { useState } from 'react';
import { PipelineState } from './StudioDashboard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Database, 
  CloudUpload, 
  FileJson, 
  Table as TableIcon,
  Globe,
  ShieldCheck,
  Cpu,
  Layers,
  Rocket
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface ExportPanelProps {
  state: PipelineState;
  updateState: (updates: Partial<PipelineState>) => void;
}

export default function ExportPanel({ state, updateState }: ExportPanelProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dbType, setDbType] = useState('chroma');

  const handleDeploy = async () => {
    if (!state.chunks.length && !state.qaPairs.length) {
      toast({ title: "Vault Empty", description: "Initialize pipeline before deployment.", variant: "destructive" });
      return;
    }

    setDeploying(true);
    setProgress(0);
    
    // Simulate complex vector indexing
    const interval = setInterval(async () => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finalizeDeployment();
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const finalizeDeployment = async () => {
    setDeploying(false);
    
    if (user) {
      // Feature 9: Vector Database Integration (Simulated record)
      const deploymentRef = doc(db, 'datasets', state.datasetId, 'deployments', Date.now().toString());
      await setDoc(deploymentRef, {
        target: dbType,
        status: 'synced',
        timestamp: serverTimestamp(),
        chunkCount: state.chunks.length,
        version: state.version
      });
    }

    toast({ 
      title: "Node Synchronized", 
      description: `Data broadcasted to ${dbType.toUpperCase()} cluster.` 
    });
    
    updateState({
      logs: [{
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        message: `Broadcasted to ${dbType.toUpperCase()} infrastructure successfully.`,
        type: 'success'
      }, ...state.logs]
    });
  };

  return (
    <div className="flex flex-col gap-8 p-6">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" /> Vector Delivery
          </h3>
          <Badge variant="outline" className="h-4 text-[8px] border-accent/20 text-accent">SECURE_TUNNEL</Badge>
        </div>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground/80">Target Infrastructure</Label>
            <Select value={dbType} onValueChange={setDbType}>
              <SelectTrigger className="h-9 text-xs bg-background/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chroma">ChromaDB (Semantic Edge)</SelectItem>
                <SelectItem value="pinecone">Pinecone (Cloud Hyper)</SelectItem>
                <SelectItem value="weaviate">Weaviate Cluster</SelectItem>
                <SelectItem value="qdrant">Qdrant Neural Engine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
             <Label className="text-[9px] font-bold uppercase text-muted-foreground/80">Embedding Protocol</Label>
             <div className="h-9 px-3 rounded-md bg-background/40 border border-white/5 flex items-center text-xs text-primary font-bold">
               {state.embeddingModel.toUpperCase()}
             </div>
          </div>
        </div>

        {deploying && (
          <div className="space-y-2 py-3">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-primary">
              <span>Broadcasting Shards</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}

        <Button 
          variant="default" 
          className="w-full h-11 bg-accent hover:bg-accent/80 text-white shadow-lg shadow-accent/20 group overflow-hidden" 
          onClick={handleDeploy}
          disabled={deploying || (!state.chunks.length && !state.qaPairs.length)}
        >
          <div className="flex items-center justify-center gap-2 relative">
            <CloudUpload className={`h-4 w-4 ${deploying ? 'animate-bounce' : 'group-hover:-translate-y-1 transition-transform'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Broadcast to Vault</span>
          </div>
        </Button>
      </section>

      <div className="h-px bg-white/5" />

      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Layers className="h-3.5 w-3.5" /> Training Formats
        </h3>
        <div className="grid grid-cols-1 gap-2">
          <ExportButton icon={<FileJson className="h-4 w-4 text-orange-400" />} label="Llama-3 Alpaca" sub="Instructional JSONL" />
          <ExportButton icon={<Cpu className="h-4 w-4 text-yellow-400" />} label="ShareGPT v4" sub="Conversational Multi-turn" />
          <ExportButton icon={<Rocket className="h-4 w-4 text-green-400" />} label="HuggingFace Shards" sub="Parquet / HF Datasets" />
          <ExportButton icon={<TableIcon className="h-4 w-4 text-blue-400" />} label="Tabular Review" sub="CSV / Excel Ingestion" />
        </div>
      </section>

      <div className="mt-auto p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Validation Active</p>
          <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
            Every shard generated follows the <span className="text-primary font-bold">Mitsara IKS Protocol</span> for civilizational data preservation.
          </p>
        </div>
      </div>
    </div>
  );
}

function ExportButton({ icon, label, sub }: { icon: React.ReactNode, label: string, sub: string }) {
  const { toast } = useToast();
  return (
    <Button 
      variant="outline" 
      className="justify-start gap-3 h-12 bg-muted/5 border-white/5 hover:border-white/20 hover:bg-muted/10 transition-all"
      onClick={() => toast({ title: "Export Initialized", description: `Generating ${label} package...` })}
    >
      <div className="p-1.5 rounded bg-muted/20">{icon}</div>
      <div className="text-left">
        <div className="text-[11px] font-black uppercase tracking-widest leading-none">{label}</div>
        <div className="text-[9px] text-muted-foreground mt-1 uppercase tracking-tighter opacity-60">{sub}</div>
      </div>
    </Button>
  );
}
