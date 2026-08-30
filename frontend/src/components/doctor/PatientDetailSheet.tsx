import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { UserProfile } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Moon, Utensils, AlertTriangle, Baby, Stethoscope } from "lucide-react";
import { differenceInYears, parseISO, format } from 'date-fns';

interface PatientDetailSheetProps {
    isOpen: boolean;
    onClose: () => void;
    patient: UserProfile | null;
}

const PatientDetailSheet: React.FC<PatientDetailSheetProps> = ({ isOpen, onClose, patient }) => {
    if (!patient) return null;

    const age = patient.createdAt ? differenceInYears(new Date(), parseISO(patient.createdAt.toString())) : 'N/A'; // Simplified age calculation

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-hidden flex flex-col">
                <SheetHeader className="mb-4">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        {patient.name}
                        <Badge variant={patient.role === 'pregnant' ? 'default' : 'secondary'}>
                            {patient.role === 'pregnant' ? 'Pregnant' : 'Mother'}
                        </Badge>
                        {patient.highRisk && (
                            <Badge variant="destructive" className="ml-auto animate-pulse">
                                High Risk
                            </Badge>
                        )}
                    </SheetTitle>
                    <SheetDescription>
                        Patient Details & Health Overview
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="space-y-6 pb-8">
                        {/* Basic Vitals */}
                        <section className="grid grid-cols-3 gap-4">
                            <div className="bg-muted/40 p-3 rounded-lg text-center border">
                                <p className="text-xs text-muted-foreground mb-1">Blood Group</p>
                                <p className="font-semibold">{patient.bloodGroup || '--'}</p>
                            </div>
                            <div className="bg-muted/40 p-3 rounded-lg text-center border">
                                <p className="text-xs text-muted-foreground mb-1">Height</p>
                                <p className="font-semibold">{patient.height ? `${patient.height} cm` : '--'}</p>
                            </div>
                            <div className="bg-muted/40 p-3 rounded-lg text-center border">
                                <p className="text-xs text-muted-foreground mb-1">Weight</p>
                                <p className="font-semibold">{patient.weight ? `${patient.weight} kg` : '--'}</p>
                            </div>
                        </section>

                        <Separator />

                        {/* Role Specific Details */}
                        <section>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Baby className="w-4 h-4 text-primary" />
                                {patient.role === 'pregnant' ? 'Pregnancy Details' : 'Baby Details'}
                            </h3>
                            <div className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
                                {patient.role === 'pregnant' ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Start Date</span>
                                            <span className="text-sm font-medium">{patient.pregnancyStartDate || '--'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Trimester</span>
                                            <span className="text-sm font-medium">{patient.trimester || '--'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Complications History</span>
                                            <span className="text-sm font-medium text-right max-w-[60%]">{patient.previousComplications || 'None'}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Baby Name</span>
                                            <span className="text-sm font-medium">{patient.babyName || `${patient.name}'s Baby`}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Date of Birth</span>
                                            <span className="text-sm font-medium">{patient.babyDob || '--'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Gender</span>
                                            <span className="text-sm font-medium capitalize">{patient.babyGender || '--'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Blood Group</span>
                                            <span className="text-sm font-medium">{patient.babyBloodGroup || '--'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Birth Weight</span>
                                            <span className="text-sm font-medium">{patient.birthWeight ? `${patient.birthWeight} kg` : '--'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Delivery Method</span>
                                            <span className="text-sm font-medium capitalize">{patient.deliveryType || '--'}</span>
                                        </div>
                                        {(patient.babyAllergies || patient.babyHealthConditions) && (
                                            <div className="pt-2 mt-2 border-t">
                                                {patient.babyAllergies && (
                                                    <div className="text-xs text-red-600 font-medium flex items-center gap-1 mb-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Allergies: {patient.babyAllergies}
                                                    </div>
                                                )}
                                                {patient.babyHealthConditions && (
                                                    <div className="text-xs text-amber-700 font-medium flex items-center gap-1">
                                                        <Activity className="w-3 h-3" />
                                                        Conditions: {patient.babyHealthConditions}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </section>

                        <Separator />

                        {/* Medical Conditions */}
                        <section>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-primary" />
                                Medical Conditions
                            </h3>
                            {patient.medicalConditions ? (
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(patient.medicalConditions)
                                        .filter(([key, value]) => value === true && key !== 'other')
                                        .map(([key]) => (
                                            <Badge key={key} variant="destructive" className="capitalize">
                                                {key}
                                            </Badge>
                                        ))}
                                    {patient.medicalConditions.other && (
                                        <Badge variant="outline">{patient.medicalConditions.other}</Badge>
                                    )}
                                    {!Object.values(patient.medicalConditions).some(v => v === true || (typeof v === 'string' && v.length > 0)) && (
                                        <p className="text-sm text-muted-foreground italic">No known conditions</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No medical history recorded</p>
                            )}
                        </section>

                        <Separator />

                        {/* Lifestyle */}
                        <section>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" />
                                Lifestyle
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/20">
                                    <Moon className="w-4 h-4 mb-1 text-slate-500" />
                                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Sleep</span>
                                    <span className="text-sm font-medium capitalize">{patient.lifestyle?.sleep || '--'}</span>
                                </div>
                                <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/20">
                                    <Activity className="w-4 h-4 mb-1 text-emerald-500" />
                                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Activity</span>
                                    <span className="text-sm font-medium capitalize">{patient.lifestyle?.activity || '--'}</span>
                                </div>
                                <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/20">
                                    <Utensils className="w-4 h-4 mb-1 text-orange-500" />
                                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Diet</span>
                                    <span className="text-sm font-medium capitalize">{patient.lifestyle?.diet || '--'}</span>
                                </div>
                            </div>
                            {patient.lifestyle?.allergies && (
                                <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-md flex items-start gap-2 text-red-700 text-sm">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>Allergies: {patient.lifestyle.allergies}</span>
                                </div>
                            )}
                        </section>

                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};

export default PatientDetailSheet;
