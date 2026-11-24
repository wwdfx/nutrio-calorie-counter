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
import { COLORS, getThemeColors } from '@/constants/theme';
import { getLanguageMeta } from '@/constants/i18n';
import { useNutrio, formatDateKey } from '@/context/NutrioContext';
import { DateCalendarModal } from '@/components/DateCalendarModal';

export default function WeightTrackerScreen() {
  const {
    themeMode,
    language,
    t,
    user,
    weightHistory,
    addOrUpdateWeight,
    deleteWeightEntry,
    updateProfileAndCalculatePlan,
  } = useNutrio();
  const theme = getThemeColors(themeMode);
  const locale = getLanguageMeta(language).locale;

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [fullCalendarOpen, setFullCalendarOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  const [logDate, setLogDate] = useState(formatDateKey());
  const [keypadWeight, setKeypadWeight] = useState(
    String(user?.currentWeightKg || 78.4)
  );
  const [newTargetWeight, setNewTargetWeight] = useState(
    String(user?.targetWeightKg || 75.0)
  );

  const currentWeight = user?.currentWeightKg || 78.4;
  const startWeight = user?.startingWeightKg || 80.0;
  const goalWeight = user?.targetWeightKg || 75.0;

  const totalToLose = Math.abs(startWeight - goalWeight) || 1;
  const lostSoFar = Math.max(0, Math.abs(startWeight - currentWeight));
  const progressPct = Math.min(100, (lostSoFar / totalToLose) * 100);

  // Build 7-day strip around logDate for Screen 93_Light_weight tracker - update weight
  const weekStrip = useMemo(() => {
    const parts = logDate.split('-').map(Number);
    const center = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    const days: { key: string; dayShort: string; dayNum: number; hasEntry: boolean }[] = [];
    for (let offset = -3; offset <= 3; offset++) {
      const d = new Date(center);
      d.setDate(center.getDate() + offset);
      const key = formatDateKey(d);
      const dayShort = d.toLocaleString(locale, { weekday: 'short' });
      days.push({
        key,
        dayShort,
        dayNum: d.getDate(),
        hasEntry: weightHistory.some((w) => w.date === key),
      });
    }
    return days;
  }, [logDate, weightHistory, locale]);

  // Marked dates for full month Weight Calendar
  const markedWeightDates = useMemo(() => {
    const map: Record<string, { label?: string; dotColor?: string }> = {};
    for (const w of weightHistory) {
      map[w.date] = {
        label: `${w.weightKg}`,
        dotColor: COLORS.weight,
      };
    }
    return map;
  }, [weightHistory]);

  // Reversed history list with diffs matching Screen 92/94
  const sortedHistory = useMemo(() => {
    const asc = [...weightHistory].sort((a, b) => a.date.localeCompare(b.date));
    return asc
      .map((entry, idx) => {
        const prev = idx > 0 ? asc[idx - 1].weightKg : startWeight;
        const diff = Math.round((entry.weightKg - prev) * 10) / 10;
        return { ...entry, diff };
      })
      .reverse();
  }, [weightHistory, startWeight]);

  const handleKeypadPress = (key: string) => {
    if (key === 'BACK') {
      setKeypadWeight((prev) => (prev.length > 1 ? prev.slice(0, -1) : ''));
      return;
    }
    if (key === '.') {
      if (!keypadWeight.includes('.')) {
        setKeypadWeight((prev) => `${prev || '0'}.`);
      }
      return;
    }
    setKeypadWeight((prev) => {
      if (prev.includes('.') && prev.split('.')[1]?.length >= 1) {
        return prev;
      }
      return prev === '0' ? key : `${prev}${key}`;
    });
  };

  const handleSaveWeight = async () => {
    const val = parseFloat(keypadWeight);
    if (!isNaN(val) && val > 20 && val < 300) {
      await addOrUpdateWeight(val, logDate);
    }
    setUpdateModalOpen(false);
  };

  const formatEntryDate = (dateKey: string) => {
    const todayKey = formatDateKey();
    const parts = dateKey.split('-').map(Number);
    const d = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    const formatted = d.toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (dateKey === todayKey) return `${t.today}, ${formatted}`;
    return formatted;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Top Navbar matching Screen 92_Light_weight tracker */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>{t.weightTrackerTitle}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => setFullCalendarOpen(true)}
            style={styles.iconBtn}
          >
            <Ionicons name="calendar-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setGoalModalOpen(true)}
            style={styles.iconBtn}
          >
            <Ionicons name="settings-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Current Weight & Progress Card */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.current}</Text>
          <View style={styles.currentWeightRow}>
            <Text style={[styles.bigWeightText, { color: theme.text }]}>
              {currentWeight.toFixed(1)}
            </Text>
            <Text style={[styles.kgUnit, { color: theme.textSecondary }]}>kg</Text>
            {sortedHistory[0] && (
              <View style={styles.diffBadge}>
                <Ionicons
                  name={
                    sortedHistory[0].diff <= 0
                      ? 'arrow-down-circle'
                      : 'arrow-up-circle'
                  }
                  size={18}
                  color={
                    sortedHistory[0].diff <= 0 ? COLORS.success : COLORS.danger
                  }
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color:
                      sortedHistory[0].diff <= 0 ? COLORS.success : COLORS.danger,
                  }}
                >
                  {sortedHistory[0].diff > 0
                    ? `+ ${sortedHistory[0].diff.toFixed(1)} kg`
                    : `- ${Math.abs(sortedHistory[0].diff).toFixed(1)} kg`}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.orangeTrack, { backgroundColor: theme.divider }]}>
            <View style={[styles.orangeFill, { width: `${progressPct}%` }]} />
          </View>

          <View style={styles.startGoalRow}>
            <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
              {t.starting}: {startWeight.toFixed(1)} kg
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
              {t.goal}: {goalWeight.toFixed(1)} kg
            </Text>
          </View>

          <TouchableOpacity
            style={styles.orangeFullBtn}
            onPress={() => {
              setKeypadWeight(String(currentWeight));
              setUpdateModalOpen(true);
            }}
          >
            <Text style={styles.orangeFullBtnText}>{t.update}</Text>
          </TouchableOpacity>
        </View>

        {/* Interactive Weight Calendar Card */}
        <TouchableOpacity
          style={[styles.calendarBanner, { backgroundColor: theme.card }]}
          onPress={() => setFullCalendarOpen(true)}
        >
          <View style={styles.calendarIconCircle}>
            <Ionicons name="calendar" size={22} color={COLORS.weight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.calBannerTitle, { color: theme.text }]}>
              {t.weightCalendarView}
            </Text>
            <Text style={{ fontSize: 13, color: theme.textSecondary }}>
              {t.weightCalendarSub}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.weight} />
        </TouchableOpacity>

        {/* Weight History List matching Screen 92/94 */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
              {t.history}
            </Text>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => setFullCalendarOpen(true)}
            >
              <Text style={styles.viewAllText}>{t.calendar}</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.weight} />
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {sortedHistory.map((item, idx) => {
            const isLoss = item.diff <= 0;
            return (
              <View key={item.id}>
                <View style={styles.historyRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyWeight, { color: theme.text }]}>
                      {item.weightKg.toFixed(1)} kg
                    </Text>
                    <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                      {formatEntryDate(item.date)}
                    </Text>
                  </View>

                  <View style={styles.diffBadge}>
                    <Ionicons
                      name={isLoss ? 'arrow-down-circle' : 'arrow-up-circle'}
                      size={18}
                      color={isLoss ? COLORS.success : COLORS.danger}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: isLoss ? COLORS.success : COLORS.danger,
                      }}
                    >
                      {isLoss
                        ? `- ${Math.abs(item.diff).toFixed(1)} kg`
                        : `+ ${item.diff.toFixed(1)} kg`}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setLogDate(item.date);
                      setKeypadWeight(String(item.weightKg));
                      setUpdateModalOpen(true);
                    }}
                    onLongPress={() => deleteWeightEntry(item.id)}
                    style={{ padding: 6 }}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={18}
                      color={theme.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {idx < sortedHistory.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Screen 93_Light_weight tracker - update weight Bottom Sheet with Week Calendar Strip & Keypad */}
      <Modal
        visible={updateModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setUpdateModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.updateSheet, { backgroundColor: theme.card }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: theme.text }]}>{t.updateWeight}</Text>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            {/* Month Navigation Row */}
            <View style={styles.monthNavRow}>
              <TouchableOpacity
                onPress={() => {
                  const parts = logDate.split('-').map(Number);
                  const d = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
                  d.setDate(d.getDate() - 7);
                  setLogDate(formatDateKey(d));
                }}
              >
                <Ionicons name="chevron-back" size={22} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.monthLabel, { color: theme.text }]}>
                {new Date(
                  Number(logDate.split('-')[0]),
                  Number(logDate.split('-')[1]) - 1,
                  Number(logDate.split('-')[2])
                ).toLocaleString(locale, { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const parts = logDate.split('-').map(Number);
                  const d = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
                  d.setDate(d.getDate() + 7);
                  setLogDate(formatDateKey(d));
                }}
              >
                <Ionicons name="chevron-forward" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* 7-Day Horizontal Calendar Strip matching Screen 93 */}
            <View style={styles.weekStripRow}>
              {weekStrip.map((day) => {
                const selected = day.key === logDate;
                return (
                  <View key={day.key} style={{ alignItems: 'center' }}>
                    <TouchableOpacity
                      style={[
                        styles.dayPill,
                        {
                          backgroundColor: selected ? COLORS.weight : theme.card,
                          borderColor: selected ? COLORS.weight : theme.divider,
                        },
                      ]}
                      onPress={() => {
                        setLogDate(day.key);
                        const existing = weightHistory.find((w) => w.date === day.key);
                        if (existing) setKeypadWeight(String(existing.weightKg));
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: selected ? '#FFFFFF' : theme.textSecondary,
                        }}
                      >
                        {day.dayShort}
                      </Text>
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: '800',
                          color: selected ? '#FFFFFF' : theme.text,
                          marginTop: 4,
                        }}
                      >
                        {day.dayNum}
                      </Text>
                    </TouchableOpacity>
                    { (selected || day.hasEntry) && (
                      <View style={styles.orangeDot} />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Large Weight Display Box */}
            <View style={[styles.weightDisplayBox, { backgroundColor: theme.inputBg }]}>
              <Text style={[styles.displayWeightVal, { color: theme.text }]}>
                {keypadWeight || '0'}
              </Text>
              <View style={styles.orangeCursor} />
              <Text style={[styles.displayKg, { color: theme.textSecondary }]}>kg</Text>
            </View>

            {/* Cancel / Save Buttons */}
            <View style={styles.sheetActionRow}>
              <TouchableOpacity
                style={styles.cancelOutlineBtn}
                onPress={() => setUpdateModalOpen(false)}
              >
                <Text style={styles.cancelOutlineText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveOrangeBtn} onPress={handleSaveWeight}>
                <Text style={styles.saveOrangeText}>{t.save}</Text>
              </TouchableOpacity>
            </View>

            {/* Custom Numeric Keypad matching Screen 93 */}
            <View style={[styles.keypadContainer, { backgroundColor: theme.inputBg }]}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['.', '0', 'BACK'],
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((k) => (
                    <TouchableOpacity
                      key={k}
                      style={styles.keypadKey}
                      onPress={() => handleKeypadPress(k)}
                    >
                      {k === 'BACK' ? (
                        <Ionicons name="backspace-outline" size={24} color={theme.text} />
                      ) : (
                        <Text style={[styles.keypadKeyText, { color: theme.text }]}>
                          {k}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Full Month Weight Calendar Modal */}
      <DateCalendarModal
        visible={fullCalendarOpen}
        onClose={() => setFullCalendarOpen(false)}
        selectedDate={logDate}
        title={t.weightCalendarTitle}
        markedDates={markedWeightDates}
        onSelectDate={(dateKey) => {
          setLogDate(dateKey);
          const existing = weightHistory.find((w) => w.date === dateKey);
          setKeypadWeight(String(existing ? existing.weightKg : currentWeight));
          setUpdateModalOpen(true);
        }}
      />

      {/* Weight Goal Setting Modal */}
      <Modal
        visible={goalModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setGoalModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.updateSheet, { backgroundColor: theme.card, paddingBottom: 32 }]}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>
              Set Target Weight Goal
            </Text>
            <View style={[styles.weightDisplayBox, { backgroundColor: theme.inputBg, marginVertical: 16 }]}>
              <TouchableOpacity
                onPress={() =>
                  setNewTargetWeight((w) => String(Math.max(40, Number(w) - 0.5)))
                }
                style={{ padding: 12 }}
              >
                <Ionicons name="remove-circle-outline" size={32} color={COLORS.weight} />
              </TouchableOpacity>
              <Text style={[styles.displayWeightVal, { color: theme.text }]}>
                {Number(newTargetWeight).toFixed(1)}
              </Text>
              <Text style={[styles.displayKg, { color: theme.textSecondary }]}>kg</Text>
              <TouchableOpacity
                onPress={() =>
                  setNewTargetWeight((w) => String(Math.min(200, Number(w) + 0.5)))
                }
                style={{ padding: 12 }}
              >
                <Ionicons name="add-circle-outline" size={32} color={COLORS.weight} />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetActionRow}>
              <TouchableOpacity
                style={styles.cancelOutlineBtn}
                onPress={() => setGoalModalOpen(false)}
              >
                <Text style={styles.cancelOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveOrangeBtn}
                onPress={async () => {
                  await updateProfileAndCalculatePlan({
                    targetWeightKg: Number(newTargetWeight) || 75.0,
                  });
                  setGoalModalOpen(false);
                }}
              >
                <Text style={styles.saveOrangeText}>Update Goal</Text>
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
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 12,
  },
  currentWeightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  bigWeightText: {
    fontSize: 40,
    fontWeight: '800',
  },
  kgUnit: {
    fontSize: 18,
    fontWeight: '600',
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 6,
  },
  orangeTrack: {
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    marginBottom: 10,
  },
  orangeFill: {
    height: '100%',
    backgroundColor: COLORS.weight,
    borderRadius: 9,
  },
  startGoalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  orangeFullBtn: {
    backgroundColor: COLORS.weight,
    height: 54,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orangeFullBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  calendarBanner: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  calendarIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 87, 38, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewAllText: {
    color: COLORS.weight,
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  historyWeight: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  updateSheet: {
    width: '100%',
    maxWidth: 430,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  weekStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  dayPill: {
    width: 46,
    height: 68,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.weight,
    marginTop: 4,
  },
  weightDisplayBox: {
    marginHorizontal: 24,
    height: 82,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  displayWeightVal: {
    fontSize: 42,
    fontWeight: '800',
  },
  orangeCursor: {
    width: 3,
    height: 42,
    backgroundColor: COLORS.weight,
    marginHorizontal: 4,
  },
  displayKg: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  sheetActionRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 14,
    marginBottom: 18,
  },
  cancelOutlineBtn: {
    flex: 1,
    height: 54,
    borderRadius: 1000,
    borderWidth: 1.5,
    borderColor: COLORS.weight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelOutlineText: {
    color: COLORS.weight,
    fontSize: 16,
    fontWeight: '700',
  },
  saveOrangeBtn: {
    flex: 1,
    height: 54,
    borderRadius: 1000,
    backgroundColor: COLORS.weight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveOrangeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  keypadContainer: {
    paddingVertical: 14,
    paddingBottom: 28,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 6,
  },
  keypadKey: {
    width: 90,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyText: {
    fontSize: 24,
    fontWeight: '700',
  },
});
