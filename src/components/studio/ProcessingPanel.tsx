"use client";

import React, { useState, useEffect } from 'react';
import { PipelineState } from './StudioDashboard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Languages, Eraser, Scissors, Tag, Zap, Wand2 } from 'lucide-react';
import { aiPoweredDocumentCleaning } from '@/ai/flows/ai-powered-document-cleaning';
import { automatedChunkingAndMetadataGeneration } from '@/ai/flows/automated-chunking-and-metadata-generation';
import { multilingualOcr } from '@/ai/flows/multilingual-ai-powered-ocr';
import { useToast } from '@/hooks/use-toast';

interface ProcessingPanelProps {
  state: PipelineState;
  updateState: (updates: Partial<PipelineState>) => void;
}

export default function ProcessingPanel({ state, updateState }: ProcessingPanelProps) {
  const { toast } = useToast();
  const [options, setOptions] = useState({
    useOcr: false,
    useCleaning: true,
    useChunking: true,
    language: 'english',
    chunkSize: 800,
    chunkOverlap: 100,
  });

  // Auto-enable OCR if an image is uploaded
  useEffect(() => {
    if (state.fileType?.startsWith('image/')) {
      setOptions(prev => ({ ...prev, useOcr: true }));
    }
  }, [state.fileType]);

  const runPipeline = async () => {
    if (!state.rawText) {
      toast({ title: "No input", description: "Please upload or paste text first.", variant: "destructive" });
      return;
    }

    updateState({ status: 'processing' });

    try {
      let currentText = state.rawText;

      // 1. OCR (if applicable)
      if (options.useOcr && state.fileType?.startsWith('image/')) {
        const ocrResult = await multilingualOcr({ 
          photoDataUri: state.rawText,
          languageHint: options.language 
        });
        currentText = ocrResult.extractedText;
      }

      // 2. Cleaning
      if (options.useCleaning) {
        const cleaningResult = await aiPoweredDocumentCleaning({ documentText: currentText });
        currentText = cleaningResult.cleanedText;
      }

      // 3. Chunking & Metadata
      if (options.useChunking) {
        const chunkingResult = await automatedChunkingAndMetadataGeneration({
          documentContent: currentText,
          chunkSize: options.chunkSize,
          chunkOverlap: options.chunkOverlap,
          sourceDetails: {
            textName: state.fileName || "Untitled Dataset",
            language: options.language,
            domain: "IKS Civilizational Data",
          }
        });
        
        updateState({ 
          processedText: currentText,
          chunks: chunkingResult.chunks,
          status: 'completed' 
        });
      } else {
        updateState({ 
          processedText: currentText,
          status: 'completed' 
        });
      }

      toast({ title: "Ingestion Pipeline Success", description: `Processed into ${state.chunks.length} semantic units.` });
    } catch (err) {
      console.error(err);
      updateState({ status: 'error' });
      toast({ title: "Pipeline Fault", description: "An error occurred in the AI processing layers.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-5">
      <div className="space-y-4">
        {/* Toggle Sections */}
        <div className="grid grid-cols-1 gap-2">
          <PipelineToggle 
            label="Visual OCR" 
            icon={<Languages className="h-3 w-3" />} 
            checked={options.useOcr} 
            onChange={(v) => setOptions(p => ({ ...p, useOcr: v }))} 
            badge={state.fileType?.startsWith('image/') ? "RECOMMENDED" : ""}
          />
          <PipelineToggle 
            label="Noise Cleaning" 
            icon={<Eraser className="h-3 w-3" />} 
            checked={options.useCleaning} 
            onChange={(v) => setOptions(p => ({ ...p, useCleaning: v }))} 
          />
          <PipelineToggle 
            label="Semantic Chunking" 
            icon={<Scissors className="h-3 w-3" />} 
            checked={options.useChunking} 
            onChange={(v) => setOptions(p => ({ ...p, useChunking: v }))} 
          />
        </div>

        {/* Dynamic Controls */}
        <div className="space-y-4 rounded-xl bg-card/30 p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
             <Wand2 className="h-3.5 w-3.5 text-primary" />
             <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Model Parameters</span>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-muted-foreground">Window Size</span>
                <span className="text-primary">{options.chunkSize}t</span>
              </div>
              <Slider 
                value={[options.chunkSize]} 
                min={200} max={2000} step={100}
                onValueChange={([v]) => setOptions(prev => ({ ...prev, chunkSize: v }))}
                className="[&_.relative]:h-1"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-muted-foreground">Context Overlap</span>
                <span className="text-accent">{options.chunkOverlap}t</span>
              </div>
              <Slider 
                value={[options.chunkOverlap]} 
                min={0} max={500} step={10}
                onValueChange={([v]) => setOptions(prev => ({ ...prev, chunkOverlap: v }))}
                className="[&_.relative]:h-1"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 space-y-3">
             <div className="flex items-center gap-2">
               <Tag className="h-3 w-3 text-muted-foreground" />
               <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary Context</Label>
             </div>
             <Select 
                value={options.language} 
                onValueChange={(v) => setOptions(prev => ({ ...prev, language: v }))}
              >
                <SelectTrigger className="h-9 text-[11px] bg-background/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English (Modern)</SelectItem>
                  <SelectItem value="sanskrit">Sanskrit (IAST)</SelectItem>
                  <SelectItem value="hindi">Hindi (Devanagari)</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Button 
          className={`w-full h-11 relative overflow-hidden group transition-all duration-300 ${state.status === 'processing' ? 'bg-muted pointer-events-none' : 'bg-primary hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)]'}`}
          onClick={runPipeline}
          disabled={state.status === 'processing' || !state.rawText}
        >
          {state.status === 'processing' && (
             <div className="absolute inset-0 bg-primary/20 animate-[shimmer_2s_infinite]" />
          )}
          <div className="flex items-center justify-center gap-2 relative">
            {state.status === 'processing' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{state.status === 'processing' ? 'Processing...' : 'Engage Pipeline'}</span>
          </div>
        </Button>
      </div>
    </div>
  );
}

function PipelineToggle({ label, icon, checked, onChange, badge }: { label: string, icon: React.ReactNode, checked: boolean, onChange: (v: boolean) => void, badge?: string }) {
  return (
    <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${checked ? 'bg-primary/5 border-primary/20' : 'bg-muted/5 border-border/40'}`}>
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-md ${checked ? 'bg-primary/20 text-primary' : 'bg-muted/30 text-muted-foreground'}`}>
          {icon}
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-wider block leading-none">{label}</Label>
          {badge && <span className="text-[8px] font-bold text-accent animate-pulse">{badge}</span>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}