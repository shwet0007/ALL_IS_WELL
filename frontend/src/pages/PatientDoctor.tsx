import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    getUserProfile,
    getPublicProfile,
    getPatientCheckups,
    getMedicalReports,
    getDoctorNotes,
    UserProfile,
    Checkup,
    MedicalReport,
    DoctorNote,
    requestAppointment
} from '@/lib/db';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import JoinDoctorRoom from '@/components/doctor/JoinDoctorRoom';
import DoctorList from '@/components/doctor/DoctorList';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calendar,
    FileText,
    MessageSquare,
    Clock,
    Download,
    Eye,
    Stethoscope,
    MapPin,
    AlertCircle
} from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

export default function PatientDoctor() {
    const { currentUser, userProfile } = useAuth();
    const [doctorProfile, setDoctorProfile] = useState<UserProfile | null>(null);
    const [checkups, setCheckups] = useState<Checkup[]>([]);
    const [reports, setReports] = useState<MedicalReport[]>([]);
    const [notes, setNotes] = useState<DoctorNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    // Removed date/time states
    const [reqReason, setReqReason] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    const handleRequestAppointment = async () => {
        try {
            await requestAppointment({
                date: new Date().toISOString(), // Use current time as request timestamp
                type: userProfile?.role === 'pregnant' ? 'pregnancy' : 'baby',
                note: reqReason,
                isUrgent
            });
            setRequestDialogOpen(false);
            // Refresh logic (simple reload for now or optimistic update)
            window.location.reload();
        } catch (e) {
            console.error("Failed", e);
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            if (currentUser && userProfile?.doctorId) {
                try {
                    setLoading(true);
                    const [docProfile, patientCheckups, patientReports, patientNotes] = await Promise.all([
                        getPublicProfile(userProfile.doctorId),
                        getPatientCheckups(currentUser.uid),
                        getMedicalReports(currentUser.uid),
                        getDoctorNotes(currentUser.uid)
                    ]);

                    if (docProfile) setDoctorProfile(docProfile);
                    setCheckups(patientCheckups);
                    setReports(patientReports);
                    setNotes(patientNotes);
                } catch (error) {
                    console.error("Error fetching doctor data:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser, userProfile]);

    // If not connected to a doctor, show Doctor List
    if (!userProfile?.doctorId) {
        return (
            <div className="space-y-6">
                <DoctorList />
            </div>
        );
    }

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading doctor details...</div>;
    }

    const upcomingCheckups = checkups.filter(c => !isPast(parseISO(c.date)) || isToday(parseISO(c.date)));
    const pastCheckups = checkups.filter(c => isPast(parseISO(c.date)) && !isToday(parseISO(c.date)));

    return (
        <div className="space-y-4 sm:space-y-6 pb-20 px-4 sm:px-0">
            {/* Doctor Overview Card */}
            <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10">
                    <Stethoscope className="w-20 h-20 sm:w-32 sm:h-32" />
                </div>
                <CardContent className="p-4 sm:p-6 relative z-10">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow-sm flex items-center justify-center border-2 border-secondary flex-shrink-0">
                            <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg sm:text-xl font-bold truncate">Dr. {doctorProfile?.name || userProfile?.doctorName || 'Doctor'}</h2>
                            <p className="text-sm sm:text-base text-secondary-foreground font-medium truncate">
                                {doctorProfile?.specialization || 'General Physician'}
                            </p>
                            {doctorProfile?.clinicName && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {doctorProfile.clinicName}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Request Appointment Button */}
            <div className="flex justify-end px-4 sm:px-0">
                <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 shadow-lg text-sm sm:text-base">
                            <Clock className="w-4 h-4" />
                            <span className="hidden xs:inline">Request Appointment</span>
                            <span className="xs:hidden">Request</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md mx-4">
                        <DialogHeader>
                            <DialogTitle>Request Appointment</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {/* Date/Time removed as per user request */}
                            <div className="space-y-2">
                                <Label>Reason / Note</Label>
                                <Textarea placeholder="Describe your symptoms or reason..." value={reqReason} onChange={e => setReqReason(e.target.value)} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="urgent" checked={isUrgent} onCheckedChange={(c) => setIsUrgent(c as boolean)} />
                                <Label htmlFor="urgent" className="text-destructive font-bold flex items-center gap-1">
                                    <AlertCircle size={14} /> Mark as Urgent
                                </Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleRequestAppointment}>Submit Request</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="checkups" className="w-full px-4 sm:px-0">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="checkups" className="text-xs sm:text-sm">Checkups</TabsTrigger>
                    <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
                    <TabsTrigger value="notes" className="text-xs sm:text-sm">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="checkups" className="space-y-4 sm:space-y-6">
                    {/* Upcoming */}
                    <section>
                        <h3 className="font-semibold text-base sm:text-lg mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            <span className="hidden xs:inline">Upcoming Appointments</span>
                            <span className="xs:hidden">Upcoming</span>
                        </h3>
                        {upcomingCheckups.length === 0 ? (
                            <Card className="bg-muted/30 border-dashed">
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    No upcoming checkups scheduled.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {upcomingCheckups.map(checkup => (
                                    <Card key={checkup.id} className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
                                            <div className="flex-1 min-w-0">
                                                {checkup.status === 'pending' ? (
                                                    <p className="font-bold text-base sm:text-lg text-yellow-700">Request Pending</p>
                                                ) : (
                                                    <>
                                                        <p className="font-bold text-base sm:text-lg">{format(parseISO(checkup.date), 'MMM d, yyyy')}</p>
                                                        <p className="text-primary font-medium text-sm sm:text-base">{format(parseISO(checkup.date), 'h:mm a')}</p>
                                                    </>
                                                )}
                                                <p className="text-xs sm:text-sm text-muted-foreground capitalize mt-1">{checkup.type} Checkup</p>
                                            </div>
                                            <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 flex-wrap">
                                                {checkup.status === 'pending' && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">Pending</span>
                                                )}
                                                {checkup.isUrgent && (
                                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                                        <AlertCircle size={10} /> Urgent
                                                    </span>
                                                )}
                                            </div>
                                            {checkup.note && (
                                                <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground w-full sm:max-w-[150px] truncate mt-2 sm:mt-0">
                                                    {checkup.note}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* History */}
                    {pastCheckups.length > 0 && (
                        <section>
                            <h3 className="font-semibold text-base sm:text-lg mb-3 text-muted-foreground">History</h3>
                            <div className="space-y-3">
                                {pastCheckups.map(checkup => (
                                    <Card key={checkup.id} className="bg-muted/10">
                                        <CardContent className="p-3 sm:p-4 flex flex-col xs:flex-row gap-2 xs:gap-0 xs:items-center xs:justify-between opacity-70">
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm sm:text-base">{format(parseISO(checkup.date), 'MMM d, yyyy')}</p>
                                                <p className="text-xs capitalize">{checkup.type}</p>
                                            </div>
                                            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-bold">
                                                Completed
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    {reports.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>No medical reports shared yet.</p>
                        </div>
                    ) : (
                        reports.map(report => (
                            <Card key={report.id}>
                                <CardContent className="p-3 sm:p-4 flex flex-col xs:flex-row items-start gap-3 sm:gap-4">
                                    <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
                                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm sm:text-base break-words">{report.fileName}</h4>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            Shared on {format(parseISO(report.date), 'MMM d, yyyy')}
                                        </p>
                                        {report.remarks && (
                                            <p className="text-sm bg-muted/50 p-2 rounded mb-2">
                                                "{report.remarks}"
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" asChild>
                                                <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="w-3 h-3" /> View
                                                </a>
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" asChild>
                                                <a href={report.fileUrl} download>
                                                    <Download className="w-3 h-3" /> Download
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                    {notes.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>No instructions from your doctor yet.</p>
                        </div>
                    ) : (
                        notes.map(note => (
                            <Card key={note.id} className={cn(
                                "border-l-4",
                                note.priority === 'high' ? "border-l-destructive bg-destructive/5" : "border-l-secondary"
                            )}>
                                <CardContent className="p-3 sm:p-4">
                                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 mb-2">
                                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(parseISO(note.date), 'MMM d, h:mm a')}
                                        </span>
                                        {note.priority === 'high' && (
                                            <span className="text-[10px] font-bold bg-destructive text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Important
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                                        {note.content}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
