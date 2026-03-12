"use client";

import React, { useCallback } from 'react';
import { PipelineState } from './StudioDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileUp, Link2, FolderUp, Type, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadPanelProps {
  state: PipelineState;
  updateState: (updates: Partial<PipelineState>) => void;
}

export default function UploadPanel({ state, updateState }: UploadPanelProps) {
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    updateState({ status: 'uploading' });

    // Mock processing for simulation
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setTimeout(() => {
        updateState({
          rawText: text || "Sample document content extracted from " + file.name,
          fileName: file.name,
          status: 'idle'
        });
        toast({ title: "File Uploaded", description: `${file.name} ready for processing.` });
      }, 1000);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    updateState({ rawText: '', fileName: undefined, chunks: [], processedText: '', status: 'idle' });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Ingestion Method</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/10 p-4 transition-colors hover:border-primary/50 hover:bg-primary/5">
            <FileUp className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Upload File</span>
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.pdf,.docx,.md" />
          </label>
          <button className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/10 p-4 transition-colors hover:border-accent/50 hover:bg-accent/5">
            <FolderUp className="h-6 w-6 text-accent" />
            <span className="text-xs font-medium">Upload Folder</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/10 p-4 transition-colors hover:border-primary/50 hover:bg-primary/5">
            <Link2 className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">Scrape URL</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/10 p-4 transition-colors hover:border-accent/50 hover:bg-accent/5">
            <Type className="h-6 w-6 text-accent" />
            <span className="text-xs font-medium">Paste Text</span>
          </button>
        </div>
      </section>

      {state.rawText ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Source Content</h3>
            <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 text-destructive">
              <X className="mr-1 h-3 w-3" /> Clear
            </Button>
          </div>
          <Card className="relative overflow-hidden border-primary/20 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold font-headline">{state.fileName || 'Pasted Content'}</span>
            </div>
            <div className="max-h-48 overflow-y-auto text-xs leading-relaxed opacity-80 font-body">
              {state.rawText.substring(0, 1000)}
              {state.rawText.length > 1000 && '...'}
            </div>
          </Card>
        </section>
      ) : (
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Quick Paste</h3>
          <Textarea 
            placeholder="Paste raw document text here..." 
            className="min-h-[200px] font-body text-sm"
            value={state.rawText}
            onChange={(e) => updateState({ rawText: e.target.value })}
          />
        </section>
      )}

      <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-tight">System Info</h4>
        <ul className="space-y-1 text-[11px] text-muted-foreground">
          <li>• Max file size: 50MB</li>
          <li>• Supported: Sanskrit, Hindi, English</li>
          <li>• OCR active for images</li>
        </ul>
      </div>
    </div>
  );
}
