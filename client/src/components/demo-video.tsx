/**
 * Auto-Generated Demo Video for CroweCad
 * Animated demonstration of natural language CAD generation
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCw, Sparkles, Terminal, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DEMO_SEQUENCE = [
  {
    prompt: "Create a titanium gear with 20 teeth, 50mm diameter",
    duration: 3000,
    result: "⚙️",
    description: "Mechanical Part"
  },
  {
    prompt: "Design a modern office building, 10 floors, glass facade",
    duration: 3500,
    result: "🏢",
    description: "Architecture"
  },
  {
    prompt: "Generate a PCB layout for Arduino shield with 16 GPIO pins",
    duration: 3000,
    result: "🔌",
    description: "Electronics"
  },
  {
    prompt: "Model a diamond ring, 2 carat center stone, platinum band",
    duration: 3500,
    result: "💍",
    description: "Jewelry Design"
  },
  {
    prompt: "Create aerodynamic car body, drag coefficient 0.25",
    duration: 3000,
    result: "🚗",
    description: "Automotive"
  }
];

export function DemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [processing, setProcessing] = useState(false);

  const currentDemo = DEMO_SEQUENCE[currentStep];

  // Typing animation
  useEffect(() => {
    if (!isPlaying) return;
    
    setTypedText('');
    setShowResult(false);
    setProcessing(false);
    
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < currentDemo.prompt.length) {
        setTypedText(currentDemo.prompt.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setProcessing(true);
        
        // Show processing for 1.5 seconds
        setTimeout(() => {
          setProcessing(false);
          setShowResult(true);
          
          // Move to next step after showing result
          setTimeout(() => {
            if (currentStep < DEMO_SEQUENCE.length - 1) {
              setCurrentStep(currentStep + 1);
            } else {
              setCurrentStep(0); // Loop back
            }
          }, 2000);
        }, 1500);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [isPlaying, currentStep, currentDemo]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && currentStep === DEMO_SEQUENCE.length - 1 && showResult) {
      // Reset if starting from the end
      setCurrentStep(0);
      setTypedText('');
      setShowResult(false);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setTypedText('');
    setShowResult(false);
    setProcessing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Video Container */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden border border-white/10">
        {/* Terminal Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-sm text-gray-400">CroweCad Terminal</span>
          </div>
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </div>

        {/* Main Content Area */}
        <div className="p-8 min-h-[400px] flex flex-col justify-center">
          {/* Command Line */}
          <div className="mb-8">
            <div className="flex items-start gap-3 font-mono text-sm">
              <span className="text-green-400">$</span>
              <span className="text-blue-400">crowecad</span>
              <span className="text-yellow-400">design</span>
              <div className="flex-1">
                <span className="text-white">"{typedText}"</span>
                {isPlaying && !showResult && <span className="animate-pulse">|</span>}
              </div>
            </div>
          </div>

          {/* Processing Animation */}
          <AnimatePresence>
            {processing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center py-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-3 text-gray-400">Generating CAD model...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Display */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <motion.div
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-8xl mb-4"
                >
                  {currentDemo.result}
                </motion.div>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  ✓ Model Generated: {currentDemo.description}
                </Badge>
                <p className="text-sm text-gray-400 mt-2">Ready for export to DXF, STL, STEP</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 p-4 border-t border-white/10">
          {DEMO_SEQUENCE.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep 
                  ? 'bg-blue-500 w-8' 
                  : index < currentStep 
                    ? 'bg-blue-500/50' 
                    : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          onClick={handlePlayPause}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pause Demo
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              {currentStep === 0 && typedText === '' ? 'Start Demo' : 'Resume Demo'}
            </>
          )}
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          size="lg"
        >
          <RotateCw className="w-5 h-5 mr-2" />
          Reset
        </Button>
      </div>

      {/* Info Text */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-400">
          This demo shows real CroweCad capabilities across multiple industries
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Actual generation time: 2-5 seconds per model
        </p>
      </div>
    </div>
  );
}