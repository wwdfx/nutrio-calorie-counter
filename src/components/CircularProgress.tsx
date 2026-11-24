import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0..1
  color: string;
  trackColor?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  size,
  strokeWidth,
  progress,
  color,
  trackColor = '#EEEEEE',
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, isNaN(progress) ? 0 : progress));
  const strokeDashoffset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          stroke={trackColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

interface MultiRingDonutProps {
  size: number;
  strokeWidth: number;
  carbsPct: number; // e.g. 0.35
  proteinPct: number; // e.g. 0.20
  fatPct: number; // e.g. 0.45
  children?: React.ReactNode;
}

export function MacroDonutChart({
  size,
  strokeWidth,
  carbsPct,
  proteinPct,
  fatPct,
  children,
}: MultiRingDonutProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = carbsPct + proteinPct + fatPct || 1;
  const cFrac = carbsPct / total;
  const pFrac = proteinPct / total;
  const fFrac = fatPct / total;

  const cLen = circumference * cFrac;
  const pLen = circumference * pFrac;
  const fLen = circumference * fFrac;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Protein segment (orange) */}
        <Circle
          stroke="#FF981F"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${pLen} ${circumference - pLen}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Fat segment (blue) */}
        <Circle
          stroke="#1A96F0"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${fLen} ${circumference - fLen}`}
          strokeDashoffset={-pLen}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Carbs segment (red) */}
        <Circle
          stroke="#F54336"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${cLen} ${circumference - cLen}`}
          strokeDashoffset={-(pLen + fLen)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
