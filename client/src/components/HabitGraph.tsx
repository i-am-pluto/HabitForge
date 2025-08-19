import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { generateGraphData, getSuccessfulDaysLast60 } from "@/lib/habitMath";

Chart.register(...registerables);

interface HabitGraphProps {
  habit: {
    completedDates: string[];
    missedDates: string[];
  };
  className?: string;
}

export function HabitGraph({ habit, className = "" }: HabitGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const successfulDays = getSuccessfulDaysLast60(habit.completedDates);
    const { habitData, thresholdData, currentPoint } = generateGraphData(successfulDays, 60);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Habit Strength (H(d) = 1/(1+e^(-k(d-d₀))))',
            data: habitData,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#3B82F6'
          },
          {
            label: 'Tipping Point (y = 0.5)',
            data: thresholdData,
            borderColor: '#6B7280',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 4
          },
          {
            label: 'Current Position',
            data: [currentPoint],
            backgroundColor: '#EF4444',
            borderColor: '#EF4444',
            pointRadius: 8,
            pointHoverRadius: 10,
            showLine: false,
            pointStyle: 'circle'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#374151',
            bodyColor: '#6B7280',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: function(context) {
                return `Day ${context[0].parsed.x}`;
              },
              label: function(context) {
                if (context.datasetIndex === 0) {
                  return `Habit Strength: ${context.parsed.y.toFixed(2)}`;
                } else {
                  return `Threshold: ${context.parsed.y}`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Successful Days (Last 60 Days)',
              font: {
                size: 12,
                weight: 500
              }
            },
            grid: {
              color: '#F3F4F6'
            },
            ticks: {
              color: '#6B7280',
              font: {
                size: 11
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Habit Strength (y-value)',
              font: {
                size: 12,
                weight: 500
              }
            },
            grid: {
              color: '#F3F4F6'
            },
            ticks: {
              color: '#6B7280',
              font: {
                size: 11
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [habit]);

  return (
    <div className={`h-80 ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" data-testid="habit-graph-canvas" />
    </div>
  );
}
