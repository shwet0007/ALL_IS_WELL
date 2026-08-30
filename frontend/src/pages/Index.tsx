import React, { useState, useEffect } from 'react';
import Onboarding from './Onboarding';
import ParentDashboard from './ParentDashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';

const Index = () => {
  // Load user role from localStorage on mount
  const [userRole, setUserRole] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userRole');
      return saved || null;
    }
    return null;
  });

  const handleOnboardingComplete = (role: string) => {
    setUserRole(role);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', role);
    }
  };

  // Update localStorage when userRole changes
  useEffect(() => {
    if (userRole && typeof window !== 'undefined') {
      localStorage.setItem('userRole', userRole);
    }
  }, [userRole]);

  if (!userRole) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  switch (userRole) {
    case 'pregnant':
      return <ParentDashboard userType="pregnant" />;
    case 'mother':
      return <ParentDashboard userType="mother" />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }
};

export default Index;
