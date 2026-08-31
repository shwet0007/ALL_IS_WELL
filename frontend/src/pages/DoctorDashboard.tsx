import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BottomNav from '@/components/layout/BottomNav';
import Sidebar, { NavItem } from '@/components/layout/Sidebar';
import Layout from '@/components/layout/Layout';
import {
  Users,
  Calendar,
  FileUp,
  Copy,
  Check,
  Clock,
  AlertCircle,
  Stethoscope,
  ChevronLeft,
  Loader2,
  Key,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  getConnectedPatients,
  UserProfile,
  getDoctorCheckups,
  Checkup,
  getDoctorRoom,
  createDoctorRoom
} from '@/lib/db';
import { differenceInWeeks, differenceInMonths, parseISO, isToday, format } from 'date-fns';
import PatientDetailSheet from '@/components/doctor/PatientDetailSheet';
import ScheduleCheckupDialog from '@/components/doctor/ScheduleCheckupDialog';
import DoctorRequests from '@/components/doctor/DoctorRequests';
import Profile from '@/pages/Profile';
import DoctorSchedule from '@/components/doctor/DoctorSchedule';
import DoctorReports from '@/components/doctor/DoctorReports';
import DoctorPatients from '@/components/doctor/DoctorPatients';

const doctorNavItems: NavItem[] = [
  { icon: <Clock className="w-5 h-5" />, label: 'Home', path: 'home' },
  { icon: <Calendar className="w-5 h-5" />, label: 'Schedule', path: 'schedule' },
  { icon: <Users className="w-5 h-5" />, label: 'Patients', path: 'patients' },
  { icon: <FileUp className="w-5 h-5" />, label: 'Reports', path: 'reports' },
  { icon: <Users className="w-5 h-5" />, label: 'Requests', path: 'requests' },
  { icon: <Stethoscope className="w-5 h-5" />, label: 'Profile', path: 'profile' },
];

const statusColors = {
  healthy: 'bg-secondary text-secondary-foreground',
  attention: 'bg-amber-100 text-amber-700',
  urgent: 'bg-destructive-soft text-destructive',
};

const statusLabels = {
  healthy: 'Healthy',
  attention: 'Needs Attention',
  urgent: 'Urgent',
};

const DoctorDashboard: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [copied, setCopied] = useState(false);

  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [checkups, setCheckups] = useState<Checkup[]>([]);

  const [roomCode, setRoomCode] = useState<string>('');
  const [loadingRoomCode, setLoadingRoomCode] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const initDoctorData = async () => {
      if (currentUser && userProfile && userProfile.role === 'doctor') {

        try {
          let room = await getDoctorRoom(currentUser.uid);
          if (!room) {
            const newRoomCode = await createDoctorRoom(currentUser.uid, userProfile.name);
            setRoomCode(newRoomCode);
          } else {
            setRoomCode(room.roomCode);
          }
        } catch (error) {
          console.error('Error initializing room code:', error);
        } finally {
          setLoadingRoomCode(false);
        }

        try {
          const [connectedPatients, doctorCheckups] = await Promise.all([
            getConnectedPatients(currentUser.uid),
            getDoctorCheckups(currentUser.uid)
          ]);

          setCheckups(doctorCheckups);

          const formattedPatients = connectedPatients.map((p) => {
            let weekOrAge = 0;
            let type = 'pregnant';
            let avatar = '👩';

            if (p.role === 'mother') {
              type = 'baby';
              avatar = '👶';
              if (p.babyDob) {
                weekOrAge = differenceInMonths(new Date(), parseISO(p.babyDob));
              }
            } else if (p.role === 'pregnant') {
              type = 'pregnant';
              avatar = '👩';
              if (p.pregnancyStartDate) {
                weekOrAge = differenceInWeeks(new Date(), parseISO(p.pregnancyStartDate));
              }
            }

            return {
              ...p, // Keep all profile data
              id: p.id,
              name: p.name,
              type,
              status: p.highRisk ? 'urgent' : 'healthy',
              weekOrAge,
              lastVisit: 'Recently',
              avatar
            };
          });
          setPatients(formattedPatients);
        } catch (error) {
          console.error("Failed to load dashboard data", error);
        } finally {
          setLoadingPatients(false);
        }
      }
    };

    initDoctorData();
  }, [currentUser, userProfile, refreshTrigger]);


  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const todaysCheckups = checkups.filter(c => isToday(parseISO(c.date)));

  return (
    <Layout
      sidebar={<Sidebar activeTab={activeTab} onTabChange={setActiveTab} items={doctorNavItems} />}
      bottomNav={<BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="bg-gradient-to-r from-accent via-accent/80 to-secondary/50 px-4 py-8 sticky top-0 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-card shadow-card flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-accent-foreground">
                  {userProfile?.name ? `Dr. ${userProfile.name}` : 'Doctor Dashboard'}
                </h1>
                <p className="text-sm text-accent-foreground/70">
                  {userProfile?.specialization || 'Specialization Not Set'}
                </p>
              </div>
            </div>

            {/* Doctor Room Code */}
            <Card className="md:w-auto w-full max-w-sm border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  Doctor Room Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">
                  Share this code with your patients to connect
                </p>
                {loadingRoomCode ? (
                  <div className="flex items-center gap-2 justify-center py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Generating code...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <code className="text-3xl font-bold tracking-widest text-primary font-mono">
                      {roomCode || '...'}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyCode}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </header>

        <main className="px-4 py-6 max-w-7xl mx-auto space-y-8">
          {activeTab === 'profile' ? (
            <div className="animate-fade-in">
              <div className="mb-4 flex items-center gap-2 md:hidden">
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('home')}>
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </Button>
              </div>
              <Profile />
            </div>
          ) : activeTab === 'schedule' ? (
            <div className="animate-fade-in">
              <DoctorSchedule
                checkups={checkups}
                onRefresh={() => setRefreshTrigger(prev => prev + 1)}
              />
            </div>
          ) : activeTab === 'patients' ? (
            <div className="animate-fade-in">
              <DoctorPatients patients={patients} />
            </div>
          ) : activeTab === 'reports' ? (
            <div className="animate-fade-in">
              <DoctorReports patients={patients} />
            </div>
          ) : activeTab === 'requests' ? (
            <div className="animate-fade-in">
              <DoctorRequests />
            </div>
          ) : (
            <div className="animate-fade-in space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 md:gap-8">
                <div className="bg-card rounded-2xl shadow-soft p-6 text-center animate-slide-up flex flex-col justify-center min-h-[120px]">
                  <p className="text-4xl font-bold text-foreground">{patients.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Patients</p>
                </div>
                <div className="bg-card rounded-2xl shadow-soft p-6 text-center animate-slide-up flex flex-col justify-center min-h-[120px]" style={{ animationDelay: '100ms' }}>
                  <p className="text-4xl font-bold text-foreground">{todaysCheckups.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Appointments Today</p>
                </div>
                <div className="bg-card rounded-2xl shadow-soft p-6 text-center animate-slide-up flex flex-col justify-center min-h-[120px]" style={{ animationDelay: '200ms' }}>
                  <p className="text-4xl font-bold text-destructive">
                    {patients.filter(p => p.status === 'urgent').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Urgent Alerts</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-8">
                {/* Checkup History / Today's Checkups */}
                <section className="bg-card rounded-2xl shadow-card p-6 lg:col-span-5 h-fit">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-xl text-foreground">Checkup Schedule</h2>
                    <div className="p-2 bg-muted rounded-full">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {checkups.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No checkups scheduled.</p>
                    ) : (
                      checkups.map((checkup, index) => (
                        <div
                          key={checkup.id}
                          className="flex items-center gap-4 p-4 bg-muted/30 hover:bg-muted/60 transition-colors rounded-xl animate-slide-up border border-border/50"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 flex-col">
                            <span className="text-xs font-bold uppercase">{format(parseISO(checkup.date), 'MMM')}</span>
                            <span className="text-lg font-bold">{format(parseISO(checkup.date), 'd')}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base truncate">{checkup.patientName}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {format(parseISO(checkup.date), 'h:mm a')} • <span className="capitalize">{checkup.type}</span>
                            </p>
                          </div>
                          {isToday(parseISO(checkup.date)) && (
                            <div className="px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase">
                              Today
                            </div>
                          )}
                        </div>
                      )))}
                  </div>
                </section>

                {/* Patient List */}
                <section className="bg-card rounded-2xl shadow-card p-6 lg:col-span-7">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-xl text-foreground">Connected Patients</h2>
                    <div className="p-2 bg-muted rounded-full">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {loadingPatients ? (
                      <p className="text-center text-muted-foreground py-8">Loading patients...</p>
                    ) : patients.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No patients connected yet. Share your join code!</p>
                    ) : (
                      patients.map((patient, index) => (
                        <button
                          key={patient.id}
                          onClick={() => {
                            setSelectedPatient(patient);
                            setIsDetailOpen(true);
                          }}
                          className="w-full flex items-center gap-4 p-4 bg-muted/30 hover:bg-muted/60 transition-all rounded-xl animate-slide-up border border-border/50 group"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                            {patient.avatar}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-bold text-base">{patient.name}</p>
                              {patient.status === 'urgent' && (
                                <div className="flex items-center animate-pulse gap-1 text-destructive bg-destructive/10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                  <AlertCircle className="w-3 h-3" />
                                  Alert
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {patient.type === 'pregnant' ? `Week ${patient.weekOrAge}` : `${patient.weekOrAge} mo`}
                              {' • '}{patient.lastVisit}
                            </p>
                          </div>
                          <span className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider",
                            statusColors[patient.status as keyof typeof statusColors]
                          )}>
                            {statusLabels[patient.status as keyof typeof statusLabels]}
                          </span>
                        </button>
                      )))}
                  </div>
                </section>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="accent"
                  className="h-20 flex-col gap-2 shadow-soft hover:shadow-card transition-all md:col-span-1"
                  onClick={() => setActiveTab('reports')}
                >
                  <FileUp className="w-6 h-6" />
                  <span className="text-sm font-semibold">Upload Report</span>
                </Button>
                <Button
                  variant="secondary"
                  className="h-20 flex-col gap-2 shadow-soft hover:shadow-card transition-all md:col-span-1"
                  onClick={() => setIsScheduleOpen(true)}
                >
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm font-semibold">Schedule Checkup</span>
                </Button>
                {/* Filler buttons for grid balance */}
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-dashed md:col-span-1"
                  onClick={() => setActiveTab('patients')}
                >
                  <Users className="w-6 h-6" />
                  <span className="text-sm font-semibold">Patient Directory</span>
                </Button>
                <Button variant="ghost" className="h-20 flex-col gap-2 md:col-span-1">
                  <Copy className="w-6 h-6" />
                  <span className="text-sm font-semibold">Copy Invite</span>
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      <ScheduleCheckupDialog
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        patients={patients}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />

      <PatientDetailSheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        patient={selectedPatient}
      />
    </Layout>
  );
};

export default DoctorDashboard;
