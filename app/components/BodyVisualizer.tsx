'use client';

import React from 'react';

interface BodyVisualizerProps {
  selectedPart?: string;
  onPartClick?: (part: string) => void;
}

const BodyVisualizer: React.FC<BodyVisualizerProps> = ({ selectedPart, onPartClick }) => {
  const getPartColor = (part: string) => {
    switch (part) {
      case 'head':
        return '#8B5CF6'; // Purple for Mind
      case 'chest':
        return '#6366F1'; // Indigo for Heart
      case 'abdomen':
        return '#EF4444'; // Red for Gut
      case 'body':
        return '#3B82F6'; // Blue for Body
      default:
        return '#6B7280'; // Gray for unselected
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px]">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-indigo-500/5 to-blue-500/5 rounded-xl" />
      
      <svg
        viewBox="0 0 400 600"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
      >
        {/* Head */}
        <g onClick={() => onPartClick?.('head')} className="cursor-pointer">
          <path
            d="M170 60
               C 170 30, 230 30, 230 60
               C 230 75, 220 90, 200 100
               C 180 90, 170 75, 170 60"
            fill={selectedPart === 'head' ? getPartColor('head') : 'currentColor'}
            className="text-purple-500/20 transition-colors hover:text-purple-500/40"
          />
          {/* Neck */}
          <path
            d="M185 100
               L 215 100
               L 210 130
               L 190 130
               Z"
            fill="currentColor"
            className="text-gray-500/20"
          />
        </g>

        {/* Torso - Heart Area */}
        <g onClick={() => onPartClick?.('chest')} className="cursor-pointer">
          <path
            d="M160 130
               C 160 130, 200 120, 240 130
               L 250 220
               C 250 240, 200 250, 150 220
               Z"
            fill={selectedPart === 'chest' ? getPartColor('chest') : 'currentColor'}
            className="text-indigo-500/20 transition-colors hover:text-indigo-500/40"
          />
        </g>

        {/* Gut Area */}
        <g onClick={() => onPartClick?.('abdomen')} className="cursor-pointer">
          <path
            d="M150 220
               C 200 250, 250 240, 250 220
               L 240 320
               C 240 340, 200 350, 160 320
               Z"
            fill={selectedPart === 'abdomen' ? getPartColor('abdomen') : 'currentColor'}
            className="text-red-500/20 transition-colors hover:text-red-500/40"
          />
        </g>

        {/* Arms */}
        <g onClick={() => onPartClick?.('body')} className="cursor-pointer">
          {/* Left Arm */}
          <path
            d="M160 140
               C 140 150, 120 180, 110 220
               C 105 240, 110 260, 120 270
               C 130 260, 140 240, 145 220
               C 150 200, 155 180, 160 160
               Z"
            fill={selectedPart === 'body' ? getPartColor('body') : 'currentColor'}
            className="text-blue-500/20 transition-colors hover:text-blue-500/40"
          />
          {/* Right Arm */}
          <path
            d="M240 140
               C 260 150, 280 180, 290 220
               C 295 240, 290 260, 280 270
               C 270 260, 260 240, 255 220
               C 250 200, 245 180, 240 160
               Z"
            fill={selectedPart === 'body' ? getPartColor('body') : 'currentColor'}
            className="text-blue-500/20 transition-colors hover:text-blue-500/40"
          />
        </g>

        {/* Legs */}
        <g onClick={() => onPartClick?.('body')} className="cursor-pointer">
          {/* Left Leg */}
          <path
            d="M160 320
               C 180 340, 180 360, 170 400
               C 165 420, 160 440, 155 480
               C 153 500, 140 520, 130 520
               C 120 520, 110 500, 120 480
               C 130 440, 140 420, 150 400
               C 155 380, 160 360, 160 320"
            fill={selectedPart === 'body' ? getPartColor('body') : 'currentColor'}
            className="text-blue-500/20 transition-colors hover:text-blue-500/40"
          />
          {/* Right Leg */}
          <path
            d="M240 320
               C 220 340, 220 360, 230 400
               C 235 420, 240 440, 245 480
               C 247 500, 260 520, 270 520
               C 280 520, 290 500, 280 480
               C 270 440, 260 420, 250 400
               C 245 380, 240 360, 240 320"
            fill={selectedPart === 'body' ? getPartColor('body') : 'currentColor'}
            className="text-blue-500/20 transition-colors hover:text-blue-500/40"
          />
        </g>

        {/* Connecting Lines */}
        <g className="pointer-events-none">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
            </marker>
          </defs>
          
          {/* Mind to Heart */}
          <path
            d="M200 110 L200 150"
            stroke="currentColor"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            className="text-purple-500/50"
          />
          
          {/* Heart to Gut */}
          <path
            d="M200 220 L200 260"
            stroke="currentColor"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            className="text-indigo-500/50"
          />
          
          {/* Gut to Body */}
          <path
            d="M200 320 L200 360"
            stroke="currentColor"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            className="text-red-500/50"
          />
        </g>
      </svg>
      
      {/* Labels */}
      <div className="absolute top-[5%] left-1/2 transform -translate-x-1/2 text-purple-500 font-medium">
        Mind Empire
      </div>
      <div className="absolute top-[30%] left-1/2 transform -translate-x-1/2 text-indigo-500 font-medium">
        Heart Empire
      </div>
      <div className="absolute top-[50%] left-1/2 transform -translate-x-1/2 text-red-500 font-medium">
        Gut Empire
      </div>
      <div className="absolute top-[70%] left-1/2 transform -translate-x-1/2 text-blue-500 font-medium">
        Body Empire
      </div>
    </div>
  );
};

export default BodyVisualizer;
