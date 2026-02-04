import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { SparkleIcon } from '../icons/SparkleIcon';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import { useAuth } from '../../context/AuthContext';

interface NavigationProps {
  onCTAClick: () => void;
  onSignInClick: () => void;
}

export const Navigation = ({ onCTAClick, onSignInClick }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { scrollToSection } = useSmoothScroll();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isLandingPage = location.pathname === '/';

  const navLinks = isLandingPage ? [
    { label: 'Features', href: 'features' },
  ] : [];

  const handleNavClick = (href: string) => {
    scrollToSection(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => isLandingPage ? scrollToSection('hero') : navigate('/')}
            className="flex items-center space-x-3 group"
          >
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 text-primary">
              <SparkleIcon size={28} />
            </div>
            <span className="font-bold text-2xl tracking-tighter text-white">Sparkle<span className="text-primary">.ai</span></span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-white/60 hover:text-primary transition-all duration-300 font-medium text-sm tracking-wide uppercase"
              >
                {link.label}
              </button>
            ))}

            {!isLandingPage && (
              <Link
                to="/dashboard"
                className="text-white/60 hover:text-primary transition-all duration-300 font-medium text-sm tracking-wide uppercase"
              >
                Chat Terminal
              </Link>
            )}

            <div className="h-4 w-[1px] bg-white/10" />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-4 py-2 rounded-full glass border border-white/10 hover:border-primary/30 transition-all duration-300"
                >
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <User size={18} className="text-primary" />
                  )}
                  <span className="font-medium text-sm text-white/90">{user.name}</span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-56 glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-1.5"
                    >
                      <button
                        onClick={() => {
                          navigate('/dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 rounded-xl flex items-center gap-3 text-white/70 transition-colors"
                      >
                        <SparkleIcon size={16} />
                        Launch Terminal
                      </button>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 rounded-xl flex items-center gap-3 text-white/70 transition-colors"
                      >
                        <User size={16} />
                        Neural Profile
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-red-500/10 rounded-xl flex items-center gap-3 text-red-400 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                
                <Button
                  onClick={onCTAClick}
                  size="small"
                  className="bg-primary text-secondary hover:shadow-glow-primary transition-all duration-300 px-6 py-2.5 rounded-full font-bold"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glass border-t border-white/5 shadow-2xl"
          >
            <div className="px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left text-white/60 hover:text-primary transition-colors font-medium text-lg py-2 uppercase tracking-widest"
                >
                  {link.label}
                </button>
              ))}
              <div className="h-[1px] w-full bg-white/5" />
              <button
                onClick={() => {
                  onSignInClick();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-white/60 hover:text-white transition-colors font-medium text-lg py-2"
              >
                Sign In
              </button>
              <Button onClick={onCTAClick} className="w-full bg-primary text-secondary font-bold py-4 rounded-xl shadow-glow-primary">
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
