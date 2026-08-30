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
import { UserProfile, scheduleCheckup } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface ScheduleCheckupDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patients: (UserProfile & { id: string })[];
    onSuccess?: () => void;
}

const ScheduleCheckupDialog: React.FC<ScheduleCheckupDialogProps> = ({ isOpen, onClose, patients, onSuccess }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('');
    const [type, setType] = useState<'pregnancy' | 'baby'>('pregnancy');
    const [note, setNote] = useState('');

    const handleSchedule = async () => {
        if (!selectedPatientId || !date || !time || !currentUser) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            const patient = patients.find(p => p.id === selectedPatientId);
            if (!patient) throw new Error("Patient not found");

            const dateTime = new Date(`${date}T${time}`);

            await scheduleCheckup(selectedPatientId, {
                date: dateTime.toISOString(),
                type,
                note,
                status: 'scheduled',
                scheduledBy: currentUser.uid,
                patientId: selectedPatientId,
                patientName: patient.name
            });

            toast.success("Checkup scheduled successfully!");
            if (onSuccess) onSuccess();
            onClose();
            // Reset form
            setSelectedPatientId('');
            setDate('');
            setTime('');
            setNote('');
        } catch (error) {
            console.error("Failed to schedule checkup", error);
            toast.error("Failed to schedule checkup. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Schedule Checkup</DialogTitle>
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
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            className="col-span-3"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={format(new Date(), 'yyyy-MM-dd')}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">
                            Time
                        </Label>
                        <Input
                            id="time"
                            type="time"
                            className="col-span-3"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
                        <Select onValueChange={(v: any) => setType(v)} value={type}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pregnancy">Pregnancy Checkup</SelectItem>
                                <SelectItem value="baby">Baby Checkup</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="note" className="text-right">
                            Note
                        </Label>
                        <Textarea
                            id="note"
                            className="col-span-3"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Optional notes..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSchedule} disabled={loading}>
                        {loading ? "Scheduling..." : "Schedule Checkup"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ScheduleCheckupDialog;
