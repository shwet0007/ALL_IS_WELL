import React from 'react';
import { ExternalLink, ArrowLeft, Baby, Info, AlertTriangle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const CryAnalysis: React.FC = () => {
    const navigate = useNavigate();

    // External URL for the hosted cry analysis tool
    const EXTERNAL_URL = "https://babycryanalysis.vercel.app/";

    React.useEffect(() => {
        // Direct redirect on mount as requested
        window.location.href = EXTERNAL_URL;
    }, []);

    const handleLaunchExternal = () => {
        window.open(EXTERNAL_URL, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-2xl flex items-center justify-between mb-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 hover:bg-white/50"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </Button>
                <div className="flex items-center gap-2">
                    <Baby className="text-blue-500 w-6 h-6" />
                    <h1 className="text-xl font-bold text-gray-800">Cry Awareness</h1>
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Main Content */}
            <main className="w-full max-w-2xl space-y-6">
                <Card className="border-none shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
                    <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500" />
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Activity className="text-blue-600 w-8 h-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Advanced Cry Analysis</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Understand your baby's needs through AI-powered sound recognition.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8 space-y-8">
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                How it works
                            </h3>
                            <p className="text-blue-800 text-sm leading-relaxed">
                                Our external Cry Analysis tool uses sophisticated machine learning models to analyze frequency patterns in baby cries, helping identify potential cues for hunger, sleep, or discomfort.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={handleLaunchExternal}
                                className="w-full h-16 text-lg font-bold rounded-2xl shadow-lg hover:shadow-blue-200 transition-all active:scale-95 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-3"
                            >
                                <ExternalLink className="w-6 h-6" />
                                Launch AI Analyzer
                            </Button>
                            <p className="text-center text-xs text-muted-foreground italic">
                                Note: This will open our dedicated analysis tool in a new window.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-gray-700">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                Important Disclaimer
                            </h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                This feature provides awareness-based suggestions only and is not a medical device. It does not replace parental judgment or medical consultation. If you are concerned about your baby's health, contact a doctor immediately.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <Button
                        variant="link"
                        onClick={() => navigate('/dashboard')}
                        className="text-muted-foreground hover:text-blue-600"
                    >
                        Nevermind, take me back to the dashboard
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default CryAnalysis;
