
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Key, 
  Database, 
  User, 
  ShieldCheck, 
  Globe, 
  Cpu, 
  LogOut,
  Users,
  History as HistoryIcon,
  Code2,
  Lock,
  Cloud
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
  const [activeTab, setActiveTab] = React.useState('account');

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] h-[100vh] border-none bg-background/95 backdrop-blur-3xl p-0 flex flex-col sm:max-w-[100vw] animate-in fade-in zoom-in-95 duration-300">
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar Nav */}
          <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 p-8 flex flex-col gap-10">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Settings className="h-6 w-6 text-primary-foreground animate-[spin_12s_linear_infinite]" />
              </div>
              <div>
                <h2 className="text-xl font-headline font-bold">Studio Hub</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Configuration v2.1</p>
              </div>
            </div>
            
            <nav className="flex flex-col gap-2">
              <NavButton icon={<User className="h-4 w-4" />} label="Account" active={activeTab === 'account'} onClick={() => setActiveTab('account')} />
              <NavButton icon={<Users className="h-4 w-4" />} label="Team & Roles" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
              <NavButton icon={<Code2 className="h-4 w-4" />} label="API Access" active={activeTab === 'api'} onClick={() => setActiveTab('api')} />
              <NavButton icon={<Database className="h-4 w-4" />} label="Storage" active={activeTab === 'storage'} onClick={() => setActiveTab('storage')} />
              <NavButton icon={<Cloud className="h-4 w-4" />} label="Recovery" active={activeTab === 'recovery'} onClick={() => setActiveTab('recovery')} />
              <NavButton icon={<ShieldCheck className="h-4 w-4" />} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
            </nav>

            <div className="mt-auto pt-8 border-t border-white/5">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 h-12 transition-all"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Terminate Session</span>
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden flex flex-col">
            <DialogHeader className="p-10 border-b border-white/5 shrink-0">
              <DialogTitle className="text-3xl font-headline font-bold tracking-tight">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">Manage your high-fidelity dataset factory and distributed cluster parameters.</p>
            </DialogHeader>

            <ScrollArea className="flex-1 p-10">
              <div className="max-w-3xl space-y-12">
                {activeTab === 'account' && (
                  <section className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Identity Context</h3>
                    </div>
                    
                    <div className="grid gap-6 p-6 rounded-2xl bg-card border border-white/5 shadow-2xl">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-xl shadow-xl">
                          {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="text-lg font-bold">{user?.displayName || 'Active Ingestor'}</p>
                            <Badge className="h-5 text-[9px] bg-primary/20 text-primary border-none font-black tracking-widest">VERIFIED NODE</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-code mt-1">{user?.email}</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase border-white/10">Edit Profile</Button>
                      </div>
                    </div>
                  </section>
                )}

                {activeTab === 'api' && (
                  <section className="space-y-8 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Code2 className="h-5 w-5" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Developer Gateway</h3>
                    </div>

                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Your Private API Key</Label>
                          <Badge variant="outline" className="text-[8px] border-orange-500/30 text-orange-500">PRODUCTION</Badge>
                        </div>
                        <div className="flex gap-3">
                          <Input 
                            type="password" 
                            value="mitsara_sk_live_9a384f92d1" 
                            readOnly
                            className="font-code text-xs bg-background/50 border-white/5 h-11 focus-visible:ring-primary/20" 
                          />
                          <Button variant="outline" className="border-white/10 h-11 px-6 text-[10px] font-black uppercase">Rotate</Button>
                        </div>
                      </div>

                      <Separator className="bg-white/5" />

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">REST Documentation</Label>
                        <div className="rounded-xl bg-muted/20 p-5 font-code text-xs space-y-3 leading-relaxed">
                          <p className="text-primary"><span className="text-muted-foreground">GET</span> /api/v1/datasets/{'{dataset_id}'}</p>
                          <p className="text-green-500"><span className="text-muted-foreground">POST</span> /api/v1/ingest</p>
                          <p className="text-accent"><span className="text-muted-foreground">WS</span> ws://stream.mitsara.ai/live</p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {activeTab === 'recovery' && (
                  <section className="space-y-8 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-accent/10 flex items-center justify-center text-accent">
                        <Cloud className="h-5 w-5" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Disaster Recovery</h3>
                    </div>

                    <div className="space-y-4">
                       <BackupItem date="2024-05-20 14:30" size="1.4 GB" status="Ready" />
                       <BackupItem date="2024-05-19 09:12" size="840 MB" status="Archived" />
                       <BackupItem date="2024-05-18 22:45" size="2.1 GB" status="Corrupt" />
                       
                       <Button variant="outline" className="w-full h-12 border-dashed border-white/10 text-[10px] font-black uppercase tracking-widest gap-2 bg-accent/5 hover:bg-accent/10 transition-all">
                         <Cloud className="h-4 w-4" /> Initialize Emergency Snapshot
                       </Button>
                    </div>
                  </section>
                )}

                {activeTab === 'team' && (
                  <section className="space-y-8 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Research Personnel</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <TeamMember name="Dr. Ananda Sharma" role="Lead Researcher" status="Online" />
                      <TeamMember name="Sanjeev Gupta" role="Data Annotator" status="Away" />
                      <Button variant="outline" className="w-full border-dashed border-white/10 h-14 text-[11px] font-black uppercase tracking-widest gap-3 hover:bg-muted/5">
                        <Users className="h-4 w-4" /> Expand Contributor Network
                      </Button>
                    </div>
                  </section>
                )}
              </div>
            </ScrollArea>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BackupItem({ date, size, status }: { date: string, size: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-white/5 transition-all hover:border-white/20">
      <div className="flex items-center gap-4">
        <div className={`h-2 w-2 rounded-full ${status === 'Ready' ? 'bg-green-500' : status === 'Archived' ? 'bg-muted-foreground' : 'bg-destructive'} shadow-sm shadow-current/50`} />
        <div>
          <p className="text-xs font-bold font-code">{date}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">{size} • AES-256 Encrypted</p>
        </div>
      </div>
      <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-primary h-8 hover:bg-primary/10">Restore</Button>
    </div>
  );
}

function TeamMember({ name, role, status }: { name: string, role: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-white/5 group transition-all hover:bg-muted/5">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-muted/20 flex items-center justify-center text-xs font-bold text-primary group-hover:scale-110 transition-transform">
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-bold">{name}</p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{role}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`h-1.5 w-1.5 rounded-full ${status === 'Online' ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`} />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{status}</span>
      </div>
    </div>
  );
}

function NavButton({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean, onClick?: () => void }) {
  return (
    <Button 
      variant={active ? "secondary" : "ghost"} 
      onClick={onClick}
      className={`w-full justify-start gap-4 h-12 transition-all rounded-xl ${active ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'text-muted-foreground hover:text-foreground'}`}
    >
      <div className={`p-1.5 rounded-md transition-colors ${active ? 'bg-primary/20' : 'bg-transparent'}`}>
        {icon}
      </div>
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
    </Button>
  );
}
