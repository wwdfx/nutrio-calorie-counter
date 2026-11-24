import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio, formatDateKey } from '@/context/NutrioContext';
import { NutrioLogo } from '@/components/NutrioLogo';

const BMI_LEGEND = [
  { label: 'Very severely underweight', range: 'BMI < 16.0', color: '#3F51B5' },
  { label: 'Severely underweight', range: 'BMI 16.0 - 16.9', color: '#1A96F0' },
  { label: 'Underweight', range: 'BMI 17.0 - 18.4', color: '#00BCD4' },
  { label: 'Normal', range: 'BMI 18.5 - 24.9', color: '#4AAF57' },
  { label: 'Overweight', range: 'BMI 25.0 - 29.9', color: '#FFC107' },
  { label: 'Obese Class I', range: 'BMI 30.0 - 34.9', color: '#FF981F' },
  { label: 'Obese Class II', range: 'BMI 35.0 - 39.9', color: '#FF5726' },
  { label: 'Obese Class III', range: 'BMI >= 40.0', color: '#F54336' },
];

interface AreaChartProps {
  values: number[];
  labels: string[];
  maxVal: number;
  color: string;
  selectedIdx: number;
  onSelect: (idx: number) => void;
  gradId: string;
  textColor: string;
}

function SimpleAreaChart({
  values,
  labels,
  maxVal,
  color,
  selectedIdx,
  onSelect,
  gradId,
  textColor,
}: AreaChartProps) {
  const width = 310;
  const height = 132;
  const padX = 16;
  const padY = 16;
  const stepX = (width - padX * 2) / Math.max(1, values.length - 1);

  const pts = values.map((v, i) => {
    const x = padX + i * stepX;
    const y = height - padY - (Math.min(maxVal, v) / maxVal) * (height - padY * 2);
    return { x, y, v };
  });

  const lineD = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const areaD = `${lineD} L ${pts[pts.length - 1].x.toFixed(1)} ${height - padY} L ${pts[0].x.toFixed(1)} ${height - padY} Z`;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>
        <Path d={areaD} fill={`url(#${gradId})`} />
        <Path d={lineD} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, idx) => (
          <Circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={idx === selectedIdx ? 6.5 : 4}
            fill={idx === selectedIdx ? '#181A20' : color}
            stroke={color}
            strokeWidth={idx === selectedIdx ? 3 : 1.5}
          />
        ))}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 }}>
        {labels.map((lbl, idx) => (
          <TouchableOpacity key={idx} onPress={() => onSelect(idx)} style={{ padding: 4 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: idx === selectedIdx ? '800' : '600',
                color: idx === selectedIdx ? color : textColor,
              }}
            >
              {lbl}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function BmiArcGauge({ bmi, textColor, mutedColor }: { bmi: number; textColor: string; mutedColor: string }) {
  // Semi-circle 240-deg arc gauge matching 98_Dark_insights
  const clampedBmi = Math.max(15, Math.min(40, bmi));
  const frac = (clampedBmi - 15) / 25;
  const angleDeg = -210 + frac * 240;
  const angleRad = (angleDeg * Math.PI) / 180;
  const cx = 130;
  const cy = 120;
  const needleLen = 68;
  const nx = cx + needleLen * Math.cos(angleRad);
  const ny = cy + needleLen * Math.sin(angleRad);

  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <Svg width={260} height={175} viewBox="0 0 260 175">
        {/* Colored BMI arc segments */}
        <Path d="M 45 155 A 95 95 0 0 1 40 90" stroke="#1A96F0" strokeWidth={16} fill="none" strokeLinecap="round" />
        <Path d="M 40 90 A 95 95 0 0 1 112 28" stroke="#4AAF57" strokeWidth={16} fill="none" />
        <Path d="M 112 28 A 95 95 0 0 1 180 42" stroke="#FFC107" strokeWidth={16} fill="none" />
        <Path d="M 180 42 A 95 95 0 0 1 222 100" stroke="#FF981F" strokeWidth={16} fill="none" />
        <Path d="M 222 100 A 95 95 0 0 1 215 155" stroke="#F54336" strokeWidth={16} fill="none" strokeLinecap="round" />
        {/* Pointer needle */}
        <Line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#4AAF57" strokeWidth={6} strokeLinecap="round" />
        <Circle cx={cx} cy={cy} r={14} fill="#1F222A" stroke="#4AAF57" strokeWidth={4} />
      </Svg>
      <Text style={{ fontSize: 38, fontWeight: '800', color: textColor, marginTop: -24 }}>
        {bmi}
      </Text>
      <Text style={{ fontSize: 13, color: mutedColor }}>BMI (kg/m2)</Text>
    </View>
  );
}

export default function InsightsScreen() {
  const {
    themeMode,
    t,
    user,
    loggedFoods,
    waterByDate,
    stepsByDate,
    weightHistory,
  } = useNutrio();
  const theme = getThemeColors(themeMode);

  const [period, setPeriod] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Weekly');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [selectedDayIdx, setSelectedDayIdx] = useState(1);

  const last7Days = useMemo(() => {
    const today = new Date();
    const list: {
      dateKey: string;
      dayNum: string;
      calories: number;
      carbsPct: number;
      proteinPct: number;
      fatPct: number;
      water: number;
      steps: number;
      weight: number;
    }[] = [];

    const fallbackCals = [2380, 2100, 2590, 2410, 2720, 2480, 2240];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const k = formatDateKey(d);
      const dayEntries = loggedFoods.filter((e) => e.date === k);
      const cals =
        dayEntries.length > 0
          ? Math.round(
              dayEntries.reduce((s, e) => s + e.food.calories * e.servings, 0)
            )
          : fallbackCals[6 - i];

      const wEntry = weightHistory.find((w) => w.date === k);
      list.push({
        dateKey: k,
        dayNum: String(d.getDate()),
        calories: cals,
        carbsPct: 45,
        proteinPct: 20,
        fatPct: 35,
        water: waterByDate[k] || 2000,
        steps: stepsByDate[k] || 5200,
        weight: wEntry ? wEntry.weightKg : user?.currentWeightKg || 78.5,
      });
    }
    return list;
  }, [loggedFoods, waterByDate, stepsByDate, weightHistory, user]);

  const currentWeight = user?.currentWeightKg || 78.4;
  const heightM = (user?.heightCm || 185) / 100;
  const bmi = Math.round((currentWeight / (heightM * heightM)) * 10) / 10;

  const renderChartToggle = (accentColor: string) => (
    <View style={[styles.togglePillBox, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[
          styles.toggleIconBtn,
          chartType === 'bar' && { backgroundColor: accentColor },
        ]}
        onPress={() => setChartType('bar')}
      >
        <Ionicons
          name="bar-chart"
          size={15}
          color={chartType === 'bar' ? '#181A20' : theme.textMuted}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.toggleIconBtn,
          chartType === 'area' && { backgroundColor: accentColor },
        ]}
        onPress={() => setChartType('area')}
      >
        <Ionicons
          name="trending-up"
          size={15}
          color={chartType === 'area' ? '#181A20' : theme.textMuted}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.topHeader, { backgroundColor: theme.background }]}>
        <View style={styles.titleRow}>
          <NutrioLogo size={28} color={COLORS.primary} eyeColor={theme.background} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t.insightsTitle}</Text>
          <Ionicons name="ellipsis-vertical" size={22} color={theme.text} />
        </View>

        {/* Weekly | Monthly | Yearly Segment */}
        <View style={[styles.segmentBar, { backgroundColor: theme.card }]}>
          {(['Weekly', 'Monthly', 'Yearly'] as const).map((p) => {
            const active = period === p;
            const pLabel = p === 'Weekly' ? t.weekly : p === 'Monthly' ? t.monthly : t.yearly;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.segmentBtn,
                  active && { backgroundColor: COLORS.primary },
                ]}
                onPress={() => setPeriod(p)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? '#181A20' : theme.text },
                  ]}
                >
                  {pLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Calorie (kcal) Bar / Area Chart Card */}
        <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
          <View style={styles.chartHeaderRow}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              {t.caloriesKcal}
            </Text>
            {renderChartToggle(COLORS.primary)}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
              <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>
                {t.selected} ({last7Days[selectedDayIdx]?.calories} {t.kcal})
              </Text>
            </View>
            <Text style={[styles.legendLabel, { color: theme.textMuted }]}>
              {t.goal}: {user?.calorieGoal || 2560} {t.kcal}
            </Text>
          </View>

          {chartType === 'area' ? (
            <SimpleAreaChart
              values={last7Days.map((d) => d.calories)}
              labels={last7Days.map((d) => d.dayNum)}
              maxVal={3200}
              color={COLORS.primary}
              selectedIdx={selectedDayIdx}
              onSelect={setSelectedDayIdx}
              gradId="calAreaGrad"
              textColor={theme.textSecondary}
            />
          ) : (
            <View style={styles.barsArea}>
              {last7Days.map((item, idx) => {
                const selected = idx === selectedDayIdx;
                const heightPct = Math.min(100, Math.round((item.calories / 3000) * 100));
                return (
                  <TouchableOpacity
                    key={item.dateKey}
                    style={styles.barColumn}
                    onPress={() => setSelectedDayIdx(idx)}
                  >
                    {selected && (
                      <View style={[styles.tooltipBubble, { borderColor: COLORS.primary, backgroundColor: theme.background }]}>
                        <Text style={[styles.tooltipVal, { color: theme.text }]}>
                          {item.calories}
                        </Text>
                      </View>
                    )}
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${heightPct}%`,
                            backgroundColor: selected
                              ? COLORS.primary
                              : 'rgba(161, 206, 80, 0.42)',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.axisDay, { color: theme.textSecondary }]}>
                      {item.dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* 2. Nutrition (%) Stacked Macro Chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
          <View style={styles.chartHeaderRow}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              {t.nutritionPct}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textSecondary }}>
              {t.carbs} 45% · {t.protein} 20% · {t.fat} 35%
            </Text>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: COLORS.carbs }]} />
              <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>{t.carbs}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: COLORS.protein }]} />
              <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>{t.protein}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: COLORS.fat }]} />
              <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>{t.fat}</Text>
            </View>
          </View>

          <View style={styles.barsArea}>
            {last7Days.map((item, idx) => {
              const selected = idx === selectedDayIdx;
              return (
                <TouchableOpacity
                  key={item.dateKey}
                  style={styles.barColumn}
                  onPress={() => setSelectedDayIdx(idx)}
                >
                  <View style={[styles.barTrack, { justifyContent: 'flex-end', gap: 2 }]}>
                    <View
                      style={{
                        height: '33%',
                        width: '100%',
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        backgroundColor: selected ? COLORS.fat : 'rgba(26,150,240,0.42)',
                      }}
                    />
                    <View
                      style={{
                        height: '22%',
                        width: '100%',
                        backgroundColor: selected
                          ? COLORS.protein
                          : 'rgba(255,152,31,0.42)',
                      }}
                    />
                    <View
                      style={{
                        height: '45%',
                        width: '100%',
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        backgroundColor: selected ? COLORS.carbs : 'rgba(245,67,54,0.42)',
                      }}
                    />
                  </View>
                  <Text style={[styles.axisDay, { color: theme.textSecondary }]}>
                    {item.dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Water (mL) Bar / Area Chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
          <View style={styles.chartHeaderRow}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>{t.water} (mL)</Text>
            {renderChartToggle(COLORS.water)}
          </View>
          {chartType === 'area' ? (
            <SimpleAreaChart
              values={last7Days.map((d) => d.water)}
              labels={last7Days.map((d) => d.dayNum)}
              maxVal={3200}
              color={COLORS.water}
              selectedIdx={selectedDayIdx}
              onSelect={setSelectedDayIdx}
              gradId="waterAreaGrad"
              textColor={theme.textSecondary}
            />
          ) : (
            <View style={styles.barsArea}>
              {last7Days.map((item, idx) => {
                const selected = idx === selectedDayIdx;
                const hPct = Math.min(100, Math.round((item.water / 3000) * 100));
                return (
                  <TouchableOpacity
                    key={item.dateKey}
                    style={styles.barColumn}
                    onPress={() => setSelectedDayIdx(idx)}
                  >
                    {selected && (
                      <View style={[styles.tooltipBubble, { borderColor: COLORS.water, backgroundColor: theme.background }]}>
                        <Text style={[styles.tooltipVal, { color: theme.text }]}>
                          {item.water}
                        </Text>
                      </View>
                    )}
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${hPct}%`,
                            backgroundColor: selected
                              ? COLORS.water
                              : 'rgba(26, 150, 240, 0.42)',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.axisDay, { color: theme.textSecondary }]}>
                      {item.dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* 4. Weight (kg) Bar / Area Chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
          <View style={styles.chartHeaderRow}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>{t.weight} (kg)</Text>
            {renderChartToggle(COLORS.weight)}
          </View>
          {chartType === 'area' ? (
            <SimpleAreaChart
              values={last7Days.map((d) => d.weight)}
              labels={last7Days.map((d) => d.dayNum)}
              maxVal={100}
              color={COLORS.weight}
              selectedIdx={selectedDayIdx}
              onSelect={setSelectedDayIdx}
              gradId="weightAreaGrad"
              textColor={theme.textSecondary}
            />
          ) : (
            <View style={styles.barsArea}>
              {last7Days.map((item, idx) => {
                const selected = idx === selectedDayIdx;
                const hPct = Math.min(100, Math.round((item.weight / 100) * 100));
                return (
                  <TouchableOpacity
                    key={item.dateKey}
                    style={styles.barColumn}
                    onPress={() => setSelectedDayIdx(idx)}
                  >
                    {selected && (
                      <View style={[styles.tooltipBubble, { borderColor: COLORS.weight, backgroundColor: theme.background }]}>
                        <Text style={[styles.tooltipVal, { color: theme.text }]}>
                          {item.weight}
                        </Text>
                      </View>
                    )}
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${hPct}%`,
                            backgroundColor: selected
                              ? COLORS.weight
                              : 'rgba(255, 87, 38, 0.45)',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.axisDay, { color: theme.textSecondary }]}>
                      {item.dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* 5. BMI Semi-Circle Gauge & Classification Table matching 98_Dark_insights */}
        <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
          <View style={styles.chartHeaderRow}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>{t.bmiTitle}</Text>
            <View style={styles.normalBadge}>
              <Text style={styles.normalBadgeText}>{t.bmiNormal}</Text>
            </View>
          </View>

          <BmiArcGauge bmi={bmi} textColor={theme.text} mutedColor={theme.textSecondary} />

          <View style={styles.bmiTable}>
            {BMI_LEGEND.map((row) => {
              const isNormal = row.label === 'Normal';
              return (
                <View key={row.label} style={styles.bmiTableRow}>
                  <View style={[styles.dot, { backgroundColor: row.color }]} />
                  <Text
                    style={[
                      styles.bmiRowLabel,
                      {
                        color: isNormal ? theme.text : theme.textSecondary,
                        fontWeight: isNormal ? '800' : '500',
                      },
                    ]}
                  >
                    {row.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: isNormal ? theme.text : theme.textSecondary,
                      fontWeight: isNormal ? '800' : '500',
                    }}
                  >
                    {row.range}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  segmentBar: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  chartCard: {
    borderRadius: 20,
    padding: 20,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  togglePillBox: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  toggleIconBtn: {
    width: 32,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  barsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 170,
    paddingTop: 28,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  tooltipBubble: {
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginBottom: 4,
  },
  tooltipVal: {
    fontSize: 10,
    fontWeight: '800',
  },
  barTrack: {
    width: 28,
    flex: 1,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 14,
  },
  axisDay: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  normalBadge: {
    backgroundColor: '#4AAF57',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  normalBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bmiTable: {
    gap: 10,
    marginTop: 14,
  },
  bmiTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bmiRowLabel: {
    flex: 1,
    fontSize: 13,
  },
});
