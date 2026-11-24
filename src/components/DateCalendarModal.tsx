import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio } from '@/context/NutrioContext';

interface DateCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  markedDates?: Record<string, { label?: string; dotColor?: string }>;
  title?: string;
}

export function DateCalendarModal({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
  markedDates = {},
  title,
}: DateCalendarModalProps) {
  const { themeMode, t } = useNutrio();
  const theme = getThemeColors(themeMode);
  const effectiveTitle = title || t.selectDate;

  const initialParts = selectedDate.split('-').map(Number);
  const [viewYear, setViewYear] = useState(initialParts[0] || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState((initialParts[1] || new Date().getMonth() + 1) - 1);

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: {
      dateKey: string;
      dayNumber: number;
      inCurrentMonth: boolean;
    }[] = [];

    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const key = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dateKey: key, dayNumber: d, inCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dateKey: key, dayNumber: d, inCurrentMonth: true });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const key = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dateKey: key, dayNumber: d, inCurrentMonth: false });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.card }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Ionicons name="close" size={26} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>{effectiveTitle}</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={[styles.calendarCard, { backgroundColor: theme.inputBg }]}>
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.iconBtn}>
                <Ionicons name="chevron-back" size={22} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.monthTitle, { color: theme.text }]}>
                {t.months[viewMonth]}, {viewYear}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.iconBtn}>
                <Ionicons name="chevron-forward" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <View style={styles.weekdaysRow}>
              {t.weekdaysShort.map((w) => (
                <Text key={w} style={[styles.weekdayText, { color: theme.text }]}>
                  {w}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {calendarDays.map((cell) => {
                const isSelected = cell.dateKey === selectedDate;
                const mark = markedDates[cell.dateKey];
                return (
                  <TouchableOpacity
                    key={cell.dateKey}
                    style={[
                      styles.dayCell,
                      isSelected && { backgroundColor: COLORS.primary, borderRadius: 24 },
                    ]}
                    onPress={() => {
                      onSelectDate(cell.dateKey);
                      onClose();
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        {
                          color: isSelected
                            ? '#212121'
                            : cell.inCurrentMonth
                            ? theme.text
                            : theme.textMuted,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {cell.dayNumber}
                    </Text>
                    {mark?.label ? (
                      <Text
                        style={[
                          styles.markLabel,
                          { color: isSelected ? '#212121' : mark.dotColor || COLORS.weight },
                        ]}
                      >
                        {mark.label}
                      </Text>
                    ) : mark?.dotColor ? (
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: isSelected ? '#212121' : mark.dotColor },
                        ]}
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 430,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  calendarCard: {
    borderRadius: 16,
    padding: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: 44,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: '14.2%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayText: {
    fontSize: 15,
  },
  markLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
});
