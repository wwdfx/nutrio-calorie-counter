import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio, MealType } from '@/context/NutrioContext';
import { SetIconModal } from '@/components/SetIconModal';

/**
 * Dedicated full-screen Quick Log route matching Stage 10 Screens 4 & 5:
 * - Blank initial state: centered '+' circle badge, Food Name & Calorie (kcal) placeholders, muted '+ Add' CTA
 * - Filled state: chosen icon (e.g. 🥙 Stuffed Flatbread, 215 kcal), bright lime '+ Add' CTA
 */
export default function QuickLogScreen() {
  const { meal } = useLocalSearchParams<{ meal?: string }>();
  const { themeMode, t, createCustomFood, addFoodIntake } = useNutrio();
  const theme = getThemeColors(themeMode);

  const targetMeal: MealType =
    meal === 'Breakfast' || meal === 'Lunch' || meal === 'Dinner' || meal === 'Snacks'
      ? meal
      : 'Dinner';

  const [emoji, setEmoji] = useState('');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const isFormReady =
    foodName.trim().length > 0 && calories.trim().length > 0;

  const handleAdd = async () => {
    if (!isFormReady) return;
    const cals = Number(calories) || 0;
    const created = await createCustomFood({
      name: foodName.trim(),
      emoji: emoji || '🥙',
      servingGrams: 100,
      unit: 'gram (g)',
      calories: cals,
      carbs: Math.round((cals * 0.45) / 4),
      protein: Math.round((cals * 0.25) / 4),
      fat: Math.round((cals * 0.3) / 9),
      isPersonal: true,
    });
    await addFoodIntake(targetMeal, created, 1);
    router.replace({ pathname: '/food/history', params: { meal: targetMeal } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Top Navbar: X on left, centered Quick Log title */}
      <View style={[styles.navbar, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>{t.quickLog}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Centered Circular Icon Badge: '+' when empty, chosen icon when set */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={[
              styles.avatarCircle,
              { borderColor: theme.inputBorder, backgroundColor: theme.background },
            ]}
            onPress={() => setIconPickerOpen(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t.setIcon}
          >
            {emoji ? (
              <Text style={{ fontSize: 44 }}>{emoji}</Text>
            ) : (
              <Ionicons name="add" size={38} color={theme.text} />
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {/* Food Name */}
        <View style={styles.fieldFull}>
          <Text style={[styles.label, { color: theme.text }]}>{t.foodName}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            value={foodName}
            onChangeText={setFoodName}
            placeholder={t.foodNamePlaceholder}
            placeholderTextColor={theme.textMuted}
          />
        </View>

        {/* Calorie (kcal) */}
        <View style={styles.fieldFull}>
          <Text style={[styles.label, { color: theme.text }]}>{t.caloriesKcal}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            value={calories}
            onChangeText={setCalories}
            placeholder={t.example200}
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
          />
        </View>
      </ScrollView>

      {/* Bottom Sticky '+ Add' Pill CTA */}
      <View
        style={[
          styles.bottomBar,
          { borderTopColor: theme.divider, backgroundColor: theme.background },
        ]}
      >
        <TouchableOpacity
          style={[styles.addBtn, !isFormReady && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!isFormReady}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color="#181A20" />
          <Text style={styles.addBtnText}>{t.add}</Text>
        </TouchableOpacity>
      </View>

      <SetIconModal
        visible={iconPickerOpen}
        selectedEmoji={emoji}
        onSelect={setEmoji}
        onClose={() => setIconPickerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 14,
    zIndex: 5,
  },
  iconBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 32,
    gap: 22,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
  },
  fieldFull: {
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    height: 58,
    borderRadius: 12,
    paddingHorizontal: 18,
    fontSize: 17,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    height: 58,
    borderRadius: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnDisabled: {
    backgroundColor: '#7B9B42',
    opacity: 0.82,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#181A20',
  },
});
