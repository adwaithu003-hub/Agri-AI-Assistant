
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI, translateText } from '../services/geminiService';
import { Send, User, Bot, Loader2, MessageSquare, Trash2, Languages } from 'lucide-react';
import VoiceButton from './VoiceButton';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string, time: string, isTranslating?: boolean }[]>([
    { 
      role: 'model', 
      text: 'Hello! I am Agri, your personal agricultural AI. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const cleanText = (text: string) => {
    if (!text) return "";
    return text.replace(/\*\*/g, '').replace(/###/g, '').replace(/^\s*[\*\-]\s*/gm, '• ').trim();
  };

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const finalInput = overrideInput || input;
    if (!finalInput.trim() || loading) return;

    const userMessage = finalInput;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage, time }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await chatWithAI(userMessage, history);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: cleanText(response || "I couldn't process that. Please try again."),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now.", time: '' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (index: number, language: string) => {
    if (messages[index].isTranslating) return;

    // Update state to show loading for this specific message
    setMessages(prev => prev.map((msg, i) => i === index ? { ...msg, isTranslating: true } : msg));

    try {
      const originalText = messages[index].text;
      const translatedText = await translateText(originalText, language);
      
      setMessages(prev => prev.map((msg, i) => 
        i === index ? { ...msg, text: cleanText(translatedText || originalText), isTranslating: false } : msg
      ));
    } catch (err) {
      console.error("Translation failed", err);
      setMessages(prev => prev.map((msg, i) => i === index ? { ...msg, isTranslating: false } : msg));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] animate-in fade-in duration-500">
      <div className="bg-emerald-600 text-white p-6 rounded-t-3xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-none">Agri Assistant</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></div>
              <p className="text-[10px] opacity-90 uppercase tracking-widest font-black">AI Specialist Online</p>
            </div>
          </div>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="p-2 hover:bg-white/10 rounded-xl transition-all">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 bg-white border-x border-b border-slate-200 overflow-hidden flex flex-col shadow-sm">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`flex gap-4 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 border border-slate-100'}`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                    {msg.isTranslating ? (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-xs font-bold">Translating...</span>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-3 mt-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] text-slate-400 font-bold">{msg.time}</span>
                    
                    {msg.role === 'model' && !msg.isTranslating && (
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <Languages size={12} className="text-slate-400 ml-1 mr-1" />
                        {['Hindi', 'Tamil', 'Malayalam'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => handleTranslate(i, lang)}
                            className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-white text-emerald-600 hover:bg-emerald-50 transition-colors border border-slate-200"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className="text-xs text-slate-500 font-medium tracking-tight uppercase">AI is analyzing...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your agricultural question..."
              className="flex-1 bg-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-100 focus:bg-white transition-all border border-slate-100"
            />
            
            <div className="flex items-center gap-2">
              <VoiceButton 
                onTranscript={(text) => setInput(text)} 
                className="w-14 h-14 rounded-2xl"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-95
                  ${input.trim() && !loading ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                `}
              >
                <Send size={24} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
