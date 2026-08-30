import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('pregnant' | 'mother' | 'doctor')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { currentUser, userProfile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // 1. Auth Guard
    if (!currentUser) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // 2. Profile Guard
    // If user is logged in but has no profile data or profile is not completed
    // And they are NOT already on the profile-setup page
    if ((!userProfile || !userProfile.profileCompleted) && location.pathname !== '/profile-setup') {
        console.log("Redirecting to setup because:", { userProfile, pathname: location.pathname });
        return <Navigate to="/profile-setup" replace />;
    }

    // 3. Role Guard
    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
        // Redirect to their appropriate dashboard if they try to access a route not for them
        // For now, just redirect home which will handle the role redirection
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
