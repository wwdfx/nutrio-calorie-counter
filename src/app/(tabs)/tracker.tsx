import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio } from '@/context/NutrioContext';
import { CircularProgress } from '@/components/CircularProgress';
import { NutrioLogo } from '@/components/NutrioLogo';

const BMI_SEGMENTS = [
  { color: '#3F51B5', flex: 0.7 },
  { color: '#1A96F0', flex: 0.8 },
  { color: '#00BCD4', flex: 0.9 },
  { color: '#4AAF57', flex: 1.8 },
  { color: '#FFC107', flex: 1.4 },
  { color: '#FF981F', flex: 1.4 },
  { color: '#FF5726', flex: 1.4 },
  { color: '#F54336', flex: 0.7 },
];

export default function TrackerHubScreen() {
  const {
    themeMode,
    t,
    user,
    selectedDate,
    waterByDate,
    stepsByDate,
    weightHistory,
    updateWater,
    updateSteps,
    updateProfileAndCalculatePlan,
  } = useNutrio();
  const theme = getThemeColors(themeMode);

  const [bmiModalOpen, setBmiModalOpen] = useState(false);
  const [editHeight, setEditHeight] = useState(String(user?.heightCm || 185));
  const [editWeight, setEditWeight] = useState(String(user?.currentWeightKg || 78.5));
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [stepInput, setStepInput] = useState(String(stepsByDate[selectedDate] || 0));

  const waterMl = waterByDate[selectedDate] || 0;
  const waterGoal = user?.waterGoalMl || 2500;
  const cupSize = user?.cupSizeMl || 250;

  const steps = stepsByDate[selectedDate] || 0;
  const stepGoal = user?.stepGoal || 6000;

  const currentWeight = user?.currentWeightKg || 78.5;
  const startWeight = user?.startingWeightKg || 80.0;
  const goalWeight = user?.targetWeightKg || 75.0;

  const prevWeight =
    weightHistory.length >= 2
      ? weightHistory[weightHistory.length - 2].weightKg
      : startWeight;
  const weightDiff = Math.round((currentWeight - prevWeight) * 10) / 10;

  const totalToLose = Math.abs(startWeight - goalWeight) || 1;
  const lostSoFar = Math.max(0, Math.abs(startWeight - currentWeight));
  const weightProgressPct = Math.min(100, (lostSoFar / totalToLose) * 100);

  const heightMeters = (user?.heightCm || 185) / 100;
  const bmi = Math.round((currentWeight / (heightMeters * heightMeters)) * 10) / 10;
  const bmiCategory =
    bmi < 18.5
      ? t.bmiUnderweight
      : bmi < 25
      ? t.bmiNormal
      : bmi < 30
      ? t.bmiOverweight
      : t.bmiObese;

  const handleSaveBmi = async () => {
    await updateProfileAndCalculatePlan({
      heightCm: Number(editHeight) || 185,
      currentWeightKg: Number(editWeight) || 78.5,
    });
    setBmiModalOpen(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Top Header matching Screen 76_Dark_tracker */}
      <View style={styles.header}>
        <NutrioLogo size={28} color={COLORS.primary} eyeColor={theme.background} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.trackerTitle}</Text>
        <TouchableOpacity onPress={() => router.push('/weight')}>
          <Ionicons name="calendar-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Water Tracker Card */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.waterRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{t.water}</Text>
              <View style={styles.valueUnitRow}>
                <Text style={[styles.bigNumber, { color: theme.text }]}>
                  {waterMl}
                </Text>
                <Text style={[styles.unitText, { color: theme.textSecondary }]}>mL</Text>
              </View>
              <Text style={[styles.goalSub, { color: theme.textMuted }]}>
                / {waterGoal.toLocaleString()} mL
              </Text>
            </View>

            <View style={styles.waterControls}>
              <TouchableOpacity
                style={[styles.blueCircleOutline, { borderColor: COLORS.water }]}
                onPress={() => updateWater(-cupSize)}
              >
                <Ionicons name="remove" size={22} color={theme.text} />
              </TouchableOpacity>

              <View
                style={[
                  styles.waterDropContainer,
                  {
                    backgroundColor:
                      waterMl > 0 ? 'rgba(26, 150, 240, 0.14)' : theme.inputBg,
                  },
                ]}
              >
                <Ionicons
                  name="water"
                  size={44}
                  color={waterMl > 0 ? COLORS.water : theme.divider}
                />
                <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.water }}>
                  {Math.min(100, Math.round((waterMl / waterGoal) * 100))}%
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.blueCircleOutline, { borderColor: COLORS.water }]}
                onPress={() => updateWater(cupSize)}
              >
                <Ionicons name="add" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 2. Step Counter Card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={() => {
            setStepInput(String(steps));
            setStepModalOpen(true);
          }}
          activeOpacity={0.85}
        >
          <View style={styles.waterRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{t.step}</Text>
              <View style={styles.valueUnitRow}>
                <Text style={[styles.bigNumber, { color: theme.text }]}>
                  {steps.toLocaleString()}
                </Text>
                <Text style={[styles.unitText, { color: theme.textSecondary }]}>
                  {t.steps}
                </Text>
              </View>
              <Text style={[styles.goalSub, { color: theme.textMuted }]}>
                / {stepGoal.toLocaleString()} {t.steps} ({t.tapToUpdate})
              </Text>
            </View>

            <CircularProgress
              size={98}
              strokeWidth={10}
              progress={steps / stepGoal}
              color={COLORS.steps}
              trackColor={theme.divider}
            >
              <TouchableOpacity
                style={styles.stepQuickPlus}
                onPress={() => updateSteps(steps + 500)}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.steps }}>
                  +500
                </Text>
              </TouchableOpacity>
            </CircularProgress>
          </View>
        </TouchableOpacity>

        {/* 3. Weight Tracker Card -> Opens Weight Calendar & History */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.weightTopRow}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{t.weight}</Text>
              <View style={styles.valueUnitRow}>
                <Text style={[styles.bigNumber, { color: theme.text }]}>
                  {currentWeight.toFixed(1)}
                </Text>
                <Text style={[styles.unitText, { color: theme.textSecondary }]}>kg</Text>
                <View style={styles.diffBadge}>
                  <Ionicons
                    name={weightDiff <= 0 ? 'arrow-down-circle' : 'arrow-up-circle'}
                    size={16}
                    color={weightDiff <= 0 ? COLORS.success : COLORS.danger}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: weightDiff <= 0 ? COLORS.success : COLORS.danger,
                    }}
                  >
                    {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.orangeUpdateBtn}
              onPress={() => router.push('/weight')}
            >
              <Text style={styles.orangeUpdateText}>{t.update}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.orangeProgressTrack, { backgroundColor: theme.divider }]}>
            <View
              style={[
                styles.orangeProgressFill,
                { width: `${weightProgressPct}%` },
              ]}
            />
          </View>

          <View style={styles.weightFooterRow}>
            <Text style={[styles.goalSub, { color: theme.textSecondary }]}>
              {t.starting}: {startWeight.toFixed(1)} kg
            </Text>
            <Text style={[styles.goalSub, { color: theme.textSecondary }]}>
              {t.goal}: {goalWeight.toFixed(1)} kg
            </Text>
          </View>
        </View>

        {/* 4. BMI (kg/m2) Card matching Screen 76 */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.weightTopRow}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{t.bmiTitle}</Text>
              <View style={styles.valueUnitRow}>
                <Text style={[styles.bigNumber, { color: theme.text }]}>{bmi}</Text>
                <Text style={[styles.unitText, { color: theme.textSecondary }]}>
                  {bmiCategory}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.editCircleBtn, { borderColor: theme.divider }]}
              onPress={() => {
                setEditHeight(String(user?.heightCm || 185));
                setEditWeight(String(user?.currentWeightKg || 78.5));
                setBmiModalOpen(true);
              }}
            >
              <Ionicons name="pencil-outline" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Multi-color BMI Spectrum Bar */}
          <View style={styles.bmiBarRow}>
            {BMI_SEGMENTS.map((seg, i) => (
              <View
                key={i}
                style={[
                  styles.bmiSegment,
                  { backgroundColor: seg.color, flex: seg.flex },
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Edit BMI Modal (Screen 97_Light_edit BMI) */}
      <Modal
        visible={bmiModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setBmiModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit BMI</Text>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Height (cm)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.text }]}
              value={editHeight}
              onChangeText={setEditHeight}
              keyboardType="numeric"
            />
            <Text style={[styles.inputLabel, { color: theme.text }]}>Weight (kg)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.text }]}
              value={editWeight}
              onChangeText={setEditWeight}
              keyboardType="numeric"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: COLORS.primary }]}
                onPress={() => setBmiModalOpen(false)}
              >
                <Text style={{ fontWeight: '700', color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveBmi}>
                <Text style={{ fontWeight: '700', color: '#212121' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Steps Modal */}
      <Modal
        visible={stepModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setStepModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Update Steps</Text>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Steps Today</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.text }]}
              value={stepInput}
              onChangeText={setStepInput}
              keyboardType="numeric"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: COLORS.steps }]}
                onPress={() => setStepModalOpen(false)}
              >
                <Text style={{ fontWeight: '700', color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: COLORS.steps }]}
                onPress={async () => {
                  await updateSteps(Number(stepInput) || 0);
                  setStepModalOpen(false);
                }}
              >
                <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Save Steps</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
  },
  waterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  valueUnitRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  bigNumber: {
    fontSize: 34,
    fontWeight: '800',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalSub: {
    fontSize: 13,
    marginTop: 6,
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  blueCircleOutline: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterDropContainer: {
    width: 84,
    height: 98,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  stepQuickPlus: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 152, 31, 0.15)',
  },
  weightTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 6,
  },
  orangeUpdateBtn: {
    backgroundColor: COLORS.weight,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 1000,
  },
  orangeUpdateText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  orangeProgressTrack: {
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  orangeProgressFill: {
    height: '100%',
    backgroundColor: COLORS.weight,
    borderRadius: 8,
  },
  weightFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bmiBarRow: {
    flexDirection: 'row',
    height: 10,
    gap: 4,
    marginTop: 6,
  },
  bmiSegment: {
    height: '100%',
    borderRadius: 5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalSheet: {
    width: '100%',
    maxWidth: 430,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 1000,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 1000,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
