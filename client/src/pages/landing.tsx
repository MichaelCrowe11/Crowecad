/**
 * CroweCad Landing Page
 * Professional home page showcasing the revolutionary CAD platform
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CroweCadIDE } from '@/components/crowecad-ide';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Box,
  Cpu,
  Globe,
  Layers,
  MessageSquare,
  Rocket,
  Sparkles,
  Users,
  Zap,
  Star,
  Check,
  Github,
  Twitter,
  Linkedin,
  Play,
  Code2,
  Gauge,
  Shield,
  Cloud,
  Infinity,
  Brain,
  Palette,
  Target,
  TrendingUp,
  Award,
  Building,
  Car,
  Plane,
  Heart,
  Gem,
  Anchor,
  Factory,
  Smartphone,
  Package,
  Bot,
  Command,
  ChevronRight,
  ArrowUpRight,
  Terminal,
  FileCode2,
  GitBranch,
  Database,
  Lock,
  Workflow,
  BarChart3,
  Clock,
  Download
} from 'lucide-react';

const INDUSTRIES = [
  { icon: Factory, name: 'Mechanical', color: 'from-blue-500 to-blue-600' },
  { icon: Building, name: 'Architecture', color: 'from-purple-500 to-purple-600' },
  { icon: Cpu, name: 'Electronics', color: 'from-green-500 to-green-600' },
  { icon: Car, name: 'Automotive', color: 'from-red-500 to-red-600' },
  { icon: Plane, name: 'Aerospace', color: 'from-indigo-500 to-indigo-600' },
  { icon: Heart, name: 'Medical', color: 'from-pink-500 to-pink-600' },
  { icon: Package, name: 'Consumer', color: 'from-orange-500 to-orange-600' },
  { icon: Gem, name: 'Jewelry', color: 'from-yellow-500 to-yellow-600' },
  { icon: Anchor, name: 'Marine', color: 'from-cyan-500 to-cyan-600' },
  { icon: Zap, name: 'Energy', color: 'from-amber-500 to-amber-600' }
];

const FEATURES = [
  {
    icon: Brain,
    title: 'Natural Language CAD',
    description: 'Describe what you want in plain English - CroweCad creates it instantly',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'Work together with live cursors, chat, and instant synchronization',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Design',
    description: 'Intelligent suggestions, auto-optimization, and generative modeling',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Globe,
    title: 'Universal Platform',
    description: 'One platform for all industries - from aerospace to jewelry design',
    gradient: 'from-green-500 to-teal-500'
  },
  {
    icon: Rocket,
    title: 'IDE-Style Interface',
    description: 'Familiar coding environment meets professional CAD tools',
    gradient: 'from-red-500 to-pink-500'
  },
  {
    icon: Shield,
    title: 'Enterprise Ready',
    description: 'Secure, scalable, and compliant with industry standards',
    gradient: 'from-indigo-500 to-purple-500'
  }
];

const STATS = [
  { value: '10+', label: 'Industries Supported' },
  { value: '100ms', label: 'AI Response Time' },
  { value: '∞', label: 'Design Possibilities' },
  { value: '24/7', label: 'Collaboration' }
];

export function LandingPage() {
  const [showIDE, setShowIDE] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(0);

  if (showIDE) {
    return <CroweCadIDE projectId="demo" onClose={() => setShowIDE(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-40 bg-slate-950/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Box className="w-8 h-8 text-blue-500" />
                CroweCad
              </h1>
              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
                <a href="#industries" className="text-gray-300 hover:text-white transition">Industries</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
                <a href="https://github.com/MichaelCrowe11/Crowecad" className="text-gray-300 hover:text-white transition flex items-center gap-1">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/workspace">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Workspace
                </Button>
              </Link>
              <Button 
                onClick={() => setShowIDE(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Launch IDE
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 py-24 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered CAD Revolution
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Design Anything with
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Natural Language</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              The most advanced CAD platform ever created. Just describe what you want to build,
              and CroweCad brings it to life. From aerospace to jewelry, one platform rules them all.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg"
                onClick={() => setShowIDE(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                Try CroweCad IDE
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-lg px-8"
              >
                <Terminal className="w-5 h-5 mr-2" />
                Install CLI
              </Button>
            </div>

            {/* Live Demo Command */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-slate-900/50 backdrop-blur border border-white/10 rounded-lg p-6 max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-gray-500">CroweCad Terminal</span>
              </div>
              <div className="font-mono text-sm">
                <span className="text-green-400">$</span>
                <span className="text-blue-400"> crowecad</span>
                <span className="text-yellow-400"> design</span>
                <span className="text-white"> "Create a gear with 20 teeth, 50mm diameter"</span>
                <span className="animate-pulse">|</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/10 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">
              Revolutionary Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              CAD Reimagined for the AI Era
            </h2>
            <p className="text-xl text-gray-400">
              Every feature designed to amplify your creativity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-900/50 border-white/10 hover:border-white/20 transition-all hover:transform hover:scale-105">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-24 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">
              Universal Platform
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              One Platform, Every Industry
            </h2>
            <p className="text-xl text-gray-400">
              Purpose-built workbenches for your specific needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {INDUSTRIES.map((industry, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                onClick={() => setSelectedIndustry(i)}
                className={`group relative p-6 rounded-xl border transition-all ${
                  selectedIndustry === i 
                    ? 'border-white/30 bg-white/10' 
                    : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${industry.color} flex items-center justify-center mx-auto mb-3`}>
                  <industry.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-medium">{industry.name}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Revolutionize Your Design Workflow?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of engineers and designers already using CroweCad
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => setShowIDE(true)}
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8"
              >
                Start Designing Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Desktop App
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Box className="w-6 h-6 text-blue-500" />
              <span className="text-white font-semibold">CroweCad</span>
              <span className="text-gray-400">© 2025</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://github.com/MichaelCrowe11/Crowecad" className="text-gray-400 hover:text-white">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}