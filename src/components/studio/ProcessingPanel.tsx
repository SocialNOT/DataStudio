"use client";

import React, { useState, useEffect } from 'react';
import { PipelineState } from './StudioDashboard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Languages, Eraser, Scissors, Tag, Zap, Wand2, Terminal } from 'lucide-react';
import { aiPoweredDocumentCleaning } from '@/ai/flows/ai-powered-document-cleaning';
import { automatedChunkingAndMetadataGeneration } from '@/ai/flows/automated-chunking-and-metadata-generation';
import { multilingualOcr } from '@/ai/flows/multilingual-ai-powered-ocr';
import { generateQaPairs } from '@/ai/flows/qa-pair-generation';
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
    useQaPairs: false,
    language: 'english',
    chunkSize: 800,
    chunkOverlap: 100,
  });

  useEffect(() => {
    if (state.fileType?.startsWith('image/')) {
      setOptions(prev => ({ ...prev, useOcr: true }));
    }
  }, [state.fileType]);

  const addPipelineLog = (message: string, type: 'info' | 'ai' | 'success' | 'error' = 'info') => {
    updateState({
      logs: [{ 
        id: Math.random().toString(36).substr(2, 9), 
        timestamp: new Date(), 
        message, 
        type 
      }, ...state.logs]
    });
  };

  const runPipeline = async () => {
    if (!state.rawText) {
      toast({ title: "Input Required", description: "Please upload a document or paste text to begin.", variant: "destructive" });
      return;
    }

    updateState({ status: 'processing' });
    addPipelineLog("Starting high-fidelity ingestion sequence...", "info");

    try {
      let currentText = state.rawText;

      // 1. OCR
      if (options.useOcr && state.fileType?.startsWith('image/')) {
        addPipelineLog("Activating Multilingual OCR engine...", "ai");
        const ocrResult = await multilingualOcr({ 
          photoDataUri: state.rawText,
          languageHint: options.language 
        });
        currentText = ocrResult.extractedText;
        addPipelineLog(`OCR completed. Detected ${ocrResult.detectedLanguage} @ ${Math.round(ocrResult.confidence * 100)}% accuracy.`, "success");
      }

      // 2. Cleaning
      if (options.useCleaning) {
        addPipelineLog("Running neural noise reduction and normalization...", "ai");
        const cleaningResult = await aiPoweredDocumentCleaning({ documentText: currentText });
        currentText = cleaningResult.cleanedText;
        addPipelineLog("Pruned document: Removed headers, page markers, and encoding artifacts.", "success");
      }

      // 3. Chunking & Metadata
      let chunks = [];
      if (options.useChunking) {
        addPipelineLog(`Segmenting text into semantic units (Size: ${options.chunkSize}t)...`, "ai");
        const chunkingResult = await automatedChunkingAndMetadataGeneration({
          documentContent: currentText,
          chunkSize: options.chunkSize,
          chunkOverlap: options.chunkOverlap,
          sourceDetails: {
            textName: state.fileName || "Ad-hoc Dataset",
            language: options.language,
            domain: "Knowledge Base",
          }
        });
        chunks = chunkingResult.chunks;
        addPipelineLog(`Segmented into ${chunks.length} semantically rich units.`, "success");
      }

      // 4. QA Pair Generation (Feature 10)
      let qaPairs = [];
      if (options.useQaPairs && chunks.length > 0) {
        addPipelineLog("Generating instruction-response pairs for fine-tuning...", "ai");
        // For demo purposes, we generate QA pairs for the first 3 chunks to save tokens
        const targetChunks = chunks.slice(0, 3);
        const allPairs = await Promise.all(targetChunks.map(c => generateQaPairs({ text: c.text, count: 2 })));
        qaPairs = allPairs.flatMap(p => p.pairs);
        addPipelineLog(`Synthesized ${qaPairs.length} instruction pairs for LLM training.`, "success");
      }
      
      updateState({ 
        processedText: currentText,
        chunks: chunks,
        qaPairs: qaPairs,
        status: 'completed' 
      });

      toast({ title: "Pipeline Synchronized", description: "Datasets ready for curation and delivery." });
    } catch (err) {
      console.error(err);
      updateState({ status: 'error' });
      addPipelineLog("Critical failure in AI processing layer.", "error");
      toast({ title: "Pipeline Fault", description: "The AI engine encountered an error. Check logs.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 p-5">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          <PipelineToggle 
            label="Visual OCR" 
            icon={<Languages className="h-3 w-3" />} 
            checked={options.useOcr} 
            onChange={(v) => setOptions(p => ({ ...p, useOcr: v }))} 
            badge={state.fileType?.startsWith('image/') ? "REQUIRED" : ""}
          />
          <PipelineToggle 
            label="Neural Cleaning" 
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
          <PipelineToggle 
            label="QA Pair Generation" 
            icon={<Terminal className="h-3 w-3" />} 
            checked={options.useQaPairs} 
            onChange={(v) => setOptions(p => ({ ...p, useQaPairs: v }))} 
            badge="NEW: TRAIN"
          />
        </div>

        <div className="space-y-4 rounded-xl bg-card/30 p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
             <Wand2 className="h-3.5 w-3.5 text-primary" />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Contextual Tuning</span>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-muted-foreground">Token Limit</span>
                <span className="text-primary">{options.chunkSize}t</span>
              </div>
              <Slider 
                value={[options.chunkSize]} 
                min={200} max={1500} step={100}
                onValueChange={([v]) => setOptions(prev => ({ ...prev, chunkSize: v }))}
                className="[&_.relative]:h-1"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-muted-foreground">Semantic Overlap</span>
                <span className="text-accent">{options.chunkOverlap}t</span>
              </div>
              <Slider 
                value={[options.chunkOverlap]} 
                min={0} max={400} step={10}
                onValueChange={([v]) => setOptions(prev => ({ ...prev, chunkOverlap: v }))}
                className="[&_.relative]:h-1"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 space-y-3">
             <div className="flex items-center gap-2">
               <Tag className="h-3 w-3 text-muted-foreground" />
               <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary Language</Label>
             </div>
             <Select 
                value={options.language} 
                onValueChange={(v) => setOptions(prev => ({ ...prev, language: v }))}
              >
                <SelectTrigger className="h-9 text-[11px] bg-background/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English (Standard)</SelectItem>
                  <SelectItem value="sanskrit">Sanskrit (IAST)</SelectItem>
                  <SelectItem value="hindi">Hindi (Devanagari)</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Button 
          className={`w-full h-12 relative overflow-hidden group transition-all duration-500 ${state.status === 'processing' ? 'bg-muted/50 cursor-not-allowed' : 'bg-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]'}`}
          onClick={runPipeline}
          disabled={state.status === 'processing' || !state.rawText}
        >
          {state.status === 'processing' && (
             <div className="absolute inset-0 bg-primary/20 animate-pulse" />
          )}
          <div className="flex items-center justify-center gap-3 relative">
            {state.status === 'processing' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 fill-current group-hover:rotate-12 transition-transform" />
            )}
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{state.status === 'processing' ? 'Processing...' : 'Deploy Pipeline'}</span>
          </div>
        </Button>
      </div>
    </div>
  );
}

function PipelineToggle({ label, icon, checked, onChange, badge }: { label: string, icon: React.ReactNode, checked: boolean, onChange: (v: boolean) => void, badge?: string }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${checked ? 'bg-primary/10 border-primary/30' : 'bg-muted/5 border-border/40 hover:border-border/80'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-md transition-colors ${checked ? 'bg-primary/20 text-primary' : 'bg-muted/30 text-muted-foreground'}`}>
          {icon}
        </div>
        <div>
          <Label className="text-[10px] font-bold uppercase tracking-widest block leading-none cursor-pointer">{label}</Label>
          {badge && <span className="text-[8px] font-black text-accent mt-1 block tracking-tighter">{badge}</span>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
