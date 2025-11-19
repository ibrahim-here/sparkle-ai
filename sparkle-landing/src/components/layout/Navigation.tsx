import { useState } from 'react';
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

  const navLinks = [
    { label: 'Features', href: 'features' },
    { label: 'How It Works', href: 'how-it-works' },
    { label: 'Community', href: 'community' },
    { label: 'About', href: 'about' },
  ];

  const handleNavClick = (href: string) => {
    scrollToSection(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center space-x-2 font-bold text-2xl hover:opacity-80 transition-opacity"
          >
            <span style={{ color: '#B2FF00' }}>
              <SparkleIcon size={32} />
            </span>
            <span>Sparkle</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-gray-700 hover:text-black transition-colors font-medium"
              >
                {link.label}
              </button>
            ))}
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <User size={20} />
                  )}
                  <span className="font-medium">{user.name}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onSignInClick}
                  className="text-gray-700 hover:text-black transition-colors font-medium"
                >
                  Sign In
                </button>
                <Button onClick={onCTAClick} size="small">
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/70 backdrop-blur-md border-t border-gray-200/50"
          >
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left text-gray-700 hover:text-black transition-colors font-medium py-2"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  onSignInClick();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-700 hover:text-black transition-colors font-medium py-2"
              >
                Sign In
              </button>
              <Button onClick={onCTAClick} className="w-full">
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
