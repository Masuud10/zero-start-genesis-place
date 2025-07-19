import React from "react";
import { useUIEnhancement } from "@/contexts/UIEnhancementContext";
import { EnhancedCard } from "./EnhancedCard";

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  title: string;
  subtitle?: string;
  height?: number;
  showGrid?: boolean;
  animate?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  subtitle,
  height = 200,
  showGrid = true,
  animate = true,
}) => {
  const { getChartColors } = useUIEnhancement();
  const colors = getChartColors();

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue;

  return (
    <EnhancedCard variant="elevated" animation="fade" className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="relative" style={{ height }}>
          <svg width="100%" height={height} className="overflow-visible">
            {/* Grid lines */}
            {showGrid && (
              <g className="text-gray-200">
                {[0, 25, 50, 75, 100].map((percent, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={(height * percent) / 100}
                    x2="100%"
                    y2={(height * percent) / 100}
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                ))}
              </g>
            )}

            {/* Line path */}
            <path
              d={data
                .map((point, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const y = 100 - ((point.value - minValue) / range) * 100;
                  return `${i === 0 ? "M" : "L"} ${x}% ${y}%`;
                })
                .join(" ")}
              stroke={colors[0]}
              strokeWidth="3"
              fill="none"
              className={animate ? "animate-dash" : ""}
              style={{
                strokeDasharray: animate ? "5,5" : "none",
                animation: animate ? "dash 2s linear infinite" : "none",
              }}
            />

            {/* Data points */}
            {data.map((point, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - ((point.value - minValue) / range) * 100;
              return (
                <circle
                  key={i}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill={colors[0]}
                  className={animate ? "animate-pulse" : ""}
                />
              );
            })}
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
            <span>{maxValue.toLocaleString()}</span>
            <span>{((maxValue + minValue) / 2).toLocaleString()}</span>
            <span>{minValue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </EnhancedCard>
  );
};

interface BarChartProps {
  data: ChartData[];
  title: string;
  subtitle?: string;
  height?: number;
  horizontal?: boolean;
  animate?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  subtitle,
  height = 200,
  horizontal = false,
  animate = true,
}) => {
  const { getChartColors } = useUIEnhancement();
  const colors = getChartColors();
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <EnhancedCard variant="elevated" animation="slide" className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            const color = item.color || colors[index % colors.length];

            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="text-muted-foreground">
                    {item.value.toLocaleString()}
                  </span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: animate ? "0%" : `${percentage}%`,
                      backgroundColor: color,
                    }}
                    onAnimationEnd={() => {
                      if (animate) {
                        const element = document.querySelector(
                          `[data-bar="${index}"]`
                        );
                        if (element && element instanceof HTMLElement) {
                          element.style.width = `${percentage}%`;
                        }
                      }
                    }}
                    data-bar={index}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </EnhancedCard>
  );
};

interface PieChartProps {
  data: ChartData[];
  title: string;
  subtitle?: string;
  size?: number;
  animate?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  subtitle,
  size = 200,
  animate = true,
}) => {
  const { getChartColors } = useUIEnhancement();
  const colors = getChartColors();

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = center * 0.8;

  let currentAngle = -90; // Start from top

  const createArc = (
    startAngle: number,
    endAngle: number,
    largeArc: boolean
  ) => {
    const startX = center + radius * Math.cos((startAngle * Math.PI) / 180);
    const startY = center + radius * Math.sin((startAngle * Math.PI) / 180);
    const endX = center + radius * Math.cos((endAngle * Math.PI) / 180);
    const endY = center + radius * Math.sin((endAngle * Math.PI) / 180);

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${
      largeArc ? 1 : 0
    } 1 ${endX} ${endY} L ${center} ${center} Z`;
  };

  return (
    <EnhancedCard variant="elevated" animation="scale" className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width={size} height={size}>
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const angle = (percentage / 100) * 360;
                const endAngle = currentAngle + angle;
                const largeArc = angle > 180;

                const path = createArc(currentAngle, endAngle, largeArc);
                const color = item.color || colors[index % colors.length];

                currentAngle = endAngle;

                return (
                  <path
                    key={index}
                    d={path}
                    fill={color}
                    className={animate ? "animate-pulse" : ""}
                    style={{
                      opacity: animate ? 0 : 1,
                      animationDelay: `${index * 200}ms`,
                      animationFillMode: "forwards",
                    }}
                  />
                );
              })}
            </svg>

            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {total.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2">
          {data.map((item, index) => {
            const color = item.color || colors[index % colors.length];
            return (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </EnhancedCard>
  );
};

interface DonutChartProps {
  data: ChartData[];
  title: string;
  subtitle?: string;
  size?: number;
  animate?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  subtitle,
  size = 200,
  animate = true,
}) => {
  const { getChartColors } = useUIEnhancement();
  const colors = getChartColors();

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = center * 0.8;
  const innerRadius = center * 0.5;

  let currentAngle = -90;

  const createArc = (
    startAngle: number,
    endAngle: number,
    largeArc: boolean
  ) => {
    const startX = center + radius * Math.cos((startAngle * Math.PI) / 180);
    const startY = center + radius * Math.sin((startAngle * Math.PI) / 180);
    const endX = center + radius * Math.cos((endAngle * Math.PI) / 180);
    const endY = center + radius * Math.sin((endAngle * Math.PI) / 180);

    const innerStartX =
      center + innerRadius * Math.cos((startAngle * Math.PI) / 180);
    const innerStartY =
      center + innerRadius * Math.sin((startAngle * Math.PI) / 180);
    const innerEndX =
      center + innerRadius * Math.cos((endAngle * Math.PI) / 180);
    const innerEndY =
      center + innerRadius * Math.sin((endAngle * Math.PI) / 180);

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${
      largeArc ? 1 : 0
    } 1 ${endX} ${endY} L ${innerEndX} ${innerEndY} A ${innerRadius} ${innerRadius} 0 ${
      largeArc ? 1 : 0
    } 0 ${innerStartX} ${innerStartY} Z`;
  };

  return (
    <EnhancedCard variant="elevated" animation="scale" className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width={size} height={size}>
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const angle = (percentage / 100) * 360;
                const endAngle = currentAngle + angle;
                const largeArc = angle > 180;

                const path = createArc(currentAngle, endAngle, largeArc);
                const color = item.color || colors[index % colors.length];

                currentAngle = endAngle;

                return (
                  <path
                    key={index}
                    d={path}
                    fill={color}
                    className={animate ? "animate-pulse" : ""}
                    style={{
                      opacity: animate ? 0 : 1,
                      animationDelay: `${index * 200}ms`,
                      animationFillMode: "forwards",
                    }}
                  />
                );
              })}
            </svg>

            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">
                  {total.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 gap-2">
          {data.map((item, index) => {
            const color = item.color || colors[index % colors.length];
            return (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-foreground flex-1">
                  {item.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </EnhancedCard>
  );
};

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
  @keyframes dash {
    to {
      stroke-dashoffset: -10;
    }
  }
  
  .animate-dash {
    animation: dash 2s linear infinite;
  }
`;
document.head.appendChild(style);
