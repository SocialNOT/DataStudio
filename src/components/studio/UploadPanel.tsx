
"use client";

import React, { useState } from 'react';
import { PipelineState } from './StudioDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUp, Link2, Type, FileText, X, ImageIcon, FileSearch, Tag, History, Info } from 'lucide-react';
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
          description: isImage ? "Image detected. OCR pipeline recommended." : `${file.name} ready.` 
        });
      }, 800);
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const updateGlobalMetadata = (field: string, value: string) => {
    updateState({
      globalMetadata: {
        ...state.globalMetadata,
        [field]: value
      }
    });
  };

  const handleClear = () => {
    updateState({ rawText: '', fileName: undefined, chunks: [], processedText: '', status: 'idle', fileType: undefined });
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-5">
          {/* Metadata Builder Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Dataset Metadata</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground/80">Project Name</Label>
                <Input 
                  placeholder="e.g. Upanishads Corpus" 
                  value={state.datasetName}
                  onChange={(e) => updateState({ datasetName: e.target.value })}
                  className="h-8 text-xs bg-card/40 border-white/5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold uppercase text-muted-foreground/80">Version</Label>
                  <Input 
                    value={state.version}
                    onChange={(e) => updateState({ version: e.target.value })}
                    className="h-8 text-xs bg-card/40 border-white/5"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold uppercase text-muted-foreground/80">Author/Source</Label>
                  <Input 
                    placeholder="e.g. Vyasa" 
                    value={state.globalMetadata.author || ''}
                    onChange={(e) => updateGlobalMetadata('author', e.target.value)}
                    className="h-8 text-xs bg-card/40 border-white/5"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground/80">Historical Period</Label>
                <Input 
                  placeholder="e.g. 8th Century BCE" 
                  value={state.globalMetadata.period || ''}
                  onChange={(e) => updateGlobalMetadata('period', e.target.value)}
                  className="h-8 text-xs bg-card/40 border-white/5"
                />
              </div>
            </div>
          </section>

          <div className="h-px bg-white/5" />

          {/* Source Ingestion Tabs */}
          <div className="flex p-1 rounded-lg bg-muted/20 border border-white/5 shrink-0">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted/30'}`}
            >
              <FileSearch className="h-3 w-3" /> Source
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
                <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-muted/5 p-4 transition-all hover:border-primary/50 hover:bg-primary/5">
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FileUp className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Documents</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.pdf,.docx,.md" />
                </label>
                <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-muted/5 p-4 transition-all hover:border-accent/50 hover:bg-accent/5">
                  <div className="p-2 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <ImageIcon className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">OCR Capture</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                </label>
              </div>
              <Button variant="outline" className="w-full h-10 text-[10px] uppercase font-bold tracking-widest gap-2 bg-muted/5 border-white/5">
                <Link2 className="h-3.5 w-3.5" /> Connect Web Stream
              </Button>
            </section>
          ) : (
            <section className="space-y-3">
              <Textarea 
                placeholder="Paste raw text for semantic processing..." 
                className="min-h-[180px] font-body text-xs bg-background/40 border-white/5 focus:ring-primary/20"
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
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/5 bg-card/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-green-500/10 flex items-center justify-center">
             <Info className="h-3.5 w-3.5 text-green-500" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Ingestion Standard</p>
            <p className="text-[10px] font-medium text-foreground/70">IKS-01 Validation Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
