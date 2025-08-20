/**
 * Global Navigation Header for CroweCad Platform
 * Provides consistent navigation across all pages
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import {
  Box,
  Menu,
  X,
  Home,
  Cpu,
  Users,
  Brain,
  Building,
  Github,
  ArrowRight,
  Sparkles,
  Database,
  Code,
  Globe
} from 'lucide-react';

export function NavigationHeader() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/code-studio', label: 'Code Studio', icon: Code },
    { href: '/ai-studio', label: 'AI Studio', icon: Brain },
    { href: '/facility-designer', label: 'Facility Designer', icon: Cpu },
    { href: '/datasets', label: 'CAD Models', icon: Database },
    { href: '/dev-resources', label: 'Dev Resources', icon: Sparkles },
    { href: '/api-hub', label: 'API Hub', icon: Globe },
    { href: '/collaborative', label: 'Collaborate', icon: Users },
    { href: '/hub', label: 'Crowe Hub', icon: Building }
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-slate-950/75">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="flex items-center gap-2 text-white hover:text-blue-400 transition cursor-pointer">
                <Box className="w-8 h-8 text-blue-500" />
                <span className="text-xl font-bold">CroweCad</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? "secondary" : "ghost"}
                    size="sm"
                    className="text-gray-300 hover:text-white"
                  >
                    <link.icon className="w-4 h-4 mr-2" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/MichaelCrowe11/Crowecad"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex text-gray-400 hover:text-white transition"
            >
              <Github className="w-5 h-5" />
            </a>
            
            {location !== '/ai-studio' && (
              <Link href="/ai-studio">
                <Button 
                  size="sm"
                  className="hidden md:flex bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  GPT-5 Studio
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition cursor-pointer ${
                    location === link.href
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </div>
              </Link>
            ))}
            <div className="mt-4 px-4">
              <Link href="/ai-studio">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  GPT-5 Studio
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}