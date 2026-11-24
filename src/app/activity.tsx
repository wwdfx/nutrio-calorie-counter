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

const PRESET_ACTIVITIES = [
  { name: 'Basketball', emoji: '🏀', caloriesPer30Min: 244 },
  { name: 'Skiing', emoji: '🎿', caloriesPer30Min: 260 },
  { name: 'Scuba Diving', emoji: '🤿', caloriesPer30Min: 210 },
  { name: 'Table Tennis', emoji: '🏓', caloriesPer30Min: 150 },
  { name: 'Running (8 mph)', emoji: '🏃', caloriesPer30Min: 340 },
  { name: 'Cycling', emoji: '🚴', caloriesPer30Min: 270 },
  { name: 'Strength Training', emoji: '🏋️', caloriesPer30Min: 220 },
  { name: 'Swimming', emoji: '🏊', caloriesPer30Min: 290 },
];

export default function ActivityLogScreen() {
  const {
    themeMode,
    t,
    selectedDate,
    loggedActivities,
    addActivityLog,
    removeActivityLog,
  } = useNutrio();
  const theme = getThemeColors(themeMode);

  const [createOpen, setCreateOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCals, setCustomCals] = useState('220');
  const [customMins, setCustomMins] = useState('30');

  const dayActivities = loggedActivities.filter((a) => a.date === selectedDate);
  const totalBurned = dayActivities.reduce((sum, a) => sum + a.caloriesBurned, 0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>{t.activityLogTitle}</Text>
        <TouchableOpacity onPress={() => setCreateOpen(true)}>
          <Ionicons name="add-circle-outline" size={26} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logged Activities Today matching Screen 66 */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>
              {t.totalBurnedToday}
            </Text>
            <Text style={[styles.totalVal, { color: COLORS.primaryDark }]}>
              {totalBurned} {t.kcal}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {dayActivities.length === 0 ? (
            <Text style={{ color: theme.textSecondary, paddingVertical: 14 }}>
              {t.noActivitiesYet}
            </Text>
          ) : (
            dayActivities.map((act, idx) => (
              <View key={act.id}>
                <View style={styles.actRow}>
                  <Text style={{ fontSize: 30 }}>{act.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.actName, { color: theme.text }]}>
                      {act.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                      {act.caloriesBurned} kcal · {act.durationMinutes} mins
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeActivityLog(act.id)}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
                {idx < dayActivities.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                )}
              </View>
            ))
          )}
        </View>

        {/* Popular Activities Catalog */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionHeader, { color: theme.text }]}>
            {t.quickAddExercise}
          </Text>
          {PRESET_ACTIVITIES.map((p, idx) => (
            <View key={p.name}>
              <TouchableOpacity
                style={styles.actRow}
                onPress={async () => {
                  await addActivityLog({
                    name: p.name,
                    emoji: p.emoji,
                    caloriesBurned: p.caloriesPer30Min,
                    durationMinutes: 30,
                  });
                }}
              >
                <Text style={{ fontSize: 30 }}>{p.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actName, { color: theme.text }]}>{p.name}</Text>
                  <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                    {p.caloriesPer30Min} kcal · 30 mins
                  </Text>
                </View>
                <View style={styles.plusBtn}>
                  <Ionicons name="add" size={20} color="#212121" />
                </View>
              </TouchableOpacity>
              {idx < PRESET_ACTIVITIES.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={createOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Create Custom Activity
            </Text>
            <Text style={[styles.label, { color: theme.text }]}>Activity Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
              value={customName}
              onChangeText={setCustomName}
              placeholder="e.g. HIIT Workout"
              placeholderTextColor={theme.textMuted}
            />
            <Text style={[styles.label, { color: theme.text }]}>Calories Burned (kcal)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
              value={customCals}
              onChangeText={setCustomCals}
              keyboardType="numeric"
            />
            <Text style={[styles.label, { color: theme.text }]}>Duration (minutes)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
              value={customMins}
              onChangeText={setCustomMins}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={async () => {
                await addActivityLog({
                  name: customName.trim() || 'Custom Workout',
                  emoji: '🔥',
                  caloriesBurned: Number(customCals) || 200,
                  durationMinutes: Number(customMins) || 30,
                });
                setCreateOpen(false);
              }}
            >
              <Text style={styles.saveBtnText}>Add Activity</Text>
            </TouchableOpacity>
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
  navTitle: {
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
    padding: 18,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '800',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  divider: {
    height: 1,
  },
  actRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  actName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#212121',
  },
});
