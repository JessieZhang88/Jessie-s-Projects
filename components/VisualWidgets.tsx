import React from 'react';
import { AnalysisData } from '../types';
import { Gauge, Activity, Eye, Zap, Aperture, ThermometerSun, Palette } from './Icons';

interface VisualWidgetsProps {
  data: AnalysisData;
}

const VisualWidgets: React.FC<VisualWidgetsProps> = ({ data }) => {
  const { technical_settings, ratings, keywords, color_palette } = data;

  return (
    <div className="flex flex-col space-y-6 mb-6 animate-fade-in">
      
      {/* 1. Technical Spec Grid */}
      {technical_settings && (
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                <div className="text-gray-500 mb-1"><Aperture size={16} /></div>
                <div className="text-accent-500 font-mono font-bold text-sm tracking-wider">{technical_settings.aperture}</div>
                <div className="text-[10px] text-gray-600 uppercase mt-1">光圈</div>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                <div className="text-gray-500 mb-1"><Zap size={16} /></div>
                <div className="text-accent-500 font-mono font-bold text-sm tracking-wider">{technical_settings.shutter_speed}</div>
                <div className="text-[10px] text-gray-600 uppercase mt-1">快门</div>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                <div className="text-gray-500 mb-1"><ThermometerSun size={16} /></div>
                <div className="text-accent-500 font-mono font-bold text-sm tracking-wider">{technical_settings.iso}</div>
                <div className="text-[10px] text-gray-600 uppercase mt-1">ISO</div>
            </div>
        </div>
      )}

      {/* 2. Color Palette */}
      {color_palette && color_palette.length > 0 && (
         <div className="bg-gray-900/30 rounded-xl p-3 border border-white/5">
             <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                 <Palette size={14} />
                 <span>色彩分析</span>
             </div>
             <div className="flex h-8 rounded-lg overflow-hidden w-full ring-1 ring-white/10">
                 {color_palette.map((color, idx) => (
                     <div 
                        key={idx} 
                        className="flex-1 h-full hover:flex-[1.5] transition-all duration-300 relative group"
                        style={{ backgroundColor: color }}
                     >
                         <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity">
                             <span className="text-[9px] font-mono text-white">{color}</span>
                         </div>
                     </div>
                 ))}
             </div>
         </div>
      )}

      {/* 3. Dynamic Ratings */}
      {ratings && (
        <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5 space-y-4">
            <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-gray-400">
                    <span className="flex items-center gap-1"><Eye size={12}/> 构图 (Composition)</span>
                    <span className="text-white">{ratings.composition}/100</span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-accent-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${ratings.composition}%` }}
                    ></div>
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-gray-400">
                    <span className="flex items-center gap-1"><Zap size={12}/> 光影 (Lighting)</span>
                    <span className="text-white">{ratings.lighting}/100</span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${ratings.lighting}%` }}
                    ></div>
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-gray-400">
                    <span className="flex items-center gap-1"><Activity size={12}/> 创意 (Creativity)</span>
                    <span className="text-white">{ratings.creativity}/100</span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${ratings.creativity}%` }}
                    ></div>
                </div>
            </div>
        </div>
      )}

      {/* 4. Keywords */}
      {keywords && keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
              {keywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 hover:border-accent-500/50 transition-colors">
                      #{kw}
                  </span>
              ))}
          </div>
      )}
    </div>
  );
};

export default VisualWidgets;
