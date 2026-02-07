
import React, { useState, useRef, useEffect } from 'react';
import { detectWildAnimals } from '../services/geminiService';
import { 
  ShieldAlert, Video, Camera, Loader2, History, Bell, 
  AlertCircle, Play, Square, Settings, RefreshCcw, Power, 
  Scan, Info, Bug, Zap
} from 'lucide-react';

interface CCTVMonitorProps {
  onAlert: (animal: string, description: string, image: string) => void;
}

const CCTVMonitor: React.FC<CCTVMonitorProps> = ({ onAlert }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("System Idle");
  const [recentAlerts, setRecentAlerts] = useState<{ id: string, animal: string, time: string, img: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const monitorInterval = useRef<number | null>(null);

  const startStream = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsMonitoring(true);
          setStatus("Monitoring active...");
          // Start periodic scans every 20 seconds for production stability
          monitorInterval.current = window.setInterval(captureAndAnalyze, 20000);
        };
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError(err.name === 'NotAllowedError' ? "Permission Denied: Please allow camera access." : "Hardware Error: Could not connect to camera.");
      setStatus("Error: Connection Failed");
    }
  };

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (monitorInterval.current) {
      clearInterval(monitorInterval.current);
      monitorInterval.current = null;
    }
    setIsMonitoring(false);
    setLoading(false);
    setStatus("System Offline");
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || loading || !isMonitoring) return;
    
    // Validate video is actually playing and has dimensions
    if (videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) {
      console.warn("Video stream not ready for capture");
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Capture frame
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    setLoading(true);
    setLastScanTime(new Date().toLocaleTimeString());
    
    try {
      const result = await detectWildAnimals(base64);
      processAIDetection(result, canvas.toDataURL('image/jpeg'));
    } catch (err) {
      console.error("Analysis error:", err);
      setStatus("Service Unavailable - Retrying...");
    } finally {
      setLoading(false);
    }
  };

  const processAIDetection = (result: string | undefined, image: string) => {
    if (result?.includes("ALERT:")) {
      const animalMatch = result.match(/ALERT: (.*) detected!/);
      const animalName = animalMatch ? animalMatch[1] : "Unidentified Animal";
      const description = result.split('\n')[1] || "Unusual movement detected in crop field.";
      
      const newAlert = {
        id: Date.now().toString(),
        animal: animalName,
        time: new Date().toLocaleTimeString(),
        img: image
      };
      
      setRecentAlerts(prev => [newAlert, ...prev].slice(0, 10));
      onAlert(animalName, result, image);
      setStatus(`WARNING: ${animalName.toUpperCase()} DETECTED!`);
      
      // Haptic/Visual feedback
      if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
    } else {
      setStatus("Field Clear - No threats detected");
    }
  };

  // Helper to simulate an intrusion for testing purposes
  const simulateIntrusion = () => {
    if (!isMonitoring) {
      alert("Please start the monitor first to simulate an intrusion on the active feed.");
      return;
    }
    setStatus("SIMULATING DETECTION...");
    setLoading(true);
    
    setTimeout(() => {
      const mockResult = "ALERT: Wild Boar detected!\nSimulation: A large wild boar is damaging the root crops.";
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (context && videoRef.current && canvas) {
         // Just capture whatever is on camera now but force the alert
         canvas.width = videoRef.current.videoWidth;
         canvas.height = videoRef.current.videoHeight;
         context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
         processAIDetection(mockResult, canvas.toDataURL('image/jpeg'));
      }
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (monitorInterval.current) clearInterval(monitorInterval.current);
      stopStream();
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
               <ShieldAlert size={24} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Intrusion Guard</h2>
          </div>
          <p className="text-slate-500 font-medium text-sm">Automated wild animal detection for farm security.</p>
        </div>
        <div className="flex gap-2">
          {!isMonitoring ? (
            <button 
              onClick={startStream}
              className="px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 flex items-center gap-2 transition-all shadow-xl shadow-emerald-200 active:scale-95"
            >
              <Play size={18} fill="currentColor" />
              Activate Monitor
            </button>
          ) : (
            <button 
              onClick={stopStream}
              className="px-8 py-3 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 flex items-center gap-2 transition-all shadow-xl shadow-rose-200 active:scale-95"
            >
              <Power size={18} />
              Stop Feed
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-700 font-bold text-sm animate-in shake duration-500">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="relative aspect-video bg-[#0f172a] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-900 group">
            {isMonitoring ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                
                {/* AI Scanning Radar Overlay */}
                {loading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-500/10 pointer-events-none">
                    <div className="w-64 h-64 border-2 border-emerald-500/50 rounded-full animate-ping opacity-40" />
                    <div className="absolute w-full h-1 bg-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-scan-line top-0" />
                    <div className="bg-emerald-600/90 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/20 shadow-2xl">
                      <Loader2 className="animate-spin text-white" size={20} />
                      <span className="text-white text-xs font-black uppercase tracking-widest">AI Scanning...</span>
                    </div>
                  </div>
                )}

                <div className="absolute top-6 left-6 flex flex-wrap gap-2 z-30">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Live</span>
                  </div>
                  <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">CAM_01 / HQ</span>
                  </div>
                  {loading && (
                    <div className="px-3 py-1.5 bg-emerald-600/80 backdrop-blur-md rounded-full border border-emerald-400/30">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                        <Zap size={10} fill="currentColor" /> AI Processing
                      </span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between z-30">
                   <div className="space-y-2">
                      <div className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest backdrop-blur-xl border-2 shadow-2xl transition-all duration-500 ${status.includes("WARNING") ? 'bg-rose-500 text-white border-white/40 scale-105' : 'bg-black/60 text-emerald-400 border-white/10'}`}>
                         {status}
                      </div>
                      {lastScanTime && (
                        <p className="text-[10px] text-white/60 font-black uppercase tracking-tight ml-1">Next Auto-Scan in ~20s</p>
                      )}
                   </div>
                   
                   <div className="flex gap-2">
                      <button 
                        onClick={captureAndAnalyze}
                        disabled={loading}
                        className="w-12 h-12 rounded-2xl bg-emerald-600/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-emerald-500 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                        title="Force AI Scan"
                      >
                        <RefreshCcw className={loading ? 'animate-spin' : ''} size={20} />
                      </button>
                      <button 
                        onClick={stopStream}
                        className="w-12 h-12 rounded-2xl bg-rose-600/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-rose-500 transition-all shadow-xl active:scale-95"
                        title="Shutdown Feed"
                      >
                        <Power size={20} />
                      </button>
                   </div>
                </div>

                {status.includes("WARNING") && (
                   <div className="absolute inset-0 border-[16px] border-rose-600/40 animate-pulse pointer-events-none z-10" />
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-6 text-slate-400 p-12 text-center">
                <div className="relative">
                  <Video size={80} className="opacity-10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <ShieldAlert size={32} className="text-slate-800" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-white uppercase tracking-widest text-sm">Monitoring Offline</h3>
                  <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">Ensure camera permissions are granted. The AI will scan the feed every 20 seconds for wildlife activity.</p>
                </div>
                <button 
                  onClick={startStream} 
                  className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-900/40 active:scale-95"
                >
                  Start Live Feed
                </button>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-emerald-200 transition-all">
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                <Bell size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Smart Alerts</h4>
                <p className="text-[10px] text-slate-500 uppercase font-black">Mobile Push Active</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-emerald-200 transition-all">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <Scan size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Vision Engine</h4>
                <p className="text-[10px] text-slate-500 uppercase font-black">Gemini 3 Flash</p>
              </div>
            </div>
            <button 
              onClick={simulateIntrusion}
              className="bg-amber-50 p-5 rounded-3xl border border-amber-100 shadow-sm flex items-center gap-4 group hover:bg-amber-100 transition-all text-left"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm group-hover:rotate-12 transition-transform">
                <Bug size={24} />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Test Detection</h4>
                <p className="text-[10px] text-amber-600 uppercase font-black tracking-tight">Verify AI Logic</p>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden max-h-[700px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History size={18} className="text-slate-400" />
              <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Intrusion Log</h3>
            </div>
            {recentAlerts.length > 0 && (
              <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {recentAlerts.length}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30">
            {recentAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-10 space-y-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <ShieldAlert size={32} className="text-slate-200" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-tighter leading-tight">Monitoring in progress... No threats logged.</p>
              </div>
            ) : (
              recentAlerts.map(alert => (
                <div key={alert.id} className="group bg-white rounded-2xl p-3 border border-slate-200 hover:border-rose-200 transition-all shadow-sm">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-black relative">
                    <img src={alert.img} alt="Detection" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-2 right-2 bg-rose-600 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-xl">CAPTURED</div>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-black text-rose-600 uppercase">{alert.animal}</span>
                    <span className="text-[9px] text-slate-400 font-bold">{alert.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-white border-t border-slate-100">
            <button 
              onClick={() => setRecentAlerts([])}
              className="w-full py-3 text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors"
            >
              Clear Logs
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
          position: absolute;
          left: 0;
          right: 0;
          z-index: 25;
        }
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default CCTVMonitor;
