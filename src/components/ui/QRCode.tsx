import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  color?: {
    dark?: string;
    light?: string;
  };
}

const QRCodeComponent: React.FC<QRCodeProps> = ({
  value,
  size = 128,
  className = "",
  errorCorrectionLevel = "M",
  color = {
    dark: "#000000",
    light: "#FFFFFF",
  },
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: color,
        errorCorrectionLevel: errorCorrectionLevel,
      }).catch((err) => {
        console.error("Error generating QR code:", err);
      });
    }
  }, [value, size, color, errorCorrectionLevel]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block" }}
    />
  );
};

export default QRCodeComponent;
