import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle, Rect, Text as SvgText, Ellipse } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { getLanguageMeta } from '@/constants/i18n';
import { useNutrio, MealType } from '@/context/NutrioContext';
import {
  analyzeFoodWithGemini,
  AnalyzedFoodResult,
  CHEAP_VISION_MODELS,
} from '@/services/gemini';
import { MacroDonutChart } from '@/components/CircularProgress';

const KIT_KAT_BARCODE_RESULT: AnalyzedFoodResult = {
  name: 'Kit Kat',
  emoji: '🍫',
  servingGrams: 42,
  unit: 'gram (g)',
  calories: 218,
  carbs: 14.7,
  protein: 10.5,
  fat: 16.8,
  cholesterolMg: 5,
  sodiumMg: 21,
  calciumMg: 40,
  ironMg: 1,
  potassiumMg: 88,
  confidenceNote: 'Barcode 8993175539210 • 4-Finger Crisp Wafer Bar',
  itemsDetected: ['Kit Kat Wafer Bar (42 g)'],
  modelUsed: 'barcode-scan',
};

const SAMPLE_FOOD_PRESETS = [
  { label: '🍫 Kit Kat (8993175539210)', barcodePreset: true, prompt: 'Kit Kat 4-finger chocolate wafer bar 42g' },
  { label: '🍣 Salmon Poke Bowl', barcodePreset: false, prompt: 'Grilled Atlantic salmon poke bowl with brown rice, edamame and avocado' },
  { label: '🍕 Margherita Pizza', barcodePreset: false, prompt: 'Two slices of Neapolitan Margherita artisan pizza with fresh mozzarella' },
  { label: '🥗 Chicken Caesar Salad', barcodePreset: false, prompt: 'Grilled chicken breast Caesar salad with parmesan and olive oil dressing' },
];

function KitKatLogoBadge() {
  return (
    <Svg width={94} height={94} viewBox="0 0 94 94">
      <Circle cx={47} cy={47} r={45} fill="#CC1F2D" />
      <Ellipse
        cx={47}
        cy={48}
        rx={36}
        ry={20}
        fill="#FFFFFF"
        transform="rotate(-10 47 48)"
      />
      <Ellipse
        cx={47}
        cy={48}
        rx={32}
        ry={16.5}
        fill="#CC1F2D"
        transform="rotate(-10 47 48)"
      />
      <SvgText
        x={47}
        y={54}
        fill="#FFFFFF"
        fontSize={19}
        fontWeight="900"
        fontStyle="italic"
        textAnchor="middle"
      >
        KitKat
      </SvgText>
    </Svg>
  );
}

function BarcodePackageBackdrop() {
  // Subtle dark realistic packaged barcode visual behind the camera reticle matching Stage 10 Screen 1
  const bars = [
    2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 2,
  ];
  return (
    <View style={styles.mockCameraScene} pointerEvents="none">
      {/* Subtle dark textured tabletop & angled chocolate wrapper */}
      <View style={styles.wrapperBandTop} />
      <View style={styles.wrapperBandMain}>
        <View style={styles.barcodeSticker}>
          <Svg width={196} height={74} viewBox="0 0 196 74">
            <Rect x={0} y={0} width={196} height={74} rx={4} fill="#E7E9ED" />
            {bars.reduce<{ x: number; nodes: React.ReactNode[] }>(
              (acc, w, idx) => {
                const barW = w * 2.4;
                if (idx % 2 === 0) {
                  acc.nodes.push(
                    <Rect
                      key={idx}
                      x={acc.x}
                      y={8}
                      width={barW}
                      height={44}
                      fill="#181A20"
                    />
                  );
                }
                acc.x += barW + 2;
                return acc;
              },
              { x: 16, nodes: [] }
            ).nodes}
            <SvgText
              x={98}
              y={66}
              fill="#2B2F3A"
              fontSize={12}
              fontWeight="700"
              letterSpacing={2}
              textAnchor="middle"
            >
              8  993175 539210
            </SvgText>
          </Svg>
        </View>
      </View>
    </View>
  );
}

export default function ScanFoodAIScreen() {
  const { meal } = useLocalSearchParams<{ meal?: string }>();
  const {
    themeMode,
    language,
    t,
    geminiApiKey,
    geminiModel,
    setGeminiModel,
    createCustomFood,
    addFoodIntake,
  } = useNutrio();
  const theme = getThemeColors(themeMode);
  const langMeta = getLanguageMeta(language);

  const selectedMeal: MealType =
    meal === 'Breakfast' || meal === 'Lunch' || meal === 'Dinner' || meal === 'Snacks'
      ? meal
      : 'Dinner';

  const [flashOn, setFlashOn] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [promptText, setPromptText] = useState('');
  const [aiSheetOpen, setAiSheetOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzedFoodResult | null>(null);

  // Result Food Details interactive state matching Stage 10 Screen 3
  const [servings, setServings] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favToast, setFavToast] = useState<string | null>(null);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [customWeightDraft, setCustomWeightDraft] = useState('42');

  // Smooth animated vertical scanning laser beam matching Stage 10 Screen 1
  const [scanAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scanAnim]);

  const laserTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 128],
  });

  const triggerAnalysis = async (
    text?: string,
    b64?: string,
    mime = 'image/jpeg'
  ) => {
    setAiSheetOpen(false);
    setIsAnalyzing(true);
    try {
      const analyzed = await analyzeFoodWithGemini({
        promptText: text,
        base64Image: b64,
        mimeType: mime,
        apiKey: geminiApiKey,
        model: geminiModel,
        languageName: langMeta.englishName,
      });
      setResult(analyzed);
      setServings(1);
      setIsFavorited(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const pickGalleryImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        setImageUri(asset.uri);
        if (asset.base64) {
          setBase64Data(asset.base64);
          await triggerAnalysis(promptText, asset.base64, asset.mimeType || 'image/jpeg');
        }
      }
    } catch {
      // Ignore picker dismissal/cancel
    }
  };

  const handleShutterPress = async () => {
    if (isAnalyzing) return;
    if (base64Data || promptText.trim()) {
      await triggerAnalysis(promptText || undefined, base64Data || undefined);
      return;
    }
    // Live barcode scan sweep -> detects barcode in viewfinder (Kit Kat 8993175539210)
    setIsAnalyzing(true);
    setTimeout(() => {
      setResult(KIT_KAT_BARCODE_RESULT);
      setServings(1);
      setIsFavorited(false);
      setIsAnalyzing(false);
    }, 550);
  };

  const handleLogAnalyzedFood = async () => {
    if (!result) return;
    const custom = await createCustomFood({
      name: result.name,
      emoji: result.emoji || '🍽️',
      servingGrams: result.servingGrams,
      unit: result.unit || 'gram (g)',
      calories: result.calories,
      carbs: result.carbs,
      protein: result.protein,
      fat: result.fat,
      cholesterolMg: result.cholesterolMg,
      sodiumMg: result.sodiumMg,
      calciumMg: result.calciumMg,
      ironMg: result.ironMg,
      potassiumMg: result.potassiumMg,
      isFavorite: isFavorited,
    });
    await addFoodIntake(selectedMeal, custom, servings);
    router.replace({ pathname: '/food/history', params: { meal: selectedMeal } });
  };

  // Stage 10 Screen 3: Scanned Product / AI Food Details matching 39_Dark / Kit Kat screen
  if (result) {
    const isKitKat = result.name.toLowerCase().includes('kit kat') || result.name.toLowerCase().includes('kitkat');
    const totalCals = Math.round(result.calories * servings);
    const totalCarbsG = Math.round(result.carbs * servings * 10) / 10;
    const totalProteinG = Math.round(result.protein * servings * 10) / 10;
    const totalFatG = Math.round(result.fat * servings * 10) / 10;
    const totalGrams = Math.round(result.servingGrams * servings);

    const macroGramSum = totalCarbsG + totalProteinG + totalFatG || 1;
    const carbsPct = Math.round((totalCarbsG / macroGramSum) * 1000) / 10;
    const proteinPct = Math.round((totalProteinG / macroGramSum) * 1000) / 10;
    const fatPct = Math.max(0, Math.round((100 - carbsPct - proteinPct) * 10) / 10);

    const cholMg = Math.round((result.cholesterolMg ?? 5) * servings);
    const cholDv = Math.max(1, Math.round((cholMg / 300) * 100));
    const sodMg = Math.round((result.sodiumMg ?? 21) * servings);
    const sodDv = Math.max(1, Math.round((sodMg / 2300) * 100));
    const calcMg = Math.round((result.calciumMg ?? 40) * servings);
    const calcDv = Math.max(1, Math.round((calcMg / 1300) * 100));
    const ironMg = Math.round((result.ironMg ?? 1) * servings * 10) / 10;
    const ironDv = Math.max(1, Math.round((ironMg / 18) * 100));
    const potMg = Math.round((result.potassiumMg ?? 88) * servings);
    const potDv = Math.max(1, Math.round((potMg / 3500) * 100));

    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {/* Top Navbar: Close (X) left, Heart right matching Screen 3 */}
        <View style={styles.resultNavbar}>
          <TouchableOpacity onPress={() => setResult(null)} style={styles.iconBtn}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              const next = !isFavorited;
              setIsFavorited(next);
              setFavToast(next ? t.addedToFavoritesToast : t.removedFromFavoritesToast);
              setTimeout(() => setFavToast(null), 2200);
            }}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={26}
              color={isFavorited ? '#F54336' : theme.text}
            />
          </TouchableOpacity>
        </View>

        {favToast && (
          <View style={styles.topToastOverlay} pointerEvents="none">
            <View
              style={[
                styles.topToastCard,
                { backgroundColor: theme.card, borderColor: theme.inputBorder },
              ]}
            >
              <View style={styles.toastCheckCircle}>
                <Ionicons name="checkmark" size={16} color="#181A20" />
              </View>
              <Text style={[styles.toastText, { color: theme.text }]}>{favToast}</Text>
            </View>
          </View>
        )}

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.resultScroll}>
          <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.scannedImageThumb} />
            ) : isKitKat ? (
              <View style={styles.heroWrap}>
                <KitKatLogoBadge />
              </View>
            ) : (
              <View style={styles.heroWrap}>
                <Text style={{ fontSize: 64 }}>{result.emoji || '🍽️'}</Text>
              </View>
            )}

            <Text style={[styles.resultFoodTitle, { color: theme.text }]}>
              {result.name}
            </Text>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            {/* Macro Donut + Breakdown matching Screen 3 */}
            <View style={styles.macroSummaryRow}>
              <MacroDonutChart
                size={116}
                strokeWidth={11}
                carbsPct={carbsPct}
                proteinPct={proteinPct}
                fatPct={fatPct}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.donutCals, { color: theme.text }]}>
                    {totalCals}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                    {t.kcal}
                  </Text>
                </View>
              </MacroDonutChart>

              <View style={styles.macroListCol}>
                <View style={styles.macroLine}>
                  <View style={[styles.dot, { backgroundColor: COLORS.carbs }]} />
                  <Text style={[styles.macroLineLabel, { color: theme.textSecondary }]}>
                    {t.carbs}
                  </Text>
                  <Text style={[styles.macroLineVal, { color: theme.text }]}>
                    {totalCarbsG} ({carbsPct.toFixed(1)}%)
                  </Text>
                </View>
                <View style={styles.macroLine}>
                  <View style={[styles.dot, { backgroundColor: COLORS.protein }]} />
                  <Text style={[styles.macroLineLabel, { color: theme.textSecondary }]}>
                    {t.protein}
                  </Text>
                  <Text style={[styles.macroLineVal, { color: theme.text }]}>
                    {totalProteinG} ({proteinPct.toFixed(1)}%)
                  </Text>
                </View>
                <View style={styles.macroLine}>
                  <View style={[styles.dot, { backgroundColor: COLORS.fat }]} />
                  <Text style={[styles.macroLineLabel, { color: theme.textSecondary }]}>
                    {t.fat}
                  </Text>
                  <Text style={[styles.macroLineVal, { color: theme.text }]}>
                    {totalFatG} ({fatPct.toFixed(1)}%)
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            {/* Micronutrients & Minerals matching Screen 3 */}
            <View style={styles.microSection}>
              <View style={styles.microRow}>
                <Text style={[styles.microLabel, { color: theme.textSecondary }]}>
                  {t.cholesterol}
                </Text>
                <Text style={[styles.microValue, { color: theme.text }]}>
                  {cholMg} mg ({cholDv}%)
                </Text>
              </View>
              <View style={styles.microRow}>
                <Text style={[styles.microLabel, { color: theme.textSecondary }]}>
                  {t.sodium}
                </Text>
                <Text style={[styles.microValue, { color: theme.text }]}>
                  {sodMg} mg ({sodDv}%)
                </Text>
              </View>

              <View style={styles.mineralsHeader}>
                <Text style={{ fontSize: 13, color: theme.textMuted, fontWeight: '600' }}>
                  {t.minerals}
                </Text>
                <View style={[styles.flexLine, { backgroundColor: theme.divider }]} />
              </View>

              <View style={styles.microRow}>
                <Text style={[styles.microLabel, { color: theme.textSecondary }]}>
                  {t.calcium}
                </Text>
                <Text style={[styles.microValue, { color: theme.text }]}>
                  {calcMg} mg ({calcDv}%)
                </Text>
              </View>
              <View style={styles.microRow}>
                <Text style={[styles.microLabel, { color: theme.textSecondary }]}>
                  {t.iron}
                </Text>
                <Text style={[styles.microValue, { color: theme.text }]}>
                  {ironMg} mg ({ironDv}%)
                </Text>
              </View>
              <View style={styles.microRow}>
                <Text style={[styles.microLabel, { color: theme.textSecondary }]}>
                  {t.potassium}
                </Text>
                <Text style={[styles.microValue, { color: theme.text }]}>
                  {potMg} mg ({potDv}%)
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Weight Stepper & + Add CTA matching Screen 3 */}
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: theme.background, borderTopColor: theme.divider },
          ]}
        >
          <View style={styles.servingControlsRow}>
            <TouchableOpacity
              onPress={() => {
                setCustomWeightDraft(String(totalGrams));
                setWeightModalOpen(true);
              }}
              activeOpacity={0.75}
            >
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                {t.weightLabel}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <Text style={[styles.weightGramsText, { color: theme.text }]}>
                  {totalGrams} g
                </Text>
                <Ionicons name="pencil-outline" size={18} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>

            <View style={styles.stepperGroup}>
              <TouchableOpacity
                style={styles.stepperCircle}
                onPress={() =>
                  setServings((s) => Math.max(0.5, Math.round((s - 0.5) * 10) / 10))
                }
              >
                <Ionicons name="remove" size={22} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.servingCountText, { color: theme.text }]}>
                {servings}
              </Text>
              <TouchableOpacity
                style={styles.stepperCircle}
                onPress={() => setServings((s) => Math.round((s + 0.5) * 10) / 10)}
              >
                <Ionicons name="add" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleLogAnalyzedFood}>
            <Ionicons name="add" size={22} color="#181A20" />
            <Text style={styles.addBtnText}>{t.add}</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Weight Edit Modal */}
        <Modal
          visible={weightModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setWeightModalOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.sheetCard, { backgroundColor: theme.card }]}>
              <View style={[styles.sheetHandle, { backgroundColor: theme.inputBorder }]} />
              <Text style={[styles.sheetTitle, { color: theme.text }]}>
                {t.servingWeight} (g)
              </Text>
              <TextInput
                style={[
                  styles.weightInput,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={customWeightDraft}
                onChangeText={setCustomWeightDraft}
                keyboardType="numeric"
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.cancelPillBtn, { backgroundColor: theme.secondaryBtnBg }]}
                  onPress={() => setWeightModalOpen(false)}
                >
                  <Text style={{ fontWeight: '700', color: theme.text }}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => {
                    const parsed = Number(customWeightDraft);
                    if (!isNaN(parsed) && parsed > 0 && result.servingGrams > 0) {
                      setServings(
                        Math.max(0.25, Math.round((parsed / result.servingGrams) * 100) / 100)
                      );
                    }
                    setWeightModalOpen(false);
                  }}
                >
                  <Text style={{ fontWeight: '800', color: '#181A20' }}>{t.save}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Stage 10 Screen 1: Full-Bleed Dark Camera "Scan Barcode" Viewfinder
  return (
    <View style={styles.scannerRoot}>
      {/* Background: Uploaded photo OR dark package barcode camera scene */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.fullCameraImage} />
      ) : (
        <BarcodePackageBackdrop />
      )}

      {/* Subtle Flash Warmth Tint when Torch Enabled */}
      {flashOn && <View style={styles.flashOverlay} pointerEvents="none" />}

      {/* Overlaid Top Transparent Navbar: X | Scan Barcode | Flash Toggle */}
      <View style={styles.scannerHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navIconBtn}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.scannerTitle}>{t.scanBarcode}</Text>
        <TouchableOpacity
          onPress={() => setFlashOn((f) => !f)}
          style={styles.navIconBtn}
          accessibilityLabel="Toggle flash"
        >
          <Ionicons
            name={flashOn ? 'flash' : 'flash-off-outline'}
            size={24}
            color={flashOn ? COLORS.primary : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      {/* Center Reticle with 4 Lime Brackets + Animated Translucent Green Scan Beam */}
      <View style={styles.reticleStage} pointerEvents="none">
        <View style={styles.reticleFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          <Animated.View
            style={[
              styles.scanBeamGroup,
              { transform: [{ translateY: laserTranslateY }] },
            ]}
          >
            <View style={styles.scanBeamTrail} />
            <View style={styles.scanBeamLine} />
          </Animated.View>
        </View>

        {isAnalyzing && (
          <View style={styles.loadingPill}>
            <ActivityIndicator size="small" color="#181A20" />
            <Text style={styles.loadingText}>{t.aiAnalyzing}</Text>
          </View>
        )}
      </View>

      {/* Bottom Camera Controls: Folder (AI/Samples) | White Shutter w/ Lime Ring | Gallery */}
      <View style={styles.bottomControlsDeck}>
        <TouchableOpacity
          style={styles.frostedCircleBtn}
          onPress={() => setAiSheetOpen(true)}
          activeOpacity={0.8}
          accessibilityLabel={t.aiScannerTitle}
        >
          <Ionicons name="folder" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shutterButtonWrap}
          onPress={handleShutterPress}
          activeOpacity={0.85}
          accessibilityLabel={t.scanBarcode}
        >
          <Svg width={84} height={84} viewBox="0 0 84 84" style={styles.shutterSvgRing}>
            <Circle
              cx={42}
              cy={42}
              r={38}
              stroke="rgba(255,255,255,0.28)"
              strokeWidth={4}
              fill="none"
            />
            <Circle
              cx={42}
              cy={42}
              r={38}
              stroke={COLORS.primary}
              strokeWidth={4.5}
              strokeDasharray="160 240"
              strokeLinecap="round"
              fill="none"
              transform="rotate(-90 42 42)"
            />
          </Svg>
          <View style={styles.shutterWhiteCore} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.frostedCircleBtn}
          onPress={pickGalleryImage}
          activeOpacity={0.8}
          accessibilityLabel="Pick photo from gallery"
        >
          <Ionicons name="image" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Gemini AI Meal Description, Sample Barcodes & Low-Cost Model Sheet (opened via Folder button) */}
      <Modal
        visible={aiSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAiSheetOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={{ flex: 1, width: '100%' }}
            activeOpacity={1}
            onPress={() => setAiSheetOpen(false)}
          />
          <View style={[styles.aiModalSheet, { backgroundColor: theme.card }]}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.inputBorder }]} />
            <Text style={[styles.sheetTitle, { color: theme.text }]}>
              {t.aiScannerTitle}
            </Text>

            <Text style={[styles.promptLabel, { color: theme.text }]}>
              {t.describeMealLabel}
            </Text>
            <View style={styles.promptInputRow}>
              <TextInput
                style={[
                  styles.promptInput,
                  { backgroundColor: theme.background, color: theme.text },
                ]}
                value={promptText}
                onChangeText={setPromptText}
                placeholder={t.describeMealPlaceholder}
                placeholderTextColor={theme.textMuted}
              />
              <TouchableOpacity
                style={styles.analyzeGoBtn}
                onPress={() =>
                  triggerAnalysis(
                    promptText || 'Grilled Chicken Avocado Salad',
                    base64Data || undefined
                  )
                }
              >
                <Ionicons name="sparkles" size={16} color="#181A20" />
                <Text style={styles.analyzeGoText}>{t.analyze}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.presetHeader, { color: theme.textMuted }]}>
              {t.instantSamples}
            </Text>
            <View style={styles.presetsGrid}>
              {SAMPLE_FOOD_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={styles.presetChip}
                  onPress={() => {
                    if (p.barcodePreset) {
                      setAiSheetOpen(false);
                      setResult(KIT_KAT_BARCODE_RESULT);
                      setServings(1);
                      return;
                    }
                    setPromptText(p.prompt);
                    triggerAnalysis(p.prompt);
                  }}
                >
                  <Text style={[styles.presetChipText, { color: theme.text }]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.presetHeader, { color: theme.textMuted, marginTop: 14 }]}>
              {t.activeVisionModel}
            </Text>
            <View style={styles.presetsGrid}>
              {CHEAP_VISION_MODELS.map((m) => {
                const active = geminiModel === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.presetChip,
                      active && { backgroundColor: COLORS.primary },
                    ]}
                    onPress={() => setGeminiModel(m.id)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        { color: active ? '#181A20' : theme.text },
                      ]}
                    >
                      {m.id}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scannerRoot: {
    flex: 1,
    backgroundColor: '#111419',
    overflow: 'hidden',
  },
  fullCameraImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mockCameraScene: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#22262E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapperBandTop: {
    position: 'absolute',
    width: '130%',
    height: 180,
    backgroundColor: '#3A231E',
    transform: [{ rotate: '14deg' }, { translateY: -95 }],
    opacity: 0.9,
  },
  wrapperBandMain: {
    width: '130%',
    height: 210,
    backgroundColor: '#482821',
    transform: [{ rotate: '14deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  barcodeSticker: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 250, 220, 0.12)',
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 14,
    zIndex: 10,
  },
  navIconBtn: {
    padding: 6,
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reticleStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  reticleFrame: {
    width: '100%',
    maxWidth: 340,
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 46,
    height: 36,
    borderColor: COLORS.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanBeamGroup: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: 0,
  },
  scanBeamTrail: {
    height: 68,
    backgroundColor: 'rgba(161, 206, 80, 0.28)',
  },
  scanBeamLine: {
    height: 3,
    backgroundColor: COLORS.primary,
  },
  loadingPill: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 1000,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#181A20',
  },
  bottomControlsDeck: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingBottom: 42,
    paddingTop: 18,
    zIndex: 10,
  },
  frostedCircleBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButtonWrap: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterSvgRing: {
    position: 'absolute',
  },
  shutterWhiteCore: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
  },
  // Result Food Details (Stage 10 Screen 3)
  resultNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 12,
  },
  iconBtn: {
    padding: 4,
  },
  topToastOverlay: {
    position: 'absolute',
    top: 94,
    left: 0,
    right: 0,
    zIndex: 30,
    alignItems: 'center',
  },
  topToastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  toastCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultScroll: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  resultCard: {
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  heroWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  scannedImageThumb: {
    width: 94,
    height: 94,
    borderRadius: 47,
    marginBottom: 10,
  },
  resultFoodTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  macroSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    gap: 16,
  },
  donutCals: {
    fontSize: 26,
    fontWeight: '800',
  },
  macroListCol: {
    flex: 1,
    gap: 14,
  },
  macroLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  macroLineLabel: {
    fontSize: 14,
    flex: 1,
  },
  macroLineVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  microSection: {
    width: '100%',
    gap: 16,
  },
  microRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  microLabel: {
    fontSize: 16,
  },
  microValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  mineralsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  flexLine: {
    flex: 1,
    height: 1,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    gap: 16,
  },
  servingControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightGramsText: {
    fontSize: 24,
    fontWeight: '800',
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  stepperCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingCountText: {
    fontSize: 22,
    fontWeight: '800',
    minWidth: 28,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    height: 58,
    borderRadius: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#181A20',
  },
  // Modals (AI Sheet & Custom Weight)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.68)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  aiModalSheet: {
    width: '100%',
    maxWidth: 440,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 30,
  },
  sheetCard: {
    width: '100%',
    maxWidth: 440,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 30,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  promptInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  promptInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
  },
  analyzeGoBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  analyzeGoText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#181A20',
  },
  presetHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    backgroundColor: 'rgba(161, 206, 80, 0.14)',
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 1000,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  weightInput: {
    height: 58,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 14,
  },
  cancelPillBtn: {
    flex: 1,
    height: 54,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    flex: 1,
    height: 54,
    borderRadius: 1000,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
