import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { COLORS, getThemeColors } from '@/constants/theme';
import { getLanguageMeta } from '@/constants/i18n';
import {
  useNutrio,
  MealType,
  formatDateKey,
} from '@/context/NutrioContext';
import { CircularProgress } from '@/components/CircularProgress';
import { DateCalendarModal } from '@/components/DateCalendarModal';
import { NutrioLogo } from '@/components/NutrioLogo';

const MEAL_CONFIG: {
  type: MealType;
  emoji: string;
  targetPct: number;
}[] = [
  { type: 'Breakfast', emoji: '🥪', targetPct: 0.30 },
  { type: 'Lunch', emoji: '🍚', targetPct: 0.30 },
  { type: 'Dinner', emoji: '🥗', targetPct: 0.30 },
  { type: 'Snacks', emoji: '🍡', targetPct: 0.10 },
];

export default function HomeScreen() {
  const {
    themeMode,
    language,
    t,
    user,
    selectedDate,
    setSelectedDate,
    loggedFoods,
    loggedActivities,
    stepsByDate,
  } = useNutrio();
  const theme = getThemeColors(themeMode);
  const locale = getLanguageMeta(language).locale;

  const mealLabel = (type: MealType) =>
    type === 'Breakfast'
      ? t.breakfast
      : type === 'Lunch'
      ? t.lunch
      : type === 'Dinner'
      ? t.dinner
      : t.snacks;

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const calorieGoal = user?.calorieGoal || 2560;
  const carbsGoal = user?.carbsGoalGrams || 224;
  const proteinGoal = user?.proteinGoalGrams || 128;
  const fatGoal = user?.fatGoalGrams || 128;

  const dayFoods = useMemo(
    () => loggedFoods.filter((e) => e.date === selectedDate),
    [loggedFoods, selectedDate]
  );

  const dayActivities = useMemo(
    () => loggedActivities.filter((a) => a.date === selectedDate),
    [loggedActivities, selectedDate]
  );

  const totals = useMemo(() => {
    let eaten = 0;
    let carbs = 0;
    let protein = 0;
    let fat = 0;
    for (const entry of dayFoods) {
      eaten += entry.food.calories * entry.servings;
      carbs += entry.food.carbs * entry.servings;
      protein += entry.food.protein * entry.servings;
      fat += entry.food.fat * entry.servings;
    }
    const stepsCount = stepsByDate[selectedDate] || 0;
    const walkingBurned = Math.round(stepsCount * 0.04);
    const activityBurned = dayActivities.reduce((sum, a) => sum + a.caloriesBurned, 0);
    const burned = walkingBurned + activityBurned;
    const netLeft = Math.max(0, calorieGoal - Math.round(eaten) + burned);

    return {
      eaten: Math.round(eaten),
      carbs: Math.round(carbs),
      protein: Math.round(protein),
      fat: Math.round(fat),
      walkingBurned,
      activityBurned,
      burned,
      kcalLeft: netLeft,
    };
  }, [dayFoods, dayActivities, stepsByDate, selectedDate, calorieGoal]);

  const formattedDateTitle = useMemo(() => {
    const todayKey = formatDateKey();
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    const shortMonth = d.toLocaleString(locale, { month: 'short' });
    const dayNum = d.getDate();
    if (selectedDate === todayKey) {
      return `${t.today}, ${shortMonth} ${dayNum}`;
    }
    return `${shortMonth} ${dayNum}, ${parts[0]}`;
  }, [selectedDate, locale, t.today]);

  const shiftDate = (deltaDays: number) => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    d.setDate(d.getDate() + deltaDays);
    setSelectedDate(formatDateKey(d));
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Green Curved Header with Subtle Wave Accent matching 28_Dark_home */}
        <View style={styles.greenBanner}>
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 430 170"
            preserveAspectRatio="none"
            style={StyleSheet.absoluteFill}
          >
            <Path
              d="M0 110 C110 20 260 150 430 40 L430 170 L0 170 Z"
              fill="rgba(255,255,255,0.12)"
            />
            <Path
              d="M0 40 C150 130 290 10 430 95 L430 0 L0 0 Z"
              fill="rgba(255,255,255,0.08)"
            />
          </Svg>
          <View style={styles.topBar}>
            <NutrioLogo size={32} color="#181A20" eyeColor={COLORS.primary} />
            <Text style={styles.brandTitle}>Nutrio</Text>
            <TouchableOpacity
              style={styles.notifBellBtn}
              onPress={() => setNotifOpen(true)}
            >
              <Ionicons name="notifications-outline" size={22} color="#181A20" />
              <View style={styles.notifRedDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Calorie & Macro Summary Card */}
        <View style={[styles.mainCard, { backgroundColor: theme.card }]}>
          {/* Date Selector Row */}
          <View style={styles.dateRow}>
            <TouchableOpacity onPress={() => shiftDate(-1)} style={styles.dateArrow}>
              <Ionicons name="chevron-back" size={22} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateCenterBtn}
              onPress={() => setCalendarOpen(true)}
            >
              <Text style={[styles.dateTitle, { color: theme.text }]}>
                {formattedDateTitle}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => shiftDate(1)} style={styles.dateArrow}>
              <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Eaten | Ring | Burned Row */}
          <View style={styles.calorieRingRow}>
            <View style={styles.sideStat}>
              <Text style={[styles.sideStatLabel, { color: theme.textSecondary }]}>
                🥗 {t.eaten}
              </Text>
              <Text style={[styles.sideStatValue, { color: theme.text }]}>
                {totals.eaten}
              </Text>
              <Text style={[styles.sideStatUnit, { color: theme.textMuted }]}>{t.kcal}</Text>
            </View>

            <CircularProgress
              size={150}
              strokeWidth={13}
              progress={totals.eaten / calorieGoal}
              color={COLORS.primary}
              trackColor={theme.divider}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.ringBigValue, { color: theme.text }]}>
                  {totals.kcalLeft}
                </Text>
                <Text style={[styles.ringSubLabel, { color: theme.textSecondary }]}>
                  {t.kcalLeft}
                </Text>
              </View>
            </CircularProgress>

            <View style={styles.sideStat}>
              <Text style={[styles.sideStatLabel, { color: theme.textSecondary }]}>
                🔥 {t.burned}
              </Text>
              <Text style={[styles.sideStatValue, { color: theme.text }]}>
                {totals.burned}
              </Text>
              <Text style={[styles.sideStatUnit, { color: theme.textMuted }]}>{t.kcal}</Text>
            </View>
          </View>

          {/* Section Divider: Eaten Macros */}
          <View style={styles.sectionDividerRow}>
            <Text style={[styles.sectionSmallLabel, { color: theme.textMuted }]}>{t.eaten}</Text>
            <View style={[styles.flexLine, { backgroundColor: theme.divider }]} />
          </View>

          <View style={styles.macrosRow}>
            <View style={styles.macroCol}>
              <CircularProgress
                size={92}
                strokeWidth={8}
                progress={totals.carbs / carbsGoal}
                color={COLORS.carbs}
                trackColor={theme.divider}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.macroValue, { color: theme.text }]}>
                    {totals.carbs}
                  </Text>
                  <Text style={[styles.macroGoal, { color: theme.textMuted }]}>
                    / {carbsGoal} g
                  </Text>
                </View>
              </CircularProgress>
              <Text style={[styles.macroName, { color: theme.text }]}>{t.carbs}</Text>
            </View>

            <View style={styles.macroCol}>
              <CircularProgress
                size={92}
                strokeWidth={8}
                progress={totals.protein / proteinGoal}
                color={COLORS.protein}
                trackColor={theme.divider}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.macroValue, { color: theme.text }]}>
                    {totals.protein}
                  </Text>
                  <Text style={[styles.macroGoal, { color: theme.textMuted }]}>
                    / {proteinGoal} g
                  </Text>
                </View>
              </CircularProgress>
              <Text style={[styles.macroName, { color: theme.text }]}>{t.protein}</Text>
            </View>

            <View style={styles.macroCol}>
              <CircularProgress
                size={92}
                strokeWidth={8}
                progress={totals.fat / fatGoal}
                color={COLORS.fat}
                trackColor={theme.divider}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.macroValue, { color: theme.text }]}>
                    {totals.fat}
                  </Text>
                  <Text style={[styles.macroGoal, { color: theme.textMuted }]}>
                    / {fatGoal} g
                  </Text>
                </View>
              </CircularProgress>
              <Text style={[styles.macroName, { color: theme.text }]}>{t.fat}</Text>
            </View>
          </View>

          {/* Section Divider: Burned */}
          <View style={styles.sectionDividerRow}>
            <Text style={[styles.sectionSmallLabel, { color: theme.textMuted }]}>{t.burned}</Text>
            <View style={[styles.flexLine, { backgroundColor: theme.divider }]} />
          </View>

          <View style={styles.burnedRow}>
            <TouchableOpacity
              style={styles.burnedHalf}
              onPress={() => router.push('/(tabs)/tracker')}
            >
              <Text style={[styles.burnedLabel, { color: theme.textSecondary }]}>
                👣 {t.walking}
              </Text>
              <Text style={[styles.burnedValue, { color: theme.text }]}>
                {totals.walkingBurned}
              </Text>
              <Text style={[styles.sideStatUnit, { color: theme.textMuted }]}>{t.kcal}</Text>
            </TouchableOpacity>

            <View style={[styles.verticalDivider, { backgroundColor: theme.divider }]} />

            <View style={styles.burnedHalfRow}>
              <TouchableOpacity
                style={{ alignItems: 'center', flex: 1 }}
                onPress={() => router.push('/activity')}
              >
                <Text style={[styles.burnedLabel, { color: theme.textSecondary }]}>
                  💪 {t.activity}
                </Text>
                <Text style={[styles.burnedValue, { color: theme.text }]}>
                  {totals.activityBurned}
                </Text>
                <Text style={[styles.sideStatUnit, { color: theme.textMuted }]}>{t.kcal}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.greenCirclePlus}
                onPress={() => router.push('/activity')}
              >
                <Ionicons name="add" size={24} color="#212121" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Gemini AI Food Recognition Quick Action Banner */}
        <TouchableOpacity
          style={[styles.aiPromoCard, { backgroundColor: theme.card, borderColor: COLORS.primary }]}
          onPress={() => router.push('/food/scan')}
          activeOpacity={0.85}
        >
          <View style={styles.aiPromoIcon}>
            <Text style={{ fontSize: 24 }}>📸</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.aiPromoTitle, { color: theme.text }]}>
              {t.aiBannerTitle}
            </Text>
            <Text style={[styles.aiPromoSub, { color: theme.textSecondary }]}>
              {t.aiBannerSub}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Meal Slots Card: Breakfast, Lunch, Dinner, Snacks */}
        <View style={[styles.mealsCard, { backgroundColor: theme.card }]}>
          {MEAL_CONFIG.map((meal, index) => {
            const entries = dayFoods.filter((e) => e.mealType === meal.type);
            const mealCals = Math.round(
              entries.reduce((sum, e) => sum + e.food.calories * e.servings, 0)
            );
            const mealGoal = Math.round(calorieGoal * meal.targetPct);
            const hasEntries = entries.length > 0;

            return (
              <View key={meal.type}>
                <View style={styles.mealRow}>
                  <TouchableOpacity
                    style={styles.mealLeftTouch}
                    onPress={() =>
                      hasEntries
                        ? router.push({ pathname: '/food/history', params: { meal: meal.type } })
                        : router.push({ pathname: '/food/add', params: { meal: meal.type } })
                    }
                  >
                    <View style={[styles.mealEmojiCircle, { backgroundColor: theme.inputBg }]}>
                      <Text style={{ fontSize: 28 }}>{meal.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.mealTitle, { color: theme.text }]}>
                          {mealLabel(meal.type)}
                        </Text>
                        {hasEntries && (
                          <View style={styles.mealCheckBadge}>
                            <Ionicons name="checkmark" size={12} color="#212121" />
                          </View>
                        )}
                      </View>
                      <View style={styles.mealProgressRow}>
                        <View style={[styles.miniBarTrack, { backgroundColor: theme.divider }]}>
                          <View
                            style={[
                              styles.miniBarFill,
                              {
                                width: `${Math.min(100, (mealCals / (mealGoal || 1)) * 100)}%`,
                                backgroundColor: hasEntries ? COLORS.primary : 'transparent',
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.mealCalText, { color: theme.textSecondary }]}>
                          {mealCals} / {mealGoal} {t.kcal}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {hasEntries ? (
                    <TouchableOpacity
                      style={styles.mealChevronBtn}
                      onPress={() =>
                        router.push({ pathname: '/food/history', params: { meal: meal.type } })
                      }
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={22}
                        color={theme.textSecondary}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.greenCirclePlus}
                      onPress={() =>
                        router.push({ pathname: '/food/add', params: { meal: meal.type } })
                      }
                    >
                      <Ionicons name="add" size={24} color="#181A20" />
                    </TouchableOpacity>
                  )}
                </View>

                {index < MEAL_CONFIG.length - 1 && (
                  <View style={[styles.mealDivider, { backgroundColor: theme.divider }]} />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <DateCalendarModal
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Notifications Sheet (Screen 74_Dark_notification) */}
      <Modal
        visible={notifOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setNotifOpen(false)}
      >
        <View style={styles.notifBackdrop}>
          <View style={[styles.notifSheet, { backgroundColor: theme.card }]}>
            <View style={styles.notifHeader}>
              <Text style={[styles.notifTitle, { color: theme.text }]}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifOpen(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            {[
              { icon: '🥗', title: 'Time to log Dinner!', sub: 'You have 1,190 kcal remaining for today.', time: '10m ago' },
              { icon: '💧', title: 'Hydration Reminder', sub: 'Drink 250 mL of water to stay on track with your 2,500 mL goal.', time: '1h ago' },
              { icon: '🔥', title: '7-Day Logging Streak!', sub: 'Great consistency tracking your calories and weight.', time: 'Today' },
            ].map((n, i) => (
              <View key={i} style={[styles.notifItem, { borderBottomColor: theme.divider }]}>
                <View style={[styles.notifIconCircle, { backgroundColor: theme.background }]}>
                  <Text style={{ fontSize: 22 }}>{n.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700' }}>{n.title}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>{n.sub}</Text>
                </View>
                <Text style={{ color: theme.textMuted, fontSize: 11 }}>{n.time}</Text>
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  greenBanner: {
    backgroundColor: COLORS.primary,
    paddingTop: 48,
    paddingBottom: 74,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#181A20',
  },
  notifBellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(24,26,32,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifRedDot: {
    position: 'absolute',
    top: 9,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F54336',
  },
  mealChevronBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreMealLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
    marginTop: 4,
  },
  notifBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  notifSheet: {
    width: '100%',
    maxWidth: 440,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notifTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  notifIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCard: {
    marginHorizontal: 20,
    marginTop: -52,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateArrow: {
    padding: 4,
  },
  dateCenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  calorieRingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sideStat: {
    alignItems: 'center',
    width: 78,
  },
  sideStatLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  sideStatValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  sideStatUnit: {
    fontSize: 13,
    marginTop: 2,
  },
  ringBigValue: {
    fontSize: 34,
    fontWeight: '800',
  },
  ringSubLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 14,
  },
  sectionSmallLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  flexLine: {
    flex: 1,
    height: 1,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  macroCol: {
    alignItems: 'center',
    gap: 8,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  macroGoal: {
    fontSize: 11,
  },
  macroName: {
    fontSize: 14,
    fontWeight: '700',
  },
  burnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  burnedHalf: {
    flex: 1,
    alignItems: 'center',
  },
  burnedHalfRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  burnedLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  burnedValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  verticalDivider: {
    width: 1,
    height: 54,
  },
  greenCirclePlus: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiPromoCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  aiPromoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiPromoTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  aiPromoSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  mealsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  mealLeftTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  mealEmojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  mealCheckBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  miniBarTrack: {
    width: 44,
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  mealCalText: {
    fontSize: 13,
    fontWeight: '600',
  },
  mealDivider: {
    height: 1,
  },
  expandedList: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  loggedEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loggedEntryName: {
    fontSize: 14,
    fontWeight: '700',
  },
  loggedEntrySub: {
    fontSize: 12,
  },
});
