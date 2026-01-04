import React from 'react';
import { HistoryItem } from '../types';
import { X, Clock, ChevronRight, Wand2 } from './Icons';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onSelectHistory }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity"
            onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-80 md:w-96 bg-[#080808] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white">
                <Clock size={18} className="text-accent-500" />
                <h2 className="font-semibold tracking-wide">History</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-600 space-y-2">
                    <Clock size={32} className="opacity-20" />
                    <p className="text-sm">暂无历史记录</p>
                </div>
            ) : (
                history.map((item) => (
                    <div 
                        key={item.id}
                        onClick={() => {
                            onSelectHistory(item);
                            onClose();
                        }}
                        className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent-500/30 rounded-xl p-3 cursor-pointer transition-all duration-200 active:scale-95"
                    >
                        <div className="flex space-x-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0 relative">
                                <img src={item.originalImage} className="w-full h-full object-cover" alt="thumbnail" />
                                {item.improvedImage && (
                                    <div className="absolute bottom-0 right-0 p-0.5 bg-accent-600/90 rounded-tl-md">
                                        <Wand2 size={10} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-gray-300 truncate pr-2">
                                        {item.mode === 'masterpiece' ? '佳作赏析' : item.mode === 'critique' ? '改良建议' : '自动分析'}
                                    </span>
                                    <span className="text-[10px] text-gray-600 whitespace-nowrap">
                                        {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                                    {item.analysisText.replace(/[\#\*\[\]]/g, '').substring(0, 60)}...
                                </p>
                            </div>
                            <div className="flex items-center text-gray-700 group-hover:text-accent-500 transition-colors">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
