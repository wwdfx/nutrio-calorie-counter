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

const EMOJI_CHOICES = ['🌭', '🥗', '🍔', '🍕', '🍣', '🍜', '🥩', '🥑', '🥞', '🥪', '🍲', '🍎'];

export default function CreateFoodScreen() {
  const { meal } = useLocalSearchParams<{ meal?: string }>();
  const { themeMode, t, createCustomFood, addFoodIntake } = useNutrio();
  const theme = getThemeColors(themeMode);

  // Exact defaults matching Figma Screen 54_Light_create food - filled form
  const [emoji, setEmoji] = useState('🌭');
  const [foodName, setFoodName] = useState('Hot Dog');
  const [serving, setServing] = useState('57');
  const [unit, setUnit] = useState('gram (g)');
  const [calories, setCalories] = useState('150');
  const [carbs, setCarbs] = useState('2');
  const [protein, setProtein] = useState('5');
  const [fat, setFat] = useState('13');

  const handleSave = async () => {
    const created = await createCustomFood({
      name: foodName.trim() || 'Custom Food',
      emoji,
      servingGrams: Number(serving) || 100,
      unit: unit || 'gram (g)',
      calories: Number(calories) || 150,
      carbs: Number(carbs) || 0,
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
    });

    if (meal) {
      await addFoodIntake(meal as MealType, created, 1);
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Navbar matching Screen 54_Dark */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>{t.createFood}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Circular Food Emoji / Image Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarCircle, { borderColor: theme.inputBorder, backgroundColor: theme.card }]}>
            <Text style={{ fontSize: 48 }}>{emoji}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emojiStrip}
          >
            {EMOJI_CHOICES.map((e) => (
              <TouchableOpacity
                key={e}
                style={[
                  styles.emojiChoice,
                  { backgroundColor: emoji === e ? COLORS.primary : theme.card },
                ]}
                onPress={() => setEmoji(e)}
              >
                <Text style={{ fontSize: 20 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {/* Food Name Input */}
        <View style={styles.fieldFull}>
          <Text style={[styles.label, { color: theme.text }]}>{t.foodName}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            value={foodName}
            onChangeText={setFoodName}
            placeholder="e.g. Hot Dog"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        {/* Row 1: Serving & Unit */}
        <View style={styles.row2Col}>
          <View style={styles.colHalf}>
            <Text style={[styles.label, { color: theme.text }]}>{t.serving}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={serving}
              onChangeText={setServing}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.colHalf}>
            <Text style={[styles.label, { color: theme.text }]}>{t.unit}</Text>
            <TouchableOpacity
              style={[styles.unitSelect, { backgroundColor: theme.card }]}
              onPress={() =>
                setUnit((u) => (u === 'gram (g)' ? 'serving' : u === 'serving' ? 'ml' : 'gram (g)'))
              }
            >
              <Text style={[styles.unitText, { color: theme.text }]}>{unit}</Text>
              <Ionicons name="chevron-down" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2: Calorie (kcal) & Carbs (g) */}
        <View style={styles.row2Col}>
          <View style={styles.colHalf}>
            <Text style={[styles.label, { color: theme.text }]}>{t.caloriesKcal}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.colHalf}>
            <Text style={[styles.label, { color: theme.text }]}>{t.carbsG}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Row 3: Protein (g) & Fat (g) */}
        <View style={styles.row2Col}>
          <View style={styles.colHalf}>
            <Text style={[styles.label, { color: theme.text }]}>{t.proteinG}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.colHalf}>
            <Text style={[styles.label, { color: theme.text }]}>{t.fatG}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={fat}
              onChangeText={setFat}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Pill Button matching Screen 54_Dark */}
      <View style={[styles.bottomBar, { borderTopColor: theme.divider, backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.addBtn} onPress={handleSave}>
          <Ionicons name="add" size={22} color="#181A20" />
          <Text style={styles.addBtnText}>{t.add}</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 12,
    paddingBottom: 32,
    gap: 22,
  },
  avatarContainer: {
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiStrip: {
    gap: 10,
    paddingHorizontal: 4,
  },
  emojiChoice: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
  },
  fieldFull: {
    gap: 8,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
  },
  input: {
    height: 60,
    borderRadius: 10,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  row2Col: {
    flexDirection: 'row',
    gap: 16,
  },
  colHalf: {
    flex: 1,
    gap: 8,
  },
  unitSelect: {
    height: 60,
    borderRadius: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitText: {
    fontSize: 18,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    height: 58,
    borderRadius: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#212121',
  },
});
