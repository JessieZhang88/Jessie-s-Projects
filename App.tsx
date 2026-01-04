import React, { useState, useEffect, useMemo } from 'react';
import ImageUploader from './components/ImageUploader';
import AnalysisView from './components/AnalysisView';
import HistorySidebar from './components/HistorySidebar';
import ImageOverlay from './components/ImageOverlay';
import { Camera, X, RefreshCw, Wand2, AlertCircle, History, Layout, ScanEye } from './components/Icons';
import { analyzeImage, generateImprovedImage } from './services/lensMasterService';
import { AnalysisMode, AnalysisState, HistoryItem, AnalysisData } from './types';

const STORAGE_KEY = 'lensmaster_history_v1';
const MAX_HISTORY = 5;

// Helper to parse JSON from Markdown
const parseAnalysisData = (text: string): AnalysisData | undefined => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```/g;
    let match;
    let lastMatch = null;
    while ((match = jsonRegex.exec(text)) !== null) {
        lastMatch = match;
    }
    if (lastMatch) {
        try {
            return JSON.parse(lastMatch[1] || lastMatch[2]) as AnalysisData;
        } catch (e) {
            console.warn("Parsing failed", e);
        }
    }
    return undefined;
};

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    originalImage: null,
    analysisText: '',
    improvedImage: null,
    error: null,
  });

  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.AUTO);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Toggle for visual guides overlay
  const [showOverlay, setShowOverlay] = useState(true);

  // Derived state for Analysis Data
  const analysisData = useMemo(() => {
      return parseAnalysisData(state.analysisText);
  }, [state.analysisText]);

  // Load History
  useEffect(() => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setHistory(JSON.parse(stored));
        }
    } catch (e) {
        console.warn("Failed to load history", e);
    }
  }, []);

  // Save History Helper
  const saveToHistory = (newItem: HistoryItem) => {
    setHistory(prev => {
        const updated = [newItem, ...prev].slice(0, MAX_HISTORY);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
    });
  };

  const handleImageSelect = (base64: string) => {
    setState({
      status: 'idle',
      originalImage: base64,
      analysisText: '',
      improvedImage: null,
      error: null,
    });
  };

  const restoreHistoryItem = (item: HistoryItem) => {
      setState({
          status: 'complete',
          originalImage: item.originalImage,
          analysisText: item.analysisText,
          improvedImage: item.improvedImage,
          error: null
      });
      setMode(item.mode);
  };

  const handleAnalyze = async () => {
    if (!state.originalImage) return;

    setState(prev => ({ ...prev, status: 'analyzing', error: null, analysisText: '', improvedImage: null }));

    try {
      // 1. Analyze
      const analysis = await analyzeImage(state.originalImage, mode);
      
      // Parse immediately to check for mode
      const parsedData = parseAnalysisData(analysis);
      
      let finalImprovedImage: string | null = null;
      
      // Update text first
      setState(prev => ({
        ...prev,
        analysisText: analysis,
        status: 'complete'
      }));

      // Determine if we should generate an image
      // Criteria: User selected Critique, OR Auto detected Critique mode via JSON field
      const isCritiqueMode = 
          mode === AnalysisMode.CRITIQUE || 
          (parsedData?.analysis_target_mode === 'critique') ||
          (mode === AnalysisMode.AUTO && analysis.includes("Mode 2"));

      if (isCritiqueMode) {
         setState(prev => ({ ...prev, status: 'generating_image' }));
         finalImprovedImage = await generateImprovedImage(state.originalImage, analysis);
         setState(prev => ({
             ...prev,
             improvedImage: finalImprovedImage,
             status: 'complete'
         }));
      }

      // Save to History
      const historyItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          originalImage: state.originalImage,
          analysisText: analysis,
          improvedImage: finalImprovedImage,
          mode: mode,
          analysisData: parsedData
      };
      saveToHistory(historyItem);

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || "Something went wrong."
      }));
    }
  };

  const reset = () => {
    setState({
      status: 'idle',
      originalImage: null,
      analysisText: '',
      improvedImage: null,
      error: null,
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-accent-500/30 overflow-x-hidden">
      
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onSelectHistory={restoreHistoryItem}
      />

      {/* Header */}
      <header className="border-b border-white/5 bg-[#050505]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={reset}>
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#0a0a0a] ring-1 ring-white/10 p-2 rounded-lg text-accent-500">
                    <Camera size={24} />
                </div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-mono">
              Lens<span className="text-accent-500">Master</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
            >
                <History size={16} />
                <span className="hidden sm:inline">历史记录</span>
            </button>
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-500">
                <div className="h-4 w-px bg-white/10"></div>
                <span className="flex items-center gap-1"><Layout size={14}/> AI 摄影私教</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Notification */}
        {state.error && (
            <div className="mb-6 bg-red-900/10 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center space-x-3 animate-fade-in">
                <AlertCircle size={20} className="text-red-500" />
                <span>{state.error}</span>
                <button onClick={() => setState(s => ({...s, error: null}))} className="ml-auto hover:text-white"><X size={18}/></button>
            </div>
        )}

        {/* Initial Upload State */}
        {!state.originalImage ? (
          <div className="max-w-2xl mx-auto mt-20 animate-fade-in-up">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold text-white mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                重塑你的摄影审美
              </h2>
              <p className="text-gray-400 text-lg font-light max-w-lg mx-auto leading-relaxed">
                上传照片，获取世界级摄影导师的专业点评、参数建议及 AI 改良模拟。
              </p>
            </div>
            <ImageUploader onImageSelected={handleImageSelect} />
          </div>
        ) : (
          /* Analysis Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
            
            {/* Left Column: Images & Controls */}
            <div className="flex flex-col space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Toolbar */}
              <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <select 
                        value={mode} 
                        onChange={(e) => setMode(e.target.value as AnalysisMode)}
                        disabled={state.status === 'analyzing' || state.status === 'generating_image'}
                        className="bg-[#151515] border border-white/10 text-gray-200 text-sm rounded-lg focus:ring-accent-500 focus:border-accent-500 block w-full sm:w-48 p-2.5 outline-none"
                    >
                        <option value={AnalysisMode.AUTO}>智能自动模式</option>
                        <option value={AnalysisMode.MASTERPIECE}>模式一：佳作赏析</option>
                        <option value={AnalysisMode.CRITIQUE}>模式二：改良与诊断</option>
                    </select>
                 </div>

                 <div className="flex space-x-3 w-full sm:w-auto">
                    <button 
                        onClick={reset}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                    >
                        重新上传
                    </button>
                    {(state.status === 'idle' || state.status === 'complete' || state.status === 'error') && (
                        <button 
                            onClick={handleAnalyze}
                            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2 text-sm font-bold text-black bg-accent-500 hover:bg-accent-400 rounded-lg shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {state.status === 'complete' ? (
                                <>
                                    <RefreshCw size={16} /> <span>重新分析</span>
                                </>
                            ) : (
                                <>
                                    <Wand2 size={16} /> <span>开始分析</span>
                                </>
                            )}
                        </button>
                    )}
                 </div>
              </div>

              {/* Original Image Container */}
              <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a] flex justify-center items-center min-h-[300px]">
                <div className="absolute top-3 left-3 flex gap-2 z-30">
                     <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded text-[10px] font-mono font-medium text-white border border-white/10 tracking-widest uppercase">
                        Original Source
                    </div>
                    {analysisData?.composition_guides && (
                        <button 
                            onClick={() => setShowOverlay(!showOverlay)}
                            className={`px-3 py-1.5 rounded text-[10px] font-mono font-medium border transition-colors flex items-center gap-1
                                ${showOverlay 
                                    ? 'bg-accent-900/50 text-accent-400 border-accent-500/50' 
                                    : 'bg-black/80 text-gray-400 border-white/10 hover:text-white'}
                            `}
                        >
                            <ScanEye size={12} /> {showOverlay ? 'Hide Guides' : 'Show Guides'}
                        </button>
                    )}
                </div>
                
                {/* Image & Overlay */}
                <div className="relative w-full h-auto">
                     <img 
                        src={state.originalImage} 
                        alt="User upload" 
                        className="w-full h-auto object-contain max-h-[600px]"
                    />
                    <ImageOverlay 
                        guides={analysisData?.composition_guides} 
                        show={showOverlay}
                    />
                </div>
              </div>

              {/* Generated Image (If available) */}
              {state.status === 'generating_image' && (
                  <div className="relative rounded-2xl overflow-hidden border border-accent-500/20 bg-[#0a0a0a] h-64 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                      <div className="relative">
                          <div className="w-12 h-12 border-4 border-accent-900 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-accent-500 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-gray-400 text-sm animate-pulse font-mono uppercase tracking-widest">Rendering Improved Simulation...</p>
                  </div>
              )}

              {state.improvedImage && (
                  <div className="relative group rounded-2xl overflow-hidden border border-accent-500/40 bg-[#0a0a0a] shadow-[0_0_30px_rgba(56,189,248,0.1)] animate-fade-in-up">
                    <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/90 to-transparent z-10 flex justify-between items-start">
                        <div className="bg-accent-600/90 backdrop-blur-sm px-3 py-1 rounded text-[10px] font-mono font-bold text-black border border-accent-400 flex items-center gap-2 uppercase tracking-wide">
                            <Wand2 size={10} /> AI Optimized
                        </div>
                    </div>
                    <img 
                        src={state.improvedImage} 
                        alt="AI Improved" 
                        className="w-full h-auto object-contain max-h-[600px]"
                    />
                     <div className="p-3 bg-black/80 border-t border-white/10 backdrop-blur-sm">
                        <p className="text-[10px] text-gray-500 font-mono">
                            * SIMULATION RENDERING. SUBJECT INTEGRITY MAINTAINED. LIGHTING ENHANCED.
                        </p>
                    </div>
                  </div>
              )}

            </div>

            {/* Right Column: Text Analysis */}
            <div className="h-full">
                <AnalysisView 
                    text={state.analysisText} 
                    isLoading={state.status === 'analyzing'} 
                />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
