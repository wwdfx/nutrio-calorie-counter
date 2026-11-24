import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio } from '@/context/NutrioContext';

export default function TabsLayout() {
  const { themeMode, t } = useNutrio();
  const theme = getThemeColors(themeMode);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.divider,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabHome,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: t.tabTracker,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: t.tabInsights,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={24} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="articles"
        options={{
          title: t.tabArticles,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={24} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t.tabAccount,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
