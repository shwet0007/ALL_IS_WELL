import React from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';

interface HeaderProps {
  userName: string;
  onEmergencyClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, onEmergencyClick }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 py-4 mx-auto w-full">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">{getGreeting()}</span>
          <h1 className="text-xl font-bold text-foreground">
            {userName} 🌸
          </h1>
        </div>

        <div className="flex items-center gap-2">

          <NotificationPanel />

          <Button
            variant="emergency"
            size="sm"
            onClick={onEmergencyClick}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">SOS</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
