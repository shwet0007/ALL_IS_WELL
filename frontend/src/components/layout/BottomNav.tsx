import React from 'react';
import { Home, Calendar, BookOpen, MessageCircle, User, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems: NavItem[] = [
  { icon: <Home className="w-5 h-5" />, label: 'Home', path: 'home' },
  { icon: <Stethoscope className="w-5 h-5" />, label: 'Doctor', path: 'doctor' },
  { icon: <Calendar className="w-5 h-5" />, label: 'Schedule', path: 'schedule' },
  { icon: <BookOpen className="w-5 h-5" />, label: 'Resources', path: 'resources' },
  { icon: <MessageCircle className="w-5 h-5" />, label: 'Chat', path: 'chat' },
  { icon: <User className="w-5 h-5" />, label: 'Profile', path: 'profile' },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-elevated">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <div className="flex items-center gap-1 px-2 py-2 min-w-max">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => onTabChange(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-2xl transition-all duration-300 flex-shrink-0 min-w-[70px] sm:min-w-[80px]",
                activeTab === item.path
                  ? "bg-primary text-primary-foreground scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.icon}
              <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
