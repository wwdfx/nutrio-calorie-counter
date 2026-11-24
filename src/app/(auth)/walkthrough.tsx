import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { getLanguageMeta } from '@/constants/i18n';
import { useNutrio } from '@/context/NutrioContext';
import { NutrioLogo } from '@/components/NutrioLogo';
import { CircularProgress } from '@/components/CircularProgress';
import { LanguagePickerModal } from '@/components/LanguagePickerModal';

function Slide1Mockup() {
  return (
    <View style={mockStyles.phoneScreen}>
      {/* Green Header */}
      <View style={mockStyles.homeGreenTop}>
        <View style={mockStyles.dynamicIsland} />
        <View style={mockStyles.homeHeaderRow}>
          <NutrioLogo size={18} color="#181A20" eyeColor={COLORS.primary} />
          <Text style={mockStyles.homeBrand}>Nutrio</Text>
          <View style={mockStyles.bellCircle}>
            <Ionicons name="notifications-outline" size={13} color="#181A20" />
            <View style={mockStyles.bellRedDot} />
          </View>
        </View>
      </View>

      {/* Dark Floating Card */}
      <View style={mockStyles.homeCard}>
        <View style={mockStyles.dateRow}>
          <Ionicons name="chevron-back" size={12} color="#9E9E9E" />
          <Text style={mockStyles.dateTxt}>Today, Dec 22 📅</Text>
          <Ionicons name="chevron-forward" size={12} color="#9E9E9E" />
        </View>

        <View style={mockStyles.ringRow}>
          <View style={mockStyles.sideMetric}>
            <Text style={mockStyles.tinyMuted}>🥗 Eaten</Text>
            <Text style={mockStyles.sideNum}>1634</Text>
            <Text style={mockStyles.tinyUnit}>kcal</Text>
          </View>
          <CircularProgress
            size={84}
            strokeWidth={7}
            progress={0.62}
            color={COLORS.primary}
            trackColor="#2D313C"
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={mockStyles.centerNum}>1190</Text>
              <Text style={mockStyles.tinyUnit}>kcal left</Text>
            </View>
          </CircularProgress>
          <View style={mockStyles.sideMetric}>
            <Text style={mockStyles.tinyMuted}>🔥 Burned</Text>
            <Text style={mockStyles.sideNum}>265</Text>
            <Text style={mockStyles.tinyUnit}>kcal</Text>
          </View>
        </View>

        <Text style={mockStyles.miniSectionLabel}>Eaten</Text>
        <View style={mockStyles.macroRow}>
          <View style={mockStyles.macroItem}>
            <CircularProgress size={48} strokeWidth={4.5} progress={0.75} color={COLORS.carbs} trackColor="#2D313C">
              <Text style={mockStyles.macroVal}>168</Text>
            </CircularProgress>
            <Text style={mockStyles.macroLbl}>Carbs</Text>
          </View>
          <View style={mockStyles.macroItem}>
            <CircularProgress size={48} strokeWidth={4.5} progress={0.65} color={COLORS.protein} trackColor="#2D313C">
              <Text style={mockStyles.macroVal}>83</Text>
            </CircularProgress>
            <Text style={mockStyles.macroLbl}>Protein</Text>
          </View>
          <View style={mockStyles.macroItem}>
            <CircularProgress size={48} strokeWidth={4.5} progress={0.55} color={COLORS.fat} trackColor="#2D313C">
              <Text style={mockStyles.macroVal}>70</Text>
            </CircularProgress>
            <Text style={mockStyles.macroLbl}>Fat</Text>
          </View>
        </View>

        <Text style={mockStyles.miniSectionLabel}>Burned</Text>
        <View style={mockStyles.burnedRow}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={mockStyles.tinyMuted}>👣 Walking</Text>
            <Text style={mockStyles.sideNum}>100</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', gap: 8 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={mockStyles.tinyMuted}>💪 Activity</Text>
              <Text style={mockStyles.sideNum}>165</Text>
            </View>
            <View style={mockStyles.miniPlus}>
              <Ionicons name="add" size={14} color="#181A20" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function Slide2Mockup() {
  const heights = [76, 66, 84, 72, 88, 78, 68];
  const days = ['16', '17', '18', '19', '20', '21', '22'];
  return (
    <View style={[mockStyles.phoneScreen, { paddingHorizontal: 14, paddingTop: 10 }]}>
      <View style={mockStyles.dynamicIsland} />
      <View style={[mockStyles.homeHeaderRow, { marginTop: 10, marginBottom: 12 }]}>
        <NutrioLogo size={18} color={COLORS.primary} eyeColor="#181A20" />
        <Text style={[mockStyles.homeBrand, { color: '#FFFFFF' }]}>Insights</Text>
        <Ionicons name="ellipsis-vertical" size={14} color="#FFFFFF" />
      </View>

      {/* Weekly / Monthly / Yearly */}
      <View style={mockStyles.segBar}>
        <View style={[mockStyles.segPill, { backgroundColor: COLORS.primary }]}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#181A20' }}>Weekly</Text>
        </View>
        <View style={mockStyles.segPill}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: '#CCCCCC' }}>Monthly</Text>
        </View>
        <View style={mockStyles.segPill}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: '#CCCCCC' }}>Yearly</Text>
        </View>
      </View>

      <View style={[mockStyles.dateRow, { marginVertical: 8 }]}>
        <Ionicons name="chevron-back" size={11} color="#9E9E9E" />
        <Text style={[mockStyles.dateTxt, { fontSize: 11 }]}>Dec 16 - Dec 22, 2024</Text>
        <Ionicons name="chevron-forward" size={11} color="#9E9E9E" />
      </View>

      {/* Calorie Chart Card */}
      <View style={mockStyles.chartBox}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Calorie (kcal)</Text>
          <View style={mockStyles.chartIconPill}>
            <Ionicons name="bar-chart" size={11} color="#181A20" />
          </View>
        </View>

        <View style={mockStyles.barChartArea}>
          {heights.map((h, i) => (
            <View key={i} style={{ alignItems: 'center', flex: 1, justifyContent: 'flex-end', height: '100%' }}>
              {i === 1 && (
                <View style={mockStyles.tooltipCircle}>
                  <Text style={{ fontSize: 7, fontWeight: '800', color: '#FFFFFF' }}>2100</Text>
                </View>
              )}
              <View
                style={{
                  width: 18,
                  height: `${h}%`,
                  borderRadius: 9,
                  backgroundColor: i === 1 ? COLORS.primary : '#5C7734',
                }}
              />
              <Text style={{ color: '#9E9E9E', fontSize: 8, marginTop: 4 }}>{days[i]}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function Slide3Mockup() {
  return (
    <View style={[mockStyles.phoneScreen, { paddingHorizontal: 14, paddingTop: 10 }]}>
      <View style={mockStyles.dynamicIsland} />
      <View style={[mockStyles.homeHeaderRow, { marginTop: 10, marginBottom: 14 }]}>
        <NutrioLogo size={18} color={COLORS.primary} eyeColor="#181A20" />
        <Text style={[mockStyles.homeBrand, { color: '#FFFFFF' }]}>Articles</Text>
        <Ionicons name="search" size={15} color="#FFFFFF" />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>Calorie &amp; Nutrition</Text>
        <Text style={{ color: COLORS.primary, fontSize: 10, fontWeight: '700' }}>View All →</Text>
      </View>

      <View style={mockStyles.artCard}>
        <Text style={mockStyles.artTitle} numberOfLines={2}>
          Macronutrients 101: Carbs, Protein, &amp; Fat
        </Text>
        <Text style={{ fontSize: 24 }}>🍎</Text>
      </View>

      <View style={mockStyles.artCard}>
        <Text style={mockStyles.artTitle} numberOfLines={2}>
          Nutrient-Dense Foods: What Are They?
        </Text>
        <Text style={{ fontSize: 24 }}>🥬</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>Physical Activity</Text>
        <Text style={{ color: COLORS.primary, fontSize: 10, fontWeight: '700' }}>View All →</Text>
      </View>

      <View style={mockStyles.artCard}>
        <Text style={mockStyles.artTitle} numberOfLines={2}>
          Why Daily Steps Matter for Metabolism
        </Text>
        <Text style={{ fontSize: 24 }}>👣</Text>
      </View>
    </View>
  );
}

export default function WalkthroughScreen() {
  const { themeMode, language, t } = useNutrio();
  const theme = getThemeColors(themeMode);
  const currentLang = getLanguageMeta(language);

  const [slide, setSlide] = useState(0); // 0, 1, 2
  const [langModalOpen, setLangModalOpen] = useState(false);

  const slides = [
    { title: t.walk1Title, subtitle: t.walk1Sub },
    { title: t.walk2Title, subtitle: t.walk2Sub },
    { title: t.walk3Title, subtitle: t.walk3Sub },
  ];

  const handleNext = () => {
    if (slide < 2) {
      setSlide((s) => s + 1);
    } else {
      router.replace('/(auth)/welcome');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: COLORS.primary }]}>
      {/* Top Floating Language Pill for instant switching */}
      <TouchableOpacity
        style={styles.langFloatBtn}
        onPress={() => setLangModalOpen(true)}
      >
        <Text style={{ fontSize: 14 }}>{currentLang.flag}</Text>
        <Text style={styles.langFloatText}>{currentLang.nativeName}</Text>
      </TouchableOpacity>

      {/* Top Green Hero Area with iPhone Bezel Mockup */}
      <View style={styles.phoneArea}>
        <View style={styles.phoneBezel}>
          {slide === 0 && <Slide1Mockup />}
          {slide === 1 && <Slide2Mockup />}
          {slide === 2 && <Slide3Mockup />}
        </View>
      </View>

      {/* Curved Dark Overlay Sheet matching Screenshots 2, 3, 4 */}
      <View style={styles.bottomSheetWrapper}>
        <Svg
          width="100%"
          height={48}
          viewBox="0 0 430 48"
          preserveAspectRatio="none"
          style={styles.curveSvg}
        >
          <Path
            d="M0 0 Q215 56 430 0 L430 48 L0 48 Z"
            fill={theme.background}
          />
        </Svg>

        <View style={[styles.bottomContent, { backgroundColor: theme.background }]}>
          <View style={styles.textBlock}>
            <Text style={[styles.title, { color: theme.text }]}>
              {slides[slide].title}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {slides[slide].subtitle}
            </Text>

            {/* Pagination Indicator Dots */}
            <View style={styles.dotsRow}>
              {[0, 1, 2].map((idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSlide(idx)}
                  style={[
                    styles.dot,
                    slide === idx ? styles.dotActive : { backgroundColor: '#35383F' },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Footer Action Bar */}
          <View style={[styles.footerDivider, { backgroundColor: theme.divider }]} />

          <View style={styles.footerButtons}>
            {slide < 2 ? (
              <>
                <TouchableOpacity
                  style={styles.skipBtn}
                  onPress={() => router.replace('/(auth)/welcome')}
                >
                  <Text style={[styles.skipText, { color: theme.text }]}>{t.skip}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueBtn} onPress={handleNext}>
                  <Text style={styles.continueText}>{t.continueBtn}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.continueBtn, { flex: 1 }]}
                onPress={() => router.replace('/(auth)/welcome')}
              >
                <Text style={styles.continueText}>{t.letsGetStartedBtn}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <LanguagePickerModal
        visible={langModalOpen}
        onClose={() => setLangModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  langFloatBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 26, 32, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 1000,
    gap: 6,
  },
  langFloatText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  phoneArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 48,
    overflow: 'hidden',
  },
  phoneBezel: {
    width: 300,
    height: 480,
    borderRadius: 42,
    borderWidth: 8,
    borderColor: '#121316',
    backgroundColor: '#181A20',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  bottomSheetWrapper: {
    marginTop: -46,
  },
  curveSvg: {
    marginBottom: -1,
  },
  bottomContent: {
    paddingTop: 12,
    paddingBottom: 28,
  },
  textBlock: {
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 22,
    opacity: 0.82,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  footerDivider: {
    height: 1,
    marginBottom: 20,
  },
  footerButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  skipBtn: {
    flex: 1,
    height: 54,
    borderRadius: 1000,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '700',
  },
  continueBtn: {
    flex: 1,
    height: 54,
    borderRadius: 1000,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181A20',
  },
});

const mockStyles = StyleSheet.create({
  phoneScreen: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  dynamicIsland: {
    width: 76,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignSelf: 'center',
    marginTop: 6,
  },
  homeGreenTop: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingBottom: 42,
  },
  homeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  homeBrand: {
    fontSize: 15,
    fontWeight: '800',
    color: '#181A20',
  },
  bellCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(24,26,32,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellRedDot: {
    position: 'absolute',
    top: 4,
    right: 5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F54336',
  },
  homeCard: {
    backgroundColor: '#1F222A',
    marginHorizontal: 12,
    marginTop: -30,
    borderRadius: 14,
    padding: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateTxt: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sideMetric: {
    alignItems: 'center',
    width: 56,
  },
  tinyMuted: {
    color: '#9E9E9E',
    fontSize: 8.5,
    fontWeight: '600',
  },
  sideNum: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  centerNum: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  tinyUnit: {
    color: '#9E9E9E',
    fontSize: 8,
  },
  miniSectionLabel: {
    color: '#757575',
    fontSize: 9,
    fontWeight: '700',
    marginVertical: 6,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  macroItem: {
    alignItems: 'center',
    gap: 3,
  },
  macroVal: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  macroLbl: {
    color: '#CCCCCC',
    fontSize: 9,
    fontWeight: '600',
  },
  burnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  miniPlus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segBar: {
    flexDirection: 'row',
    backgroundColor: '#262A35',
    borderRadius: 8,
    padding: 3,
  },
  segPill: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  chartBox: {
    backgroundColor: '#1F222A',
    borderRadius: 12,
    padding: 12,
    height: 195,
  },
  chartIconPill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  barChartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    paddingTop: 18,
    gap: 4,
  },
  tooltipCircle: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 3,
  },
  artCard: {
    backgroundColor: '#1F222A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  artTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
    lineHeight: 16,
  },
});
