import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCheck, UserX, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface DoctorRequest {
    _id: string;
    patientId: string;
    patientName: string;
    status: string;
    requestDate: string;
}

export default function DoctorRequests() {
    const [requests, setRequests] = useState<DoctorRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/users/doctor-requests');
            setRequests(response.requests);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
        setProcessingId(requestId);
        try {
            await api.patch(`/users/doctor-request/${requestId}`, { status });
            toast.success(status === 'accepted' ? 'Request accepted! Patient connected.' : 'Request rejected.');
            // Remove from list
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (error) {
            toast.error('Failed to process request');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No pending connection requests</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Connection Requests</h2>
                <p className="text-muted-foreground">Review and respond to patient connection requests</p>
            </div>

            {requests.map((request) => (
                <Card key={request._id}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">{request.patientName}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Requested on {new Date(request.requestDate).toLocaleDateString()}
                                </p>
                            </div>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                Pending
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => handleResponse(request._id, 'accepted')}
                                disabled={processingId === request._id}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                {processingId === request._id ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <UserCheck className="w-4 h-4 mr-2" />
                                )}
                                Accept
                            </Button>
                            <Button
                                onClick={() => handleResponse(request._id, 'rejected')}
                                disabled={processingId === request._id}
                                variant="outline"
                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                            >
                                <UserX className="w-4 h-4 mr-2" />
                                Reject
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
