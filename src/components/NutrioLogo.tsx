import React from 'react';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

interface NutrioLogoProps {
  size?: number;
  color?: string;
  eyeColor?: string;
}

/**
 * Custom vector recreation of the Nutrio apple-mascot logo shown in
 * Splash (dark on #A1CE50) and Welcome/Header (#A1CE50 on #181A20).
 */
export function NutrioLogo({
  size = 64,
  color = '#A1CE50',
  eyeColor = '#181A20',
}: NutrioLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Leaf tilted top-left */}
      <Path
        d="M48 31 C45 14 31 6 21 8 C20 20 29 31 45 33 Z"
        fill={color}
      />
      {/* Stem tilted top-right */}
      <Path
        d="M50 32 C53 20 61 14 66 13 C68 15 67 19 63 22 C59 25 56 29 55 34 Z"
        fill={color}
      />
      {/* Main rounded apple body */}
      <Circle cx="50" cy="60" r="34" fill={color} />
      {/* Two pill eyes */}
      <Ellipse cx="40" cy="60" rx="5.2" ry="9.5" fill={eyeColor} />
      <Ellipse cx="60" cy="60" rx="5.2" ry="9.5" fill={eyeColor} />
    </Svg>
  );
}
