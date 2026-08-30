import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserProfile, addMedicalReport } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UploadReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patients: (UserProfile & { id: string })[];
    onSuccess?: () => void;
}

const UploadReportDialog: React.FC<UploadReportDialogProps> = ({ isOpen, onClose, patients, onSuccess }) => {
    const { currentUser, userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [fileName, setFileName] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [remarks, setRemarks] = useState('');

    const handleUpload = async () => {
        if (!selectedPatientId || !fileName || !fileUrl || !currentUser) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            const patient = patients.find(p => p.id === selectedPatientId);
            if (!patient) throw new Error("Patient not found");

            await addMedicalReport({
                date: new Date().toISOString(),
                fileName,
                fileUrl,
                doctorName: userProfile?.name || 'Doctor',
                remarks,
                patientId: selectedPatientId,
            });

            toast.success("Report shared successfully!");
            if (onSuccess) onSuccess();
            onClose();
            // Reset form
            setSelectedPatientId('');
            setFileName('');
            setFileUrl('');
            setRemarks('');
        } catch (error) {
            console.error("Failed to share report", error);
            toast.error("Failed to share report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Share Medical Report</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="patient" className="text-right">
                            Patient
                        </Label>
                        <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select patient" />
                            </SelectTrigger>
                            <SelectContent>
                                {patients.map((patient) => (
                                    <SelectItem key={patient.id} value={patient.id}>
                                        {patient.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fileName" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="fileName"
                            placeholder="e.g. Blood Test Results"
                            className="col-span-3"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fileUrl" className="text-right">
                            Link/URL
                        </Label>
                        <Input
                            id="fileUrl"
                            placeholder="https://..."
                            className="col-span-3"
                            value={fileUrl}
                            onChange={(e) => setFileUrl(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="remarks" className="text-right">
                            Remarks
                        </Label>
                        <Textarea
                            id="remarks"
                            className="col-span-3"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Optional remarks..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleUpload} disabled={loading}>
                        {loading ? "Sharing..." : "Share Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UploadReportDialog;
