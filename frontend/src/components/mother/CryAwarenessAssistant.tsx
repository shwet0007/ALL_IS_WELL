import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Baby, Mic, Square, Loader2, RefreshCw, AlertTriangle } from 'lucide-react'; // Added icons
import { api as apiHelper } from '@/lib/api'; // Use the main api helper logic

export default function CryAwarenessAssistant() {
    const [isRecording, setIsRecording] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<{ pattern: string; message: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const startRecording = async () => {
        setError(null);
        setResult(null);
        chunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                analyzeCry(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Auto-stop after 15 seconds
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    stopRecording();
                }
            }, 15000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const analyzeCry = async (audioBlob: Blob) => {
        setAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'cry.webm');

            // Use the API helper to send the file
            const response = await apiHelper.upload('/cry-analysis/analyze', formData);
            setResult(response);
        } catch (err) {
            console.error("Analysis failed:", err);
            setError("Cry analysis is currently unavailable. Please try again or consult a healthcare professional.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <Card className="border-sky-300 bg-sky-50 overflow-hidden">
            <CardHeader className="bg-sky-100 pb-4">
                <CardTitle className="text-sky-900 flex items-center gap-2">
                    <Baby className="w-6 h-6" />
                    Baby Cry Awareness Assistant
                </CardTitle>
                <CardDescription className="text-sky-700">
                    Record a short cry (10–15 seconds) for awareness-based guidance.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 text-center space-y-6">

                {/* Result Display */}
                {result && (
                    <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-sm animate-in fade-in zoom-in">
                        <h3 className="text-xl font-bold text-sky-800 mb-2">{result.pattern} Pattern</h3>
                        <p className="text-slate-600">{result.message}</p>
                        <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-100 text-left">
                            <strong>Disclaimer:</strong> This feature provides awareness-based suggestions only and does not replace parental judgment or medical consultation.
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 justify-center text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {/* Controls */}
                <div className="flex justify-center items-center gap-4">
                    {analyzing ? (
                        <Button disabled className="bg-sky-600">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing cry pattern...
                        </Button>
                    ) : isRecording ? (
                        <Button variant="destructive" onClick={stopRecording} className="animate-pulse">
                            <Square className="w-4 h-4 mr-2 fill-current" />
                            Stop Recording
                        </Button>
                    ) : (
                        <Button onClick={startRecording} className="bg-sky-600 hover:bg-sky-700">
                            <Mic className="w-4 h-4 mr-2" />
                            {result ? 'Record Again' : 'Start Recording'}
                        </Button>
                    )}
                </div>

                {isRecording && (
                    <p className="text-xs text-muted-foreground animate-pulse">
                        Recording... (Max 15s)
                    </p>
                )}
                <div className="mt-6 text-[10px] text-muted-foreground bg-slate-50 p-2 rounded border border-slate-100 mx-auto max-w-xs">
                    <p className="flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Audio is processed temporarily and deleted immediately.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
