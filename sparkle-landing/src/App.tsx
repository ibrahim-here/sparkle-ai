import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/sections/HeroSection';
import { MarqueeSection } from './components/sections/MarqueeSection';
import { HowItWorksSection } from './components/sections/HowItWorksSection';
import { FeaturesSection } from './components/sections/FeaturesSection';
import { DemoSection } from './components/sections/DemoSection';
import { CommunitySection } from './components/sections/CommunitySection';
import { TestimonialsSection } from './components/sections/TestimonialsSection';
import { RoadmapSection } from './components/sections/RoadmapSection';
import { FinalCTASection } from './components/sections/FinalCTASection';
import { AuthModal } from './components/auth/AuthModal';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import { onboardingAPI } from './api/onboarding.api';

function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  const handleGetStarted = () => {
    setAuthModalTab('signup');
    setAuthModalOpen(true);
  };

  const handleSignIn = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Navigation onCTAClick={handleGetStarted} onSignInClick={handleSignIn} />
    
    <main>
      <HeroSection onGetStarted={handleGetStarted} onSignIn={handleSignIn} />
      <MarqueeSection />
      <HowItWorksSection onCTAClick={handleGetStarted} />
      <FeaturesSection />
      <DemoSection />
      <CommunitySection onCTAClick={handleGetStarted} />
      <TestimonialsSection />
      <RoadmapSection />
      <FinalCTASection onGetStarted={handleGetStarted} />
    </main>
    
    <Footer />
    
    <AuthModal 
      isOpen={authModalOpen} 
      onClose={() => setAuthModalOpen(false)}
      initialTab={authModalTab}
    />
  </div>
  );
}

// Onboarding route component
function OnboardingRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [onboardingStatus, setOnboardingStatus] = useState<{ completed: boolean } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        const status = await onboardingAPI.getStatus();
        setOnboardingStatus(status);
        
        if (status.completed) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      } finally {
        setChecking(false);
      }
    };

    if (!loading) {
      checkOnboarding();
    }
  }, [user, loading, navigate]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (onboardingStatus?.completed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <OnboardingPage />;
}

// Dashboard route component
function DashboardRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [onboardingStatus, setOnboardingStatus] = useState<{ completed: boolean } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        const status = await onboardingAPI.getStatus();
        setOnboardingStatus(status);
        
        if (!status.completed) {
          navigate('/onboarding');
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      } finally {
        setChecking(false);
      }
    };

    if (!loading) {
      checkOnboarding();
    }
  }, [user, loading, navigate]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!onboardingStatus?.completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <DashboardPage />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingRoute />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
