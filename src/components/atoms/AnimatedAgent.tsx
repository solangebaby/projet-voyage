import { useState, useEffect } from 'react';

type AgentState = 'idle' | 'typing' | 'success' | 'error';

interface AnimatedAgentProps {
  state: AgentState;
  className?: string;
}

export const AnimatedAgent = ({ state, className = '' }: AnimatedAgentProps) => {
  const [eyesClosed, setEyesClosed] = useState(false);

  useEffect(() => {
    if (state === 'typing') {
      setEyesClosed(true);
    } else {
      setEyesClosed(false);
    }
  }, [state]);

  // Agent face colors and expressions
  const getFaceColor = () => {
    switch (state) {
      case 'success':
        return '#10B981'; // green
      case 'error':
        return '#EF4444'; // red
      default:
        return '#F97316'; // orange
    }
  };

  const getMouthPath = () => {
    switch (state) {
      case 'success':
        return 'M 25 45 Q 32 52 40 45'; // Smile
      case 'error':
        return 'M 25 50 Q 32 43 40 50'; // Frown
      default:
        return 'M 25 47 L 40 47'; // Neutral
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Face */}
        <circle cx="32" cy="32" r="28" fill={getFaceColor()} />
        
        {/* Eyes */}
        {eyesClosed ? (
          <>
            {/* Closed eyes (lines) */}
            <line x1="20" y1="28" x2="26" y2="28" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
            <line x1="38" y1="28" x2="44" y2="28" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Open eyes (circles) */}
            <circle cx="23" cy="28" r="3" fill="#1F2937" />
            <circle cx="41" cy="28" r="3" fill="#1F2937" />
            {/* White reflection */}
            <circle cx="24" cy="27" r="1.5" fill="white" />
            <circle cx="42" cy="27" r="1.5" fill="white" />
          </>
        )}

        {/* Mouth */}
        <path 
          d={getMouthPath()} 
          stroke="#1F2937" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          fill="none"
        />

        {/* Security badge */}
        <circle cx="48" cy="48" r="8" fill="white" />
        <path d="M 48 42 L 51 45 L 48 54 L 45 45 Z" fill={getFaceColor()} />
      </svg>
    </div>
  );
};

export default AnimatedAgent;
