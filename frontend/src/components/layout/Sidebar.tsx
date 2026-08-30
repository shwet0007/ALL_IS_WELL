import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Calendar, BookOpen, MessageCircle, User, Stethoscope, BarChart3, ShoppingBag } from 'lucide-react';
import Logo from '@/components/icons/Logo';
import { useAuth } from '@/contexts/AuthContext';

export interface NavItem {
    icon: React.ReactNode;
    label: string;
    path: string;
}

const defaultNavItems: NavItem[] = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', path: 'home' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', path: 'analytics' },
    { icon: <Stethoscope className="w-5 h-5" />, label: 'Doctor', path: 'doctor' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Schedule', path: 'schedule' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Resources', path: 'resources' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Marketplace', path: 'marketplace' },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'Chat', path: 'chat' },
    { icon: <User className="w-5 h-5" />, label: 'Profile', path: 'profile' },
];

interface SidebarProps {
    className?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    items?: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ className, activeTab, onTabChange, items = defaultNavItems }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <aside className={cn("flex flex-col h-screen w-64 bg-card border-r border-border fixed left-0 top-0 z-30 bg-gradient-to-b from-card to-background", className)}>
            <div className="p-6 flex items-center gap-3">
                <Logo size="md" />
                <span className="font-bold text-xl tracking-tight text-foreground">Aal is Well</span>
            </div>

            <div className="flex-1 px-4 py-4 space-y-2">
                {items.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => onTabChange(item.path)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                            activeTab === item.path
                                ? "bg-primary/10 text-primary-foreground font-semibold shadow-sm"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {activeTab === item.path && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                        )}
                        <span className={cn(activeTab === item.path ? "text-primary" : "")}>{item.icon}</span>
                        <span className={cn(activeTab === item.path ? "text-primary" : "")}>{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </Button>
            </div>
        </aside>
    );
};

export default Sidebar;
