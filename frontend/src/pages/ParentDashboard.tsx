import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, UserProfile, getSchedule, ScheduleItem, updateScheduleItem, getDailyCheckupStatus, getAdvancedDashboardData, AdvancedDashboardData, getNotifications, Notification, markNotificationRead } from '@/lib/db';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Sidebar from '@/components/layout/Sidebar';
import Layout from '@/components/layout/Layout';
import StatusCard from '@/components/cards/StatusCard';
import QuickActionCard from '@/components/cards/QuickActionCard';
import ScheduleCard from '@/components/cards/ScheduleCard';
import ReminderCard from '@/components/cards/ReminderCard';
import {
  BookOpen,
  Utensils,
  MessageCircle,
  FileText,
  Syringe,
  ShieldCheck,
  Moon,
  ChevronLeft,
  Loader2,
  Baby,
  Heart,
  Calendar as CalendarIcon,
  Activity,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import ConsistencyScore from '@/components/dashboard/ConsistencyScore';
import KPIWithContext from '@/components/dashboard/KPIWithContext';
import RiskAwarenessPanel from '@/components/dashboard/RiskAwarenessPanel';
import { DietPlanContent } from '@/pages/DietPlan';
import Diary from '@/pages/Diary';
import Profile from '@/pages/Profile';
import Schedule from '@/pages/Schedule';
import PatientDoctor from '@/pages/PatientDoctor';
import JoinDoctorRoom from '@/components/doctor/JoinDoctorRoom';
import MotherResourcesSection from '@/components/mother/MotherResourcesSection';
import ResourcesSection from '@/components/resources/ResourcesSection';

import InfantCareSection from '@/components/mother/InfantCareSection';
import VaccinationSchedule from '@/components/mother/VaccinationSchedule';
import CalendarPage from '@/components/calendar/CalendarPage';
import PregnancyCareSection from '@/components/mother/PregnancyCareSection';
import Analytics from '@/pages/Analytics';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DailyOneStepCard } from '@/components/cards/DailyOneStepCard';
import { getTodayStr, getTomorrowStr } from '@/lib/utils';
import { api } from '@/lib/api';

interface ParentDashboardProps {
  userType?: 'pregnant' | 'mother';
}

const ParentDashboard: React.FC<ParentDashboardProps> = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dashboardSchedule, setDashboardSchedule] = useState<ScheduleItem[]>([]);
  const [dashboardNotifications, setDashboardNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [isCheckupCompleted, setIsCheckupCompleted] = useState(false);
  const [advancedData, setAdvancedData] = useState<AdvancedDashboardData | null>(null);

  useEffect(() => {
    const fetchMethods = async () => {
      if (currentUser) {
        // Only show loading if it's the very first load
        if (loading) setLoading(true);

        try {
          const [userProfile, userSchedule, checkupStatus, advData, userNotifications] = await Promise.all([
            getUserProfile(currentUser.uid),
            getSchedule(currentUser.uid),
            getDailyCheckupStatus(),
            getAdvancedDashboardData(),
            getNotifications()
          ]);
          setProfile(userProfile);
          setDashboardSchedule(userSchedule);
          setIsCheckupCompleted(checkupStatus?.completed || false);
          setAdvancedData(advData);
          setDashboardNotifications(userNotifications);
          console.log("[Auto-Refresh] Home data updated");
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    // Refresh when user comes back to home tab
    if (activeTab === 'home') {
      fetchMethods();
    }

    // Set up polling for notifications (every 15 seconds)
    const pollInterval = setInterval(async () => {
      if (currentUser && activeTab === 'home') {
        try {
          const userNotifications = await getNotifications();
          setDashboardNotifications(userNotifications);
          console.log("[Polling] Notifications updated");
        } catch (error) {
          console.error("[Polling] Error fetching notifications:", error);
        }
      }
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [currentUser, activeTab]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const userType = profile.role === 'pregnant' ? 'pregnant' : 'mother';

  // Calculate details
  const getCalculatedAge = () => {
    if (profile.role === 'pregnant' && profile.pregnancyStartDate) {
      const start = new Date(profile.pregnancyStartDate);
      const now = new Date();
      if (isNaN(start.getTime())) return 0;
      const diffTime = Math.abs(now.getTime() - start.getTime());
      return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)); // Age in weeks for pregnancy
    } else if (profile.role === 'mother' && profile.babyDob) {
      const start = new Date(profile.babyDob);
      const now = new Date();
      if (isNaN(start.getTime())) return 0;

      // Calculate age in months
      let months = (now.getFullYear() - start.getFullYear()) * 12;
      months += now.getMonth() - start.getMonth();

      // If the day of the month is less than the birth day, subtract one month
      if (now.getDate() < start.getDate()) {
        months--;
      }

      return Math.max(0, months);
    }
    return 0;
  };

  const calculateEDD = () => {
    if (profile.role === 'pregnant' && profile.pregnancyStartDate) {
      const start = new Date(profile.pregnancyStartDate);
      if (isNaN(start.getTime())) return undefined;
      // EDD = LMP + 280 days
      const edd = new Date(start.getTime() + 280 * 24 * 60 * 60 * 1000);
      return edd;
    }
    return undefined;
  };

  const currentAge = getCalculatedAge();
  const eddDate = calculateEDD();

  // Functional Reminders Logic
  // Functional Reminders Logic - now driven by Notifications
  const processedReminders = dashboardNotifications
    .filter(n => !n.isRead) // Only show unread
    .map(n => {
      let type: 'vaccination' | 'checkup' | 'milestone' | 'medication' = 'milestone';
      if (n.sourceType === 'doctor') type = 'checkup';
      else if (n.sourceType === 'vaccine') type = 'vaccination';
      else if (n.sourceType === 'medicine') type = 'medication';

      const dateObj = new Date(n.createdAt);
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        id: n.id,
        title: n.title,
        description: n.message || 'New notification',
        babyMessage: n.message, // Use message as baby message
        type,
        time: timeStr,
        date: dateStr,
        sourceType: n.sourceType
      };
    });

  const medicalReminders = processedReminders.filter(r => r.sourceType === 'doctor' || r.sourceType === 'vaccine');

  // Helper to format date
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return undefined;
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'marketplace') {
      navigate('/marketplace');
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <Layout
      sidebar={<Sidebar activeTab={activeTab} onTabChange={handleTabChange} />}
      bottomNav={<BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
    >
      <Header
        userName={profile.name.split(' ')[0]} // First name only
        onEmergencyClick={() => setEmergencyDialogOpen(true)}
      />

      <main className="px-4 py-6 max-w-7xl mx-auto space-y-6">
        {activeTab === 'chat' ? (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('home')} className="md:hidden">
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>
              <h2 className="text-xl font-bold">AI Health Assistant</h2>
            </div>
            <ChatInterface />
          </div>
        ) : activeTab === 'diary' ? (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('home')}>
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>
            </div>
            <Diary />
          </div>
        ) : activeTab === 'diet' ? (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('home')}>
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>
              <h2 className="text-xl font-bold">Diet Plan</h2>
            </div>
            <DietPlanContent />
          </div>
        ) : activeTab === 'schedule' ? (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('home')}>
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>
            </div>
            <Schedule />
          </div>
        ) : activeTab === 'doctor' ? (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('home')}>
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>
            </div>
            <PatientDoctor />
          </div>
        ) : activeTab === 'profile' ? (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('home')}>
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>
            </div>
            <Profile />
          </div>
        ) : activeTab === 'resources' ? (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('home')}>
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>
            </div>
            {userType === 'pregnant' ? <ResourcesSection /> : <MotherResourcesSection />}
          </div>
        ) : activeTab === 'care' ? (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('home')}>
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>
            </div>
            {userType === 'pregnant' ? <PregnancyCareSection /> : <InfantCareSection />}
          </div>
        ) : activeTab === 'calendar' ? (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('home')}>
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>
            </div>
            <CalendarPage />
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('home')}>
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>
            </div>
            <Analytics />
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Daily 1 Step Ahead Feature */}
            <DailyOneStepCard />

            {/* NEW: Analytics Overview Row */}
            {advancedData && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <ConsistencyScore
                    score={advancedData.consistencyScore}
                    label={advancedData.consistencyLabel}
                  />
                </div>
                <div className="md:col-span-1">
                  <KPIWithContext
                    title="Routine Adherence"
                    value={`${advancedData.kpis.routine.value}%`}
                    trend={advancedData.kpis.routine.trend}
                    status={advancedData.kpis.routine.status}
                    icon={Activity}
                    variant="mint"
                  />
                </div>
                <div className="md:col-span-1">
                  <KPIWithContext
                    title="Task Completion"
                    value={`${advancedData.kpis.completion.value}%`}
                    trend={advancedData.kpis.completion.trend}
                    icon={CheckCircle2}
                    variant="peach"
                  />
                </div>
                <div className="md:col-span-1">
                  <RiskAwarenessPanel
                    contactsConfigured={!!profile.emergencyContact?.phone}
                    locationEnabled={true}
                    triggersDetected={advancedData.consistencyScore < 50}
                  />
                </div>
              </div>
            )}

            {/* Top Row: Status & Tip */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                {/* Status Card */}
                <StatusCard
                  type={userType === 'pregnant' ? 'pregnant' : 'baby'}
                  weekOrAge={currentAge}
                  dueDate={userType === 'pregnant' ? (formatDate(eddDate) || 'Calculated from LMP') : undefined}
                  babyName={userType === 'mother' ? 'Your Baby' : undefined} // We didn't ask for baby name in profile, just gender
                />
              </div>
              <div className="md:w-1/3">
                {/* Health Tips */}
                <section className="bg-gradient-to-r from-secondary via-secondary/80 to-accent/50 rounded-2xl p-5 shadow-soft h-full flex flex-col justify-center">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-card/50 flex items-center justify-center shrink-0">
                      <Moon className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-secondary-foreground mb-1">
                        Tip of the Day
                      </h3>
                      <p className="text-sm text-secondary-foreground/80">
                        Getting enough rest is crucial during {userType === 'pregnant' ? 'pregnancy' : 'early motherhood'}.
                        Try to sleep when your {userType === 'pregnant' ? 'baby' : 'little one'} sleeps! 😴
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Quick Actions */}
            <section>
              <h2 className="font-bold text-lg mb-4 text-foreground">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickActionCard
                  icon={BookOpen}
                  label="Diary"
                  description="Record daily memories"
                  variant="peach"
                  onClick={() => setActiveTab('diary')}
                />
                <QuickActionCard
                  icon={Utensils}
                  label="Diet Plan"
                  description="Weekly meal schedule"
                  variant="mint"
                  onClick={() => setActiveTab('diet')}
                />
                <QuickActionCard
                  icon={CalendarIcon} // Need to import this or reuse FileText if not avail? I'll import Calendar from lucide-react. 
                  // Wait, I need to add Calendar to imports first.
                  label="Calendar"
                  description="Events & Notes"
                  variant="lavender"
                  onClick={() => setActiveTab('calendar')}
                />
                <QuickActionCard
                  icon={MessageCircle}
                  label="AI Chat"
                  description="Ask any question"
                  variant="sky"
                  onClick={() => setActiveTab('chat')}
                />
                <QuickActionCard
                  icon={Heart}
                  label="Daily Check-in"
                  description={isCheckupCompleted ? "Completed for today" : "Track your health anytime"}
                  variant={isCheckupCompleted ? "mint" : "sky"}
                  onClick={() => navigate('/daily-checkup')}
                />
                <QuickActionCard
                  icon={FileText}
                  label="Resources"
                  description="Guides & Tips"
                  variant="lavender"
                  onClick={() => setActiveTab('resources')}
                />
                {userType === 'pregnant' && (
                  <QuickActionCard
                    icon={ShieldCheck}
                    label="Pregnancy Care"
                    description="Checkups & Wellness"
                    variant="sky"
                    onClick={() => setActiveTab('care')}
                  />
                )}
                {userType === 'mother' && (
                  <>
                    <QuickActionCard
                      icon={Utensils}
                      label="Baby Nutrition"
                      description="AI Diet & Food Logs"
                      variant="peach"
                      onClick={() => setActiveTab('care')}
                    />
                    <QuickActionCard
                      icon={Baby}
                      label="Cry Awareness"
                      description="Analyze cry patterns"
                      variant="sky"
                      onClick={() => window.location.href = "https://lets-win.vercel.app"}
                    />
                  </>
                )}
              </div>
            </section>

            {/* Bottom Row: Schedule & Reminders */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Today's Schedule (Daily routines) */}
              <ScheduleCard
                items={dashboardSchedule.filter(item => !item.date)}
                onToggle={async (id) => {
                  if (!currentUser) return;
                  const item = dashboardSchedule.find(i => i.id === id);
                  if (!item) return;

                  try {
                    // Optimistic update
                    setDashboardSchedule(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i));

                    await updateScheduleItem(currentUser.uid, id, { completed: !item.completed });
                  } catch (e) {
                    console.error("Failed to toggle item", e);
                    // Revert on failure
                    setDashboardSchedule(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
                  }
                }}
              />

              <div className="space-y-6">
                {/* General Notifications (Next 4) */}
                <ReminderCard
                  reminders={processedReminders.slice(0, 4)}
                  title="New Alerts"
                  onDismiss={async (id) => {
                    try {
                      // Optimistic update
                      setDashboardNotifications(prev => prev.filter(n => n.id !== id));
                      await markNotificationRead(id);
                    } catch (e) {
                      console.error("Failed to dismiss notification", e);
                      // Refresh from server on error
                      const nots = await getNotifications();
                      setDashboardNotifications(nots);
                    }
                  }}
                />

                {/* Medical Specific Reminders (Appointments & Vaccines) */}
                {medicalReminders.length > 0 && (
                  <ReminderCard
                    reminders={medicalReminders}
                    title={userType === 'pregnant' ? "Medical & Checkups" : "Medical & Vaccines"}
                    className="border-t pt-2 md:pt-0 md:border-t-0"
                    onDismiss={async (id) => {
                      try {
                        setDashboardNotifications(prev => prev.filter(n => n.id !== id));
                        await markNotificationRead(id);
                      } catch (e) {
                        const nots = await getNotifications();
                        setDashboardNotifications(nots);
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Emergency Dialog */}
      <Dialog open={emergencyDialogOpen} onOpenChange={setEmergencyDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive flex items-center gap-2">
              🚨 Emergency Help
            </DialogTitle>
            <DialogDescription>
              Stay calm. Help is on the way.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <Button variant="emergency" className="w-full h-14 text-lg" onClick={() => window.open(`tel:102`)}>
              📞 Call Ambulance (102)
            </Button>
            <Button
              variant="destructive"
              className="w-full h-12"
              onClick={async () => {
                // Trigger native call handler for mobile users
                window.open(`tel:${profile.emergencyContact.phone}`);

                // ALSO trigger the automated Twilio call as a backup/alert
                try {
                  console.log("Initiating backend call to:", profile.emergencyContact.phone);
                  const data = await api.post('/call/emergency', {
                    to: profile.emergencyContact.phone,
                    name: profile.name
                  });
                  console.log("Backend call response:", data);
                  if (data.success) {
                    console.log("Automatic alert call initiated successfully.");
                  } else {
                    console.error("Backend failed to initiate call:", data.error);
                    alert("Automatic call failed: " + data.error);
                  }
                } catch (e) {
                  console.error("Failed to send auto-alert", e);
                  alert("Failed to reach server for auto-call. Check console.");
                }
              }}
            >
              👨‍👩‍👧 Call {profile.emergencyContact.name}
            </Button>
          </div>

          <div className="mt-4 p-4 bg-destructive-soft rounded-xl">
            <h4 className="font-semibold text-destructive mb-2">Quick Info for Responders:</h4>
            <p className="text-sm text-destructive/80">
              • Name: {profile.name}<br />
              • Role: {profile.role.toUpperCase()}<br />
              • Status: {userType === 'pregnant' ? `${currentAge} Weeks Pregnant` : `Postpartum`}<br />
              • Emergency Contact: {profile.emergencyContact.name} ({profile.emergencyContact.phone})
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ParentDashboard;
