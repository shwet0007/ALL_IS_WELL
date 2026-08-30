import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserCheck,
  FileText,
  Activity,
  ChevronRight,
  Shield,
  Settings,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Layout from '@/components/layout/Layout';
import Sidebar, { NavItem } from '@/components/layout/Sidebar';

const adminNavItems: NavItem[] = [
  { icon: <Activity className="w-5 h-5" />, label: 'Overview', path: 'overview' },
  { icon: <Users className="w-5 h-5" />, label: 'Users', path: 'users' },
  { icon: <FileText className="w-5 h-5" />, label: 'Content', path: 'content' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: 'settings' },
];

interface VerificationRequest {
  id: string;
  name: string;
  specialty: string;
  submittedDate: string;
  documents: number;
}

interface SystemHealth {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  value: string;
}

const verificationRequests: VerificationRequest[] = [
  { id: '1', name: 'Dr. John Williams', specialty: 'Pediatrician', submittedDate: '2 hours ago', documents: 4 },
  { id: '2', name: 'Dr. Emily Brown', specialty: 'Obstetrician', submittedDate: '1 day ago', documents: 3 },
  { id: '3', name: 'Dr. Michael Lee', specialty: 'Neonatologist', submittedDate: '2 days ago', documents: 5 },
];

const systemHealth: SystemHealth[] = [
  { name: 'API Response', status: 'healthy', value: '45ms' },
  { name: 'Database', status: 'healthy', value: '99.9%' },
  { name: 'Storage', status: 'warning', value: '78%' },
  { name: 'Active Users', status: 'healthy', value: '1,234' },
];

const statusColors = {
  healthy: 'text-secondary-dark',
  warning: 'text-amber-500',
  error: 'text-destructive',
};

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <Layout
      sidebar={<Sidebar activeTab={activeSection} onTabChange={setActiveSection} items={adminNavItems} />}
    >
      <div className="min-h-screen bg-background pb-12">
        {/* Header */}
        <header className="bg-gradient-to-r from-lavender via-lavender/80 to-accent/30 px-4 py-6 sticky top-0 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-card shadow-card flex items-center justify-center">
                <Shield className="w-7 h-7 text-lavender-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-lavender-foreground">Admin Panel</h1>
                <p className="text-sm text-lavender-foreground/70">Aal is Well Platform Management</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-2xl shadow-soft p-6 animate-slide-up flex flex-col justify-between h-32 hover:shadow-card transition-all">
              <Users className="w-8 h-8 text-primary-dark mb-2" />
              <div>
                <p className="text-3xl font-bold text-foreground">2,456</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
            <div className="bg-card rounded-2xl shadow-soft p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <UserCheck className="w-8 h-8 text-secondary-dark mb-2" />
              <div>
                <p className="text-3xl font-bold text-foreground">48</p>
                <p className="text-sm text-muted-foreground">Doctors</p>
              </div>
            </div>
            <div className="bg-card rounded-2xl shadow-soft p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <FileText className="w-8 h-8 text-accent-dark mb-2" />
              <div>
                <p className="text-3xl font-bold text-foreground">156</p>
                <p className="text-sm text-muted-foreground">Reports Today</p>
              </div>
            </div>
            <div className="bg-card rounded-2xl shadow-soft p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
              <div>
                <p className="text-3xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">Pending Verifications</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Doctor Verification Requests */}
            <section className="bg-card rounded-2xl shadow-card p-6 lg:col-span-7">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl text-foreground">Verification Requests</h2>
                <div className="p-2 bg-muted rounded-full">
                  <UserCheck className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-4">
                {verificationRequests.map((request, index) => (
                  <div
                    key={request.id}
                    className="p-4 bg-muted/30 hover:bg-muted/60 transition-colors rounded-xl animate-slide-up border border-border/50"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-base">{request.name}</p>
                        <p className="text-sm text-muted-foreground">{request.specialty}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span>📄 {request.documents} docs</span>
                          <span>•</span>
                          <span>🕒 {request.submittedDate}</span>
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="secondary" size="sm" className="flex-1 gap-2 shadow-sm">
                        <Check className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive">
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* System Health */}
            <section className="bg-card rounded-2xl shadow-card p-6 lg:col-span-5 h-fit sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl text-foreground">System Health</h2>
                <div className="p-2 bg-muted rounded-full">
                  <Activity className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-4">
                {systemHealth.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full shadow-sm",
                        item.status === 'healthy' && "bg-secondary-dark shadow-secondary/50",
                        item.status === 'warning' && "bg-amber-500 shadow-amber-500/50",
                        item.status === 'error' && "bg-destructive shadow-destructive/50"
                      )} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <span className={cn("font-bold text-sm", statusColors[item.status])}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-6 gap-2 border-dashed">
                <Settings className="w-4 h-4" />
                System Settings
              </Button>
            </section>
          </div>

          {/* Quick Actions */}
          <section className="mt-8">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="peach" className="h-24 flex-col gap-2 shadow-soft hover:shadow-card transition-all">
                <Users className="w-6 h-6" />
                <span className="text-sm font-medium">Manage Users</span>
              </Button>
              <Button variant="mint" className="h-24 flex-col gap-2 shadow-soft hover:shadow-card transition-all">
                <FileText className="w-6 h-6" />
                <span className="text-sm font-medium">Content Moderation</span>
              </Button>
              <Button variant="sky" className="h-24 flex-col gap-2 shadow-soft hover:shadow-card transition-all">
                <Activity className="w-6 h-6" />
                <span className="text-sm font-medium">View Analytics</span>
              </Button>
              <Button variant="ghost" className="h-24 flex-col gap-2 border-2 border-muted hover:bg-muted/50">
                <Settings className="w-6 h-6" />
                <span className="text-sm font-medium">Settings</span>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
