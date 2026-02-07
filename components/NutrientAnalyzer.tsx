
import React, { useState, useRef } from 'react';
import { analyzeNutrientDeficiency } from '../services/geminiService';
import { 
  Camera, Loader2, Activity, CheckCircle, AlertTriangle, 
  Leaf, Trash2,
} from 'lucide-react';

interface NutrientAnalyzerProps {
  onResult: (title: string, content: string, imageUrl: string) => void;
}

const NutrientAnalyzer: React.FC<NutrientAnalyzerProps> = ({ onResult }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [contextInput, setContextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const parseNutrientResult = (text: string) => {
    const data: any = {
      deficiency: 'Unknown',
      severity: 'Medium',
      healthScore: 50,
      visualIndicators: [],
      correctiveMeasures: [],
      raw: text
    };

    const lines = text.split('\n');
    let currentSection = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('Detected Nutrient Deficiency:')) data.deficiency = trimmed.replace('Detected Nutrient Deficiency:', '').trim();
      else if (trimmed.startsWith('Severity Level:')) data.severity = trimmed.replace('Severity Level:', '').trim();
      else if (trimmed.startsWith('Health Score:')) data.healthScore = parseInt(trimmed.replace('Health Score:', '')) || 50;
      else if (trimmed.startsWith('Visual Indicators Observed:')) currentSection = 'visualIndicators';
      else if (trimmed.startsWith('Recommended Corrective Measures:')) currentSection = 'correctiveMeasures';
      else if (trimmed.startsWith('-') || trimmed.match(/^\d+\./)) {
        const item = trimmed.replace(/^[- \d.]*/, '').trim();
        if (currentSection && item) data[currentSection].push(item);
      }
    });

    return data;
  };

  const handleAction = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const analysis = await analyzeNutrientDeficiency(base64, contextInput);
      const parsed = parseNutrientResult(analysis || "");
      setResult(parsed);
      onResult("Nutrient Analysis", analysis || "", image);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500';
    if (score >= 50) return 'text-amber-500 border-amber-500';
    return 'text-rose-500 border-rose-500';
  };

  const resetAll = () => {
    setImage(null);
    setResult(null);
    setContextInput('');
  };

  return (
    <div className="max-w-4xl mx-auto pb-48 animate-in fade-in duration-500">
      <div className="bg-teal-600 text-white p-5 rounded-t-[2.5rem] flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Activity size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider leading-none">Nutrient Lab</h2>
            <div className="flex items-center gap-2 text-[10px] opacity-90 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse"></span>
              {loading ? 'ANALYZING CHEMISTRY...' : 'SYSTEM READY'}
            </div>
          </div>
        </div>
        {(image || result) && (
          <button 
            onClick={resetAll}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <Trash2 size={14} />
            Reset
          </button>
        )}
      </div>

      <div className="bg-white rounded-b-[2.5rem] shadow-2xl overflow-hidden min-h-[500px] border-x border-b border-slate-200">
        {!image && !loading && (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-28 h-28 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 shadow-inner relative group">
              <Camera size={56} className="group-hover:scale-110 transition-transform" />
              <div className="absolute top-0 right-0 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-md animate-bounce">
                <Leaf size={16} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Plant Nutrient Scan</h3>
              <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                Identify Nitrogen, Phosphorus, Potassium deficiencies and more. Upload a leaf photo to start.
              </p>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-12 py-5 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 transition-all shadow-2xl shadow-teal-200 hover:-translate-y-1"
            >
              Upload Leaf Photo
            </button>
          </div>
        )}

        {image && !loading && !result && (
          <div className="p-16 text-center animate-in slide-in-from-bottom-4 duration-300 flex flex-col items-center">
            <div className="relative mb-8">
              <div className="w-56 h-56 rounded-[3rem] overflow-hidden border-4 border-teal-500 shadow-2xl">
                <img src={image} alt="Uploaded" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="w-full max-w-md mb-8">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                Additional Context (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder="e.g., Heavy rain last week, yellowing started at tips..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-teal-200 focus:border-teal-500 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              onClick={() => handleAction()}
              className="px-12 py-5 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-200 active:scale-95"
            >
              Analyze Nutrients
            </button>
          </div>
        )}

        {loading && (
          <div className="p-20 text-center flex flex-col items-center justify-center min-h-[500px] space-y-10 animate-pulse">
            <Loader2 className="text-teal-500 animate-spin" size={64} />
            <div className="space-y-2">
              <p className="text-xl font-black text-slate-900">Examining Plant Tissue...</p>
              <p className="text-sm text-slate-400">Checking N-P-K Levels & Micronutrients</p>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="animate-in fade-in duration-700">
            <div className="px-8 py-10 space-y-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Deficiency Detected</span>
                  <h1 className="text-3xl font-black text-slate-900 leading-none">{result.deficiency}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wide`}>
                      Severity: {result.severity}
                    </span>
                  </div>
                </div>
                
                {/* Health Score Circle */}
                <div className={`relative w-24 h-24 rounded-full border-8 flex items-center justify-center bg-white shadow-xl ${getScoreColor(result.healthScore)}`}>
                  <div className="text-center">
                    <span className="block text-2xl font-black">{result.healthScore}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Health Score</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                    <h4 className="flex items-center gap-2 font-bold text-amber-800 mb-4 text-sm uppercase tracking-wide">
                      <AlertTriangle size={16} />
                      Visual Indicators
                    </h4>
                    <ul className="space-y-3">
                      {result.visualIndicators.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-amber-900 text-sm font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                            {item}
                          </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-teal-50 p-6 rounded-3xl border border-teal-100">
                    <h4 className="flex items-center gap-2 font-bold text-teal-800 mb-4 text-sm uppercase tracking-wide">
                      <CheckCircle size={16} />
                      Corrective Measures
                    </h4>
                    <ul className="space-y-3">
                      {result.correctiveMeasures.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-teal-900 text-sm font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0"></div>
                            {item}
                          </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
         {/* Hidden input for camera trigger */}
         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
    </div>
  );
};

export default NutrientAnalyzer;
