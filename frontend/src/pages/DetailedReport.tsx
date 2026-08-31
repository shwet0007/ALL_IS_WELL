import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMonthlyReport } from '@/lib/db';

interface MonthlyReport {
    month: string;
    consistencyScore: number;
    metrics: Record<string, number>;
    highlights: string[];
    attentionAreas: string[];
}

const DetailedReport: React.FC = () => {
    const navigate = useNavigate();
    const [report, setReport] = useState<MonthlyReport | null>(null);
    const [loading, setLoading] = useState(true);
    const currentMonth = new Date().toISOString().slice(0, 7);

    useEffect(() => {
        const loadReport = async () => {
            try {
                setReport(await getMonthlyReport(currentMonth));
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, [currentMonth]);

    const displayMonth = report?.month
        ? new Date(`${report.month}-01T00:00:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
        : currentMonth;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="p-6 space-y-6 max-w-4xl mx-auto pb-24">
                <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4" /> Back to Analytics
                </Button>
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        Monthly report is not available yet.
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                <p className="text-muted-foreground font-medium">{displayMonth}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 border-2 border-primary/10 shadow-soft">
                    <CardHeader className="text-center">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Care Consistency</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-8">
                        <div className="text-6xl font-black text-primary mb-2">{report.consistencyScore}%</div>
                        <p className="text-sm font-bold text-green-600 bg-green-50 py-1 rounded-full">STATUS: GOOD</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-none shadow-soft">
                    <CardHeader>
                        <CardTitle className="text-lg">Key Health Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(report.metrics).map(([key, value]) => (
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
                        {report.highlights.map((item, idx) => (
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
                        {report.attentionAreas.map((item, idx) => (
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
                        <FileText className="w-5 h-5 text-primary" /> Report Metadata
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm italic font-medium text-muted-foreground bg-white p-4 rounded-xl border">
                        Generated from your current Aal Is Well care activity.
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
