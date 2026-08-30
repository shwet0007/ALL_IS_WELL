import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";
import DietPlan from "./pages/DietPlan";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProfileSetup from "./pages/auth/ProfileSetup";
import ParentDashboard from "@/pages/ParentDashboard";
import DoctorDashboard from "@/pages/DoctorDashboard";
import CryAnalysis from "@/pages/CryAnalysis";
import DailyCheckup from "@/pages/DailyCheckup";
import DetailedReport from "@/pages/DetailedReport";
import Marketplace from "@/pages/Marketplace";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Helper component to handle root redirection based on role
export const RootRedirect = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) return <Navigate to="/profile-setup" replace />;

  if (userProfile.role === 'pregnant') return <Navigate to="/dashboard/pregnant" replace />;
  if (userProfile.role === 'mother') return <Navigate to="/dashboard/mother" replace />;
  if (userProfile.role === 'doctor') return <Navigate to="/dashboard/doctor" replace />;

  return <Navigate to="/login" replace />;
};

import LandingPage from "./pages/LandingPage";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />

            {/* Role Based Dashboards */}
            <Route
              path="/dashboard/pregnant"
              element={
                <ProtectedRoute allowedRoles={['pregnant']}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/mother"
              element={
                <ProtectedRoute allowedRoles={['mother']}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Diet Plan - Accessible by parents */}
            <Route
              path="/diet-plan"
              element={
                <ProtectedRoute allowedRoles={['pregnant', 'mother']}>
                  <DietPlan />
                </ProtectedRoute>
              }
            />

            {/* Cry Analysis - Accessible by parents */}
            <Route
              path="/cry-analysis"
              element={
                <ProtectedRoute allowedRoles={['mother', 'pregnant']}>
                  <CryAnalysis />
                </ProtectedRoute>
              }
            />

            {/* Daily Checkup - Accessible by parents */}
            <Route
              path="/daily-checkup"
              element={
                <ProtectedRoute allowedRoles={['mother', 'pregnant']}>
                  <DailyCheckup />
                </ProtectedRoute>
              }
            />

            {/* Detailed Report - Accessible by parents */}
            <Route
              path="/detailed-report"
              element={
                <ProtectedRoute allowedRoles={['mother', 'pregnant']}>
                  <DetailedReport />
                </ProtectedRoute>
              }
            />

            {/* Marketplace - Accessible by parents */}
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute allowedRoles={['mother', 'pregnant']}>
                  <Marketplace />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Redirect Logic */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RootRedirect />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
