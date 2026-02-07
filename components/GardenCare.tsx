
import React, { useState, useRef, useEffect } from 'react';
import { getGardenCareGuide, chatWithAI } from '../services/geminiService';
import { Search, Loader2, BookOpen, Sun, MessageSquare, Send, User, Bot, Leaf } from 'lucide-react';

interface GardenCareProps {
  onResult: (title: string, content: string) => void;
}

const GardenCare: React.FC<GardenCareProps> = ({ onResult }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const cleanText = (text: string) => {
    if (!text) return "";
    return text.replace(/\*\*/g, '').replace(/###/g, '').replace(/^\s*[\*\-]\s*/gm, '• ').trim();
  };

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = overrideQuery || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    try {
      const guide = await getGardenCareGuide(finalQuery);
      const cleanedGuide = cleanText(guide || "No information found.");
      setResult(cleanedGuide);
      onResult(`Care Guide: ${finalQuery}`, cleanedGuide);
      setChatHistory([]);
    } catch (err) {
      console.error(err);
      setResult("Error retrieving guide. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (e?: React.FormEvent, overrideChat?: string) => {
    if (e) e.preventDefault();
    const finalChat = overrideChat || chatInput;
    if (!finalChat.trim() || loading) return;

    const userMessage = finalChat;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const history = chatHistory.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const contextPrompt = result ? `Context: You are discussing ${query}. Previous Guide Info: ${result.substring(0, 500)}... User Question: ${userMessage}` : userMessage;
      
      const response = await chatWithAI(contextPrompt, history);
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        text: cleanText(response || "I couldn't process that. Please try again.") 
      }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Garden Care Encyclopedia</h2>
          <p className="text-slate-600">Get expert advice on planting, soil, water, and seasonal care for any plant.</p>
        </div>
      </header>

      <form onSubmit={handleSearch} className="relative group flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tomatoes, Lavender, Rose..."
            className="w-full pl-14 pr-4 py-5 bg-white border border-slate-200 rounded-3xl text-lg outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all shadow-sm"
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={24} />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="h-[68px] px-8 bg-emerald-600 text-white font-bold rounded-3xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg"
        >
          {loading && !result ? <Loader2 className="animate-spin" /> : 'Search'}
        </button>
      </form>

      {result ? (
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center space-x-3 text-emerald-600 mb-6">
                <BookOpen size={24} />
                <h3 className="text-xl font-bold uppercase tracking-tight">Care Instructions: {query}</h3>
              </div>
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                {result}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                <h4 className="text-emerald-800 font-bold mb-4 flex items-center gap-2">
                  <Sun size={20} /> Quick Checklist
                </h4>
                <ul className="space-y-4 text-emerald-700 text-sm font-semibold">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">1</div>
                    Check soil moisture daily
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">2</div>
                    Ensure proper drainage holes
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">3</div>
                    Monitor for early signs of pests
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">4</div>
                    Prune dead leaves regularly
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl">
            <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold leading-none tracking-tight uppercase text-sm">Agri Care Expert</h3>
                  <p className="text-[10px] opacity-80 mt-1 uppercase font-black">Ask follow-up questions</p>
                </div>
              </div>
            </div>

            <div className="h-80 overflow-y-auto p-6 space-y-4 bg-slate-50/50 custom-scrollbar">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 border border-slate-100'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm text-sm font-semibold leading-relaxed ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleChat} className="p-4 bg-white border-t border-slate-100 flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Ask more about ${query}...`}
                className="flex-1 bg-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-100 focus:bg-white transition-all border border-slate-100"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || loading}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${chatInput.trim() && !loading ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-300'}`}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] p-20 text-center border border-slate-100 shadow-sm">
          <Leaf size={80} className="mx-auto text-emerald-100 mb-6" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Grow Something Beautiful</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Enter a plant name above to unlock its full care profile.</p>
        </div>
      )}
    </div>
  );
};

export default GardenCare;
