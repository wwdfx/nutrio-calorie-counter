import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NutrioProvider, useNutrio } from '@/context/NutrioContext';
import { getThemeColors } from '@/constants/theme';

function AppShell() {
  const { themeMode } = useNutrio();
  const theme = getThemeColors(themeMode);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Nutrio — Calorie Counter & AI Food Tracker';
      let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = '/manifest.json';
        document.head.appendChild(manifestLink);
      }
      let themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (!themeMeta) {
        themeMeta = document.createElement('meta');
        themeMeta.name = 'theme-color';
        themeMeta.content = '#A1CE50';
        document.head.appendChild(themeMeta);
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    }
  }, []);

  return (
    <View style={[styles.outerBg, { backgroundColor: themeMode === 'dark' ? '#0D0F14' : '#E8ECE2' }]}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.mobileFrame, { backgroundColor: theme.background }]}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="food/add" />
          <Stack.Screen name="food/create" />
          <Stack.Screen name="food/scan" />
          <Stack.Screen name="food/history" />
          <Stack.Screen name="food/[id]" />
          <Stack.Screen name="weight" />
          <Stack.Screen name="activity" />
        </Stack>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <NutrioProvider>
      <AppShell />
    </NutrioProvider>
  );
}

const styles = StyleSheet.create({
  outerBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.14)',
        }
      : {}),
  },
});
