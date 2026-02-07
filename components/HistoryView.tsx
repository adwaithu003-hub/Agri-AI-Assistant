
import React from 'react';
import { HistoryItem } from '../types';
import { History, Trash2, Calendar, FileText, Bug, Sprout, Leaf } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
  clearHistory: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, clearHistory }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'disease': return <Bug size={18} className="text-rose-500" />;
      case 'soil': return <Sprout size={18} className="text-amber-500" />;
      case 'garden': return <Leaf size={18} className="text-emerald-500" />;
      default: return <FileText size={18} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Activity History</h2>
          <p className="text-slate-600">Review your past scans, analyses, and gardening reports.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-semibold"
          >
            <Trash2 size={18} />
            Clear All
          </button>
        )}
      </header>

      {history.length === 0 ? (
        <div className="bg-white rounded-[40px] p-20 text-center border border-slate-100 shadow-sm">
          <History size={80} className="mx-auto text-slate-100 mb-6" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No history yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Start using the scanners or soil analyzer to see your agricultural journey tracked here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all">
              <div className="flex flex-col md:flex-row gap-6">
                {item.imageUrl && (
                  <div className="w-full md:w-32 h-32 shrink-0 rounded-2xl overflow-hidden shadow-inner">
                    <img src={item.imageUrl} alt="Scan" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        {getIcon(item.type)}
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <Calendar size={14} />
                      {item.date}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 text-slate-600 text-sm leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {item.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
