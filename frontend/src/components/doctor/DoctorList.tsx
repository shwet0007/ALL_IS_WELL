import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Stethoscope, Building2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Doctor {
    id: string;
    uid?: string;
    name: string;
    specialization?: string;
    clinicName?: string;
}

export default function DoctorList() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestingId, setRequestingId] = useState<string | null>(null);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await api.get('/users/doctors');
            setDoctors(response.doctors);
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
            toast.error('Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestConnection = async (doctorId: string) => {
        setRequestingId(doctorId);
        try {
            await api.post('/users/doctor-request', { doctorId });
            toast.success('Connection request sent! The doctor will review your request.');
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to send request';
            toast.error(message);
        } finally {
            setRequestingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (doctors.length === 0) {
        return (
            <div className="text-center py-12">
                <Stethoscope className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No doctors available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Available Doctors</h2>
                <p className="text-muted-foreground">Browse and connect with healthcare professionals</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doctor) => {
                    const doctorId = doctor.uid || String(doctor.id);
                    return (
                        <Card key={doctorId} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Stethoscope className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Dr. {doctor.name}</CardTitle>
                                            {doctor.specialization && (
                                                <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {doctor.clinicName && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                        <Building2 className="w-4 h-4" />
                                        <span>{doctor.clinicName}</span>
                                    </div>
                                )}
                                <Button
                                    onClick={() => handleRequestConnection(doctorId)}
                                    disabled={requestingId === doctorId}
                                    className="w-full"
                                >
                                    {requestingId === doctorId ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending Request...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Request Connection
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
