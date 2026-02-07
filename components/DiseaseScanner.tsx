
import React, { useState, useRef, useEffect } from 'react';
import { analyzePlantDisease, answerDiseaseDoubt, translateAnalysis } from '../services/geminiService';
import { 
  Camera, Loader2, Bug, ShieldCheck, 
  AlertTriangle, Leaf, CheckCircle, Send, Trash2,
  Activity, Search, Shield, Download, ShoppingBag, FlaskConical, Sprout, Languages
} from 'lucide-react';

interface DiseaseScannerProps {
  onResult: (title: string, content: string, imageUrl: string) => void;
}

const DiseaseScanner: React.FC<DiseaseScannerProps> = ({ onResult }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [translating, setTranslating] = useState(false);
  const [originalRaw, setOriginalRaw] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const cleanText = (text: string) => {
    return text.replace(/\*\*/g, '').replace(/###/g, '').replace(/^\s*[\*\-]\s*/gm, '').trim();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setOriginalRaw(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const parseAIResult = (text: string) => {
    const data: any = {
      plantName: 'Unknown Plant',
      diagnosis: 'Unknown Condition',
      severity: 'Medium',
      healthScore: 50,
      symptoms: [],
      prevention: [],
      organic: [],
      chemical: [],
      raw: text
    };

    const lines = text.split('\n');
    let currentSection = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('PLANT_NAME:')) data.plantName = cleanText(trimmed.replace('PLANT_NAME:', ''));
      else if (trimmed.startsWith('DIAGNOSIS:')) data.diagnosis = cleanText(trimmed.replace('DIAGNOSIS:', ''));
      else if (trimmed.startsWith('SEVERITY:')) data.severity = cleanText(trimmed.replace('SEVERITY:', ''));
      else if (trimmed.startsWith('HEALTH_SCORE:')) data.healthScore = parseInt(trimmed.replace('HEALTH_SCORE:', '')) || 50;
      else if (trimmed.startsWith('SYMPTOMS:')) currentSection = 'symptoms';
      else if (trimmed.startsWith('PREVENTION:')) currentSection = 'prevention';
      else if (trimmed.startsWith('ORGANIC_TREATMENT:')) currentSection = 'organic';
      else if (trimmed.startsWith('CHEMICAL_TREATMENT:')) currentSection = 'chemical';
      else if (trimmed.startsWith('-') || trimmed.match(/^\d+\./)) {
        const item = cleanText(trimmed.replace(/^[- \d.]*/, ''));
        if (currentSection && item) data[currentSection].push(item);
      }
    });

    return data;
  };

  const handleAction = async (overrideText?: string) => {
    const finalInput = overrideText || inputText;
    if (!image && !finalInput.trim()) return;

    setLoading(true);
    try {
      if (image && !result) {
        const base64 = image.split(',')[1];
        const analysis = await analyzePlantDisease(base64, finalInput);
        const parsed = parseAIResult(analysis || "");
        setResult(parsed);
        setOriginalRaw(analysis || "");
        onResult("Health Analysis", `${parsed.diagnosis} - ${parsed.plantName}`, image);
        if (finalInput.trim()) {
          setChatHistory(prev => [...prev, { role: 'user', text: finalInput }]);
        }
        setInputText('');
      } else if (finalInput.trim()) {
        const userQuery = finalInput;
        setInputText('');
        setChatHistory(prev => [...prev, { role: 'user', text: userQuery }]);
        
        const response = await answerDiseaseDoubt(userQuery, result?.raw);
        setChatHistory(prev => [...prev, 
          { role: 'bot', text: cleanText(response || "I'm sorry, I couldn't find an answer to that.") }
        ]);
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'bot', text: "An error occurred. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (lang: string) => {
    if (!originalRaw || translating) return;

    if (lang === 'English') {
      setResult({ ...parseAIResult(originalRaw), raw: originalRaw });
      return;
    }

    setTranslating(true);
    try {
      const translatedRaw = await translateAnalysis(originalRaw, lang);
      const parsed = parseAIResult(translatedRaw || "");
      setResult({ ...parsed, raw: translatedRaw || parsed.raw });
    } catch (err) {
      console.error("Translation error", err);
    } finally {
      setTranslating(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const s = severity.toLowerCase();
    if (s.includes('high')) return 'bg-rose-100 text-rose-700';
    if (s.includes('medium')) return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  const resetAll = () => {
    setImage(null);
    setResult(null);
    setChatHistory([]);
    setInputText('');
    setOriginalRaw(null);
  };

  return (
    <div className="max-w-5xl mx-auto pb-48 animate-in fade-in duration-500">
      <div className="bg-[#059669] text-white p-5 rounded-t-[2.5rem] flex items-center justify-between shadow-xl relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Activity size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider leading-none">Agri Health Lab</h2>
            <div className="flex items-center gap-2 text-[10px] opacity-90 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
              {loading ? 'ANALYZING SPECIES...' : 'SYSTEM ONLINE'}
            </div>
          </div>
        </div>
        {(image || result || chatHistory.length > 0) && (
          <button 
            onClick={resetAll}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <Trash2 size={14} />
            Reset
          </button>
        )}
      </div>

      <div className="bg-white rounded-b-[2.5rem] shadow-2xl overflow-hidden min-h-[600px] border-x border-b border-slate-200">
        {!image && !loading && chatHistory.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shadow-inner relative group">
              <Camera size={56} className="group-hover:scale-110 transition-transform" />
              <div className="absolute top-0 right-0 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-md animate-bounce">
                <Leaf size={16} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Plant Disease Scanner</h3>
              <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                Take a photo of a leaf. We'll identify the disease, provide symptoms, prevention guides, and organic/chemical treatments.
              </p>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-12 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 hover:-translate-y-1"
            >
              Upload Plant Photo
            </button>
          </div>
        )}

        {image && !loading && !result && (
          <div className="p-16 text-center animate-in slide-in-from-bottom-4 duration-300 flex flex-col items-center">
            <div className="relative mb-8">
              <div className="w-64 h-64 rounded-[2rem] overflow-hidden border-4 border-emerald-500 shadow-2xl">
                <img src={image} alt="Uploaded" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-bounce">
                <Activity size={28} />
              </div>
            </div>
            <button 
              onClick={() => handleAction()}
              className="px-12 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-95"
            >
              Start Analysis
            </button>
          </div>
        )}

        {loading && (
          <div className="p-20 text-center flex flex-col items-center justify-center min-h-[500px] space-y-10 animate-pulse">
            <Loader2 className="text-emerald-500 animate-spin" size={64} />
            <div className="space-y-2">
              <p className="text-xl font-black text-slate-900">Processing Plant Bio-Metrics...</p>
              <p className="text-sm text-slate-400">Comparing with 50,000+ disease patterns</p>
            </div>
          </div>
        )}

        {(result || chatHistory.length > 0) && !loading && (
          <div className="animate-in fade-in duration-700">
            {result && (
              <div className="flex flex-col">
                {/* Hero Header with Image */}
                <div className="relative w-full h-80 bg-slate-900 overflow-hidden">
                  <div className="absolute inset-0 opacity-60">
                     <img src={image || ""} alt="Plant" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-slate-900/50 backdrop-blur-md px-3 py-1 rounded-lg border border-emerald-500/30">
                        {result.plantName}
                      </span>
                      <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg ${result.severity.toLowerCase().includes('high') ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {result.severity} Severity
                      </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight shadow-sm mb-2">
                      {result.diagnosis}
                    </h1>
                    <div className="flex items-end justify-between">
                      <p className="text-slate-300 font-medium max-w-xl">
                        Health Score: <span className="text-emerald-400 font-bold">{result.healthScore}/100</span>
                      </p>
                      
                      {/* Translation Buttons */}
                      <div className="flex items-center gap-2">
                         <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                           <Languages size={16} className="text-white ml-1" />
                           {['English', 'Hindi', 'Tamil', 'Malayalam'].map((lang) => (
                              <button
                                key={lang}
                                onClick={() => handleTranslate(lang)}
                                disabled={translating}
                                className="px-3 py-1 text-[10px] font-bold uppercase rounded-lg bg-white/10 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                              >
                                {lang === 'English' ? 'EN' : lang.substring(0,2)}
                              </button>
                           ))}
                           {translating && <Loader2 size={14} className="animate-spin text-emerald-400 mr-2" />}
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-8 space-y-10">
                  
                  {/* Health Analysis Details */}
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold text-slate-900">Health Analysis Details</h3>
                      <button className="flex items-center gap-2 px-5 py-2.5 border border-emerald-200 text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors text-sm">
                        <Download size={18} />
                        Download Report
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Symptoms */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
                            <Search size={20} />
                          </div>
                          <h4 className="font-black text-slate-800 uppercase text-sm tracking-wide">Symptoms & Signs</h4>
                        </div>
                        <div className="space-y-3">
                          {result.symptoms.map((item: string, i: number) => (
                            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                              <div className="w-2 h-2 bg-sky-400 rounded-full mt-2 shrink-0"></div>
                              <p className="text-slate-700 text-sm font-medium leading-relaxed">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prevention */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                            <ShieldCheck size={20} />
                          </div>
                          <h4 className="font-black text-slate-800 uppercase text-sm tracking-wide">Prevention Guide</h4>
                        </div>
                        <div className="space-y-3">
                          {result.prevention.map((item: string, i: number) => (
                            <div key={i} className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                              <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                              <p className="text-slate-700 text-sm font-medium leading-relaxed">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Treatment Section */}
                  <div className="bg-[#0f172a] rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10"></div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <span className="text-emerald-400 uppercase tracking-widest text-sm font-black">Treatment & Pest Control</span>
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-10">
                        {/* Organic */}
                        <div className="space-y-5">
                          <div className="flex items-center gap-3 mb-2 text-emerald-400">
                            <Sprout size={20} />
                            <h4 className="font-bold">Organic & Natural</h4>
                          </div>
                          <div className="space-y-3">
                             {result.organic.map((item: string, i: number) => (
                               <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                 <p className="text-sm font-medium text-slate-200 leading-relaxed">{item}</p>
                               </div>
                             ))}
                             {result.organic.length === 0 && <p className="text-slate-500 text-sm italic">No organic treatments listed.</p>}
                          </div>
                        </div>

                        {/* Chemical */}
                        <div className="space-y-5">
                          <div className="flex items-center gap-3 mb-2 text-sky-400">
                            <FlaskConical size={20} />
                            <h4 className="font-bold">Chemical Pesticides</h4>
                          </div>
                          <div className="space-y-3">
                             {result.chemical.map((item: string, i: number) => (
                               <div key={i} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center justify-between gap-4">
                                 <div className="flex-1">
                                    <p className="text-sm font-bold text-white mb-1">{item}</p>
                                    <p className="text-[10px] text-slate-400 uppercase">Chemical Control</p>
                                 </div>
                                 <button className="bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                   <ShoppingBag size={12} />
                                   Buy Now
                                 </button>
                               </div>
                             ))}
                             {result.chemical.length === 0 && <p className="text-slate-500 text-sm italic">No chemical treatments listed.</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Chat History Section */}
            {chatHistory.length > 0 && (
              <div className="px-8 pb-24 space-y-6 border-t border-slate-100 pt-8 mt-8">
                <h3 className="text-xl font-bold text-slate-900">Follow-up Q&A</h3>
                <div ref={scrollRef} className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                  {chatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-4 rounded-2xl max-w-[85%] ${chat.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <p className="text-sm font-semibold leading-relaxed">{chat.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
        <div className="bg-white/95 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-3 flex items-center gap-3 shadow-2xl">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-4 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all shrink-0"
            title="Upload Picture"
          >
            <Camera size={28} />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </button>
          
          <div className="flex-1">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about nutrients, deficiencies..."
              className="w-full bg-slate-100 rounded-2xl py-4 px-6 text-slate-800 font-bold outline-none focus:bg-white transition-all text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (image || inputText.trim()) && !loading) {
                  e.preventDefault();
                  handleAction();
                }
              }}
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => handleAction()}
              disabled={(!image && !inputText.trim()) || loading}
              className={`
                p-4 rounded-2xl transition-all shadow-xl active:scale-95
                ${(image || inputText.trim()) && !loading 
                  ? 'bg-emerald-600 text-white hover:scale-110 shadow-emerald-200' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
              `}
            >
              {loading ? <Loader2 className="animate-spin" size={28} /> : <Send size={28} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseScanner;
