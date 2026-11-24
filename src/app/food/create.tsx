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
import { SetIconModal } from '@/components/SetIconModal';

const UNIT_OPTIONS = ['gram (g)', 'ml', 'oz', 'cup', 'serving', 'piece', 'slice'];

/**
 * Create & Edit Personal Food Screen matching:
 * - Stage 6 Screen 4 (Edit Food pre-filled with Save CTA)
 * - Stage 9 Screen 1 (Set Icon tall searchable 5-column dark sheet)
 * - Stage 9 Screen 2 (Create Food blank initial form with '+' icon badge & muted '+ Add' CTA)
 * - Stage 9 Screen 3 (Create Food filled form with chosen emoji & bright '+ Add' CTA)
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

  const [emoji, setEmoji] = useState(editingFood?.emoji || '');
  const [foodName, setFoodName] = useState(editingFood?.name || '');
  const [serving, setServing] = useState(
    editingFood ? String(editingFood.servingGrams) : ''
  );
  const [unit, setUnit] = useState(editingFood?.unit || '');
  const [calories, setCalories] = useState(
    editingFood ? String(editingFood.calories) : ''
  );
  const [carbs, setCarbs] = useState(
    editingFood ? String(editingFood.carbs) : ''
  );
  const [protein, setProtein] = useState(
    editingFood ? String(editingFood.protein) : ''
  );
  const [fat, setFat] = useState(editingFood ? String(editingFood.fat) : '');

  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);

  const isFormReady =
    foodName.trim().length > 0 && calories.trim().length > 0;

  const handleSave = async () => {
    if (!isFormReady) return;
    const payload = {
      name: foodName.trim(),
      emoji: emoji || '🍽️',
      servingGrams: Number(serving) || 100,
      unit: unit || 'gram (g)',
      calories: Number(calories) || 0,
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
      <View style={[styles.navbar, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>
          {isEditMode ? t.editFood : t.createFood}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={{ flex: 1, overflow: 'hidden' }}
        contentContainerStyle={styles.scrollContent}
      >
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

        <View style={styles.row2Col}>
          <View style={styles.colHalf}>
            <Text style={[styles.label, { color: theme.text }]}>{t.serving}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={serving}
              onChangeText={setServing}
              placeholder={t.example100}
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.colHalf}>
            <Text style={[styles.label, { color: theme.text }]}>{t.unit}</Text>
            <TouchableOpacity
              style={[styles.unitSelect, { backgroundColor: theme.card }]}
              onPress={() => setUnitPickerOpen(true)}
            >
              <Text
                style={[
                  styles.unitText,
                  { color: unit ? theme.text : theme.textMuted },
                ]}
                numberOfLines={1}
              >
                {unit || t.unitPlaceholder}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row2Col}>
          <View style={styles.colHalf}>
            <Text style={[styles.label, { color: theme.text }]}>{t.caloriesKcal}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={calories}
              onChangeText={setCalories}
              placeholder={t.example100}
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.colHalf}>
            <Text style={[styles.label, { color: theme.text }]}>{t.carbsG}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={carbs}
              onChangeText={setCarbs}
              placeholder={t.example100}
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row2Col}>
          <View style={styles.colHalf}>
            <Text style={[styles.label, { color: theme.text }]}>{t.proteinG}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={protein}
              onChangeText={setProtein}
              placeholder={t.example100}
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.colHalf}>
            <Text style={[styles.label, { color: theme.text }]}>{t.fatG}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={fat}
              onChangeText={setFat}
              placeholder={t.example100}
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { borderTopColor: theme.divider, backgroundColor: theme.background },
        ]}
      >
        <TouchableOpacity
          style={[styles.addBtn, !isFormReady && styles.addBtnDisabled]}
          onPress={handleSave}
          disabled={!isFormReady}
          activeOpacity={0.85}
        >
          {!isEditMode && <Ionicons name="add" size={22} color="#181A20" />}
          <Text style={styles.addBtnText}>
            {isEditMode ? t.save : t.add}
          </Text>
        </TouchableOpacity>
      </View>

      <SetIconModal
        visible={iconPickerOpen}
        selectedEmoji={emoji}
        onSelect={setEmoji}
        onClose={() => setIconPickerOpen(false)}
      />

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
    gap: 6,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.68)',
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
  unitOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
});
