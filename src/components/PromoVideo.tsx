import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';

interface PromoVideoProps {
  onClose?: () => void;
}

const PromoVideo: React.FC<PromoVideoProps> = ({ onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(21);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState(-1);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const demoScript = [
    { time: 0, text: "Welcome to Edu-Fam - Kenya's most comprehensive school management system" },
    { time: 3, text: "Built specifically for CBC curriculum and M-Pesa integration" },
    { time: 6, text: "Manage students, grades, attendance, and finances all in one place" },
    { time: 9, text: "Real-time communication between teachers, students, and parents" },
    { time: 12, text: "Advanced analytics and reporting for data-driven decisions" },
    { time: 15, text: "Trusted by over 1,000 schools across Kenya" },
    { time: 18, text: "Start your free trial today and transform your school's future" }
  ];

  // Load voices on component mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('Voices loaded:', voices.length);
        setVoicesLoaded(true);
      }
    };

    // Check if voices are already loaded
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const stopAllSpeech = () => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    if (speechUtteranceRef.current) {
      speechUtteranceRef.current = null;
    }
  };

  const speakText = (text: string, index: number) => {
    if (isMuted || !voicesLoaded || !('speechSynthesis' in window)) {
      return;
    }

    console.log('Speaking:', text, 'Index:', index);
    
    // Stop any existing speech
    stopAllSpeech();
    
    // Small delay to ensure cancellation is complete
    speechTimeoutRef.current = setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      
      // Select the best available voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Natural'))
      ) || voices.find(voice => voice.lang.startsWith('en-US')) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        console.log('Speech started for index:', index);
      };

      utterance.onend = () => {
        console.log('Speech ended for index:', index);
        speechUtteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
        speechUtteranceRef.current = null;
      };
      
      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const getCurrentScript = () => {
    const scriptIndex = demoScript.findIndex((script, index) => {
      const nextScript = demoScript[index + 1];
      return currentTime >= script.time && (!nextScript || currentTime < nextScript.time);
    });
    
    if (scriptIndex !== -1) {
      return { script: demoScript[scriptIndex], index: scriptIndex };
    }
    
    return { script: demoScript[0], index: 0 };
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stopAllSpeech();
      setIsPlaying(false);
      setCurrentSpeechIndex(-1);
    } else {
      // Play
      setIsPlaying(true);
      
      // Start speaking current script immediately
      const { script, index } = getCurrentScript();
      if (!isMuted) {
        speakText(script.text, index);
        setCurrentSpeechIndex(index);
      }
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= duration) {
            // End of video
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            stopAllSpeech();
            setIsPlaying(false);
            setCurrentTime(0);
            setCurrentSpeechIndex(-1);
            return 0;
          }
          return newTime;
        });
      }, 100);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (newMuted) {
      stopAllSpeech();
      setCurrentSpeechIndex(-1);
    } else if (isPlaying && voicesLoaded) {
      const { script, index } = getCurrentScript();
      speakText(script.text, index);
      setCurrentSpeechIndex(index);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    const clampedTime = Math.max(0, Math.min(duration, newTime));
    
    setCurrentTime(clampedTime);
    setCurrentSpeechIndex(-1); // Reset speech tracking
    
    if (isPlaying && !isMuted && voicesLoaded) {
      const { script, index } = getCurrentScript();
      speakText(script.text, index);
      setCurrentSpeechIndex(index);
    }
  };

  // Handle script changes for voiceover
  useEffect(() => {
    if (!isPlaying || isMuted || !voicesLoaded) {
      return;
    }

    const { index } = getCurrentScript();
    
    // Only trigger new speech if we've moved to a different script
    if (index !== currentSpeechIndex && index >= 0) {
      const script = demoScript[index];
      if (script) {
        speakText(script.text, index);
        setCurrentSpeechIndex(index);
      }
    }
  }, [Math.floor(currentTime), isPlaying, isMuted, voicesLoaded, currentSpeechIndex]);

  // Auto-start when voices are loaded
  useEffect(() => {
    if (voicesLoaded) {
      console.log('Auto-starting video with voiceover');
      setIsPlaying(true);
      
      // Start with first script
      speakText(demoScript[0].text, 0);
      setCurrentSpeechIndex(0);
      
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= duration) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            stopAllSpeech();
            setIsPlaying(false);
            setCurrentTime(0);
            setCurrentSpeechIndex(-1);
            return 0;
          }
          return newTime;
        });
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopAllSpeech();
    };
  }, [voicesLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopAllSpeech();
    };
  }, []);

  const { script } = getCurrentScript();

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-900 via-green-800 to-purple-900 rounded-2xl overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20 animate-pulse"></div>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          ></div>
        ))}
      </div>

      {onClose && (
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full p-2"
        >
          <X className="w-6 h-6" />
        </Button>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 md:p-8">
        <div className="text-center space-y-4 md:space-y-6 max-w-4xl w-full">
          <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 md:mb-6 animate-pulse">
            <img 
              src="/lovable-uploads/0d049285-3d91-4a2b-ad37-6e375c4ce0e5.png" 
              alt="EduFam Logo" 
              className="w-10 h-10 md:w-16 md:h-16 object-contain"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
            {[
              { icon: "🎓", title: "Student Management" },
              { icon: "📊", title: "CBC Grading" },
              { icon: "💰", title: "M-Pesa Integration" },
              { icon: "📱", title: "Parent Portal" }
            ].map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="text-xl md:text-2xl mb-1 md:mb-2">{feature.icon}</div>
                <div className="text-xs md:text-sm font-medium">{feature.title}</div>
              </div>
            ))}
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 md:p-6 mb-4 md:mb-6 max-w-3xl mx-auto min-h-[60px] md:min-h-[80px] flex items-center justify-center">
            <p className="text-sm md:text-lg italic text-center leading-relaxed">
              {script.text}
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2 md:space-x-4 mb-3 md:mb-4">
            <Button
              onClick={handlePlayPause}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30"
              size="lg"
            >
              {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
            </Button>
            
            <Button
              onClick={toggleMute}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30"
              size="lg"
            >
              {isMuted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
            </Button>

            <div className="text-xs md:text-sm font-mono bg-black/20 px-2 md:px-3 py-1 md:py-2 rounded">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="w-full max-w-md mx-auto mb-4 md:mb-6">
            <div 
              className="bg-white/20 rounded-full h-2 md:h-3 cursor-pointer hover:bg-white/30 transition-colors"
              onClick={handleSeek}
            >
              <div 
                className="bg-gradient-to-r from-blue-400 to-green-400 h-2 md:h-3 rounded-full transition-all duration-300 relative"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-3 md:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button 
                onClick={() => window.open('https://calendly.com/edufam-demo', '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base"
                size="lg"
              >
                Schedule Live Demo
              </Button>
              <Button 
                onClick={() => window.open('mailto:sales@edufam.co.ke', '_blank')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-900 text-sm md:text-base"
                size="lg"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoVideo;
