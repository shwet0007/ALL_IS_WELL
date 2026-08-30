import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    findDoctorByRoomCode,
    joinDoctorRoom,
    isPatientConnected
} from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, CheckCircle2, Stethoscope } from 'lucide-react';

export default function JoinDoctorRoom() {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [doctorName, setDoctorName] = useState('');

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !userProfile) return;

        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            // Validate room code format
            if (roomCode.length !== 6 || !/^\d+$/.test(roomCode)) {
                setError('Room code must be exactly 6 digits');
                setLoading(false);
                return;
            }

            // Check if already connected
            const alreadyConnected = await isPatientConnected(currentUser.uid);
            if (alreadyConnected) {
                setError('You are already connected to a doctor. Please contact support to change doctors.');
                setLoading(false);
                return;
            }

            // Find doctor by room code
            const doctorRoom = await findDoctorByRoomCode(roomCode);
            if (!doctorRoom) {
                setError('Invalid room code. Please check the code and try again.');
                setLoading(false);
                return;
            }

            // Join the doctor room
            await joinDoctorRoom(currentUser.uid, doctorRoom.doctorId, doctorRoom.doctorName);

            // Refresh profile to get updated data
            await refreshProfile();

            setSuccess(true);
            setDoctorName(doctorRoom.doctorName);
            setRoomCode('');
        } catch (err) {
            console.error('Error joining doctor room:', err);
            setError('Failed to join doctor room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // If already connected, show connected doctor info
    if (userProfile?.doctorId && userProfile?.doctorName) {
        return (
            <Card className="border-green-200 bg-green-50/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-900">
                        <CheckCircle2 className="w-5 h-5" />
                        Connected to Doctor
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-lg">Dr. {userProfile.doctorName}</p>
                            <p className="text-sm text-muted-foreground">Your personal healthcare provider</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    Join Doctor Room
                </CardTitle>
                <CardDescription>
                    Enter the room code shared by your doctor to connect
                </CardDescription>
            </CardHeader>
            <CardContent>
                {success && (
                    <Alert className="mb-4 border-green-200 bg-green-50">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <AlertDescription className="text-green-900">
                            Successfully connected to Dr. {doctorName}! You can now access personalized care.
                        </AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleJoin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="roomCode">Doctor Room Code</Label>
                        <Input
                            id="roomCode"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            maxLength={6}
                            required
                            className="text-center text-2xl font-mono tracking-widest"
                        />
                        <p className="text-xs text-muted-foreground">
                            Ask your doctor for their unique room code
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || roomCode.length !== 6}
                        className="w-full gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                Join Doctor Room
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
