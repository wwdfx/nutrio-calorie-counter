import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio, MealType, LoggedFoodEntry } from '@/context/NutrioContext';
import { SwipeableDeleteRow } from '@/components/SwipeableDeleteRow';

const MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

/**
 * Dedicated Meal Log History screen matching Stage 4 Screens:
 * - 35_Dark_food log history - dinner
 * - 36_Dark_food log history - delete (red square trash reveal on row)
 * - 37_Dark_food log history - delete confirmation modal
 * - 38_Dark_food log history - food log deleted toast
 */
export default function MealHistoryScreen() {
  const { meal } = useLocalSearchParams<{ meal?: string }>();
  const {
    themeMode,
    t,
    selectedDate,
    loggedFoods,
    removeFoodIntake,
  } = useNutrio();
  const theme = getThemeColors(themeMode);

  const mealType: MealType = MEALS.includes(meal as MealType)
    ? (meal as MealType)
    : 'Dinner';

  const mealLabel =
    mealType === 'Breakfast'
      ? t.breakfast
      : mealType === 'Lunch'
      ? t.lunch
      : mealType === 'Dinner'
      ? t.dinner
      : t.snacks;

  const [revealedEntryId, setRevealedEntryId] = useState<string | null>(null);
  const [confirmEntry, setConfirmEntry] = useState<LoggedFoodEntry | null>(null);
  const [deletedToastVisible, setDeletedToastVisible] = useState(false);

  const entries = useMemo(
    () =>
      loggedFoods.filter(
        (e) => e.date === selectedDate && e.mealType === mealType
      ),
    [loggedFoods, selectedDate, mealType]
  );

  const totalKcal = useMemo(
    () =>
      Math.round(
        entries.reduce((sum, e) => sum + e.food.calories * e.servings, 0)
      ),
    [entries]
  );

  const handleConfirmDelete = async () => {
    if (!confirmEntry) return;
    await removeFoodIntake(confirmEntry.id);
    setConfirmEntry(null);
    setRevealedEntryId(null);
    setDeletedToastVisible(true);
    setTimeout(() => setDeletedToastVisible(false), 3200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/(tabs)')
          }
          style={styles.iconBtn}
        >
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>{mealLabel}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logged Food Card matching 35_Dark_food log history */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>{t.totalLabel}</Text>
            <Text style={[styles.totalVal, { color: theme.text }]}>
              {totalKcal} {t.kcal}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {entries.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 34, marginBottom: 8 }}>🍽️</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 15 }}>
                {t.noItemsLoggedYet}
              </Text>
            </View>
          ) : (
            entries.map((entry, idx) => {
              const isRevealed = revealedEntryId === entry.id;
              const entryKcal = Math.round(entry.food.calories * entry.servings);
              const entryGrams = Math.round(entry.food.servingGrams * entry.servings);

              return (
                <View key={entry.id}>
                  <SwipeableDeleteRow
                    enabled
                    isOpen={isRevealed}
                    onOpen={() => setRevealedEntryId(entry.id)}
                    onClose={() =>
                      setRevealedEntryId((cur) => (cur === entry.id ? null : cur))
                    }
                    onDeletePress={() => setConfirmEntry(entry)}
                    deleteAccessibilityLabel={`${t.deleteTitle} ${entry.food.name}`}
                    rightAccessory={
                      <TouchableOpacity
                        style={styles.chevronBtn}
                        onPress={() =>
                          router.push({
                            pathname: '/food/[id]',
                            params: {
                              id: entry.food.id,
                              meal: mealType,
                              entryId: entry.id,
                            },
                          })
                        }
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={theme.textSecondary}
                        />
                      </TouchableOpacity>
                    }
                  >
                    <View style={styles.entryRow}>
                      <TouchableOpacity
                        style={styles.entryMainTouch}
                        activeOpacity={0.8}
                        onPress={() =>
                          isRevealed
                            ? setRevealedEntryId(null)
                            : setRevealedEntryId(entry.id)
                        }
                        onLongPress={() => setConfirmEntry(entry)}
                      >
                        <View style={styles.emojiSlot}>
                          <Text style={{ fontSize: 36 }}>{entry.food.emoji}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.foodName, { color: theme.text }]}>
                            {entry.food.name}
                          </Text>
                          <Text style={[styles.foodMeta, { color: theme.textSecondary }]}>
                            {entryKcal} {t.kcal}
                            {entryGrams > 0 ? ` , ${entryGrams} gram` : ''}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </SwipeableDeleteRow>

                  {idx < entries.length - 1 && (
                    <View style={[styles.dividerInset, { backgroundColor: theme.divider }]} />
                  )}
                </View>
              );
            })
          )}
        </View>

        {entries.length > 0 && (
          <Text style={[styles.hintText, { color: theme.textMuted }]}>
            {t.tapToDeleteHint}
          </Text>
        )}
      </ScrollView>

      {/* Food log successfully deleted! Toast matching 38_Dark */}
      {deletedToastVisible && (
        <View style={styles.toastWrap}>
          <View
            style={[
              styles.toastPill,
              { backgroundColor: theme.card, borderColor: theme.inputBorder },
            ]}
          >
            <View style={styles.toastCheckCircle}>
              <Ionicons name="checkmark" size={16} color="#181A20" />
            </View>
            <Text style={[styles.toastText, { color: theme.text }]}>
              {t.foodLogDeletedToast}
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Sticky + Add Button matching 35_Dark / 38_Dark */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: theme.background, borderTopColor: theme.divider },
        ]}
      >
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            router.push({ pathname: '/food/add', params: { meal: mealType } })
          }
        >
          <Ionicons name="add" size={22} color="#181A20" />
          <Text style={styles.addBtnText}>{t.add}</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Bottom Sheet matching 37_Dark_food log history - delete confirmation modal */}
      <Modal
        visible={!!confirmEntry}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmEntry(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.deleteSheet, { backgroundColor: theme.card }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.deleteTitle}>{t.deleteTitle}</Text>

            <View
              style={[
                styles.divider,
                { backgroundColor: theme.divider, marginVertical: 16 },
              ]}
            />

            <Text style={[styles.confirmQuestion, { color: theme.text }]}>
              {t.deleteFoodConfirm}
            </Text>
            <Text style={[styles.confirmSub, { color: theme.textSecondary }]}>
              {t.cannotBeUndone}
            </Text>

            <View
              style={[
                styles.divider,
                { backgroundColor: theme.divider, marginVertical: 20 },
              ]}
            />

            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                style={[styles.cancelPillBtn, { backgroundColor: theme.secondaryBtnBg }]}
                onPress={() => setConfirmEntry(null)}
              >
                <Text style={[styles.cancelPillText, { color: theme.text }]}>
                  {t.cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.confirmDeleteText}>{t.yesDelete}</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 16,
  },
  iconBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 19,
    fontWeight: '800',
  },
  totalVal: {
    fontSize: 19,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginHorizontal: 18,
  },
  dividerInset: {
    height: 1,
    marginHorizontal: 18,
  },
  emptyBox: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    overflow: 'hidden',
  },
  entryMainTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emojiSlot: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  foodMeta: {
    fontSize: 13,
  },
  chevronBtn: {
    padding: 6,
  },
  redDeleteSquare: {
    width: 56,
    height: 56,
    borderRadius: 6,
    backgroundColor: '#F55A5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
  },
  toastWrap: {
    paddingHorizontal: 28,
    paddingBottom: 14,
    alignItems: 'center',
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
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
    fontSize: 15,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  deleteSheet: {
    width: '100%',
    maxWidth: 440,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#35383F',
    alignSelf: 'center',
    marginBottom: 18,
  },
  deleteTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F55A5A',
    textAlign: 'center',
  },
  confirmQuestion: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmSub: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.85,
  },
  confirmBtnRow: {
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
  cancelPillText: {
    fontSize: 16,
    fontWeight: '700',
  },
  confirmDeleteBtn: {
    flex: 1,
    height: 54,
    borderRadius: 1000,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#181A20',
  },
});
