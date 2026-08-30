import React, { useState, useEffect } from 'react';
import FoodIntroductionTracker from './FoodIntroductionTracker';
import BabyDietPlan from './BabyDietPlan';
import InfantDiseaseAssistant from './InfantDiseaseAssistant';
import CryAwarenessAssistant from './CryAwarenessAssistant';
import VaccinationTracker from './VaccinationTracker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Utensils, Apple, Info, Calendar, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Syringe, Baby } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, UserProfile } from '@/lib/db';
import { format, differenceInMonths, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';

export default function InfantCareSection() {
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

    const babyDob = profile?.babyDob ? new Date(profile.babyDob) : null;
    const ageInMonths = babyDob ? differenceInMonths(new Date(), babyDob) : 0;
    const solidFoodDate = babyDob ? addMonths(babyDob, 6) : null;
    const isReadyForSolids = ageInMonths >= 6;

    const commonHeader = (
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
                <Apple className="w-8 h-8 text-primary" />
            </div>
            <div>
                <h2 className="text-2xl font-bold">Baby Nutrition & Care</h2>
                <p className="text-muted-foreground">Expert guidance for feeding and infant wellness</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {commonHeader}

            <Tabs defaultValue={isReadyForSolids ? "diet" : "roadmap"} className="w-full">
                <TabsList className={cn("grid w-full mb-8", isReadyForSolids ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3")}>
                    {!isReadyForSolids && (
                        <TabsTrigger value="roadmap" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            Roadmap
                        </TabsTrigger>
                    )}
                    {isReadyForSolids && (
                        <>
                            <TabsTrigger value="diet" className="gap-2">
                                <Utensils className="w-4 h-4" />
                                Diet Plan
                            </TabsTrigger>
                            <TabsTrigger value="food" className="gap-2">
                                <Apple className="w-4 h-4" />
                                Food Intro
                            </TabsTrigger>
                        </>
                    )}
                    <TabsTrigger value="vaccine" className="gap-2">
                        <Syringe className="w-4 h-4" />
                        Vaccines
                    </TabsTrigger>
                    <TabsTrigger value="disease" className="gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        Disease
                    </TabsTrigger>
                    <TabsTrigger value="cry" className="gap-2">
                        <Baby className="w-4 h-4" />
                        Cry Awareness
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="roadmap">
                    <Card className="border-amber-200 bg-amber-50/30 overflow-hidden">
                        <CardHeader className="bg-amber-100/50 pb-4">
                            <CardTitle className="text-amber-800 flex items-center gap-2">
                                <Info className="w-5 h-5" />
                                When to start solids?
                            </CardTitle>
                            <CardDescription className="text-amber-700/80">
                                Recommended age: 6 Months (approx. {solidFoodDate ? format(solidFoodDate, 'MMMM d, yyyy') : '6 months from birth'})
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="bg-white/80 rounded-2xl p-6 border border-amber-100 shadow-sm">
                                <h3 className="font-bold text-lg mb-4 text-amber-900">Why wait until 6 months?</h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 items-start">
                                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <span><strong>Digestive Maturity:</strong> Your baby's gut is still developing and needs time to process anything other than milk.</span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <span><strong>Lower Allergy Risk:</strong> Introducing solids too early may increase the risk of allergies and infections.</span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <span><span>Tongue-Thrust Reflex:</span> Babies naturally push foreign objects out of their mouth until about 6 months.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4 items-center">
                                <AlertCircle className="w-6 h-6 text-primary shrink-0" />
                                <p className="text-sm text-primary-foreground font-medium">
                                    Keep breastfeeding or formula feeding as the primary source of nutrition.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="diet">
                    <BabyDietPlan />
                </TabsContent>

                <TabsContent value="food">
                    <Card className="border-peach-100 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-peach-50 to-transparent rounded-t-xl pb-2 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Info className="w-4 h-4 text-peach-500" />
                                Solid Food Introduction
                            </CardTitle>
                            <CardDescription>
                                Track how your baby reacts to new flavors and textures
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <FoodIntroductionTracker />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vaccine">
                    <VaccinationTracker />
                </TabsContent>

                <TabsContent value="disease">
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                            <p className="text-sm text-blue-900">
                                <strong>Safety First:</strong> This assistant provides awareness and general pediatric information. It is not a diagnostic tool. In case of emergency, contact your pediatrician or local emergency services immediately.
                            </p>
                        </div>
                        <InfantDiseaseAssistant />
                    </div>
                </TabsContent>

                <TabsContent value="cry">
                    <CryAwarenessAssistant />
                </TabsContent>
            </Tabs>
        </div>
    );
}
