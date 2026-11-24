import React, { useState, useMemo, useEffect } from 'react';
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
import { useNutrio, MealType, FoodItem } from '@/context/NutrioContext';

const MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export default function AddFoodIntakeScreen() {
  const { meal, tab, removedFav } = useLocalSearchParams<{
    meal?: string;
    tab?: string;
    removedFav?: string;
  }>();
  const {
    themeMode,
    t,
    catalogFoods,
    addFoodIntake,
    addMultipleFoodIntakes,
    createCustomFood,
  } = useNutrio();
  const theme = getThemeColors(themeMode);

  const mealLabel = (m: MealType) =>
    m === 'Breakfast'
      ? t.breakfast
      : m === 'Lunch'
      ? t.lunch
      : m === 'Dinner'
      ? t.dinner
      : t.snacks;

  const [selectedMeal, setSelectedMeal] = useState<MealType>(
    MEALS.includes(meal as MealType) ? (meal as MealType) : 'Dinner'
  );
  const [mealDropdownOpen, setMealDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Recent' | 'Favorites' | 'Personal'>(
    tab === 'Favorites' || tab === 'Personal' ? tab : 'Recent'
  );
  const [bottomToast, setBottomToast] = useState<string | null>(
    removedFav === '1' ? t.removedFromFavoritesToast : null
  );

  useEffect(() => {
    if (!bottomToast) return;
    const timer = setTimeout(() => setBottomToast(null), 2600);
    return () => clearTimeout(timer);
  }, [bottomToast]);

  // Multi-select basket matching Stage 4 Screens 31_Dark, 32_Dark, 33_Dark
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);

  // Quick Log Modal State
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickCals, setQuickCals] = useState('');

  const filteredFoods = useMemo(() => {
    return catalogFoods.filter((f) => {
      if (activeTab === 'Favorites' && !f.isFavorite) return false;
      if (activeTab === 'Personal' && !f.isPersonal) return false;
      if (searchQuery.trim()) {
        return f.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      }
      return true;
    });
  }, [catalogFoods, activeTab, searchQuery]);

  const selectedFoods = useMemo(
    () =>
      selectedIds
        .map((id) => catalogFoods.find((f) => f.id === id))
        .filter((f): f is FoodItem => Boolean(f)),
    [selectedIds, catalogFoods]
  );

  const selectedTotalKcal = useMemo(
    () => Math.round(selectedFoods.reduce((sum, f) => sum + f.calories, 0)),
    [selectedFoods]
  );

  const toggleSelectFood = (foodId: string) => {
    setSelectedIds((prev) =>
      prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId]
    );
  };

  const handleCommitSelected = async () => {
    await addMultipleFoodIntakes(selectedMeal, selectedFoods);
    setSelectedIds([]);
    setReviewOpen(false);
    router.replace({ pathname: '/food/history', params: { meal: selectedMeal } });
  };

  const handleQuickLogSubmit = async () => {
    const cals = Number(quickCals) || 250;
    const custom = await createCustomFood({
      name: quickName.trim() || `${selectedMeal} Quick Log`,
      emoji: '⚡',
      servingGrams: 100,
      unit: 'gram (g)',
      calories: cals,
      carbs: Math.round((cals * 0.45) / 4),
      protein: Math.round((cals * 0.25) / 4),
      fat: Math.round((cals * 0.3) / 9),
    });
    await addFoodIntake(selectedMeal, custom, 1);
    setQuickLogOpen(false);
    router.replace({ pathname: '/food/history', params: { meal: selectedMeal } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Top Navbar & Controls matching 29_Dark_add food intake */}
      <View style={[styles.topSection, { backgroundColor: theme.background }]}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mealPickerBtn}
            onPress={() => setMealDropdownOpen((v) => !v)}
          >
            <Text style={[styles.navbarTitle, { color: theme.text }]}>
              {mealLabel(selectedMeal)}
            </Text>
            <Ionicons name="chevron-down" size={20} color={theme.text} />
          </TouchableOpacity>

          <View style={{ width: 28 }} />
        </View>

        {mealDropdownOpen && (
          <View style={[styles.mealDropdown, { backgroundColor: theme.card }]}>
            {MEALS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.mealOption,
                  selectedMeal === m && { backgroundColor: COLORS.primary },
                ]}
                onPress={() => {
                  setSelectedMeal(m);
                  setMealDropdownOpen(false);
                }}
              >
                <Text
                  style={{
                    fontWeight: '700',
                    color: selectedMeal === m ? '#181A20' : theme.text,
                  }}
                >
                  {mealLabel(m)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Search Bar matching 29_Dark / 30_Dark / 31_Dark */}
        <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
          <Ionicons name="search-outline" size={20} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.searchFoodPlaceholder}
            placeholderTextColor={theme.textMuted}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 2 }}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: '/food/scan', params: { meal: selectedMeal } })
            }
          >
            <Ionicons name="scan-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Quick Log & Create Food Row */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.card }]}
            onPress={() => setQuickLogOpen(true)}
          >
            <Ionicons name="flash-outline" size={18} color={theme.text} />
            <Text style={[styles.actionBtnText, { color: theme.text }]}>
              {t.quickLog}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.card }]}
            onPress={() =>
              router.push({ pathname: '/food/create', params: { meal: selectedMeal } })
            }
          >
            <Ionicons name="add-circle-outline" size={18} color={theme.text} />
            <Text style={[styles.actionBtnText, { color: theme.text }]}>
              {t.createFood}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Segmented Control: Recent | Favorites | Personal */}
        <View style={[styles.segmentedBar, { backgroundColor: theme.card }]}>
          {(['Recent', 'Favorites', 'Personal'] as const).map((tab) => {
            const active = activeTab === tab;
            const tabLabel =
              tab === 'Recent' ? t.recent : tab === 'Favorites' ? t.favorites : t.personal;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.segmentBtn,
                  active && { backgroundColor: COLORS.primary },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? '#181A20' : theme.text },
                  ]}
                >
                  {tabLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.topDivider, { backgroundColor: theme.divider }]} />

      {/* Food Catalog List inside rounded dark card matching 29_Dark / 31_Dark / 32_Dark / Stage 6 Personal */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
        <View style={[styles.listCard, { backgroundColor: theme.card }]}>
          {filteredFoods.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🍽️</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {t.noFoodsMatch}
              </Text>
              <Text
                style={{
                  color: theme.textSecondary,
                  textAlign: 'center',
                  marginTop: 6,
                  marginBottom: 14,
                }}
              >
                {t.noFoodsSub}
              </Text>
              <TouchableOpacity
                style={styles.aiEmptyBtn}
                onPress={() =>
                  router.push({ pathname: '/food/scan', params: { meal: selectedMeal } })
                }
              >
                <Ionicons name="sparkles" size={16} color="#181A20" />
                <Text style={{ color: '#181A20', fontWeight: '800', fontSize: 13 }}>
                  {t.aiScan}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredFoods.map((food, idx) => {
              const isSelected = selectedIds.includes(food.id);
              return (
                <View key={food.id}>
                  <View style={styles.foodRow}>
                    <TouchableOpacity
                      style={[
                        styles.plusCircleOutline,
                        isSelected && {
                          backgroundColor: COLORS.primary,
                          borderColor: COLORS.primary,
                        },
                      ]}
                      onPress={() => toggleSelectFood(food.id)}
                    >
                      <Ionicons
                        name={isSelected ? 'checkmark' : 'add'}
                        size={22}
                        color={isSelected ? '#181A20' : theme.text}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.foodInfoTouch}
                      onPress={() =>
                        router.push({
                          pathname: '/food/[id]',
                          params: {
                            id: food.id,
                            meal: selectedMeal,
                            fromTab: activeTab,
                          },
                        })
                      }
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.foodName, { color: theme.text }]}>
                          {food.name}
                        </Text>
                        <Text style={[styles.foodMeta, { color: theme.textSecondary }]}>
                          {food.calories} {t.kcal} , {food.servingGrams}{' '}
                          {food.unit === 'gram (g)' ? 'gram' : food.unit}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={theme.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {idx < filteredFoods.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Bottom Floating Toast matching Stage 7 Screen 2 ("Removed from favorites!") */}
      {bottomToast && (
        <View style={styles.bottomToastOverlay} pointerEvents="none">
          <View
            style={[
              styles.bottomToastCard,
              { backgroundColor: theme.card, borderColor: theme.inputBorder },
            ]}
          >
            <View style={styles.toastCheckCircle}>
              <Ionicons name="checkmark" size={16} color="#181A20" />
            </View>
            <Text style={[styles.toastText, { color: theme.text }]}>
              {bottomToast}
            </Text>
          </View>
        </View>
      )}

      {/* Sticky Multi-Select Footer matching Stage 4 Screens 31_Dark & 32_Dark */}
      {selectedFoods.length > 0 && (
        <View
          style={[
            styles.basketFooter,
            { backgroundColor: theme.background, borderTopColor: theme.divider },
          ]}
        >
          <TouchableOpacity
            style={styles.basketKcalCol}
            onPress={() => setReviewOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.basketKcalLabel, { color: theme.textSecondary }]}>
              {t.kcal}
            </Text>
            <Text style={[styles.basketKcalNum, { color: theme.text }]}>
              {selectedTotalKcal}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.basketAddBtn}
            onPress={handleCommitSelected}
            onLongPress={() => setReviewOpen(true)}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={20} color="#181A20" />
            <Text style={styles.basketAddText}>
              {t.add} ({selectedFoods.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selected Food Basket Review Sheet matching Screen 33_Dark_add food intake - review */}
      <Modal
        visible={reviewOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setReviewOpen(false)}
        >
          <View
            style={[styles.reviewSheet, { backgroundColor: theme.background }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHandle} />

            <ScrollView style={{ maxHeight: 300 }}>
              {selectedFoods.map((food, idx) => (
                <View key={food.id}>
                  <View style={styles.reviewRow}>
                    <View style={styles.reviewEmojiBox}>
                      <Text style={{ fontSize: 34 }}>{food.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.foodName, { color: theme.text }]}>
                        {food.name}
                      </Text>
                      <Text style={[styles.foodMeta, { color: theme.textSecondary }]}>
                        {food.calories} {t.kcal} , {food.servingGrams} gram
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        toggleSelectFood(food.id);
                        if (selectedFoods.length <= 1) setReviewOpen(false);
                      }}
                      style={{ padding: 6 }}
                    >
                      <Ionicons name="close" size={22} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                  {idx < selectedFoods.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                  )}
                </View>
              ))}
            </ScrollView>

            <View
              style={[
                styles.reviewFooterRow,
                { borderTopColor: theme.divider },
              ]}
            >
              <View style={styles.basketKcalCol}>
                <Text style={[styles.basketKcalLabel, { color: theme.textSecondary }]}>
                  {t.kcal}
                </Text>
                <Text style={[styles.basketKcalNum, { color: theme.text }]}>
                  {selectedTotalKcal}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.basketAddBtn}
                onPress={handleCommitSelected}
              >
                <Ionicons name="add" size={20} color="#181A20" />
                <Text style={styles.basketAddText}>
                  {t.add} ({selectedFoods.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Quick Log Modal */}
      <Modal
        visible={quickLogOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setQuickLogOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                ⚡ {t.quickLog} ({mealLabel(selectedMeal)})
              </Text>
              <TouchableOpacity onPress={() => setQuickLogOpen(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              {t.foodName}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={quickName}
              onChangeText={setQuickName}
              placeholder="e.g. Stuffed Flatbread"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              {t.caloriesKcal}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              value={quickCals}
              onChangeText={setQuickCals}
              placeholder="e.g. 215"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={handleQuickLogSubmit}
            >
              <Text style={styles.modalPrimaryText}>
                {t.addTo} {mealLabel(selectedMeal)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topSection: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 18,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  iconBtn: {
    padding: 4,
  },
  mealPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navbarTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  mealDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  mealOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    gap: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 10,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  segmentedBar: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  topDivider: {
    height: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 32,
  },
  listCard: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  plusCircleOutline: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodInfoTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foodName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  foodMeta: {
    fontSize: 13,
  },
  divider: {
    height: 1,
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  aiEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 1000,
    gap: 6,
  },
  basketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    gap: 20,
  },
  bottomToastOverlay: {
    position: 'absolute',
    bottom: 84,
    left: 0,
    right: 0,
    zIndex: 35,
    alignItems: 'center',
  },
  bottomToastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.45,
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
  basketKcalCol: {
    minWidth: 66,
  },
  basketKcalLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  basketKcalNum: {
    fontSize: 24,
    fontWeight: '800',
  },
  basketAddBtn: {
    flex: 1,
    height: 56,
    borderRadius: 1000,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  basketAddText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#181A20',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  reviewSheet: {
    width: '100%',
    maxWidth: 440,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#35383F',
    alignSelf: 'center',
    marginBottom: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  reviewEmojiBox: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    marginTop: 8,
    borderTopWidth: 1,
    gap: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalInput: {
    height: 54,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalPrimaryBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181A20',
  },
});
