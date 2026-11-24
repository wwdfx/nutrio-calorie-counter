import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio, MealType } from '@/context/NutrioContext';

const EMOJI_CHOICES = [
  '🌭', '🍊', '🥑', '🥪', '🍓', '🌯', '🍰', '🍔',
  '🥗', '🍕', '🍣', '🍜', '🥩', '🥞', '🍲', '🍎',
];

const UNIT_OPTIONS = ['gram (g)', 'ml', 'oz', 'cup', 'serving', 'piece', 'slice'];

/**
 * Create & Edit Personal Food Screen matching Stage 6 Screen 4 (Edit Food):
 * - Clean single circular emoji picker badge (tap to choose emoji)
 * - Food Name, Serving + Unit dropdown modal, Calorie (kcal) + Carbs (g), Protein (g) + Fat (g)
 * - Bottom green pill CTA: "Save" in Edit mode, "+ Add" in Create mode
 */
export default function CreateFoodScreen() {
  const { meal, editId } = useLocalSearchParams<{ meal?: string; editId?: string }>();
  const {
    themeMode,
    t,
    catalogFoods,
    createCustomFood,
    updateCustomFood,
    addFoodIntake,
  } = useNutrio();
  const theme = getThemeColors(themeMode);

  const editingFood = editId
    ? catalogFoods.find((f) => f.id === editId)
    : undefined;
  const isEditMode = Boolean(editingFood);

  const [emoji, setEmoji] = useState(editingFood?.emoji || '🌭');
  const [foodName, setFoodName] = useState(editingFood?.name || 'Hot Dog');
  const [serving, setServing] = useState(
    editingFood ? String(editingFood.servingGrams) : '57'
  );
  const [unit, setUnit] = useState(editingFood?.unit || 'gram (g)');
  const [calories, setCalories] = useState(
    editingFood ? String(editingFood.calories) : '150'
  );
  const [carbs, setCarbs] = useState(
    editingFood ? String(editingFood.carbs) : '2'
  );
  const [protein, setProtein] = useState(
    editingFood ? String(editingFood.protein) : '5'
  );
  const [fat, setFat] = useState(editingFood ? String(editingFood.fat) : '13');

  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);

  const handleSave = async () => {
    const payload = {
      name: foodName.trim() || 'Custom Food',
      emoji,
      servingGrams: Number(serving) || 100,
      unit: unit || 'gram (g)',
      calories: Number(calories) || 150,
      carbs: Number(carbs) || 0,
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
      isPersonal: true,
    };

    if (isEditMode && editingFood) {
      await updateCustomFood(editingFood.id, payload);
      router.back();
      return;
    }

    const created = await createCustomFood(payload);
    if (meal) {
      await addFoodIntake(meal as MealType, created, 1);
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Top Navbar: X on left, centered Edit Food / Create Food title */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>
          {isEditMode ? t.editFood : t.createFood}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {/* Centered Circular Food Emoji Badge matching Stage 6 Screen 4 */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={[
              styles.avatarCircle,
              { borderColor: theme.inputBorder, backgroundColor: theme.background },
            ]}
            onPress={() => setEmojiPickerOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 44 }}>{emoji}</Text>
          </TouchableOpacity>
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
              onPress={() => setUnitPickerOpen(true)}
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

      {/* Bottom Sticky Pill CTA: "Save" in Edit mode, "+ Add" in Create mode */}
      <View
        style={[
          styles.bottomBar,
          { borderTopColor: theme.divider, backgroundColor: theme.background },
        ]}
      >
        <TouchableOpacity style={styles.addBtn} onPress={handleSave}>
          {!isEditMode && <Ionicons name="add" size={22} color="#181A20" />}
          <Text style={styles.addBtnText}>
            {isEditMode ? t.save : t.add}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Emoji Picker Sheet */}
      <Modal
        visible={emojiPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setEmojiPickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setEmojiPickerOpen(false)}
        >
          <View style={[styles.sheetCard, { backgroundColor: theme.card }]}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.inputBorder }]} />
            <View style={styles.emojiGrid}>
              {EMOJI_CHOICES.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[
                    styles.emojiGridCell,
                    { backgroundColor: emoji === e ? COLORS.primary : theme.background },
                  ]}
                  onPress={() => {
                    setEmoji(e);
                    setEmojiPickerOpen(false);
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Unit Picker Sheet */}
      <Modal
        visible={unitPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setUnitPickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setUnitPickerOpen(false)}
        >
          <View style={[styles.sheetCard, { backgroundColor: theme.card }]}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.inputBorder }]} />
            <Text style={[styles.sheetTitle, { color: theme.text }]}>{t.unit}</Text>
            {UNIT_OPTIONS.map((opt) => {
              const active = opt === unit;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.unitOptionRow,
                    active && { backgroundColor: COLORS.primary },
                  ]}
                  onPress={() => {
                    setUnit(opt);
                    setUnitPickerOpen(false);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: active ? '#181A20' : theme.text,
                    }}
                  >
                    {opt}
                  </Text>
                  {active && <Ionicons name="checkmark" size={20} color="#181A20" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
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
    gap: 20,
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
    gap: 8,
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
  row2Col: {
    flexDirection: 'row',
    gap: 16,
  },
  colHalf: {
    flex: 1,
    gap: 8,
  },
  unitSelect: {
    height: 58,
    borderRadius: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitText: {
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
  addBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#181A20',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetCard: {
    width: '100%',
    maxWidth: 440,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 8,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  emojiGridCell: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
});
