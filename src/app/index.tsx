import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useNutrio } from '@/context/NutrioContext';
import { COLORS } from '@/constants/theme';
import { NutrioLogo } from '@/components/NutrioLogo';

export default function IndexSplashGate() {
  const { isHydrated, user } = useNutrio();
  const [spinAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spinAnim]);

  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(() => {
      if (!user) {
        router.replace('/(auth)/walkthrough');
      } else if (!user.onboardingCompleted) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    }, 1400);
    return () => clearTimeout(timer);
  }, [isHydrated, user]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.centerBlock}>
        <NutrioLogo size={108} color="#212121" eyeColor={COLORS.primary} />
        <Text style={styles.brandText}>Nutrio</Text>
      </View>

      <View style={styles.spinnerWrap}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Svg width={64} height={64} viewBox="0 0 64 64">
            <Defs>
              <LinearGradient id="splashSpin" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#181A20" stopOpacity="1" />
                <Stop offset="65%" stopColor="#181A20" stopOpacity="0.65" />
                <Stop offset="100%" stopColor="#181A20" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Circle
              cx="32"
              cy="32"
              r="24"
              stroke="url(#splashSpin)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeDasharray="112 40"
              fill="none"
            />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 84,
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  brandText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#212121',
    letterSpacing: -0.5,
  },
  spinnerWrap: {
    marginBottom: 18,
  },
});
