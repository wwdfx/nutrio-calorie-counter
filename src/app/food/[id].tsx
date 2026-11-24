import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio, MealType } from '@/context/NutrioContext';
import { MacroDonutChart } from '@/components/CircularProgress';

/**
 * Reworked Stage 5 & Stage 6 Food Details screen matching:
 * - 39_Dark_food details (Add mode with heart outline + `+ Add`)
 * - 40_Dark_food details - add to favorites (red filled heart + top floating `"Added to Favorites!"` toast)
 * - 41_Dark_food details (Edit mode from logged history: heart + red trash icon + `"Save"` CTA)
 * - Stage 6 Personal Food Details (Edit pencil + Heart + Red trash, compact macro card, Delete Personal Food modal)
 */
export default function FoodDetailsScreen() {
  const { id, meal, entryId, fromTab } = useLocalSearchParams<{
    id: string;
    meal?: string;
    entryId?: string;
    fromTab?: string;
  }>();
  const {
    themeMode,
    t,
    catalogFoods,
    loggedFoods,
    addFoodIntake,
    updateFoodIntake,
    removeFoodIntake,
    deleteCustomFood,
    toggleFavoriteFood,
  } = useNutrio();
  const theme = getThemeColors(themeMode);

  const existingEntry = entryId
    ? loggedFoods.find((e) => e.id === entryId)
    : undefined;
  const catalogMatch = catalogFoods.find(
    (f) => f.id === (existingEntry?.food.id || id)
  );
  // Always read latest catalog edits when viewing/editing a personal food
  const food =
    (existingEntry ? { ...existingEntry.food, ...catalogMatch } : catalogMatch) ||
    catalogFoods[0];
  const isFavorite = catalogMatch?.isFavorite ?? Boolean(food.isFavorite);

  const isEditMode = Boolean(existingEntry);
  const isPersonalView = Boolean(food.isPersonal && !isEditMode);
  const showMicronutrients = !isPersonalView;

  const [servings, setServings] = useState(existingEntry?.servings || 1);
  const [favoriteToast, setFavoriteToast] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [removeFavModalOpen, setRemoveFavModalOpen] = useState(false);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [customWeightDraft, setCustomWeightDraft] = useState(
    String(Math.round(food.servingGrams * (existingEntry?.servings || 1)))
  );

  const totalCals = Math.round(food.calories * servings);
  const totalCarbsG = Math.round(food.carbs * servings * 10) / 10;
  const totalProteinG = Math.round(food.protein * servings * 10) / 10;
  const totalFatG = Math.round(food.fat * servings * 10) / 10;
  const totalGrams = Math.round(food.servingGrams * servings);

  const shortUnit =
    food.unit === 'ml'
      ? 'ml'
      : food.unit === 'gram (g)' || food.unit === 'gram'
      ? 'g'
      : food.unit;

  // Macro kcal breakdown & percentages (Carbs 4 kcal/g, Protein 4 kcal/g, Fat 9 kcal/g)
  const carbsKcal = Math.round(food.carbs * servings * 4 * 10) / 10;
  const proteinKcal = Math.round(food.protein * servings * 4 * 10) / 10;
  const fatKcal = Math.round(food.fat * servings * 9 * 10) / 10;
  const macroKcalSum = carbsKcal + proteinKcal + fatKcal || 1;
  const carbsPct = Math.round((carbsKcal / macroKcalSum) * 1000) / 10;
  const proteinPct = Math.round((proteinKcal / macroKcalSum) * 1000) / 10;
  const fatPct = Math.max(0, Math.round((100 - carbsPct - proteinPct) * 10) / 10);

  const handleToggleFavorite = async () => {
    if (isFavorite) {
      // Stage 7 Screen 4: Confirm before removing from favorites
      setRemoveFavModalOpen(true);
      return;
    }
    await toggleFavoriteFood(food.id);
    setFavoriteToast(t.addedToFavoritesToast);
    setTimeout(() => setFavoriteToast(null), 2400);
  };

  const handleConfirmRemoveFavorite = async () => {
    setRemoveFavModalOpen(false);
    await toggleFavoriteFood(food.id);
    if (fromTab === 'Favorites') {
      router.replace({
        pathname: '/food/add',
        params: {
          meal: meal || 'Dinner',
          tab: 'Favorites',
          removedFav: '1',
        },
      });
      return;
    }
    setFavoriteToast(t.removedFromFavoritesToast);
    setTimeout(() => setFavoriteToast(null), 2400);
  };

  const handlePrimaryAction = async () => {
    if (isEditMode && existingEntry) {
      await updateFoodIntake(existingEntry.id, servings);
      router.back();
      return;
    }
    const targetMeal: MealType = (meal as MealType) || 'Dinner';
    await addFoodIntake(targetMeal, food, servings);
    router.replace({ pathname: '/food/history', params: { meal: targetMeal } });
  };

  const handleConfirmDelete = async () => {
    if (isEditMode && existingEntry) {
      await removeFoodIntake(existingEntry.id);
      setDeleteModalOpen(false);
      router.back();
      return;
    }
    if (isPersonalView) {
      await deleteCustomFood(food.id);
      setDeleteModalOpen(false);
      router.back();
      return;
    }
    setDeleteModalOpen(false);
  };

  const handleApplyWeight = () => {
    const parsed = Number(customWeightDraft);
    if (!isNaN(parsed) && parsed > 0 && food.servingGrams > 0) {
      setServings(Math.max(0.25, Math.round((parsed / food.servingGrams) * 100) / 100));
    }
    setWeightModalOpen(false);
  };

  // Micronutrient daily value percentages matching Stage 5
  const cholMg = Math.round((food.cholesterolMg ?? 53) * servings);
  const cholDv = Math.max(1, Math.round((cholMg / 300) * 100));
  const sodMg = Math.round((food.sodiumMg ?? 231) * servings);
  const sodDv = Math.max(1, Math.round((sodMg / 2300) * 100));
  const calcMg = Math.round((food.calciumMg ?? 54) * servings);
  const calcDv = Math.max(1, Math.round((calcMg / 1300) * 100));
  const ironMg = Math.round((food.ironMg ?? 1.4) * servings * 10) / 10;
  const ironDv = Math.max(1, Math.round((ironMg / 18) * 100));
  const potMg = Math.round((food.potassiumMg ?? 182) * servings);
  const potDv = Math.max(1, Math.round((potMg / 3500) * 100));

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Top Navbar: Close on left; Edit Pencil (Personal), Heart, & Red Trash (Edit/Personal) on right */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.navRightGroup}>
          {isPersonalView && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/food/create',
                  params: { editId: food.id, meal: meal || 'Dinner' },
                })
              }
              style={styles.iconBtn}
              accessibilityLabel={t.editFood}
            >
              <Ionicons name="pencil-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.iconBtn}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={26}
              color={isFavorite ? '#F54336' : theme.text}
            />
          </TouchableOpacity>
          {(isEditMode || isPersonalView) && (
            <TouchableOpacity
              onPress={() => setDeleteModalOpen(true)}
              style={styles.iconBtn}
              accessibilityLabel={t.deleteTitle}
            >
              <Ionicons name="trash-outline" size={25} color="#F55A5A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Top Floating Favorites Toast matching Screen 40_Dark & Stage 6 */}
      {favoriteToast && (
        <View style={styles.topToastOverlay} pointerEvents="none">
          <View
            style={[
              styles.topToastCard,
              { backgroundColor: theme.card, borderColor: theme.inputBorder },
            ]}
          >
            <View style={styles.toastCheckCircle}>
              <Ionicons name="checkmark" size={16} color="#181A20" />
            </View>
            <Text style={[styles.toastText, { color: theme.text }]}>
              {favoriteToast}
            </Text>
          </View>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.foodHeroEmoji}>
            <Text style={{ fontSize: 64 }}>{food.emoji}</Text>
          </View>

          <Text style={[styles.foodTitle, { color: theme.text }]}>
            {food.name}
          </Text>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Macro Donut + Breakdown Row matching Stage 5 & Stage 6 Personal */}
          <View style={styles.macroSummaryRow}>
            <MacroDonutChart
              size={116}
              strokeWidth={11}
              carbsPct={carbsPct}
              proteinPct={proteinPct}
              fatPct={fatPct}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.donutCals, { color: theme.text }]}>
                  {totalCals}
                </Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                  {t.kcal}
                </Text>
              </View>
            </MacroDonutChart>

            <View style={styles.macroListCol}>
              <View style={styles.macroLine}>
                <View style={[styles.dot, { backgroundColor: COLORS.carbs }]} />
                <Text style={[styles.macroLineLabel, { color: theme.textSecondary }]}>
                  {t.carbs}
                </Text>
                <Text style={[styles.macroLineVal, { color: theme.text }]}>
                  {isPersonalView ? totalCarbsG : carbsKcal} ({carbsPct.toFixed(1)}%)
                </Text>
              </View>

              <View style={styles.macroLine}>
                <View style={[styles.dot, { backgroundColor: COLORS.protein }]} />
                <Text style={[styles.macroLineLabel, { color: theme.textSecondary }]}>
                  {t.protein}
                </Text>
                <Text style={[styles.macroLineVal, { color: theme.text }]}>
                  {isPersonalView ? totalProteinG : proteinKcal} ({proteinPct.toFixed(1)}%)
                </Text>
              </View>

              <View style={styles.macroLine}>
                <View style={[styles.dot, { backgroundColor: COLORS.fat }]} />
                <Text style={[styles.macroLineLabel, { color: theme.textSecondary }]}>
                  {t.fat}
                </Text>
                <Text style={[styles.macroLineVal, { color: theme.text }]}>
                  {isPersonalView ? totalFatG : fatKcal} ({fatPct.toFixed(1)}%)
                </Text>
              </View>
            </View>
          </View>

          {showMicronutrients && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />

              {/* Micronutrients & Minerals matching Stage 5 */}
              <View style={styles.microSection}>
                <View style={styles.microRow}>
                  <Text style={[styles.microLabel, { color: theme.textSecondary }]}>
                    {t.cholesterol}
                  </Text>
                  <Text style={[styles.microValue, { color: theme.text }]}>
                    {cholMg} mg ({cholDv}%)
                  </Text>
                </View>
                <View style={styles.microRow}>
                  <Text style={[styles.microLabel, { color: theme.textSecondary }]}>
                    {t.sodium}
                  </Text>
                  <Text style={[styles.microValue, { color: theme.text }]}>
                    {sodMg} mg ({sodDv}%)
                  </Text>
                </View>

                <View style={styles.mineralsHeader}>
                  <Text style={{ fontSize: 13, color: theme.textMuted, fontWeight: '600' }}>
                    {t.minerals}
                  </Text>
                  <View style={[styles.flexLine, { backgroundColor: theme.divider }]} />
                </View>

                <View style={styles.microRow}>
                  <Text style={[styles.microLabel, { color: theme.textSecondary }]}>
                    {t.calcium}
                  </Text>
                  <Text style={[styles.microValue, { color: theme.text }]}>
                    {calcMg} mg ({calcDv}%)
                  </Text>
                </View>
                <View style={styles.microRow}>
                  <Text style={[styles.microLabel, { color: theme.textSecondary }]}>
                    {t.iron}
                  </Text>
                  <Text style={[styles.microValue, { color: theme.text }]}>
                    {ironMg} mg ({ironDv}%)
                  </Text>
                </View>
                <View style={styles.microRow}>
                  <Text style={[styles.microLabel, { color: theme.textSecondary }]}>
                    {t.potassium}
                  </Text>
                  <Text style={[styles.microValue, { color: theme.text }]}>
                    {potMg} mg ({potDv}%)
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Weight Stepper & Add / Save Pill */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: theme.background, borderTopColor: theme.divider },
        ]}
      >
        <View style={styles.servingControlsRow}>
          <TouchableOpacity
            onPress={() => {
              setCustomWeightDraft(String(totalGrams));
              setWeightModalOpen(true);
            }}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: 13, color: theme.textSecondary }}>
              {t.weightLabel}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <Text style={[styles.weightGramsText, { color: theme.text }]}>
                {totalGrams} {shortUnit}
              </Text>
              {!isPersonalView && (
                <Ionicons name="pencil-outline" size={18} color={theme.textSecondary} />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.stepperGroup}>
            <TouchableOpacity
              style={styles.stepperCircle}
              onPress={() => setServings((s) => Math.max(0.5, Math.round((s - 0.5) * 10) / 10))}
            >
              <Ionicons name="remove" size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.servingCountText, { color: theme.text }]}>
              {servings}
            </Text>
            <TouchableOpacity
              style={styles.stepperCircle}
              onPress={() => setServings((s) => Math.round((s + 0.5) * 10) / 10)}
            >
              <Ionicons name="add" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handlePrimaryAction}>
          {!isEditMode && <Ionicons name="add" size={22} color="#181A20" />}
          <Text style={styles.addBtnText}>
            {isEditMode ? t.save : t.add}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Inline Custom Gram Weight Modal */}
      <Modal
        visible={weightModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setWeightModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.inputBorder }]} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t.servingWeight} ({shortUnit})
            </Text>
            <TextInput
              style={[
                styles.weightInput,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={customWeightDraft}
              onChangeText={setCustomWeightDraft}
              keyboardType="numeric"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.cancelPillBtn, { backgroundColor: theme.secondaryBtnBg }]}
                onPress={() => setWeightModalOpen(false)}
              >
                <Text style={{ fontWeight: '700', color: theme.text }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleApplyWeight}>
                <Text style={{ fontWeight: '800', color: '#181A20' }}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Remove from Favorites Confirmation Bottom Sheet matching Stage 7 Screen 4 */}
      <Modal
        visible={removeFavModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setRemoveFavModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.inputBorder }]} />
            <Text style={[styles.removeSheetTitle, { color: theme.text }]}>
              {t.removeTitle}
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <Text style={[styles.confirmQuestion, { color: theme.text }]}>
              {t.removeFavoriteConfirm}
            </Text>
            <Text style={[styles.confirmSub, { color: theme.textSecondary }]}>
              {t.canAddBackLater}
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.cancelPillBtn, { backgroundColor: theme.secondaryBtnBg }]}
                onPress={() => setRemoveFavModalOpen(false)}
              >
                <Text style={{ fontWeight: '700', color: theme.text }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmRemoveFavorite}
              >
                <Text style={{ fontWeight: '800', color: '#181A20' }}>{t.yesRemove}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal (Logged Entry OR Personal Food matching Stage 6 Screen 5) */}
      <Modal
        visible={deleteModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.inputBorder }]} />
            <Text style={styles.deleteTitle}>{t.deleteTitle}</Text>
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <Text style={[styles.confirmQuestion, { color: theme.text }]}>
              {isPersonalView ? t.deletePersonalFoodConfirm : t.deleteFoodConfirm}
            </Text>
            <Text style={[styles.confirmSub, { color: theme.textSecondary }]}>
              {t.cannotBeUndone}
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.cancelPillBtn, { backgroundColor: theme.secondaryBtnBg }]}
                onPress={() => setDeleteModalOpen(false)}
              >
                <Text style={{ fontWeight: '700', color: theme.text }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmDelete}>
                <Text style={{ fontWeight: '800', color: '#181A20' }}>{t.yesDelete}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 12,
  },
  navRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    padding: 4,
  },
  topToastOverlay: {
    position: 'absolute',
    top: 94,
    left: 0,
    right: 0,
    zIndex: 30,
    alignItems: 'center',
  },
  topToastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  toastCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  card: {
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  foodHeroEmoji: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  foodTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  macroSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    gap: 16,
  },
  donutCals: {
    fontSize: 26,
    fontWeight: '800',
  },
  macroListCol: {
    flex: 1,
    gap: 14,
  },
  macroLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  macroLineLabel: {
    fontSize: 14,
    flex: 1,
  },
  macroLineVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  microSection: {
    width: '100%',
    gap: 16,
  },
  microRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  microLabel: {
    fontSize: 16,
  },
  microValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  mineralsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  flexLine: {
    flex: 1,
    height: 1,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    gap: 16,
  },
  servingControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightGramsText: {
    fontSize: 24,
    fontWeight: '800',
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  stepperCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingCountText: {
    fontSize: 22,
    fontWeight: '800',
    minWidth: 28,
    textAlign: 'center',
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
    backgroundColor: 'rgba(0,0,0,0.68)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  weightInput: {
    height: 58,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F55A5A',
    textAlign: 'center',
  },
  removeSheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  confirmQuestion: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 10,
  },
  confirmSub: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 14,
  },
  cancelPillBtn: {
    flex: 1,
    height: 54,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    flex: 1,
    height: 54,
    borderRadius: 1000,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
