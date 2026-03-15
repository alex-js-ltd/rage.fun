"use client";

import React, { useId } from "react";

interface SquareProgressProps {
  progress: number; // 0..100
  size?: number; // outer box
  strokeWidth?: number;
  radius?: number; // corner roundness
  children?: React.ReactNode; // avatar/content
  trackColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
}

export function SquareProgress({
  progress,
  size = 74,
  strokeWidth = 2,
  radius = 8,
  children,
  trackColor = "#1f2937",
  gradientFrom = "#06b0f9",
  gradientTo = "#f906b0",
  className,
}: SquareProgressProps) {
  const gradId = useId(); // unique per render
  const side = size - strokeWidth;
  // Perimeter of rounded rect: 2*(w+h-2r) + 2πr
  const perimeter = 2 * (side + side - 2 * radius) + 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(100, progress)) / 100) * perimeter;

  return (
    <div
      className={`relative flex items-center justify-center ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-90" // start at top and go clockwise
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>

        {/* Track */}
        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={side}
          height={side}
          rx={radius}
          ry={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* Progress */}
        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={side}
          height={side}
          rx={radius}
          ry={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={perimeter}
          strokeDashoffset={perimeter - dash}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "stroke-dashoffset 200ms ease" }}
        />
      </svg>

      {/* Center content — inset equals stroke + a tiny padding */}
      <div
        className="absolute flex items-center justify-center overflow-hidden rounded-lg"
        style={{
          inset: strokeWidth + 2, // keep it off the ring
        }}
      >
        {children}
      </div>
    </div>
  );
}
