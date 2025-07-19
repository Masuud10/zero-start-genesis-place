import React, { createContext, useContext, useState, ReactNode } from "react";

interface UIEnhancementContextType {
  // Theme and styling
  theme: "light" | "dark" | "auto";
  setTheme: (theme: "light" | "dark" | "auto") => void;

  // Animation preferences
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;

  // Visual effects
  gradientsEnabled: boolean;
  setGradientsEnabled: (enabled: boolean) => void;

  // Color schemes for different roles
  getRoleColors: (role: string) => {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
    bgGradient: string;
  };

  // Animation classes
  getAnimationClasses: (type: "fade" | "slide" | "scale" | "bounce") => string;

  // Card styling
  getCardStyles: (
    variant: "default" | "elevated" | "gradient" | "glass" | "role"
  ) => string;

  // Button styling
  getButtonStyles: (
    variant: "primary" | "secondary" | "gradient" | "glass"
  ) => string;

  // Chart colors
  getChartColors: () => string[];

  // Loading animations
  getLoadingAnimation: () => ReactNode;
}

const UIEnhancementContext = createContext<
  UIEnhancementContextType | undefined
>(undefined);

export const useUIEnhancement = () => {
  const context = useContext(UIEnhancementContext);
  if (context === undefined) {
    throw new Error(
      "useUIEnhancement must be used within a UIEnhancementProvider"
    );
  }
  return context;
};

interface UIEnhancementProviderProps {
  children: ReactNode;
}

export const UIEnhancementProvider: React.FC<UIEnhancementProviderProps> = ({
  children,
}) => {
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [gradientsEnabled, setGradientsEnabled] = useState(true);

  const getRoleColors = (role: string) => {
    const colorSchemes = {
      super_admin: {
        primary: "from-yellow-500 to-orange-500",
        secondary: "from-yellow-400 to-orange-400",
        accent: "text-yellow-600",
        gradient: "bg-gradient-to-r from-yellow-500 to-orange-500",
        bgGradient: "bg-gradient-to-br from-yellow-50 to-orange-50",
      },
      support_hr: {
        primary: "from-blue-500 to-indigo-500",
        secondary: "from-blue-400 to-indigo-400",
        accent: "text-blue-600",
        gradient: "bg-gradient-to-r from-blue-500 to-indigo-500",
        bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50",
      },
      software_engineer: {
        primary: "from-purple-500 to-pink-500",
        secondary: "from-purple-400 to-pink-400",
        accent: "text-purple-600",
        gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
        bgGradient: "bg-gradient-to-br from-purple-50 to-pink-50",
      },
      sales_marketing: {
        primary: "from-green-500 to-emerald-500",
        secondary: "from-green-400 to-emerald-400",
        accent: "text-green-600",
        gradient: "bg-gradient-to-r from-green-500 to-emerald-500",
        bgGradient: "bg-gradient-to-br from-green-50 to-emerald-50",
      },
      finance: {
        primary: "from-emerald-500 to-teal-500",
        secondary: "from-emerald-400 to-teal-400",
        accent: "text-emerald-600",
        gradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
        bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
      },
    };

    return (
      colorSchemes[role as keyof typeof colorSchemes] ||
      colorSchemes.super_admin
    );
  };

  const getAnimationClasses = (type: "fade" | "slide" | "scale" | "bounce") => {
    if (!animationsEnabled) return "";

    const animations = {
      fade: "animate-in fade-in duration-500 ease-out",
      slide: "animate-in slide-in-from-bottom-4 duration-500 ease-out",
      scale: "animate-in zoom-in-95 duration-300 ease-out",
      bounce: "animate-in bounce-in duration-500 ease-out",
    };

    return animations[type];
  };

  const getCardStyles = (
    variant: "default" | "elevated" | "gradient" | "glass" | "role"
  ) => {
    const baseClasses =
      "rounded-xl border shadow-sm transition-all duration-300";

    const variants = {
      default: `${baseClasses} bg-white hover:shadow-md`,
      elevated: `${baseClasses} bg-white shadow-lg hover:shadow-xl transform hover:-translate-y-1`,
      gradient: `${baseClasses} bg-gradient-to-br from-white to-gray-50 hover:shadow-lg`,
      glass: `${baseClasses} bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90`,
      role: `${baseClasses} bg-white hover:shadow-md`,
    };

    return variants[variant];
  };

  const getButtonStyles = (
    variant: "primary" | "secondary" | "gradient" | "glass"
  ) => {
    const baseClasses =
      "rounded-lg font-medium transition-all duration-300 transform hover:scale-105";

    const variants = {
      primary: `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg`,
      secondary: `${baseClasses} bg-gray-100 text-gray-900 hover:bg-gray-200`,
      gradient: `${baseClasses} bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:shadow-lg`,
      glass: `${baseClasses} bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 hover:bg-white/30`,
    };

    return variants[variant];
  };

  const getChartColors = () => {
    return [
      "#3B82F6", // Blue
      "#10B981", // Green
      "#F59E0B", // Yellow
      "#EF4444", // Red
      "#8B5CF6", // Purple
      "#06B6D4", // Cyan
      "#F97316", // Orange
      "#EC4899", // Pink
      "#84CC16", // Lime
      "#6366F1", // Indigo
    ];
  };

  const getLoadingAnimation = () => {
    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-8 h-8 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  };

  const value: UIEnhancementContextType = {
    theme,
    setTheme,
    animationsEnabled,
    setAnimationsEnabled,
    gradientsEnabled,
    setGradientsEnabled,
    getRoleColors,
    getAnimationClasses,
    getCardStyles,
    getButtonStyles,
    getChartColors,
    getLoadingAnimation,
  };

  return (
    <UIEnhancementContext.Provider value={value}>
      {children}
    </UIEnhancementContext.Provider>
  );
};
