import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, saveBabyDietPlan, getBabyDietPlan, BabyDietPlanDoc, UserProfile } from '@/lib/db';
import { generateBabyDietPlan } from '@/lib/groq';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, RefreshCcw, Download, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function BabyDietPlan() {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [dietPlan, setDietPlan] = useState<BabyDietPlanDoc | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (currentUser) {
            initData();
        }
    }, [currentUser]);

    const initData = async () => {
        if (!currentUser) return;
        try {
            const [userProfile, savedPlan] = await Promise.all([
                getUserProfile(currentUser.uid),
                getBabyDietPlan(currentUser.uid)
            ]);
            setProfile(userProfile);
            setDietPlan(savedPlan);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!currentUser || !profile) return;
        setGenerating(true);
        try {
            const babyAgeWeeks = profile.babyDob ? Math.floor(Math.abs(new Date().getTime() - new Date(profile.babyDob).getTime()) / (1000 * 60 * 60 * 24 * 7)) : 0;
            const newPlan = await generateBabyDietPlan(profile);
            const planData: BabyDietPlanDoc = {
                plan: newPlan,
                generatedAt: new Date(),
                babyAgeWeeks
            };
            await saveBabyDietPlan(currentUser.uid, planData);
            setDietPlan(planData);
        } catch (error) {
            console.error(error);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {!dietPlan ? (
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Generate Baby Nutrition Plan</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Create a personalized, data-driven diet plan tailored to your baby's age, weight, and health conditions using AI.
                        </p>
                        <Button onClick={handleGenerate} disabled={generating} className="gap-2 px-8">
                            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Generate Now
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-lg">Personalized Diet Plan</h3>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating} className="gap-2">
                            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                            Update Plan
                        </Button>
                    </div>

                    <Card className="shadow-sm border-primary/10">
                        <CardHeader className="bg-primary/5 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-primary">Diet Strategy</CardTitle>
                                    <CardDescription>
                                        Generated for {dietPlan.babyAgeWeeks} week old baby
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 prose prose-sm max-w-none">
                            <ReactMarkdown>{dietPlan.plan}</ReactMarkdown>
                        </CardContent>
                    </Card>

                    <p className="text-[10px] text-center text-muted-foreground italic px-4">
                        Note: This plan is AI-generated based on your profile inputs. Always consult with your pediatrician before making significant changes to your baby's diet.
                    </p>
                </div>
            )}
        </div>
    );
}
