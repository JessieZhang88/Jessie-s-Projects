import React from 'react';
import { CompositionGuide } from '../types';

interface ImageOverlayProps {
  guides?: CompositionGuide[];
  show: boolean;
}

const ImageOverlay: React.FC<ImageOverlayProps> = ({ guides, show }) => {
  if (!show || !guides || guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
      <svg className="w-full h-full" preserveAspectRatio="none">
        {guides.map((guide, idx) => {
          if (guide.type === 'line' && guide.x1 !== undefined && guide.y1 !== undefined && guide.x2 !== undefined && guide.y2 !== undefined) {
            return (
              <g key={idx} className="animate-fade-in">
                <line 
                  x1={`${guide.x1}%`} 
                  y1={`${guide.y1}%`} 
                  x2={`${guide.x2}%`} 
                  y2={`${guide.y2}%`} 
                  stroke={guide.color || "rgba(56, 189, 248, 0.7)"} 
                  strokeWidth="2" 
                  strokeDasharray="5,5"
                  className="drop-shadow-md"
                />
                {guide.label && (
                   <text 
                     x={`${(guide.x1 + guide.x2) / 2}%`} 
                     y={`${(guide.y1 + guide.y2) / 2}%`} 
                     fill="white" 
                     fontSize="10" 
                     dy="-5"
                     textAnchor="middle"
                     className="drop-shadow-md font-sans"
                   >
                     {guide.label}
                   </text>
                )}
              </g>
            );
          } else if (guide.type === 'rect' && guide.x !== undefined && guide.y !== undefined && guide.w !== undefined && guide.h !== undefined) {
             return (
               <g key={idx} className="animate-fade-in">
                 <rect 
                   x={`${guide.x}%`} 
                   y={`${guide.y}%`} 
                   width={`${guide.w}%`} 
                   height={`${guide.h}%`} 
                   fill="none" 
                   stroke={guide.color || "rgba(255, 99, 71, 0.8)"} 
                   strokeWidth="2"
                   rx="4"
                   className="drop-shadow-md"
                 />
                 {guide.label && (
                   <text 
                     x={`${guide.x}%`} 
                     y={`${guide.y}%`} 
                     fill="white" 
                     fontSize="10" 
                     dy="-5"
                     className="drop-shadow-md font-sans"
                   >
                     {guide.label}
                   </text>
                )}
               </g>
             );
          }
          return null;
        })}
      </svg>
    </div>
  );
};

export default ImageOverlay;
