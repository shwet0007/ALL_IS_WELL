import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/Logo';
import { Heart, Baby, Stethoscope, Settings, ChevronRight, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingProps {
  onComplete: (role: string) => void;
}

type Role = 'pregnant' | 'mother' | 'doctor' | 'admin';

interface RoleOption {
  id: Role;
  icon: React.ReactNode;
  title: string;
  description: string;
  emoji: string;
}

const roles: RoleOption[] = [
  {
    id: 'pregnant',
    icon: <Heart className="w-6 h-6" />,
    title: 'Expecting Mother',
    description: 'Track your pregnancy journey',
    emoji: '🤰',
  },
  {
    id: 'mother',
    icon: <Baby className="w-6 h-6" />,
    title: 'New Mother',
    description: "Care for your baby's growth",
    emoji: '👩‍👧',
  },
  {
    id: 'doctor',
    icon: <Stethoscope className="w-6 h-6" />,
    title: 'Healthcare Provider',
    description: 'Manage patient care',
    emoji: '👨‍⚕️',
  },
  {
    id: 'admin',
    icon: <Settings className="w-6 h-6" />,
    title: 'Administrator',
    description: 'Manage the platform',
    emoji: '⚙️',
  },
];

const features = [
  { icon: "📊", title: "Track Progress", desc: "Monitor pregnancy & baby growth", delay: "100ms" },
  { icon: "💬", title: "AI Assistant", desc: "Get instant answers to your questions", delay: "200ms" },
  { icon: "👨‍⚕️", title: "Connect with Doctors", desc: "Stay in touch with healthcare providers", delay: "300ms" },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'role'>('welcome');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleContinue = () => {
    if (step === 'welcome') {
      setStep('role');
    } else if (selectedRole) {
      onComplete(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Left Split - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/30 via-background to-accent/20 relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-gentle" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse-gentle" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-lg text-center">
          <Logo size="xl" className="mx-auto mb-8 animate-float" />
          <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight">
            Aal is Well
          </h1>
          <p className="text-2xl text-muted-foreground mb-12 font-light">
            Because your baby's health matters 💕
          </p>

          <div className="grid gap-4 w-full max-w-md mx-auto">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 animate-slide-up" style={{ animationDelay: feature.delay }}>
                <span className="text-3xl">{feature.icon}</span>
                <div className="text-left">
                  <p className="font-bold text-foreground">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side / Mobile View - Interaction */}
      <div className="flex-1 flex flex-col relative bg-background/50 md:bg-card">
        <div className="absolute top-4 right-4 z-20">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:bg-muted/50">
            <Globe className="w-4 h-4" />
            English
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 pb-8 overflow-y-auto">

          {step === 'welcome' ? (
            <div className="text-center animate-fade-in max-w-sm w-full">
              {/* Mobile Branding */}
              <div className="md:hidden">
                <Logo size="xl" className="mx-auto mb-6 animate-float" />
                <h1 className="text-3xl font-bold text-foreground mb-2">Aal is Well</h1>
                <p className="text-muted-foreground text-lg mb-8">Because your baby's health matters 💕</p>

                <div className="space-y-4 mb-8">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-soft animate-slide-up" style={{ animationDelay: feature.delay }}>
                      <span className="text-2xl">{feature.icon}</span>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Get Started Button Area */}
              <div className="mt-4 md:mt-0 space-y-6">
                <div className="hidden md:block mb-8">
                  <h2 className="text-3xl font-bold text-foreground">Welcome Back! 👋</h2>
                  <p className="text-muted-foreground mt-2">Start your journey with us today.</p>
                </div>

                <Button
                  size="xl"
                  onClick={handleContinue}
                  className="w-full gap-2 text-lg h-14 md:max-w-xs mx-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                  Get Started
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md animate-fade-in px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  Who are you?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Tell us about yourself to personalize your experience
                </p>
              </div>

              <div className="grid gap-4 mb-8 md:grid-cols-1">
                {roles.map((role, index) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 animate-slide-up group border-2 border-transparent",
                      selectedRole === role.id
                        ? "bg-primary/5 border-primary shadow-soft"
                        : "bg-card hover:bg-muted/50 border-transparent shadow-sm hover:shadow-md"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-colors",
                      selectedRole === role.id ? "bg-primary text-primary-foreground shadow-inner" : "bg-muted text-muted-foreground group-hover:bg-white"
                    )}>
                      {role.emoji}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={cn(
                        "font-bold text-lg",
                        selectedRole === role.id ? "text-primary-dark" : "text-foreground"
                      )}>
                        {role.title}
                      </p>
                      <p className={cn(
                        "text-sm",
                        selectedRole === role.id ? "text-primary-dark/70" : "text-muted-foreground"
                      )}>
                        {role.description}
                      </p>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      selectedRole === role.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    )}>
                      {selectedRole === role.id && <div className="w-2.5 h-2.5 bg-current rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>

              <Button
                size="xl"
                onClick={handleContinue}
                disabled={!selectedRole}
                className="w-full gap-2 text-lg h-14 shadow-lg"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
