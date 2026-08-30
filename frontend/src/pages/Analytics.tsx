import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getAdvancedDashboardData, AdvancedDashboardData, getMonthlyReport } from '@/lib/db';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, CheckCircle2, Activity, AlertTriangle, Syringe, Phone, Stethoscope, Calendar, Baby, Heart, Brain, Trophy, ChevronRight, Download, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnalyticsData {
    overview: {
        taskStreak: number;
        completionRate: number;
        vaccinationProgress: number;
        totalSOSTriggers: number;
        routineAdherence: number;
    };
    taskInsights: {
        completed: number;
        skipped: number;
        pending: number;
        streak: number;
    };
    routineAnalytics: {
        scheduledRoutines: number;
        completedRoutines: number;
        adherenceRate: number;
        weeklyConsistency: Array<{ date: string; completed: number }>;
    };
    roleBasedMetrics: {
        type: 'pregnancy' | 'infant';
        checkupsAttended?: number;
        checkupsScheduled?: number;
        attendanceRate?: number;
        trimester?: string;
        highRisk?: boolean;
        feedingObservations?: number;
        sleepObservations?: number;
        babyAge?: string;
    };
    vaccinationTracking: {
        completed: number;
        total: number;
        progress: number;
        upcoming: Array<{ name: string; dueDate: string; babyAge?: string }>;
        missed: number;
    };
    emergencySummary: {
        totalTriggers: number;
        lastTrigger: string | null;
        contactConfigured: boolean;
    };
    doctorInteraction: {
        connected: boolean;
        checkupsScheduled: number;
        reportsUploaded: number;
    };
    moodTrends: Array<{ date: string; mood: string }>;
    healthTrends: Array<{ date: string; score: number }>;
    symptomFrequency: Record<string, number>;
    totalEntries: number;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Analytics() {
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [advData, setAdvData] = useState<AdvancedDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'weekly' | 'journey'>('weekly');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [analytics, advanced] = await Promise.all([
                api.get('/users/analytics'),
                getAdvancedDashboardData()
            ]);
            setData(analytics);
            setAdvData(advanced);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                No analytics data available yet. Start tracking your daily activities!
            </div>
        );
    }

    const taskStatusData = [
        { name: 'Completed', value: data.taskInsights.completed, color: '#10b981' },
        { name: 'Skipped', value: data.taskInsights.skipped, color: '#f59e0b' },
        { name: 'Pending', value: data.taskInsights.pending, color: '#6b7280' }
    ];

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Health Intelligence</h1>
                <p className="text-muted-foreground">Deep patterns and insights for proactive care</p>
                <div className="flex bg-muted p-1 rounded-lg w-fit mt-4">
                    <button
                        onClick={() => setViewMode('weekly')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${viewMode === 'weekly' ? 'bg-white shadow-sm' : 'text-muted-foreground'}`}
                    >
                        Active Focus
                    </button>
                    <button
                        onClick={() => setViewMode('journey')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${viewMode === 'journey' ? 'bg-white shadow-sm' : 'text-muted-foreground'}`}
                    >
                        Health Journey View
                    </button>
                </div>
            </div>

            {/* Ethical Disclaimer */}
            <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                    <strong>Note:</strong> Analytics are for awareness and pattern observation only and do not replace medical consultation.
                </AlertDescription>
            </Alert>

            {/* 1. Overview KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Task Streak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.taskStreak}</div>
                        <p className="text-xs text-muted-foreground mt-1">days completed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            Completion
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.completionRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">task rate</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Syringe className="w-4 h-4 text-purple-600" />
                            Vaccines
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.vaccinationProgress}%</div>
                        <p className="text-xs text-muted-foreground mt-1">completed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Phone className="w-4 h-4 text-red-600" />
                            SOS Calls
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.totalSOSTriggers}</div>
                        <p className="text-xs text-muted-foreground mt-1">total triggers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            Routine
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.routineAdherence}%</div>
                        <p className="text-xs text-muted-foreground mt-1">adherence</p>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Trend Intelligence (Mood & Energy) */}
            <div className="grid grid-cols-1 gap-6">
                <Card className="border-none shadow-soft overflow-hidden">
                    <CardHeader className="bg-lavender-50/50 pb-4 border-b">
                        <CardTitle className="text-lg flex items-center gap-2 text-lavender-700">
                            <Brain className="w-5 h-5" />
                            Mood & Energy Trend
                        </CardTitle>
                        <CardDescription>Correlation between emotional states and physical activity</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={advData?.moodTrends || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" hide />
                                <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tickFormatter={(v) => ['', 'Low', 'Anx', 'Calm', 'Happy'][v]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="mt-4 p-4 bg-lavender-50 rounded-xl flex items-start gap-3">
                            <span className="text-lavender-600 font-bold">🧠 Insight:</span>
                            <p className="text-xs text-lavender-900 font-medium">
                                Lower energy levels were observed on days following "Low" mood check-ins. Consistent sleep routines help stabilize these trends.
                            </p>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* 4. Role-Based Metrics */}
            {data.roleBasedMetrics.type && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {data.roleBasedMetrics.type === 'pregnancy' ? <Heart className="w-5 h-5 text-pink-600" /> : <Baby className="w-5 h-5 text-blue-600" />}
                            {data.roleBasedMetrics.type === 'pregnancy' ? 'Pregnancy Care Summary' : 'Infant Care Summary'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.roleBasedMetrics.type === 'pregnancy' ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Checkups Attended</p>
                                    <p className="text-2xl font-bold">{data.roleBasedMetrics.checkupsAttended}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Checkups Scheduled</p>
                                    <p className="text-2xl font-bold">{data.roleBasedMetrics.checkupsScheduled}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                                    <p className="text-2xl font-bold">{data.roleBasedMetrics.attendanceRate}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Trimester</p>
                                    <p className="text-2xl font-bold">{data.roleBasedMetrics.trimester}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Feeding Observations</p>
                                    <p className="text-2xl font-bold">{data.roleBasedMetrics.feedingObservations}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Sleep Observations</p>
                                    <p className="text-2xl font-bold">{data.roleBasedMetrics.sleepObservations}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Baby Age</p>
                                    <p className="text-2xl font-bold">{data.roleBasedMetrics.babyAge}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* 5. Vaccination Tracking */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Syringe className="w-5 h-5 text-purple-600" />
                        Vaccination Tracking
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="mb-4">
                                <p className="text-sm text-muted-foreground mb-2">Progress</p>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${data.vaccinationTracking.progress}%` }}></div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{data.vaccinationTracking.completed} of {data.vaccinationTracking.total} completed</p>
                            </div>
                            <div className="text-sm">
                                <p className="text-muted-foreground">Missed: <span className="font-bold text-red-600">{data.vaccinationTracking.missed}</span></p>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm font-semibold mb-2">Upcoming Vaccinations</p>
                            {data.vaccinationTracking.upcoming.length > 0 ? (
                                <div className="space-y-2">
                                    {data.vaccinationTracking.upcoming.map((vac, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm">{vac.name}</p>
                                                {vac.babyAge && <p className="text-xs text-muted-foreground">{vac.babyAge}</p>}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{new Date(vac.dueDate).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No upcoming vaccinations scheduled</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 6. Emergency Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-red-600" />
                        Emergency & Safety Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Total SOS Activations</p>
                            <p className="text-2xl font-bold">{data.emergencySummary.totalTriggers}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Last SOS</p>
                            <p className="text-lg font-bold">
                                {data.emergencySummary.lastTrigger
                                    ? new Date(data.emergencySummary.lastTrigger).toLocaleDateString()
                                    : 'Never'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Emergency Contact</p>
                            <p className="text-lg font-bold">
                                {data.emergencySummary.contactConfigured ? '✅ Configured' : '❌ Not Set'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 7. Doctor Interaction */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                        Doctor Interaction Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-mint-50 rounded-xl border border-mint-100">
                            <Trophy className="w-8 h-8 text-mint-600" />
                            <div>
                                <p className="font-bold text-mint-900">Care Champion</p>
                                <p className="text-xs text-mint-700">7-day streak</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl border border-sky-100">
                            <Trophy className="w-8 h-8 text-sky-600" />
                            <div>
                                <p className="font-bold text-sky-900">Consistency Builder</p>
                                <p className="text-xs text-sky-700">85% check-in rate</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-peach-50 rounded-xl border border-peach-100">
                            <Trophy className="w-8 h-8 text-peach-600" />
                            <div>
                                <p className="font-bold text-peach-900">Baby Comfort Star</p>
                                <p className="text-xs text-peach-700">Routine master</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Health Summary */}
            <Card className="bg-primary text-white border-none shadow-xl overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="space-y-2 text-center md:text-left">
                            <h2 className="text-2xl font-bold">Monthly Health Summary Generated</h2>
                            <p className="text-blue-100 opacity-80 uppercase tracking-widest text-xs font-bold">Professional Doctor-Ready Report</p>
                            <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                                <div className="bg-white/10 px-3 py-1 rounded-full text-sm backdrop-blur-sm">Care Consistency: {advData?.consistencyScore}%</div>
                                <div className="bg-white/10 px-3 py-1 rounded-full text-sm backdrop-blur-sm">Vaccination: On Track 👍</div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" className="gap-2 font-bold h-12" onClick={() => navigate('/detailed-report')}>
                                <FileText className="w-4 h-4" /> View Detailed Report
                            </Button>
                            <Button variant="outline" className="bg-white text-primary hover:bg-white/90 gap-2 font-bold h-12" onClick={() => window.print()}>
                                <Download className="w-4 h-4" /> Download PDF
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
