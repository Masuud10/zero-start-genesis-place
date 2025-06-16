import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import PromoVideo from "@/components/PromoVideo";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal = ({ isOpen, onClose }: VideoModalProps) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-2 md:p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-blue-900 to-green-900 rounded-2xl md:rounded-3xl w-full h-full md:w-[95vw] md:h-[90vh] md:max-w-6xl overflow-hidden animate-scale-in shadow-2xl transform border border-white/20">
        <div className="p-3 md:p-6 border-b border-white/20 flex items-center justify-between bg-gradient-to-r from-blue-900/80 to-green-900/80 backdrop-blur-sm">
          <h3 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            EduFam Promotional Video
          </h3>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2 md:p-3 hover:bg-white/10 hover:text-white transition-all duration-300 rounded-full text-white/80 hover:scale-110"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>
        <div className="p-1 md:p-2 h-[calc(100%-60px)] md:h-[calc(100%-80px)]">
          <div className="w-full h-full rounded-xl md:rounded-2xl overflow-hidden">
            <PromoVideo onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
