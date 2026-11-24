import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio } from '@/context/NutrioContext';

interface WheelColumnProps {
  label?: string;
  values: (string | number)[];
  selectedIndex: number;
  onChange: (nextIndex: number) => void;
  width?: number;
  suffix?: string;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ROWS = 7;
const CENTER_OFFSET = Math.floor(VISIBLE_ROWS / 2); // 3 items above & below

/**
 * Truly scrollable 7-row vertical wheel picker supporting:
 * - Touch swipe / momentum scroll with snapToInterval (iOS, Android, mobile web)
 * - Mouse wheel & trackpad scrolling on desktop web
 * - Tap-to-select any visible row
 */
export function WheelColumn({
  label,
  values,
  selectedIndex,
  onChange,
  width = 104,
  suffix,
}: WheelColumnProps) {
  const { themeMode } = useNutrio();
  const theme = getThemeColors(themeMode);

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const wheelHostRef = useRef<any>(null);
  const isProgrammaticRef = useRef(false);

  const clampIdx = (idx: number) =>
    Math.max(0, Math.min(values.length - 1, idx));

  const scrollToIdx = (idx: number, animated = true) => {
    const clamped = clampIdx(idx);
    isProgrammaticRef.current = true;
    scrollRef.current?.scrollTo({
      y: clamped * ITEM_HEIGHT,
      animated,
    });
    setTimeout(() => {
      isProgrammaticRef.current = false;
    }, 180);
  };

  // Sync initial scroll position on mount / when values length changes
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: clampIdx(selectedIndex) * ITEM_HEIGHT,
        animated: false,
      });
    }, 20);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.length]);

  // Attach native non-passive wheel listener on web so mouse wheel / trackpad scrolls the column smoothly without scrolling the outer page
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = wheelHostRef.current as HTMLElement | null;
    if (!node || typeof node.addEventListener !== 'function') return;

    let wheelAccumulator = 0;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      wheelAccumulator += e.deltaY;
      const threshold = 24;
      if (Math.abs(wheelAccumulator) >= threshold) {
        const steps = wheelAccumulator > 0 ? 1 : -1;
        wheelAccumulator = 0;
        const nextIdx = clampIdx(selectedIndex + steps);
        if (nextIdx !== selectedIndex) {
          onChange(nextIdx);
          scrollToIdx(nextIdx, true);
        }
      }
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', handleWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, values.length, onChange]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticRef.current) return;
    const y = e.nativeEvent.contentOffset.y;
    const idx = clampIdx(Math.round(y / ITEM_HEIGHT));
    if (idx !== selectedIndex) {
      onChange(idx);
    }
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = clampIdx(Math.round(y / ITEM_HEIGHT));
    if (idx !== selectedIndex) {
      onChange(idx);
    }
    scrollToIdx(idx, true);
  };

  const wheelHeight = ITEM_HEIGHT * VISIBLE_ROWS;

  return (
    <View style={[styles.col, { width }]}>
      {label ? (
        <Text style={[styles.colHeader, { color: theme.textSecondary }]}>
          {label}
        </Text>
      ) : null}

      <View
        ref={wheelHostRef}
        style={[styles.wheelFrame, { height: wheelHeight }]}
      >
        {/* Fixed Center Selection Lime Lines */}
        <View
          pointerEvents="none"
          style={[
            styles.centerHighlightLines,
            {
              top: CENTER_OFFSET * ITEM_HEIGHT,
              height: ITEM_HEIGHT,
            },
          ]}
        >
          {suffix ? (
            <Text style={[styles.fixedSuffixText, { color: theme.text }]}>
              {suffix}
            </Text>
          ) : null}
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          contentContainerStyle={{
            paddingVertical: CENTER_OFFSET * ITEM_HEIGHT,
          }}
        >
          {values.map((val, idx) => {
            const dist = Math.abs(idx - selectedIndex);
            const isCenter = dist === 0;
            const fontSize = isCenter ? 32 : dist === 1 ? 24 : dist === 2 ? 20 : 16;
            const opacity = isCenter ? 1 : dist === 1 ? 0.88 : dist === 2 ? 0.55 : 0.3;

            return (
              <TouchableOpacity
                key={`${val}-${idx}`}
                activeOpacity={0.75}
                onPress={() => {
                  onChange(idx);
                  scrollToIdx(idx, true);
                }}
                style={[styles.row, { height: ITEM_HEIGHT }]}
              >
                <Text
                  style={[
                    styles.itemText,
                    {
                      fontSize,
                      opacity,
                      color: isCenter ? COLORS.primary : theme.text,
                      fontWeight: isCenter ? '800' : dist === 1 ? '700' : '600',
                      paddingRight: suffix ? 28 : 0,
                    },
                  ]}
                >
                  {val}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  col: {
    alignItems: 'center',
  },
  colHeader: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 14,
  },
  wheelFrame: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  centerHighlightLines: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
    zIndex: 2,
  },
  fixedSuffixText: {
    fontSize: 15,
    fontWeight: '700',
  },
  row: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    letterSpacing: 0.3,
  },
});
