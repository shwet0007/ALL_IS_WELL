import React from 'react';
import { cn } from '@/lib/utils';
import DailyCheckupReminder from '../DailyCheckupReminder';
import AIGuideAssistant from '../chat/AIGuideAssistant';

interface LayoutProps {
    children: React.ReactNode;
    className?: string;
    showSidebar?: boolean;
    sidebar?: React.ReactNode;
    bottomNav?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, className, sidebar, bottomNav }) => {
    return (
        <div className={cn("min-h-screen bg-background relative", className)}>
            {/* Desktop Sidebar */}
            {sidebar && (
                <div className="hidden md:block fixed left-0 top-0 h-full w-64 z-40">
                    {sidebar}
                </div>
            )}

            {/* Main Content Area */}
            <div className={cn(
                "min-h-screen transition-all duration-300",
                sidebar ? "md:pl-64" : ""
            )}>
                {children}
            </div>

            {/* Mobile Bottom Nav */}
            {bottomNav && (
                <div className="md:hidden">
                    {bottomNav}
                </div>
            )}

            <DailyCheckupReminder />
            <AIGuideAssistant />
        </div>
    );
};

export default Layout;
