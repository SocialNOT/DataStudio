"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Key, 
  Database, 
  User, 
  ShieldCheck, 
  Globe, 
  Cpu, 
  LogOut,
  Mail,
  Smartphone
} from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { user } = useUser();
  const auth = useAuth();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] h-[100vh] border-none bg-background/95 backdrop-blur-2xl p-0 flex flex-col sm:max-w-[100vw]">
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar Nav */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-card/20 p-6 flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-headline font-bold">Preferences</h2>
            </div>
            
            <nav className="flex flex-col gap-1">
              <NavButton icon={<User className="h-4 w-4" />} label="Account" active />
              <NavButton icon={<Key className="h-4 w-4" />} label="API Keys" />
              <NavButton icon={<Database className="h-4 w-4" />} label="Storage" />
              <NavButton icon={<ShieldCheck className="h-4 w-4" />} label="Security" />
              <NavButton icon={<Globe className="h-4 w-4" />} label="Network" />
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span>Terminate Session</span>
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden flex flex-col">
            <DialogHeader className="p-8 border-b border-white/5 shrink-0">
              <DialogTitle className="text-2xl font-headline font-bold tracking-tight">System Configuration</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Manage your ingestion credentials and infrastructure settings.</p>
            </DialogHeader>

            <ScrollArea className="flex-1 p-8">
              <div className="max-w-2xl space-y-12">
                {/* Account Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Identity Context</h3>
                  </div>
                  
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Account Status</Label>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-white/5 shadow-inner">
                        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
                          {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{user?.displayName || 'Active Ingestor'}</p>
                          <p className="text-[10px] text-muted-foreground font-code">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="display-name" className="text-[10px] font-bold uppercase">Display Identifier</Label>
                        <Input id="display-name" defaultValue={user?.displayName || ''} className="bg-background/50 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email" className="text-[10px] font-bold uppercase">Emergency Contact</Label>
                        <Input id="contact-email" placeholder="email@mitsara.io" className="bg-background/50 border-white/10" />
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="bg-white/5" />

                {/* Infrastructure Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Cpu className="h-4 w-4 text-accent" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Neural Engine Parameters</h3>
                  </div>

                  <div className="grid gap-4">
                    <SettingsToggle 
                      label="Autonomous Optimization" 
                      description="Allow AI to dynamically adjust chunk overlap based on semantic density." 
                      icon={<Cpu className="h-4 w-4" />}
                      defaultChecked
                    />
                    <SettingsToggle 
                      label="Quantum Encryption" 
                      description="Enable end-to-end multi-layer encryption for all manuscript data." 
                      icon={<ShieldCheck className="h-4 w-4" />}
                      defaultChecked
                    />
                    <SettingsToggle 
                      label="Global Sync" 
                      description="Broadcast ingestion logs to distributed cluster nodes in real-time." 
                      icon={<Globe className="h-4 w-4" />}
                    />
                  </div>
                </section>

                {/* API Credentials */}
                <section className="space-y-6">
                   <div className="flex items-center gap-2 mb-4">
                    <Key className="h-4 w-4 text-orange-500" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Access Tokens</h3>
                  </div>
                  <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 space-y-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-orange-500/70">Google Gemini API Key</Label>
                       <div className="flex gap-2">
                         <Input 
                            type="password" 
                            value="********************************" 
                            readOnly
                            className="font-code text-xs bg-background/50 border-orange-500/10 cursor-default focus-visible:ring-0" 
                         />
                         <Button variant="outline" className="border-orange-500/20 text-orange-500 hover:bg-orange-500/10">Rotate</Button>
                       </div>
                    </div>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NavButton({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Button 
      variant={active ? "secondary" : "ghost"} 
      className={`w-full justify-start gap-3 h-10 transition-all ${active ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground'}`}
    >
      {icon}
      <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
    </Button>
  );
}

function SettingsToggle({ label, description, icon, defaultChecked = false }: { label: string; description: string; icon: React.ReactNode; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-card border border-white/5 transition-colors hover:border-white/10">
      <div className="flex gap-3">
        <div className="p-2 rounded-lg bg-background border border-white/5 text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold leading-none mb-1.5">{label}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
