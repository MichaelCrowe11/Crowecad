import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';

interface CursorPosition {
  x: number;
  y: number;
}

interface CollaborativeCursorProps {
  userId: string;
  userName: string;
  color: string;
  position: CursorPosition;
  isActive: boolean;
}

export const CollaborativeCursor: React.FC<CollaborativeCursorProps> = ({
  userId,
  userName,
  color,
  position,
  isActive
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
    }
  }, [position]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={cursorRef}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.2 }}
        className="absolute pointer-events-none z-50"
        style={{
          left: 0,
          top: 0,
          willChange: 'transform'
        }}
      >
        {/* Cursor icon */}
        <div
          className="relative"
          style={{ color }}
        >
          <MousePointer2 
            className="h-5 w-5 drop-shadow-md"
            style={{ 
              fill: color,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}
          />
          
          {/* User name label */}
          <div
            ref={labelRef}
            className="absolute left-6 top-0 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap shadow-md"
            style={{
              backgroundColor: color,
              color: '#ffffff'
            }}
          >
            {userName}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

interface SelectionBoxProps {
  userId: string;
  color: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  userId,
  color,
  bounds
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute pointer-events-none"
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        border: `2px solid ${color}`,
        backgroundColor: `${color}20`,
        borderRadius: '4px',
        zIndex: 40
      }}
    />
  );
};