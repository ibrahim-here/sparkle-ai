import { Github, Twitter, Mail } from 'lucide-react';
import { SparkleIcon } from '../icons/SparkleIcon';
import { GridBackground } from '../ui/GridBackground';

export const Footer = () => {
  const links = [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms', href: '#' },
  ];

  const socialLinks = [
    { icon: <Github size={24} />, href: '#', label: 'GitHub' },
    { icon: <Twitter size={24} />, href: '#', label: 'Twitter' },
    { icon: <Mail size={24} />, href: '#', label: 'Email' },
  ];

  return (
    <footer className="bg-secondary text-white relative">
      <GridBackground opacity={0.05} className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Logo and Tagline */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span style={{ color: '#B2FF00' }}>
                  <SparkleIcon size={32} />
                </span>
                <span className="font-bold text-2xl">Sparkle</span>
              </div>
              <p className="text-gray-400">AI that learns how you learn</p>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 transition-colors inline-block hover:glow-effect-hover"
                    style={{ '--hover-color': '#B2FF00' } as React.CSSProperties}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#B2FF00'}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Icons */}
            <div>
              <h3 className="font-semibold mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="text-gray-400 transition-all hover:scale-110 hover:glow-effect-hover"
                    onMouseEnter={(e) => e.currentTarget.style.color = '#B2FF00'}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Sparkle AI. All rights reserved.</p>
          </div>
        </div>
      </GridBackground>
    </footer>
  );
};
