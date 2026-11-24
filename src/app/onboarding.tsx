import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import {
  useNutrio,
  UserProfile,
  calculateCaloriePlan,
} from '@/context/NutrioContext';
import { CircularProgress, MacroDonutChart } from '@/components/CircularProgress';
import { WheelColumn } from '@/components/WheelPicker';
import { HorizontalRuler } from '@/components/HorizontalRuler';

const GOALS: { label: UserProfile['mainGoal']; emoji: string }[] = [
  { label: 'Lose Weight', emoji: '🔥' },
  { label: 'Gain Muscle', emoji: '💪' },
  { label: 'Maintain Weight', emoji: '⚖️' },
  { label: 'Boost Energy', emoji: '⚡' },
  { label: 'Improve Nutrition', emoji: '🥗' },
  { label: 'Gain Weight', emoji: '🎈' },
];

const ACTIVITY_LEVELS: {
  label: UserProfile['activityLevel'];
  emoji: string;
}[] = [
  { label: 'Sedentary', emoji: '🛋️' },
  { label: 'Lightly Active', emoji: '🚶' },
  { label: 'Moderately Active', emoji: '🏃' },
  { label: 'Very Active', emoji: '🏋️' },
  { label: 'Super Active', emoji: '💪' },
];

const DIET_TYPES: { label: UserProfile['dietType']; emoji: string }[] = [
  { label: 'Balanced Diet', emoji: '🥗' },
  { label: 'High Protein', emoji: '🍗' },
  { label: 'Low Carb', emoji: '🥩' },
  { label: 'Vegetarian', emoji: '🥕' },
  { label: 'Vegan', emoji: '🌿' },
  { label: 'Keto', emoji: '🥑' },
  { label: 'Mediterranean', emoji: '🍅' },
];

const MONTHS_NUM = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const DAYS_NUM = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const YEARS_NUM = Array.from({ length: 85 }, (_, i) => String(1940 + i));
const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES_60 = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function OnboardingScreen() {
  const { themeMode, user, updateProfileAndCalculatePlan, t } = useNutrio();
  const theme = getThemeColors(themeMode);

  // step 1..11 = onboarding steps, 12 = Personalizing loading ring, 13 = Plan Ready donut
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || 'Andrew');
  const [gender, setGender] = useState<UserProfile['gender']>(user?.gender || 'Male');

  // Step 3: Birthday 3-wheel (default 12 / 25 / 1995)
  const initialYearIdx = useMemo(() => {
    const idx = YEARS_NUM.indexOf(String(user?.birthYear || 1995));
    return idx >= 0 ? idx : 55;
  }, [user?.birthYear]);
  const [birthMonthIdx, setBirthMonthIdx] = useState(11);
  const [birthDayIdx, setBirthDayIdx] = useState(24);
  const [birthYearIdx, setBirthYearIdx] = useState(initialYearIdx);

  // Step 4, 5, 6: Height, Current Weight, Target Weight rulers
  const [heightCm, setHeightCm] = useState<number>(user?.heightCm || 185.0);
  const [heightUseFt, setHeightUseFt] = useState(false);

  const [currentWeightKg, setCurrentWeightKg] = useState<number>(
    user?.startingWeightKg || 80.0
  );
  const [currentWeightUseLb, setCurrentWeightUseLb] = useState(false);

  const [targetWeightKg, setTargetWeightKg] = useState<number>(
    user?.targetWeightKg || 75.0
  );
  const [targetWeightUseLb, setTargetWeightUseLb] = useState(false);

  // Step 7: Multi-select goals (matches Stage 3 Step 7 where Lose Weight, Gain Muscle, Improve Nutrition can be multi-checked)
  const [selectedGoals, setSelectedGoals] = useState<UserProfile['mainGoal'][]>([
    user?.mainGoal || 'Lose Weight',
    'Gain Muscle',
    'Improve Nutrition',
  ]);

  // Step 8: Activity Level
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>(
    user?.activityLevel || 'Sedentary'
  );

  // Step 9: Diet Type
  const [dietType, setDietType] = useState<UserProfile['dietType']>(
    user?.dietType === 'Balanced' ? 'Balanced Diet' : user?.dietType || 'Balanced Diet'
  );

  // Step 10: Breakfast time wheel (default 08:00 AM)
  const [breakfastHourIdx, setBreakfastHourIdx] = useState(8);
  const [breakfastMinIdx, setBreakfastMinIdx] = useState(0);

  // Step 11: Dinner time wheel (default 20:30 PM)
  const [dinnerHourIdx, setDinnerHourIdx] = useState(20);
  const [dinnerMinIdx, setDinnerMinIdx] = useState(30);

  // Step 12: Personalizing animation progress 0 -> 100
  const [personalizingPct, setPersonalizingPct] = useState(0);

  useEffect(() => {
    if (step !== 12) return;
    const interval = setInterval(() => {
      setPersonalizingPct((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setStep(13), 250);
          return 100;
        }
        return Math.min(100, prev + 9);
      });
    }, 120);
    return () => clearInterval(interval);
  }, [step]);

  const birthYear = Number(YEARS_NUM[birthYearIdx]) || 1995;
  const primaryGoal: UserProfile['mainGoal'] = selectedGoals[0] || 'Lose Weight';
  const breakfastTime = `${HOURS_24[breakfastHourIdx]}:${MINUTES_60[breakfastMinIdx]} ${
    breakfastHourIdx < 12 ? 'AM' : 'PM'
  }`;
  const dinnerTime = `${HOURS_24[dinnerHourIdx]}:${MINUTES_60[dinnerMinIdx]} ${
    dinnerHourIdx < 12 ? 'AM' : 'PM'
  }`;

  const draftProfile: UserProfile = {
    id: user?.id || 'user-temp',
    email: user?.email || 'andrew.ainsley@yourdomain.com',
    name: name.trim() || 'Andrew',
    gender,
    birthYear,
    heightCm,
    startingWeightKg: currentWeightKg,
    currentWeightKg,
    targetWeightKg,
    mainGoal: primaryGoal,
    activityLevel,
    dietType,
    breakfastTime,
    dinnerTime,
    calorieGoal: 2560,
    carbsGoalGrams: 224,
    proteinGoalGrams: 128,
    fatGoalGrams: 128,
    waterGoalMl: 2500,
    stepGoal: 6000,
    cupSizeMl: 250,
    onboardingCompleted: true,
  };

  const calculatedPlan = calculateCaloriePlan(draftProfile);

  const toggleGoalSelection = (goal: UserProfile['mainGoal']) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goal)) {
        return prev.length > 1 ? prev.filter((g) => g !== goal) : prev;
      }
      return [...prev, goal];
    });
  };

  const handleNext = async () => {
    if (step < 11) {
      setStep((s) => s + 1);
    } else if (step === 11) {
      setPersonalizingPct(12);
      setStep(12);
    } else if (step === 13) {
      await updateProfileAndCalculatePlan({
        ...draftProfile,
        ...calculatedPlan,
        onboardingCompleted: true,
      });
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (step > 1 && step <= 11) {
      setStep((s) => s - 1);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/welcome');
    }
  };

  // STEP 12: Personalizing your Nutrio experience... (Circular Lime Progress Ring)
  if (step === 12) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.personalizingWrap}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setStep(11)}
          >
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.readyTitle, { color: theme.text }]}>
            {t.personalizingTitle}
          </Text>

          <View style={styles.personalizingCenter}>
            <CircularProgress
              size={254}
              strokeWidth={18}
              progress={personalizingPct / 100}
              color={COLORS.primary}
              trackColor="#35383F"
            >
              <Text style={[styles.personalizingPctText, { color: theme.text }]}>
                {personalizingPct}%
              </Text>
            </CircularProgress>
          </View>

          <Text style={[styles.personalizingSubText, { color: theme.textSecondary }]}>
            {t.personalizingSub}
          </Text>
        </View>
      </View>
    );
  }

  // STEP 13: Your personalized calorie plan is ready! (Dark Macro Donut + Dark Floating Pills)
  if (step === 13) {
    const totalMacroCals =
      calculatedPlan.carbsGoalGrams * 4 +
      calculatedPlan.proteinGoalGrams * 4 +
      calculatedPlan.fatGoalGrams * 9 || 1;
    const carbsPct = Math.round(((calculatedPlan.carbsGoalGrams * 4) / totalMacroCals) * 100);
    const proteinPct = Math.round(((calculatedPlan.proteinGoalGrams * 4) / totalMacroCals) * 100);
    const fatPct = Math.max(0, 100 - carbsPct - proteinPct);

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.readyScroll}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setStep(11)}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.readyTitle, { color: theme.text }]}>
            {t.planReadyTitle}
          </Text>

          <View style={styles.donutWrapper}>
            <MacroDonutChart
              size={256}
              strokeWidth={24}
              carbsPct={carbsPct}
              proteinPct={proteinPct}
              fatPct={fatPct}
            >
              <View style={styles.donutCenter}>
                <Text style={[styles.planCalories, { color: theme.text }]}>
                  {calculatedPlan.calorieGoal}
                </Text>
                <Text style={[styles.planKcalLabel, { color: theme.textSecondary }]}>
                  {t.kcal}
                </Text>
              </View>
            </MacroDonutChart>

            <View
              style={[
                styles.pctBadge,
                styles.pctCarbs,
                { backgroundColor: '#242731' },
              ]}
            >
              <Text style={[styles.pctText, { color: '#FFFFFF' }]}>{carbsPct}%</Text>
            </View>
            <View
              style={[
                styles.pctBadge,
                styles.pctProtein,
                { backgroundColor: '#242731' },
              ]}
            >
              <Text style={[styles.pctText, { color: '#FFFFFF' }]}>{proteinPct}%</Text>
            </View>
            <View
              style={[
                styles.pctBadge,
                styles.pctFat,
                { backgroundColor: '#242731' },
              ]}
            >
              <Text style={[styles.pctText, { color: '#FFFFFF' }]}>{fatPct}%</Text>
            </View>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.carbs }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                {t.carbs}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.protein }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                {t.protein}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.fat }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                {t.fat}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            { borderTopColor: theme.divider, backgroundColor: theme.background },
          ]}
        >
          <TouchableOpacity style={styles.continueBtn} onPress={handleNext}>
            <Text style={styles.continueBtnText}>{t.startPlanNow}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Progress Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backIconBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={[styles.progressTrack, { backgroundColor: '#35383F' }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${(step / 11) * 100}%`, backgroundColor: COLORS.primary },
            ]}
          />
        </View>
        <Text style={[styles.stepCounter, { color: theme.text }]}>{step} / 11</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.stepContent,
          (step <= 6 || step === 10 || step === 11) && styles.stepCenteredBody,
        ]}
      >
        {/* STEP 1: What's your name? */}
        {step === 1 && (
          <View style={styles.stageCenterContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>{t.step1Title}</Text>
            <View style={styles.centeredControlArea}>
              <TextInput
                style={[
                  styles.nameStageInput,
                  {
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor: theme.inputBorder,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Andrew"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>
        )}

        {/* STEP 2: What's your gender? */}
        {step === 2 && (
          <View style={styles.stageCenterContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>{t.step2Title}</Text>
            <View style={styles.centeredControlArea}>
              <View style={styles.genderCirclesRow}>
                <TouchableOpacity
                  style={styles.genderCircleCol}
                  activeOpacity={0.85}
                  onPress={() => setGender('Male')}
                >
                  <View
                    style={[
                      styles.genderCircle,
                      gender === 'Male'
                        ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                        : { backgroundColor: 'transparent', borderColor: theme.inputBorder },
                    ]}
                  >
                    <Ionicons
                      name="male"
                      size={50}
                      color={gender === 'Male' ? '#181A20' : theme.text}
                    />
                  </View>
                  <Text
                    style={[
                      styles.genderCircleLabel,
                      { color: gender === 'Male' ? COLORS.primary : theme.text },
                    ]}
                  >
                    {t.genderMale}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.genderCircleCol}
                  activeOpacity={0.85}
                  onPress={() => setGender('Female')}
                >
                  <View
                    style={[
                      styles.genderCircle,
                      gender === 'Female'
                        ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                        : { backgroundColor: 'transparent', borderColor: theme.inputBorder },
                    ]}
                  >
                    <Ionicons
                      name="female"
                      size={50}
                      color={gender === 'Female' ? '#181A20' : theme.text}
                    />
                  </View>
                  <Text
                    style={[
                      styles.genderCircleLabel,
                      { color: gender === 'Female' ? COLORS.primary : theme.text },
                    ]}
                  >
                    {t.genderFemale}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.preferNotPill,
                  {
                    borderColor: gender === 'Other' ? COLORS.primary : theme.inputBorder,
                    backgroundColor:
                      gender === 'Other' ? 'rgba(161, 206, 80, 0.14)' : 'transparent',
                  },
                ]}
                onPress={() => setGender('Other')}
              >
                <Text
                  style={[
                    styles.preferNotText,
                    { color: gender === 'Other' ? COLORS.primary : theme.text },
                  ]}
                >
                  {t.preferNotToSay}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: When's your birthday? */}
        {step === 3 && (
          <View style={styles.stageCenterContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>{t.step3Title}</Text>
            <View style={styles.birthdayWheelsRow}>
              <WheelColumn
                label={t.monthLabel}
                values={MONTHS_NUM}
                selectedIndex={birthMonthIdx}
                onChange={setBirthMonthIdx}
                width={106}
              />
              <WheelColumn
                label={t.dayLabel}
                values={DAYS_NUM}
                selectedIndex={birthDayIdx}
                onChange={setBirthDayIdx}
                width={106}
              />
              <WheelColumn
                label={t.yearLabel}
                values={YEARS_NUM}
                selectedIndex={birthYearIdx}
                onChange={setBirthYearIdx}
                width={116}
              />
            </View>
          </View>
        )}

        {/* STEP 4: How tall are you? — Stage 3 Horizontal Ruler (cm / ft) */}
        {step === 4 && (
          <View style={styles.stageCenterContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>{t.step4Title}</Text>
            <View style={styles.centeredControlArea}>
              <HorizontalRuler
                value={heightCm}
                min={120}
                max={230}
                step={0.5}
                unit="cm"
                altUnit="ft"
                useAltUnit={heightUseFt}
                onToggleUnit={setHeightUseFt}
                onChange={setHeightCm}
                formatDisplay={(cm, useFt) => {
                  if (!useFt) return { main: cm.toFixed(1), unitLabel: 'cm' };
                  const totalInches = cm / 2.54;
                  const ft = Math.floor(totalInches / 12);
                  const inches = Math.round(totalInches % 12);
                  return { main: `${ft}'${inches}"`, unitLabel: 'ft' };
                }}
              />
            </View>
          </View>
        )}

        {/* STEP 5: What's your current weight? — Stage 3 Horizontal Ruler (kg / lb) */}
        {step === 5 && (
          <View style={styles.stageCenterContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              {t.step5Title}
            </Text>
            <View style={styles.centeredControlArea}>
              <HorizontalRuler
                value={currentWeightKg}
                min={35}
                max={200}
                step={0.5}
                unit="kg"
                altUnit="lb"
                useAltUnit={currentWeightUseLb}
                onToggleUnit={setCurrentWeightUseLb}
                onChange={setCurrentWeightKg}
                formatDisplay={(kg, useLb) =>
                  useLb
                    ? { main: (kg * 2.20462).toFixed(1), unitLabel: 'lb' }
                    : { main: kg.toFixed(1), unitLabel: 'kg' }
                }
              />
            </View>
          </View>
        )}

        {/* STEP 6: What's your target weight? — Stage 3 Horizontal Ruler (kg / lb) */}
        {step === 6 && (
          <View style={styles.stageCenterContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              {t.step6Title}
            </Text>
            <View style={styles.centeredControlArea}>
              <HorizontalRuler
                value={targetWeightKg}
                min={35}
                max={200}
                step={0.5}
                unit="kg"
                altUnit="lb"
                useAltUnit={targetWeightUseLb}
                onToggleUnit={setTargetWeightUseLb}
                onChange={setTargetWeightKg}
                formatDisplay={(kg, useLb) =>
                  useLb
                    ? { main: (kg * 2.20462).toFixed(1), unitLabel: 'lb' }
                    : { main: kg.toFixed(1), unitLabel: 'kg' }
                }
              />
            </View>
          </View>
        )}

        {/* STEP 7: What's your main goal with Nutrio? — Multi-select Stage 3 */}
        {step === 7 && (
          <>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              {t.step7Title}
            </Text>
            <View style={styles.cardsList}>
              {GOALS.map((g) => {
                const selected = selectedGoals.includes(g.label);
                return (
                  <TouchableOpacity
                    key={g.label}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: selected ? COLORS.primary : 'transparent',
                      },
                    ]}
                    onPress={() => toggleGoalSelection(g.label)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.optionEmoji}>{g.emoji}</Text>
                    <Text style={[styles.optionTitle, { color: theme.text }]}>{g.label}</Text>
                    {selected && <Ionicons name="checkmark" size={22} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* STEP 8: What's your activity level? — 5 clean single-line cards */}
        {step === 8 && (
          <>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              {t.step8Title}
            </Text>
            <View style={styles.cardsList}>
              {ACTIVITY_LEVELS.map((act) => {
                const selected = activityLevel === act.label;
                return (
                  <TouchableOpacity
                    key={act.label}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: selected ? COLORS.primary : 'transparent',
                      },
                    ]}
                    onPress={() => setActivityLevel(act.label)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.optionEmoji}>{act.emoji}</Text>
                    <Text style={[styles.optionTitle, { color: theme.text }]}>{act.label}</Text>
                    {selected && <Ionicons name="checkmark" size={22} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* STEP 9: What's your diet type? — 7 clean single-line cards */}
        {step === 9 && (
          <>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              {t.step9Title}
            </Text>
            <View style={styles.cardsList}>
              {DIET_TYPES.map((d) => {
                const selected = dietType === d.label;
                return (
                  <TouchableOpacity
                    key={d.label}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: selected ? COLORS.primary : 'transparent',
                      },
                    ]}
                    onPress={() => setDietType(d.label)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.optionEmoji}>{d.emoji}</Text>
                    <Text style={[styles.optionTitle, { color: theme.text }]}>{d.label}</Text>
                    {selected && <Ionicons name="checkmark" size={22} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* STEP 10: When do you usually have breakfast? — 2-column Time Wheel */}
        {step === 10 && (
          <View style={styles.stageCenterContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              {t.step10Title}
            </Text>
            <View style={styles.timeWheelsRow}>
              <WheelColumn
                values={HOURS_24}
                selectedIndex={breakfastHourIdx}
                onChange={setBreakfastHourIdx}
                width={136}
              />
              <WheelColumn
                values={MINUTES_60}
                selectedIndex={breakfastMinIdx}
                onChange={setBreakfastMinIdx}
                width={146}
                suffix={breakfastHourIdx < 12 ? 'AM' : 'PM'}
              />
            </View>
          </View>
        )}

        {/* STEP 11: When do you usually have dinner? — 2-column Time Wheel */}
        {step === 11 && (
          <View style={styles.stageCenterContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              {t.step11Title}
            </Text>
            <View style={styles.timeWheelsRow}>
              <WheelColumn
                values={HOURS_24}
                selectedIndex={dinnerHourIdx}
                onChange={setDinnerHourIdx}
                width={136}
              />
              <WheelColumn
                values={MINUTES_60}
                selectedIndex={dinnerMinIdx}
                onChange={setDinnerMinIdx}
                width={146}
                suffix={dinnerHourIdx < 12 ? 'AM' : 'PM'}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { borderTopColor: theme.divider, backgroundColor: theme.background },
        ]}
      >
        <TouchableOpacity style={styles.continueBtn} onPress={handleNext}>
          <Text style={styles.continueBtnText}>
            {step === 11 ? t.finishBtn : t.continueBtn}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 16,
    gap: 18,
  },
  backIconBtn: {
    padding: 4,
  },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  stepCounter: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 44,
    textAlign: 'right',
  },
  stepContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
  },
  stepCenteredBody: {
    flexGrow: 1,
  },
  stageCenterContainer: {
    flex: 1,
    alignItems: 'center',
  },
  centeredControlArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 36,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  nameStageInput: {
    width: '100%',
    height: 92,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  genderCirclesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 44,
    marginBottom: 44,
  },
  genderCircleCol: {
    alignItems: 'center',
    gap: 18,
  },
  genderCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderCircleLabel: {
    fontSize: 19,
    fontWeight: '700',
  },
  preferNotPill: {
    paddingHorizontal: 32,
    height: 46,
    borderRadius: 1000,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferNotText: {
    fontSize: 15,
    fontWeight: '700',
  },
  birthdayWheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  timeWheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 28,
    gap: 12,
  },
  cardsList: {
    marginTop: 12,
    gap: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 68,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 18,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    height: 58,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181A20',
  },
  personalizingWrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 42,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personalizingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalizingPctText: {
    fontSize: 52,
    fontWeight: '800',
  },
  personalizingSubText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.85,
  },
  readyScroll: {
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 32,
    alignItems: 'center',
  },
  closeBtn: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  readyTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 32,
  },
  donutWrapper: {
    width: 296,
    height: 296,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  donutCenter: {
    alignItems: 'center',
  },
  planCalories: {
    fontSize: 44,
    fontWeight: '800',
  },
  planKcalLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 2,
  },
  pctBadge: {
    position: 'absolute',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  pctCarbs: {
    left: 2,
    top: 72,
  },
  pctProtein: {
    right: 12,
    top: 22,
  },
  pctFat: {
    right: 18,
    bottom: 24,
  },
  pctText: {
    fontSize: 16,
    fontWeight: '800',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
