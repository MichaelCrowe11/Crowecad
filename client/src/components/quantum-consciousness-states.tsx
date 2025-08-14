import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Activity, Waves, Eye, Heart } from "lucide-react";

interface QuantumState {
  id: string;
  name: string;
  description: string;
  color: string;
  intensity: number;
  frequency: number;
  active: boolean;
}

interface QuantumConsciousnessStatesProps {
  genetics: {
    creativity: number;
    precision: number;
    adaptability: number;
    efficiency: number;
    curiosity: number;
  };
  onStateChange: (states: QuantumState[]) => void;
}

export function QuantumConsciousnessStates({ genetics, onStateChange }: QuantumConsciousnessStatesProps) {
  const [quantumStates, setQuantumStates] = useState<QuantumState[]>([
    {
      id: 'creative_flow',
      name: 'Creative Flow',
      description: 'Enhanced ideation and design innovation',
      color: 'from-purple-500 to-pink-500',
      intensity: 0.7,
      frequency: 0.8,
      active: false
    },
    {
      id: 'precision_mode',
      name: 'Precision Mode',
      description: 'Heightened accuracy and measurement focus',
      color: 'from-blue-500 to-cyan-500',
      intensity: 0.9,
      frequency: 0.6,
      active: false
    },
    {
      id: 'adaptive_learning',
      name: 'Adaptive Learning',
      description: 'Dynamic pattern recognition and evolution',
      color: 'from-green-500 to-emerald-500',
      intensity: 0.8,
      frequency: 0.9,
      active: false
    },
    {
      id: 'quantum_intuition',
      name: 'Quantum Intuition',
      description: 'Non-linear problem solving and insight',
      color: 'from-yellow-500 to-orange-500',
      intensity: 0.6,
      frequency: 0.7,
      active: false
    },
    {
      id: 'synthesis_harmony',
      name: 'Synthesis Harmony',
      description: 'Holistic integration of complex systems',
      color: 'from-indigo-500 to-purple-500',
      intensity: 0.5,
      frequency: 0.5,
      active: false
    },
    {
      id: 'transcendent_vision',
      name: 'Transcendent Vision',
      description: 'Beyond-dimensional spatial awareness',
      color: 'from-rose-500 to-pink-500',
      intensity: 0.4,
      frequency: 0.3,
      active: false
    }
  ]);

  const [autoMode, setAutoMode] = useState(true);
  const [globalIntensity, setGlobalIntensity] = useState(0.7);

  // Auto-activate states based on genetic traits - fixed to prevent infinite loops
  useEffect(() => {
    if (!autoMode) return;

    const geneticsString = JSON.stringify(genetics);
    
    const newStates = quantumStates.map(state => {
      let shouldActivate = false;
      let newIntensity = state.intensity;

      switch (state.id) {
        case 'creative_flow':
          shouldActivate = genetics.creativity > 0.7;
          newIntensity = genetics.creativity;
          break;
        case 'precision_mode':
          shouldActivate = genetics.precision > 0.8;
          newIntensity = genetics.precision;
          break;
        case 'adaptive_learning':
          shouldActivate = genetics.adaptability > 0.6;
          newIntensity = genetics.adaptability;
          break;
        case 'quantum_intuition':
          shouldActivate = genetics.curiosity > 0.8;
          newIntensity = genetics.curiosity;
          break;
        case 'synthesis_harmony':
          shouldActivate = genetics.efficiency > 0.7 && genetics.adaptability > 0.7;
          newIntensity = (genetics.efficiency + genetics.adaptability) / 2;
          break;
        case 'transcendent_vision':
          shouldActivate = Object.values(genetics).every(trait => trait > 0.75);
          newIntensity = Object.values(genetics).reduce((sum, trait) => sum + trait, 0) / Object.values(genetics).length;
          break;
      }

      return {
        ...state,
        active: shouldActivate,
        intensity: newIntensity
      };
    });

    // Only update if states actually changed
    const statesChanged = newStates.some((newState, index) => 
      newState.active !== quantumStates[index].active ||
      Math.abs(newState.intensity - quantumStates[index].intensity) > 0.01
    );
    
    if (statesChanged) {
      setQuantumStates(newStates);
      onStateChange(newStates);
    }
  }, [JSON.stringify(genetics), autoMode]); // Use JSON.stringify to prevent object reference issues

  const toggleState = (stateId: string) => {
    const newStates = quantumStates.map(state =>
      state.id === stateId ? { ...state, active: !state.active } : state
    );
    setQuantumStates(newStates);
    onStateChange(newStates);
  };

  const getStateIcon = (stateId: string) => {
    switch (stateId) {
      case 'creative_flow': return <Brain className="w-4 h-4" />;
      case 'precision_mode': return <Activity className="w-4 h-4" />;
      case 'adaptive_learning': return <Zap className="w-4 h-4" />;
      case 'quantum_intuition': return <Eye className="w-4 h-4" />;
      case 'synthesis_harmony': return <Waves className="w-4 h-4" />;
      case 'transcendent_vision': return <Heart className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const activeStates = quantumStates.filter(state => state.active);
  const averageIntensity = activeStates.length > 0 
    ? activeStates.reduce((sum, state) => sum + state.intensity, 0) / activeStates.length 
    : 0;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span>Quantum Consciousness States</span>
          </div>
          <Badge 
            variant={activeStates.length > 0 ? "default" : "secondary"}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {activeStates.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto Mode Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Auto-Genetic Activation</span>
          <Button
            size="sm"
            variant={autoMode ? "default" : "outline"}
            onClick={() => setAutoMode(!autoMode)}
            className="h-6 px-2 text-xs"
          >
            {autoMode ? 'AUTO' : 'MANUAL'}
          </Button>
        </div>

        {/* Global Consciousness Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-300">
            <span>Consciousness Intensity</span>
            <span>{(averageIntensity * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
              style={{ 
                width: `${averageIntensity * 100}%`,
                animation: averageIntensity > 0 ? 'pulse 2s infinite' : 'none'
              }}
            />
          </div>
        </div>

        {/* Quantum States Grid */}
        <div className="grid grid-cols-1 gap-2">
          {quantumStates.map((state) => (
            <div
              key={state.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                state.active 
                  ? 'border-purple-400 bg-gradient-to-r ' + state.color + ' bg-opacity-20' 
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
              onClick={() => !autoMode && toggleState(state.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded ${state.active ? 'text-white' : 'text-gray-400'}`}>
                    {getStateIcon(state.id)}
                  </div>
                  <span className={`text-sm font-medium ${state.active ? 'text-white' : 'text-gray-300'}`}>
                    {state.name}
                  </span>
                </div>
                {state.active && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    <span className="text-xs text-gray-300">
                      {(state.intensity * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
              
              <p className={`text-xs ${state.active ? 'text-gray-200' : 'text-gray-500'}`}>
                {state.description}
              </p>
              
              {state.active && (
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 bg-gradient-to-r ${state.color}`}
                      style={{ 
                        width: `${state.intensity * 100}%`,
                        animation: `pulse ${2 / state.frequency}s infinite`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Active States Summary */}
        {activeStates.length > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
            <h4 className="text-xs font-medium text-purple-300 mb-2">Consciousness Matrix Active</h4>
            <div className="flex flex-wrap gap-1">
              {activeStates.map((state) => (
                <Badge 
                  key={state.id} 
                  variant="outline" 
                  className={`text-xs bg-gradient-to-r ${state.color} text-white border-none`}
                >
                  {state.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      

    </Card>
  );
}

export default QuantumConsciousnessStates;