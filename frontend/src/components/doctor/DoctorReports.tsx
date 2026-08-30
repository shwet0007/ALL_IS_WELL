import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MedicalReport,
    getMedicalReports,
    deleteMedicalReport,
    UserProfile
} from '@/lib/db';
import {
    FileText,
    Search,
    Trash2,
    ExternalLink,
    Plus,
    Calendar
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import UploadReportDialog from './UploadReportDialog';

interface DoctorReportsProps {
    patients: (UserProfile & { id: string })[];
}

export default function DoctorReports({ patients }: DoctorReportsProps) {
    const [reports, setReports] = useState<MedicalReport[]>([]);
    const [loading, setLoading] = useState(false); // Initially false, loads when patient selected or init?
    // Actually we should fetch ALL reports for ALL connected patients? 
    // Or maybe just show recent uploads?
    // Let's fetch all reports for connected patients.

    // Better approach: Since getMedicalReports takes a patientId, maybe we iterate connected patients?
    // Or maybe we change getMedicalReports to fetch by doctor?
    // For now, let's just let the doctor select a patient to view reports, OR show a flat list if possible.
    // Given the structure, fetching per patient is easiest. Let's fetch all and combine.

    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchAllReports = async () => {
            if (patients.length === 0) {
                setReports([]);
                return;
            };

            setLoading(true);
            try {
                // Fetch reports for all connected patients in parallel
                const promises = patients.map(p => getMedicalReports(p.id));
                const results = await Promise.all(promises);
                const allReports = results.flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setReports(allReports);
            } catch (error) {
                console.error("Error fetching reports:", error);
                toast.error("Failed to load reports");
            } finally {
                setLoading(false);
            }
        };

        fetchAllReports();
    }, [patients, refreshTrigger]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this report?")) return;
        try {
            await deleteMedicalReport(id);
            toast.success("Report deleted");
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error deleting report:", error);
            toast.error("Failed to delete report");
        }
    };

    // Helper to get patient name if not in report (though it should be)
    const getPatientName = (id: string) => {
        return patients.find(p => p.id === id)?.name || 'Unknown Patient';
    };

    const filteredReports = reports.filter(report => {
        const patientName = getPatientName(report.patientId);
        return (
            report.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patientName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search report or patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-card"
                    />
                </div>

                <Button onClick={() => setIsUploadOpen(true)} className="w-full md:w-auto gap-2">
                    <Plus className="w-4 h-4" />
                    Share New Report
                </Button>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading reports...</div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border-dashed border-2 border-border">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No reports shared yet.</p>
                    </div>
                ) : (
                    filteredReports.map((report) => (
                        <Card key={report.id} className="transition-all hover:shadow-md">
                            <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base truncate">{report.fileName}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <span className="font-medium text-foreground">{getPatientName(report.patientId)}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(parseISO(report.date), 'MMM d, yyyy')}
                                        </span>
                                    </p>
                                    {report.remarks && (
                                        <p className="text-xs text-muted-foreground mt-1 truncate">{report.remarks}</p>
                                    )}
                                </div>

                                <div className="flex gap-2 justify-end md:w-auto w-full">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="gap-2"
                                    >
                                        <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-4 h-4" />
                                            View
                                        </a>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(report.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <UploadReportDialog
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                patients={patients}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
        </div>
    );
}
