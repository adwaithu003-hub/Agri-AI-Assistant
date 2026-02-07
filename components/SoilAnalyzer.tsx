
import React, { useState, useRef } from 'react';
import { analyzeSoil, analyzeSoilImage } from '../services/geminiService';
import { Sprout, Loader2, FileText, Send, Lightbulb, Tractor, TrendingUp, Camera, X } from 'lucide-react';

interface SoilAnalyzerProps {
  onResult: (title: string, content: string, imageUrl?: string) => void;
}

const SoilAnalyzer: React.FC<SoilAnalyzerProps> = ({ onResult }) => {
  const [reportText, setReportText] = useState('');
  const [reportImage, setReportImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const finalInput = overrideText || reportText;
    if (!finalInput.trim() && !reportImage) return;
    
    setLoading(true);
    try {
      let analysis = "";
      if (reportImage) {
        const base64 = reportImage.split(',')[1];
        analysis = await analyzeSoilImage(base64) || "";
      } else {
        analysis = await analyzeSoil(finalInput) || "";
      }
      
      setResult(analysis || "No analysis available.");
      onResult("Soil Analysis Report", analysis || "", reportImage || undefined);
    } catch (err) {
      console.error(err);
      setResult("Error analyzing report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatSoilData = (text: string) => {
    const sections = text.split(/\n(?=\d+\.|\*\*)/g).filter(s => s.trim().length > 0);

    return (
      <div className="space-y-6">
        {sections.map((section, idx) => {
          const lines = section.split('\n').filter(l => l.trim().length > 0);
          const title = lines[0].replace(/\*\*/g, '').replace(/###/g, '').replace(/^\d+\.\s*/, '').replace(':', '').trim();
          const content = lines.slice(1);

          const getIcon = (t: string) => {
            if (t.toLowerCase().includes('crop')) return <Tractor size={18} className="text-emerald-500" />;
            if (t.toLowerCase().includes('yield') || t.toLowerCase().includes('why')) return <TrendingUp size={18} className="text-sky-500" />;
            return <Lightbulb size={18} className="text-amber-500" />;
          };

          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:border-emerald-200 transition-all">
              <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                {getIcon(title)}
                <h3 className="font-bold text-slate-800 tracking-tight text-xs uppercase">{title}</h3>
              </div>
              <div className="p-5">
                <ul className="space-y-2">
                  {content.map((line, lIdx) => (
                    <li key={lIdx} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                      <span>{line.replace(/^\s*\*+\s*/, '').replace(/\*\*/g, '').replace(/###/g, '').trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleReset = () => {
    setReportText('');
    setReportImage(null);
    setResult(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Soil Analysis Lab</h2>
        <p className="text-slate-600 text-sm">Upload a photo of your report or describe it manually.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={(e) => handleAnalyze(e)} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-emerald-600 font-bold mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <FileText size={20} />
                </div>
                <span>Report Input</span>
              </div>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-all text-xs"
                >
                  <Camera size={14} />
                  Upload
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </button>
              </div>
            </div>

            {reportImage ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-lg h-64 group">
                <img src={reportImage} alt="Soil Report" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setReportImage(null)}
                  className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-emerald-500/90 text-white p-2 text-center text-xs font-bold uppercase tracking-widest">
                  Report Image Loaded
                </div>
              </div>
            ) : (
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Describe your soil (pH, moisture, nutrients) or paste report results..."
                className="w-full h-80 p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all resize-none text-slate-700 leading-relaxed font-medium"
              />
            )}
          </div>

          <div className="flex gap-4">
             <button
              type="button"
              onClick={handleReset}
              className="px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all border border-slate-200"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading || (!reportText.trim() && !reportImage)}
              className={`
                flex-1 py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-300
                ${loading || (!reportText.trim() && !reportImage)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200 hover:-translate-y-1 active:scale-95'}
              `}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              <span>{loading ? 'Analyzing...' : 'Analyze Now'}</span>
            </button>
          </div>
        </form>

        <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 p-2 min-h-[500px]">
          <div className="h-full bg-white/40 backdrop-blur-sm rounded-[1.8rem] p-6 overflow-y-auto">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
                  <Sprout className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600 opacity-20" size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-slate-900">Scanning Soil Data</p>
                  <p className="text-slate-500 text-sm max-w-[250px] mx-auto">AI is calculating optimal crops for your soil chemistry...</p>
                </div>
              </div>
            ) : result ? (
              <div className="animate-in fade-in duration-700">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Crop Recommendation Report</h3>
                    <p className="text-xs text-slate-500">Personalized Soil Strategy</p>
                  </div>
                </div>
                
                {formatSoilData(result)}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
                  <Sprout size={48} className="text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-400 mb-2">Ready for Scan</h3>
                <p className="text-sm text-slate-400 max-w-[220px] mx-auto">Use text to describe your soil conditions for custom yield tips.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilAnalyzer;
