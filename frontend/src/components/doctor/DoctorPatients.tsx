import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/lib/db';
import {
    Search,
    User,
    Calendar,
    Activity,
    AlertCircle,
    ChevronRight,
    MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PatientDetailSheet from './PatientDetailSheet';

interface DoctorPatientsProps {
    patients: any[]; // Using any[] for now as the dashboard maps it with extra props
}

export default function DoctorPatients({ patients }: DoctorPatientsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patients by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-card"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    Total Patients: <span className="font-bold text-foreground">{patients.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border-dashed border-2 border-border">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No patients found{searchTerm && " matching your search"}.</p>
                    </div>
                ) : (
                    filteredPatients.map((patient) => (
                        <Card
                            key={patient.id}
                            className="group hover:shadow-card transition-all cursor-pointer border-border/50 overflow-hidden"
                            onClick={() => {
                                setSelectedPatient(patient);
                                setIsDetailOpen(true);
                            }}
                        >
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
                                            {patient.avatar}
                                        </div>
                                        <span className={cn(
                                            "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full",
                                            statusColors[patient.status as keyof typeof statusColors]
                                        )}>
                                            {statusLabels[patient.status as keyof typeof statusLabels]}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold mb-1">{patient.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {patient.type === 'pregnant' ? `Week ${patient.weekOrAge}` : `${patient.weekOrAge} months old`}
                                    </p>

                                    <div className="space-y-2">
                                        {patient.status === 'urgent' && (
                                            <div className="flex items-center gap-2 text-xs text-destructive font-semibold bg-destructive/5 p-2 rounded">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>Requires immediate attention</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Activity className="w-4 h-4" />
                                            <span>Last visit: {patient.lastVisit}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-3 bg-muted/30 border-t border-border/50 flex items-center justify-between text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                    <span>View Details</span>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <PatientDetailSheet
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                patient={selectedPatient}
            />
        </div>
    );
}
