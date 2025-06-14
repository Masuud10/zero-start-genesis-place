
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const demoScript = [
    { time: 0, text: "Welcome to EduFam - Kenya's most comprehensive school management system" },
    { time: 3, text: "Built specifically for CBC curriculum and M-Pesa integration" },
    { time: 6, text: "Manage students, grades, attendance, and finances all in one place" },
    { time: 9, text: "Real-time communication between teachers, students, and parents" },
    { time: 12, text: "Advanced analytics and reporting for data-driven decisions" },
    { time: 15, text: "Trusted by over 1,000 schools across Kenya" },
    { time: 18, text: "Start your free trial today and transform your school's future" }
  ];

  const getCurrentScript = () => {
    const current = demoScript.find((script, index) => {
      const nextScript = demoScript[index + 1];
      return currentTime >= script.time && (!nextScript || currentTime < nextScript.time);
    });
    return current?.text || demoScript[0].text;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= duration) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setIsPlaying(false);
            setCurrentTime(0);
            return 0;
          }
          return newTime;
        });
      }, 100);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
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
    setCurrentTime(Math.max(0, Math.min(duration, newTime)));
  };

  useEffect(() => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 0.1;
        if (newTime >= duration) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsPlaying(false);
          setCurrentTime(0);
          return 0;
        }
        return newTime;
      });
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [duration]);

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
          
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 animate-fade-in">
            EduFam Demo Video
          </h2>
          
          <p className="text-lg md:text-xl mb-4 md:mb-6 max-w-2xl animate-fade-in px-4">
            Experience Kenya's most comprehensive school management system designed for CBC curriculum and M-Pesa integration
          </p>

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
              {getCurrentScript()}
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
