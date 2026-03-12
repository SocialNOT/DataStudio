"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import UploadPanel from './UploadPanel';
import ProcessingPanel from './ProcessingPanel';
import PreviewPanel from './PreviewPanel';
import ExportPanel from './ExportPanel';
import { BrainCircuit, Upload, Cog, Eye, Share2 } from 'lucide-react';

export type PipelineState = {
  rawText: string;
  processedText: string;
  chunks: { text: string; metadata: any }[];
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  fileName?: string;
};

export default function StudioDashboard() {
  const isMobile = useIsMobile();
  const [state, setState] = useState<PipelineState>({
    rawText: '',
    processedText: '',
    chunks: [],
    status: 'idle',
  });

  const updateState = (updates: Partial<PipelineState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const DesktopLayout = () => (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-card/30 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-headline text-xl font-bold tracking-tight">Mitsara Data Studio</h1>
            <p className="text-xs text-muted-foreground">AI Knowledge Ingestion Pipeline</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs">
            <span className={`h-2 w-2 rounded-full ${state.status === 'processing' ? 'animate-pulse bg-accent' : state.status === 'completed' ? 'bg-green-500' : 'bg-muted-foreground'}`} />
            <span className="capitalize font-medium">{state.status === 'idle' ? 'System Ready' : state.status}</span>
          </div>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-12 gap-px bg-border">
        {/* Panel 1: Upload */}
        <div className="col-span-3 bg-background workspace-panel border-r">
          <div className="p-4 border-b bg-muted/20 flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            <h2 className="font-headline text-sm font-semibold uppercase tracking-wider text-muted-foreground">1. Upload</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <UploadPanel state={state} updateState={updateState} />
          </div>
        </div>

        {/* Panel 2: Processing */}
        <div className="col-span-3 bg-background workspace-panel border-r">
           <div className="p-4 border-b bg-muted/20 flex items-center gap-2">
            <Cog className="h-4 w-4 text-primary" />
            <h2 className="font-headline text-sm font-semibold uppercase tracking-wider text-muted-foreground">2. Processing</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ProcessingPanel state={state} updateState={updateState} />
          </div>
        </div>

        {/* Panel 3: Preview */}
        <div className="col-span-4 bg-background workspace-panel border-r">
           <div className="p-4 border-b bg-muted/20 flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <h2 className="font-headline text-sm font-semibold uppercase tracking-wider text-muted-foreground">3. Human-in-the-Loop Editor</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <PreviewPanel state={state} updateState={updateState} />
          </div>
        </div>

        {/* Panel 4: Export */}
        <div className="col-span-2 bg-background workspace-panel">
           <div className="p-4 border-b bg-muted/20 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            <h2 className="font-headline text-sm font-semibold uppercase tracking-wider text-muted-foreground">4. Deploy</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ExportPanel state={state} updateState={updateState} />
          </div>
        </div>
      </div>
    </div>
  );

  const MobileLayout = () => (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
        <BrainCircuit className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-lg font-bold">Mitsara</h1>
      </header>
      <Tabs defaultValue="upload" className="flex flex-1 flex-col">
        <div className="flex-1 overflow-hidden">
          <TabsContent value="upload" className="m-0 h-full overflow-y-auto"><UploadPanel state={state} updateState={updateState} /></TabsContent>
          <TabsContent value="process" className="m-0 h-full overflow-y-auto"><ProcessingPanel state={state} updateState={updateState} /></TabsContent>
          <TabsContent value="preview" className="m-0 h-full overflow-hidden"><PreviewPanel state={state} updateState={updateState} /></TabsContent>
          <TabsContent value="export" className="m-0 h-full overflow-y-auto"><ExportPanel state={state} updateState={updateState} /></TabsContent>
        </div>
        <TabsList className="h-16 w-full rounded-none border-t bg-muted/30 p-1">
          <TabsTrigger value="upload" className="flex flex-1 flex-col gap-1 py-2 text-[10px]"><Upload className="h-4 w-4" />Upload</TabsTrigger>
          <TabsTrigger value="process" className="flex flex-1 flex-col gap-1 py-2 text-[10px]"><Cog className="h-4 w-4" />Process</TabsTrigger>
          <TabsTrigger value="preview" className="flex flex-1 flex-col gap-1 py-2 text-[10px]"><Eye className="h-4 w-4" />Preview</TabsTrigger>
          <TabsTrigger value="export" className="flex flex-1 flex-col gap-1 py-2 text-[10px]"><Share2 className="h-4 w-4" />Export</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
