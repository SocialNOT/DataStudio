"use client";

import React, { useState } from 'react';
import { PipelineState } from './StudioDashboard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Languages, Eraser, Scissors, Tag } from 'lucide-react';
import { aiPoweredDocumentCleaning } from '@/ai/flows/ai-powered-document-cleaning';
import { automatedChunkingAndMetadataGeneration } from '@/ai/flows/automated-chunking-and-metadata-generation';
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

  const runPipeline = async () => {
    if (!state.rawText) {
      toast({ title: "No input", description: "Please upload or paste text first.", variant: "destructive" });
      return;
    }

    updateState({ status: 'processing' });

    try {
      let currentText = state.rawText;

      // 1. Cleaning
      if (options.useCleaning) {
        const cleaningResult = await aiPoweredDocumentCleaning({ documentText: currentText });
        currentText = cleaningResult.cleanedText;
      }

      // 2. Chunking & Metadata
      if (options.useChunking) {
        const chunkingResult = await automatedChunkingAndMetadataGeneration({
          documentContent: currentText,
          chunkSize: options.chunkSize,
          chunkOverlap: options.chunkOverlap,
          sourceDetails: {
            textName: state.fileName || "Untitled Dataset",
            language: options.language,
            domain: "General Knowledge",
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

      toast({ title: "Processing Complete", description: "Your data is ready for review." });
    } catch (err) {
      console.error(err);
      updateState({ status: 'error' });
      toast({ title: "Pipeline Error", description: "Something went wrong during processing.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eraser className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Text Cleaning</Label>
          </div>
          <Switch 
            checked={options.useCleaning} 
            onCheckedChange={(v) => setOptions(prev => ({ ...prev, useCleaning: v }))} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">OCR (Images/Manuscripts)</Label>
          </div>
          <Switch 
            checked={options.useOcr} 
            onCheckedChange={(v) => setOptions(prev => ({ ...prev, useOcr: v }))} 
          />
        </div>

        <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Intelligent Chunking</Label>
            </div>
            <Switch 
              checked={options.useChunking} 
              onCheckedChange={(v) => setOptions(prev => ({ ...prev, useChunking: v }))} 
            />
          </div>

          {options.useChunking && (
            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Chunk Size</span>
                  <span className="font-code text-accent">{options.chunkSize} tokens</span>
                </div>
                <Slider 
                  value={[options.chunkSize]} 
                  min={200} max={2000} step={50}
                  onValueChange={([v]) => setOptions(prev => ({ ...prev, chunkSize: v }))}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Overlap</span>
                  <span className="font-code text-accent">{options.chunkOverlap} tokens</span>
                </div>
                <Slider 
                  value={[options.chunkOverlap]} 
                  min={0} max={500} step={10}
                  onValueChange={([v]) => setOptions(prev => ({ ...prev, chunkOverlap: v }))}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Language Setting</Label>
          </div>
          <Select 
            value={options.language} 
            onValueChange={(v) => setOptions(prev => ({ ...prev, language: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select primary language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="sanskrit">Sanskrit (IAST)</SelectItem>
              <SelectItem value="hindi">Hindi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        size="lg" 
        className="w-full h-12 shadow-xl shadow-primary/10" 
        onClick={runPipeline}
        disabled={state.status === 'processing' || !state.rawText}
      >
        {state.status === 'processing' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Data...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" /> Start Pipeline
          </>
        )}
      </Button>

      <div className="mt-auto space-y-4">
        <div className="rounded-xl bg-accent/10 p-4 border border-accent/20">
          <h4 className="text-xs font-bold font-headline text-accent uppercase tracking-wider mb-1">Mitsara Mission</h4>
          <p className="text-[11px] leading-relaxed text-muted-foreground italic">
            "Preserving civilizational knowledge through modern AI ingestion infrastructure."
          </p>
        </div>
      </div>
    </div>
  );
}
