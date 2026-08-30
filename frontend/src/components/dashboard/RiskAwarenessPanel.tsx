import React from 'react';
import { ShieldCheck, MapPin, Phone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface RiskAwarenessPanelProps {
    contactsConfigured: boolean;
    locationEnabled: boolean;
    triggersDetected: boolean;
}

const RiskAwarenessPanel: React.FC<RiskAwarenessPanelProps> = ({
    contactsConfigured,
    locationEnabled,
    triggersDetected
}) => {
    return (
        <Card className="border-none shadow-soft overflow-hidden">
            <CardHeader className="bg-destructive/10 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
                    <ShieldCheck className="w-4 h-4" />
                    Safety & Readiness
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" /> Emergency Contacts
                    </span>
                    <span className={contactsConfigured ? "text-green-600 font-bold" : "text-orange-600 font-bold"}>
                        {contactsConfigured ? "Safe & Ready ✨" : "Awaiting your loved ones' details 🌸"}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" /> Location Services
                    </span>
                    <span className={locationEnabled ? "text-green-600 font-bold" : "text-blue-600 font-bold"}>
                        {locationEnabled ? "Sharing with Care ✅" : "Keeping you safe locally 🏠"}
                    </span>
                </div>
                <div className="pt-2 border-t mt-2">
                    <p className={`text-xs font-bold text-center py-1 rounded-full ${triggersDetected ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {triggersDetected ? "Gentle note: You've been doing a lot. Maybe take a little breather? 🌿" : "All is calm and safe right now 🕊️"}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default RiskAwarenessPanel;
