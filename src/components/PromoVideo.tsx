
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface PromoVideoProps {
  onClose?: () => void;
}

const PromoVideo: React.FC<PromoVideoProps> = ({ onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Demo script for voice-over
  const demoScript = [
    { time: 0, text: "Welcome to EduFam - Kenya's most comprehensive school management system" },
    { time: 3, text: "Built specifically for CBC curriculum and M-Pesa integration" },
    { time: 6, text: "Manage students, grades, attendance, and finances all in one place" },
    { time: 9, text: "Real-time communication between teachers, students, and parents" },
    { time: 12, text: "Advanced analytics and reporting for data-driven decisions" },
    { time: 15, text: "Trusted by over 1,000 schools across Kenya" },
    { time: 18, text: "Start your free trial today and transform your school's future" }
  ];

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-900 via-green-800 to-purple-900 rounded-2xl overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20 animate-pulse"></div>
        {[...Array(20)].map((_, i) => (
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

      {/* Video Content Simulation */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover opacity-0"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        muted={isMuted}
      >
        {/* Placeholder - in a real implementation, this would be your actual promotional video */}
      </video>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <div className="text-center space-y-6 p-8">
          <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 animate-pulse">
            <img 
              src="/lovable-uploads/0d049285-3d91-4a2b-ad37-6e375c4ce0e5.png" 
              alt="EduFam Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          
          <h2 className="text-4xl font-bold mb-4 animate-fade-in">
            EduFam Demo Video
          </h2>
          
          <p className="text-xl mb-6 max-w-2xl animate-fade-in">
            Experience Kenya's most comprehensive school management system designed for CBC curriculum and M-Pesa integration
          </p>

          {/* Demo Features Showcase */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: "🎓", title: "Student Management" },
              { icon: "📊", title: "CBC Grading" },
              { icon: "💰", title: "M-Pesa Integration" },
              { icon: "📱", title: "Parent Portal" }
            ].map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="text-2xl mb-2">{feature.icon}</div>
                <div className="text-sm font-medium">{feature.title}</div>
              </div>
            ))}
          </div>

          {/* Current Demo Script Display */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-6 max-w-3xl mx-auto">
            <p className="text-lg italic">
              {demoScript.find(script => currentTime >= script.time && currentTime < (demoScript[demoScript.indexOf(script) + 1]?.time || Infinity))?.text || demoScript[0].text}
            </p>
          </div>

          {/* Video Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={handlePlayPause}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30"
              size="lg"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            
            <Button
              onClick={toggleMute}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30"
              size="lg"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </Button>

            <div className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration || 21)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / (duration || 21)) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-blue-200">
              This is a demo showcase. In production, this would be a real promotional video highlighting EduFam's features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.open('https://calendly.com/edufam-demo', '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                Schedule Live Demo
              </Button>
              <Button 
                onClick={() => window.open('mailto:sales@edufam.co.ke', '_blank')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-900"
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
