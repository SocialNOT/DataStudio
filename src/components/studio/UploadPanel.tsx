"use client";

import React, { useState } from 'react';
import { PipelineState } from './StudioDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileUp, Link2, FolderUp, Type, FileText, X, ImageIcon, FileSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadPanelProps {
  state: PipelineState;
  updateState: (updates: Partial<PipelineState>) => void;
}

export default function UploadPanel({ state, updateState }: UploadPanelProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    updateState({ status: 'uploading' });

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const isImage = file.type.startsWith('image/');
      
      setTimeout(() => {
        updateState({
          rawText: isImage ? text : text || "Extracted content from " + file.name,
          fileName: file.name,
          fileType: file.type,
          status: 'idle'
        });
        toast({ 
          title: "Source Captured", 
          description: isImage ? "Image detected. OCR pipeline will activate." : `${file.name} ready.` 
        });
      }, 800);
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file); // For OCR preview
    } else {
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    updateState({ rawText: '', fileName: undefined, chunks: [], processedText: '', status: 'idle', fileType: undefined });
  };

  return (
    <div className="flex flex-col gap-6 p-5">
      <div className="flex p-1 rounded-lg bg-muted/20 border border-border/50 shrink-0">
        <button 
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted/30'}`}
        >
          <FileSearch className="h-3 w-3" /> External
        </button>
        <button 
          onClick={() => setActiveTab('paste')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'paste' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted/30'}`}
        >
          <Type className="h-3 w-3" /> Manual
        </button>
      </div>

      {activeTab === 'upload' ? (
        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/5 p-4 transition-all hover:border-primary/50 hover:bg-primary/5">
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <FileUp className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Documents</span>
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.pdf,.docx,.md" />
            </label>
            <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/5 p-4 transition-all hover:border-accent/50 hover:bg-accent/5">
              <div className="p-2 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <ImageIcon className="h-5 w-5 text-accent" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Manuscripts</span>
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" className="h-10 text-[10px] uppercase font-bold tracking-widest gap-2 bg-muted/5">
              <Link2 className="h-3.5 w-3.5" /> Connect Web Stream
            </Button>
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          <Textarea 
            placeholder="Paste raw text for semantic chunking..." 
            className="min-h-[180px] font-body text-xs bg-background/40 border-border/40 focus:ring-primary/20"
            value={state.rawText}
            onChange={(e) => updateState({ rawText: e.target.value })}
          />
        </section>
      )}

      {state.rawText && (
        <Card className="relative group overflow-hidden border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {state.fileType?.startsWith('image/') ? <ImageIcon className="h-3.5 w-3.5 text-primary" /> : <FileText className="h-3.5 w-3.5 text-primary" />}
              <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[120px]">{state.fileName || 'Pasted Data'}</span>
            </div>
            <button onClick={handleClear} className="p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="max-h-32 overflow-hidden relative">
            {state.fileType?.startsWith('image/') ? (
              <img src={state.rawText} className="w-full h-24 object-cover rounded opacity-60 grayscale" alt="Source" />
            ) : (
              <p className="text-[10px] leading-relaxed text-muted-foreground/80 font-code truncate-lines-4">
                {state.rawText.substring(0, 300)}...
              </p>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
          </div>
        </Card>
      )}

      <div className="mt-auto pt-6">
        <div className="rounded-lg bg-card/40 p-3 border border-border/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Engine Status</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            IKS-01 Standard Validation active. Ingestion rate limited to 500 tokens/sec.
          </p>
        </div>
      </div>
    </div>
  );
}