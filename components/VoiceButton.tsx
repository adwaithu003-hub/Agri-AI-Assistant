
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  showLabel?: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ onTranscript, className, showLabel }) => {
  const [isListening, setIsListening] = useState(false);
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check permission status on mount if supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(status => {
          setPermissionState(status.state);
          status.onchange = () => setPermissionState(status.state);
        })
        .catch(() => {
          // Fallback if query not supported
        });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please try Google Chrome or Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setPermissionState('denied');
          alert("Microphone access blocked. Please click the lock icon in your address bar to allow microphone access.");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Dynamic styles based on state
  const getButtonStyles = () => {
    if (permissionState === 'denied') {
      return 'bg-slate-100 text-rose-400 border-2 border-rose-100 cursor-help';
    }
    if (isListening) {
      return 'bg-rose-500 text-white ring-4 ring-rose-200 animate-pulse scale-105';
    }
    return 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 hover:shadow-lg hover:shadow-emerald-100/50';
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative flex items-center justify-center gap-2 transition-all duration-300 shadow-md active:scale-95 ${getButtonStyles()} ${className || 'h-14 w-14 rounded-2xl'}`}
      title={permissionState === 'denied' ? "Microphone access denied" : "Click to speak"}
    >
      {permissionState === 'denied' ? (
        <MicOff size={20} />
      ) : isListening ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          {showLabel && <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Listening</span>}
        </>
      ) : (
        <>
          <Mic size={20} />
          {showLabel && <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Speak</span>}
        </>
      )}
      
      {permissionState === 'denied' && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></span>
      )}
    </button>
  );
};

export default VoiceButton;
