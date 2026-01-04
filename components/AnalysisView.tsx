import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Aperture } from './Icons';
import VisualWidgets from './VisualWidgets';
import { AnalysisData } from '../types';

interface AnalysisViewProps {
  text: string;
  isLoading: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ text, isLoading }) => {
  
  // Parse logic to separate Markdown from JSON block
  const { markdown, data } = useMemo(() => {
    if (!text) return { markdown: '', data: null };

    // Regex to find JSON block enclosed in ```json ... ``` or just ``` ... ``` at the end
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```/g;
    let match;
    let lastMatch = null;
    
    // Find the last code block which should be our JSON
    while ((match = jsonRegex.exec(text)) !== null) {
        lastMatch = match;
    }

    if (lastMatch) {
        try {
            const jsonStr = lastMatch[1] || lastMatch[2];
            const parsedData = JSON.parse(jsonStr) as AnalysisData;
            
            // Remove the JSON block from the display text
            const cleanMarkdown = text.replace(lastMatch[0], '').trim();
            
            return { markdown: cleanMarkdown, data: parsedData };
        } catch (e) {
            console.warn("Failed to parse analysis JSON", e);
            // If parse fails, just return full text
            return { markdown: text, data: null };
        }
    }

    return { markdown: text, data: null };
  }, [text]);


  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 min-h-[300px]">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-[3px] border-gray-800 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-[3px] border-accent-500 rounded-full border-t-transparent animate-spin"></div>
          <Aperture className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600 animate-pulse" size={24} />
        </div>
        <p className="text-lg font-medium animate-pulse tracking-wide text-gray-400">正在解析光影数据...</p>
        <p className="text-xs text-gray-600 mt-2 font-mono">CALCULATING ISO / COMPOSITION SCORE</p>
      </div>
    );
  }

  if (!text) return null;

  return (
    <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden h-full flex flex-col relative group">
      {/* Glassy Header */}
      <div className="p-4 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-2">
            <Sparkles className="text-accent-500" size={18} />
            <h2 className="font-semibold text-gray-100 tracking-wide text-sm uppercase">LensMaster Intelligence</h2>
        </div>
        <div className="text-[10px] font-mono text-gray-600">V 2.5.0</div>
      </div>
      
      <div className="p-6 overflow-y-auto custom-scrollbar flex-grow bg-gradient-to-b from-[#0a0a0a] to-black">
        
        {/* Render Widgets if data exists */}
        {data && <VisualWidgets data={data} />}

        <div className="markdown-content text-gray-300">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
        
        {/* Decorative footer line */}
        <div className="mt-12 border-t border-white/5 pt-4 text-center">
             <div className="inline-block px-3 py-1 bg-white/5 rounded text-[10px] text-gray-600 font-mono">
                AI GENERATED ANALYSIS END
             </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
