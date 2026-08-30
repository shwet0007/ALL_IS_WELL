import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { submitDailyCheckup, DailyCheckupResponses } from '@/lib/db';
import { Loader2, Heart, Brain, Activity, Baby, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function DailyCheckup() {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    const [responses, setResponses] = useState<DailyCheckupResponses>({
        physical: '',
        mental: '',
        lifestyle: '',
        babyRelated: ''
    });

    const handleSubmit = async () => {
        if (!responses.physical || !responses.mental || !responses.lifestyle) {
            alert("Please answer the required questions.");
            return;
        }

        setLoading(true);
        try {
            await submitDailyCheckup(responses);
            setSubmitted(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            console.error("Checkup submission failed:", error);
            alert("Failed to submit checkup. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full text-center p-8 animate-fade-in border-2 border-primary/20 shadow-xl">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-primary animate-bounce" />
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2">Check-in Complete!</CardTitle>
                    <CardDescription className="text-lg">
                        Thank you for taking care of yourself today. Redirecting you home...
                    </CardDescription>
                </Card>
            </div>
        );
    }

    return (
        <Layout
            sidebar={<Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}
            bottomNav={<BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
        >
            <Header userName={userProfile?.name?.split(' ')[0] || 'User'} onEmergencyClick={() => { }} />

            <main className="px-4 py-8 max-w-2xl mx-auto space-y-8 pb-24">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="mb-4 gap-2 hover:bg-blue-50"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>

                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Daily Health Check-in</h1>
                    <p className="text-muted-foreground">It only takes 2 minutes to track your well-being 💙</p>
                </div>

                <div className="space-y-6">
                    {/* Physical Health */}
                    <Card className="border-none shadow-soft overflow-hidden">
                        <CardHeader className="bg-peach-50/50 pb-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2 text-peach-700">
                                <Activity className="w-5 h-5" />
                                Physical Well-being
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <Label className="text-base">How are you feeling physically today?</Label>
                            <RadioGroup
                                value={responses.physical}
                                onValueChange={(v) => setResponses({ ...responses, physical: v })}
                                className="grid grid-cols-2 gap-3"
                            >
                                {['Energetic', 'Normal', 'Tired', 'Pain/Discomfort'].map(option => (
                                    <div key={option}>
                                        <RadioGroupItem value={option} id={`phys-${option}`} className="sr-only" />
                                        <Label
                                            htmlFor={`phys-${option}`}
                                            className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all text-center h-full ${responses.physical === option
                                                ? 'border-blue-600 bg-blue-500 text-white font-bold shadow-lg scale-105'
                                                : 'border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-300'
                                                }`}
                                        >
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Mental Health */}
                    <Card className="border-none shadow-soft overflow-hidden">
                        <CardHeader className="bg-lavender-50/50 pb-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2 text-lavender-700">
                                <Brain className="w-5 h-5" />
                                Mental & Emotional Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <Label className="text-base">Your mood today?</Label>
                            <RadioGroup
                                value={responses.mental}
                                onValueChange={(v) => setResponses({ ...responses, mental: v })}
                                className="grid grid-cols-2 gap-3"
                            >
                                {['Happy', 'Calm', 'Anxious', 'Low'].map(option => (
                                    <div key={option}>
                                        <RadioGroupItem value={option} id={`mental-${option}`} className="sr-only" />
                                        <Label
                                            htmlFor={`mental-${option}`}
                                            className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all text-center h-full ${responses.mental === option
                                                ? 'border-blue-600 bg-blue-500 text-white font-bold shadow-lg scale-105'
                                                : 'border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-300'
                                                }`}
                                        >
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Lifestyle */}
                    <Card className="border-none shadow-soft overflow-hidden">
                        <CardHeader className="bg-mint-50/50 pb-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2 text-mint-700">
                                <Heart className="w-5 h-5" />
                                Lifestyle & Nutrition
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <Label className="text-base">Did you manage to follow your diet and sleep well?</Label>
                            <RadioGroup
                                value={responses.lifestyle}
                                onValueChange={(v) => setResponses({ ...responses, lifestyle: v })}
                                className="grid grid-cols-1 gap-3"
                            >
                                {['Yes, everything was great', 'Mostly, on track', 'A bit struggling', 'Not a good day'].map(option => (
                                    <div key={option}>
                                        <RadioGroupItem value={option} id={`life-${option}`} className="sr-only" />
                                        <Label
                                            htmlFor={`life-${option}`}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${responses.lifestyle === option
                                                ? 'border-blue-600 bg-blue-500 text-white font-bold shadow-lg scale-105'
                                                : 'border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-300'
                                                }`}
                                        >
                                            <span>{option}</span>
                                            <ChevronRight className="w-4 h-4 opacity-50" />
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Role Specific (Baby) */}
                    {userProfile?.role === 'mother' && (
                        <Card className="border-none shadow-soft overflow-hidden">
                            <CardHeader className="bg-sky-50/50 pb-4 border-b">
                                <CardTitle className="text-lg flex items-center gap-2 text-sky-700">
                                    <Baby className="w-5 h-5" />
                                    Baby's Update
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <Label className="text-base">Any concerns or highlights for your baby today?</Label>
                                <Textarea
                                    placeholder="e.g. Baby slept well, or had minor colic in the afternoon..."
                                    value={responses.babyRelated}
                                    onChange={(e) => setResponses({ ...responses, babyRelated: e.target.value })}
                                    className="min-h-[100px] rounded-xl border-2 focus:border-sky-300 ring-0"
                                />
                            </CardContent>
                        </Card>
                    )}

                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-95"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Complete Check-in 💙'
                        )}
                    </Button>
                </div>
            </main>
        </Layout>
    );
}
