import React, { useState, useEffect } from 'react';
import PregnancyCareTracker from './PregnancyCareTracker';
import InfantDiseaseAssistant from './InfantDiseaseAssistant';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Info, Calendar, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Stethoscope } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, UserProfile } from '@/lib/db';
import { format, differenceInWeeks } from 'date-fns';
import { cn } from '@/lib/utils';

export default function PregnancyCareSection() {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            getUserProfile(currentUser.uid).then(data => {
                setProfile(data);
                setLoading(false);
            });
        }
    }, [currentUser]);

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const currentWeek = profile?.pregnancyStartDate
        ? differenceInWeeks(new Date(), new Date(profile.pregnancyStartDate))
        : 0;

    const commonHeader = (
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
                <Heart className="w-8 h-8 text-primary" />
            </div>
            <div>
                <h2 className="text-2xl font-bold">Pregnancy Care & Wellness</h2>
                <p className="text-muted-foreground">Personalized guidance for your prenatal journey</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {commonHeader}

            <Tabs defaultValue="checkups" className="w-full">
                <TabsList className="grid w-full mb-8 grid-cols-2">
                    <TabsTrigger value="checkups" className="gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Checkups
                    </TabsTrigger>
                    <TabsTrigger value="wellness" className="gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        Health Assistant
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="checkups">
                    <PregnancyCareTracker />
                </TabsContent>

                <TabsContent value="wellness">
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                            <p className="text-sm text-blue-900">
                                <strong>Safety First:</strong> This health assistant provides awareness on pregnancy symptoms and general wellness. It is not for diagnosis. Consult your doctor for any severe pain, bleeding, or reduced movement.
                            </p>
                        </div>
                        <InfantDiseaseAssistant isPregnancyMode={true} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
