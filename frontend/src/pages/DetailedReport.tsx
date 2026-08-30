import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DetailedReport: React.FC = () => {
    const navigate = useNavigate();

    const mockReport = {
        month: "January 2026",
        consistencyScore: 82,
        metrics: {
            checkupCompletion: 90,
            routineAdherence: 78,
            vaccinationTimeliness: 100,
            sleepRegularity: 72
        },
        highlights: [
            "Maintained 100% vaccination timeliness",
            "Morning routine adherence improved by 12%",
            "Stable mood patterns recorded over last 14 days"
        ],
        attentionAreas: [
            "Sleep patterns slightly inconsistent on weekends",
            "Physical energy levels dipped during Week 2"
        ],
        doctorNotes: "Observation: Patient shows great consistency. Recommended to maintain the current hydration levels."
    };

    return (
        <div className="p-6 space-y-8 max-w-4xl mx-auto pb-24">
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4" /> Back to Analytics
                </Button>
                <Button className="gap-2 bg-primary" onClick={() => window.print()}>
                    <Download className="w-4 h-4" /> Download PDF
                </Button>
            </div>

            <div className="text-center space-y-2">
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">Official Medical Summary</div>
                <h1 className="text-4xl font-black text-foreground">Monthly Care Report</h1>
                <p className="text-muted-foreground font-medium">{mockReport.month}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 border-2 border-primary/10 shadow-soft">
                    <CardHeader className="text-center">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Care Consistency</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-8">
                        <div className="text-6xl font-black text-primary mb-2">{mockReport.consistencyScore}%</div>
                        <p className="text-sm font-bold text-green-600 bg-green-50 py-1 rounded-full">STATUS: GOOD</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-none shadow-soft">
                    <CardHeader>
                        <CardTitle className="text-lg">Key Health Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(mockReport.metrics).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                    <span>{value}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className="bg-primary h-2 rounded-full" style={{ width: `${value}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-soft bg-mint-50/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-mint-700">
                            <CheckCircle2 className="w-5 h-5" /> Care Highlights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {mockReport.highlights.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl text-sm font-medium text-mint-900 border border-mint-100">
                                <span>•</span> {item}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-soft bg-orange-50/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                            <AlertCircle className="w-5 h-5" /> Attention Areas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {mockReport.attentionAreas.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl text-sm font-medium text-orange-900 border border-orange-100">
                                <span>•</span> {item}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-2 border-dashed border-primary/20 bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" /> Doctor's Observation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm italic font-medium text-muted-foreground bg-white p-4 rounded-xl border">
                        "{mockReport.doctorNotes}"
                    </p>
                    <div className="mt-6 flex justify-between items-end border-t pt-6 opacity-50">
                        <div className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Generated by Aal Is Well AI Platform</div>
                        <div className="text-xs font-mono">{new Date().toLocaleDateString()}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DetailedReport;
