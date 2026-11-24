import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
} from 'react-native';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio } from '@/context/NutrioContext';

interface HorizontalRulerProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  altUnit: string;
  useAltUnit: boolean;
  onToggleUnit: (useAlt: boolean) => void;
  onChange: (nextVal: number) => void;
  formatDisplay?: (val: number, useAlt: boolean) => { main: string; unitLabel: string };
}

/**
 * Interactive horizontal ruler scale matching Stage 3 Steps 4, 5, and 6:
 * - Two unit toggle pills at top (cm/ft or kg/lb)
 * - Giant value readout (e.g. 185.0 cm, 80.0 kg, 75.0 kg)
 * - Drag/swipe or tap tick marks with fixed central lime green needle & major labeled ticks
 */
export function HorizontalRuler({
  value,
  min,
  max,
  step = 0.5,
  unit,
  altUnit,
  useAltUnit,
  onToggleUnit,
  onChange,
  formatDisplay,
}: HorizontalRulerProps) {
  const { themeMode } = useNutrio();
  const theme = getThemeColors(themeMode);

  const clampAndRound = useMemo(
    () => (v: number) => {
      const snapped = Math.round(v / step) * step;
      return Math.max(min, Math.min(max, Math.round(snapped * 10) / 10));
    },
    [min, max, step]
  );

  const panResponder = useMemo(() => {
    const baseVal = value;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const deltaUnits = -gestureState.dx / 12;
        const nextVal = clampAndRound(baseVal + deltaUnits);
        if (nextVal !== value) {
          onChange(nextVal);
        }
      },
    });
  }, [value, clampAndRound, onChange]);

  const display = formatDisplay
    ? formatDisplay(value, useAltUnit)
    : { main: value.toFixed(1), unitLabel: useAltUnit ? altUnit : unit };

  // Render 31 visible ticks centered around rounded integer of current value
  const centerTick = Math.round(value);
  const tickOffsets = Array.from({ length: 31 }, (_, i) => i - 15);

  return (
    <View style={styles.wrapper}>
      {/* Unit Toggle Pills */}
      <View style={styles.unitPillsRow}>
        <TouchableOpacity
          style={[
            styles.unitPill,
            !useAltUnit
              ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
              : { backgroundColor: 'transparent', borderColor: theme.inputBorder },
          ]}
          onPress={() => onToggleUnit(false)}
        >
          <Text
            style={[
              styles.unitPillText,
              { color: !useAltUnit ? '#181A20' : theme.text },
            ]}
          >
            {unit}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.unitPill,
            useAltUnit
              ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
              : { backgroundColor: 'transparent', borderColor: theme.inputBorder },
          ]}
          onPress={() => onToggleUnit(true)}
        >
          <Text
            style={[
              styles.unitPillText,
              { color: useAltUnit ? '#181A20' : theme.text },
            ]}
          >
            {altUnit}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Big Center Value Readout */}
      <View style={styles.valueReadoutRow}>
        <Text style={[styles.bigValue, { color: theme.text }]}>
          {display.main}
        </Text>
        <Text style={[styles.bigUnit, { color: theme.textSecondary }]}>
          {display.unitLabel}
        </Text>
      </View>

      {/* Interactive Tick Ruler Track */}
      <View style={styles.rulerContainer} {...panResponder.panHandlers}>
        <View style={styles.ticksRow}>
          {tickOffsets.map((offset) => {
            const tickVal = centerTick + offset;
            const isMajor = tickVal % 10 === 0;
            const isCenter = offset === 0;
            const inRange = tickVal >= min && tickVal <= max;

            return (
              <TouchableOpacity
                key={offset}
                style={styles.tickSlot}
                activeOpacity={0.7}
                onPress={() => inRange && onChange(clampAndRound(tickVal))}
              >
                <View
                  style={[
                    styles.tickLine,
                    {
                      height: isCenter ? 68 : isMajor ? 82 : 42,
                      width: isCenter ? 4 : isMajor ? 2 : 1.5,
                      borderRadius: isCenter ? 2 : 1,
                      backgroundColor: isCenter
                        ? COLORS.primary
                        : inRange
                        ? isMajor
                          ? '#9E9E9E'
                          : '#616670'
                        : 'transparent',
                    },
                  ]}
                />
                {isMajor && inRange ? (
                  <Text style={[styles.majorLabel, { color: theme.textSecondary }]}>
                    {tickVal}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Fine Step +/- Tap Controls for desktop/precision accessibility */}
      <View style={styles.fineAdjustRow}>
        <TouchableOpacity
          style={[styles.fineBtn, { borderColor: theme.inputBorder }]}
          onPress={() => onChange(clampAndRound(value - step))}
        >
          <Text style={[styles.fineBtnText, { color: theme.textSecondary }]}>
            - {step}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fineBtn, { borderColor: theme.inputBorder }]}
          onPress={() => onChange(clampAndRound(value + step))}
        >
          <Text style={[styles.fineBtnText, { color: theme.textSecondary }]}>
            + {step}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 28,
  },
  unitPillsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 42,
  },
  unitPill: {
    minWidth: 74,
    height: 44,
    borderRadius: 1000,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  unitPillText: {
    fontSize: 16,
    fontWeight: '700',
  },
  valueReadoutRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 24,
  },
  bigValue: {
    fontSize: 54,
    fontWeight: '800',
    letterSpacing: -1,
  },
  bigUnit: {
    fontSize: 22,
    fontWeight: '600',
  },
  rulerContainer: {
    width: '100%',
    height: 116,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  ticksRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
  },
  tickSlot: {
    width: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tickLine: {
    marginTop: 4,
  },
  majorLabel: {
    position: 'absolute',
    top: 90,
    width: 38,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  fineAdjustRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  fineBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 1000,
    borderWidth: 1,
  },
  fineBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
