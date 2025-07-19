import React from "react";
import { cn } from "@/lib/utils";
import { useUIEnhancement } from "@/contexts/UIEnhancementContext";

interface EnhancedCardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "gradient" | "glass" | "role";
  role?: string;
  className?: string;
  animation?: "fade" | "slide" | "scale" | "bounce";
  delay?: number;
  onClick?: () => void;
  hover?: boolean;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  variant = "default",
  role,
  className,
  animation = "fade",
  delay = 0,
  onClick,
  hover = true,
}) => {
  const { getCardStyles, getAnimationClasses, getRoleColors } =
    useUIEnhancement();

  const baseClasses = getCardStyles(variant);
  const animationClasses = getAnimationClasses(animation);

  const roleColors = role ? getRoleColors(role) : null;

  const cardClasses = cn(
    baseClasses,
    animationClasses,
    hover && "cursor-pointer hover:shadow-xl hover:-translate-y-1",
    roleColors && variant === "role" && roleColors.bgGradient,
    className
  );

  const style = delay > 0 ? { animationDelay: `${delay}ms` } : {};

  return (
    <div className={cardClasses} style={style} onClick={onClick}>
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  role?: string;
  variant?: "default" | "gradient" | "glass";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  role,
  variant = "default",
}) => {
  const { getRoleColors, getAnimationClasses } = useUIEnhancement();
  const roleColors = role ? getRoleColors(role) : null;

  return (
    <EnhancedCard
      variant={variant}
      role={role}
      animation="scale"
      className="p-6 relative overflow-hidden"
    >
      {/* Background gradient overlay */}
      {variant === "gradient" && roleColors && (
        <div className={`absolute inset-0 ${roleColors.gradient} opacity-5`} />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div
              className={`p-3 rounded-full ${
                roleColors ? roleColors.bgGradient : "bg-blue-100"
              }`}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    </EnhancedCard>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "indigo";
  size?: "sm" | "md" | "lg";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  color = "blue",
  size = "md",
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <EnhancedCard
      variant="elevated"
      animation="slide"
      className={`${sizeClasses[size]} group`}
    >
      <div className="flex items-center space-x-4">
        {icon && (
          <div
            className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p
            className={`font-bold text-foreground ${
              size === "sm"
                ? "text-xl"
                : size === "md"
                ? "text-2xl"
                : "text-3xl"
            }`}
          >
            {value}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </EnhancedCard>
  );
};

interface ProgressCardProps {
  title: string;
  value: number;
  max: number;
  subtitle?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
  showPercentage?: boolean;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  max,
  subtitle,
  color = "blue",
  showPercentage = true,
}) => {
  const percentage = (value / max) * 100;

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  };

  return (
    <EnhancedCard variant="default" animation="fade" className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {showPercentage && (
            <span className="text-sm font-medium text-muted-foreground">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{value}</span>
            <span className="text-muted-foreground">{max}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </EnhancedCard>
  );
};
