import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDailyCheckupStatus } from '@/lib/db';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bell, Heart, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DailyCheckupReminder() {
    const { userProfile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [hiddenForSession, setHiddenForSession] = useState(false);

    useEffect(() => {
        if (authLoading || !userProfile || userProfile.role === 'doctor') return;
        if (location.pathname === '/daily-checkup') {
            setIsVisible(false);
            return;
        }

        const checkStatus = async () => {
            const now = new Date();
            const hour = now.getHours();

            // Reminder layer triggers after 8 PM (20:00)
            if (hour >= 20 || hour < 5) { // Show until 5 AM next day
                const status = await getDailyCheckupStatus();
                if (!status.completed && !hiddenForSession) {
                    setIsVisible(true);
                } else if (status.completed) {
                    setIsCompleted(true);
                    setIsVisible(false);
                }
            } else {
                setIsVisible(false);
            }
        };

        checkStatus();
        // Check every 5 minutes
        const interval = setInterval(checkStatus, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [userProfile, authLoading, location.pathname, hiddenForSession]);

    if (!isVisible || hiddenForSession) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-card border-l-4 border-l-primary shadow-2xl rounded-2xl p-4 md:flex items-center justify-between gap-4 max-w-4xl mx-auto relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-50 hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setHiddenForSession(true)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full shrink-0 group-hover:scale-110 transition-transform">
                        <Bell className="w-6 h-6 text-primary animate-ring" />
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground">Daily Health Check Reminder 💙</h4>
                        <p className="text-sm text-muted-foreground">
                            You haven't completed today's health check yet. It takes just 2 minutes!
                        </p>
                    </div>
                </div>

                <div className="mt-4 md:mt-0 flex gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => setHiddenForSession(true)}
                    >
                        Remind Later
                    </Button>
                    <Button
                        size="sm"
                        className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                        onClick={() => navigate('/daily-checkup')}
                    >
                        Start Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
