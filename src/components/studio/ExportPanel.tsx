"use client";

import React, { useState } from 'react';
import { PipelineState } from './StudioDashboard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Download, Database, CloudUpload, CheckCircle2, FileJson, FileType, Table as TableIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportPanelProps {
  state: PipelineState;
  updateState: (updates: Partial<PipelineState>) => void;
}

export default function ExportPanel({ state, updateState }: ExportPanelProps) {
  const { toast } = useToast();
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dbType, setDbType] = useState('chroma');

  const handleDeploy = () => {
    if (!state.chunks.length) {
      toast({ title: "No data", description: "Process some documents before deploying.", variant: "destructive" });
      return;
    }

    setDeploying(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDeploying(false);
          toast({ title: "Deployment Successful", description: `Data synchronized with ${dbType.toUpperCase()}.` });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDownload = (format: string) => {
    toast({ title: "Export Started", description: `Generating ${format.toUpperCase()} dataset...` });
  };

  return (
    <div className="flex flex-col gap-8 p-6">
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Database className="h-4 w-4" /> Vector DB Deployment
        </h3>
        <div className="space-y-3">
          <Label className="text-xs">Target Provider</Label>
          <Select value={dbType} onValueChange={setDbType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chroma">ChromaDB (Local)</SelectItem>
              <SelectItem value="pinecone">Pinecone (Cloud)</SelectItem>
              <SelectItem value="weaviate">Weaviate</SelectItem>
              <SelectItem value="qdrant">Qdrant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 pt-2">
           <Label className="text-xs">Embedding Model</Label>
           <Select defaultValue="bge-large">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bge-large">BAAI/bge-large-en</SelectItem>
              <SelectItem value="openai">OpenAI Text-3-Small</SelectItem>
              <SelectItem value="instructor">Instructor-XL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {deploying && (
          <div className="space-y-2 py-2">
            <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider">
              <span>Syncing Vectors</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        <Button 
          variant="accent" 
          className="w-full shadow-lg shadow-accent/20" 
          onClick={handleDeploy}
          disabled={deploying || !state.chunks.length}
        >
          {deploying ? <CloudUpload className="mr-2 h-4 w-4 animate-bounce" /> : <Database className="mr-2 h-4 w-4" />}
          {deploying ? 'Pushing Data...' : 'Push to Vector DB'}
        </Button>
      </section>

      <div className="h-px bg-border/50" />

      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Download className="h-4 w-4" /> Dataset Export
        </h3>
        <div className="grid grid-cols-1 gap-2">
          <Button variant="outline" className="justify-start gap-3 h-11" onClick={() => handleDownload('jsonl')}>
            <FileJson className="h-4 w-4 text-orange-500" />
            <div className="text-left">
              <div className="text-xs font-bold">JSONL Format</div>
              <div className="text-[10px] text-muted-foreground">Standard RAG interchange</div>
            </div>
          </Button>
          <Button variant="outline" className="justify-start gap-3 h-11" onClick={() => handleDownload('hf')}>
             <div className="h-4 w-4 flex items-center justify-center font-bold text-yellow-500">🤗</div>
            <div className="text-left">
              <div className="text-xs font-bold">HuggingFace</div>
              <div className="text-[10px] text-muted-foreground">Parquet dataset shards</div>
            </div>
          </Button>
          <Button variant="outline" className="justify-start gap-3 h-11" onClick={() => handleDownload('csv')}>
            <TableIcon className="h-4 w-4 text-green-500" />
            <div className="text-left">
              <div className="text-xs font-bold">CSV / Sheets</div>
              <div className="text-[10px] text-muted-foreground">Tabular review file</div>
            </div>
          </Button>
        </div>
      </section>

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-green-500/5 p-4 border border-green-500/10">
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
            All datasets created via Mitsara Data Studio follow the <span className="text-green-500 font-bold">IKS-01 Standard</span> for civilizational knowledge preservation.
          </p>
        </div>
      </div>
    </div>
  );
}
