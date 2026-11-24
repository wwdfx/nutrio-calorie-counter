import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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

const SAMPLE_FOOD_PRESETS = [
  { label: '🍣 Salmon Poke Bowl', prompt: 'Grilled Atlantic salmon poke bowl with brown rice, edamame and avocado' },
  { label: '🍕 Margherita Pizza', prompt: 'Two slices of Neapolitan Margherita artisan pizza with fresh mozzarella' },
  { label: '🍫 Kit Kat Bar (42g)', prompt: 'Kit Kat 4-finger milk chocolate crisp wafer bar 42g' },
  { label: '🥗 Chicken Caesar Salad', prompt: 'Grilled chicken breast Caesar salad with parmesan and olive oil dressing' },
];

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

  const mealLabel = (m: MealType) =>
    m === 'Breakfast'
      ? t.breakfast
      : m === 'Lunch'
      ? t.lunch
      : m === 'Dinner'
      ? t.dinner
      : t.snacks;

  const [selectedMeal, setSelectedMeal] = useState<MealType>(
    (meal as MealType) || 'Lunch'
  );
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [promptText, setPromptText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzedFoodResult | null>(null);
  const [servings, setServings] = useState(1);

  const pickImage = async (useCamera: boolean) => {
    try {
      const pickerFn = useCamera
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

      const res = await pickerFn({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        const asset = res.assets[0];
        setImageUri(asset.uri);
        if (asset.base64) {
          setBase64Data(asset.base64);
          await triggerAnalysis(promptText, asset.base64, asset.mimeType || 'image/jpeg');
        }
      }
    } catch {
      // Fallback if camera not available on desktop browser
      const fallback = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.7,
      });
      if (!fallback.canceled && fallback.assets?.[0]) {
        setImageUri(fallback.assets[0].uri);
        setBase64Data(fallback.assets[0].base64 || null);
        await triggerAnalysis(
          promptText,
          fallback.assets[0].base64 || undefined,
          fallback.assets[0].mimeType || 'image/jpeg'
        );
      }
    }
  };

  const triggerAnalysis = async (
    text?: string,
    b64?: string,
    mime = 'image/jpeg'
  ) => {
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
    } finally {
      setIsAnalyzing(false);
    }
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
    });
    await addFoodIntake(selectedMeal, custom, servings);
    router.replace('/(tabs)');
  };

  // If we have an AI result, show the Scanned Food Details UI (Screen 58_Light_scanned food details)
  if (result) {
    const totalCals = Math.round(result.calories * servings);
    const totalCarbs = Math.round(result.carbs * servings * 10) / 10;
    const totalProtein = Math.round(result.protein * servings * 10) / 10;
    const totalFat = Math.round(result.fat * servings * 10) / 10;
    const macroSum = totalCarbs + totalProtein + totalFat || 1;
    const cPct = Math.round((totalCarbs / macroSum) * 100);
    const pPct = Math.round((totalProtein / macroSum) * 100);
    const fPct = Math.max(0, 100 - cPct - pPct);

    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={styles.resultNavbar}>
          <TouchableOpacity onPress={() => setResult(null)}>
            <Ionicons name="arrow-back" size={26} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.resultNavTitle, { color: theme.text }]}>
            {t.aiScannedDetails}
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.resultScroll}>
          <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.scannedImageThumb} />
            ) : (
              <View style={styles.emojiAvatar}>
                <Text style={{ fontSize: 44 }}>{result.emoji}</Text>
              </View>
            )}

            <View style={styles.aiTagPill}>
              <Ionicons name="sparkles" size={14} color="#212121" />
              <Text style={styles.aiTagText}>{result.modelUsed || geminiModel}</Text>
            </View>

            <Text style={[styles.resultFoodTitle, { color: theme.text }]}>
              {result.name}
            </Text>
            <Text style={[styles.confidenceText, { color: theme.textSecondary }]}>
              {result.confidenceNote}
            </Text>

            {result.itemsDetected?.length > 0 && (
              <View style={styles.detectedWrap}>
                {result.itemsDetected.map((item) => (
                  <View
                    key={item}
                    style={[styles.detectedChip, { backgroundColor: theme.inputBg }]}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: theme.text }}>
                      ✓ {item}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <View style={styles.macroSummaryRow}>
              <MacroDonutChart
                size={114}
                strokeWidth={11}
                carbsPct={cPct}
                proteinPct={pPct}
                fatPct={fPct}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.donutCals, { color: theme.text }]}>
                    {totalCals}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary }}>kcal</Text>
                </View>
              </MacroDonutChart>

              <View style={styles.macroListCol}>
                <View style={styles.macroLine}>
                  <View style={[styles.dot, { backgroundColor: COLORS.carbs }]} />
                  <Text style={[styles.macroLineLabel, { color: theme.textSecondary }]}>
                    {t.carbs}
                  </Text>
                  <Text style={[styles.macroLineVal, { color: theme.text }]}>
                    {totalCarbs}g ({cPct}%)
                  </Text>
                </View>
                <View style={styles.macroLine}>
                  <View style={[styles.dot, { backgroundColor: COLORS.protein }]} />
                  <Text style={[styles.macroLineLabel, { color: theme.textSecondary }]}>
                    {t.protein}
                  </Text>
                  <Text style={[styles.macroLineVal, { color: theme.text }]}>
                    {totalProtein}g ({pPct}%)
                  </Text>
                </View>
                <View style={styles.macroLine}>
                  <View style={[styles.dot, { backgroundColor: COLORS.fat }]} />
                  <Text style={[styles.macroLineLabel, { color: theme.textSecondary }]}>
                    {t.fat}
                  </Text>
                  <Text style={[styles.macroLineVal, { color: theme.text }]}>
                    {totalFat}g ({fPct}%)
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <View style={styles.microGrid}>
              <View style={styles.microRow}>
                <Text style={{ color: theme.textSecondary }}>{t.cholesterol}</Text>
                <Text style={{ color: theme.text, fontWeight: '700' }}>
                  {Math.round(result.cholesterolMg * servings)} mg
                </Text>
              </View>
              <View style={styles.microRow}>
                <Text style={{ color: theme.textSecondary }}>{t.sodium}</Text>
                <Text style={{ color: theme.text, fontWeight: '700' }}>
                  {Math.round(result.sodiumMg * servings)} mg
                </Text>
              </View>
              <View style={styles.microRow}>
                <Text style={{ color: theme.textSecondary }}>{t.calcium}</Text>
                <Text style={{ color: theme.text, fontWeight: '700' }}>
                  {Math.round(result.calciumMg * servings)} mg
                </Text>
              </View>
              <View style={styles.microRow}>
                <Text style={{ color: theme.textSecondary }}>{t.potassium}</Text>
                <Text style={{ color: theme.text, fontWeight: '700' }}>
                  {Math.round(result.potassiumMg * servings)} mg
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.divider }]}>
          <View style={styles.mealTargetRow}>
            {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as MealType[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.mealChip,
                  {
                    backgroundColor:
                      selectedMeal === m ? COLORS.primary : theme.inputBg,
                  },
                ]}
                onPress={() => setSelectedMeal(m)}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: selectedMeal === m ? '#212121' : theme.text,
                  }}
                >
                  {mealLabel(m)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.servingControlsRow}>
            <View>
              <Text style={{ fontSize: 12, color: theme.textSecondary }}>{t.servingWeight}</Text>
              <Text style={[styles.weightGramsText, { color: theme.text }]}>
                {Math.round(result.servingGrams * servings)} g
              </Text>
            </View>

            <View style={styles.stepperGroup}>
              <TouchableOpacity
                style={styles.stepperCircle}
                onPress={() => setServings((s) => Math.max(0.5, s - 0.5))}
              >
                <Ionicons name="remove" size={20} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.servingCountText, { color: theme.text }]}>
                {servings}
              </Text>
              <TouchableOpacity
                style={styles.stepperCircle}
                onPress={() => setServings((s) => s + 0.5)}
              >
                <Ionicons name="add" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleLogAnalyzedFood}>
            <Ionicons name="add" size={22} color="#212121" />
            <Text style={styles.addBtnText}>{t.addTo} {mealLabel(selectedMeal)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Scanner Viewfinder matching Screen 57_Light_scan barcode / AI food scanner
  return (
    <View style={styles.scannerRoot}>
      <View style={styles.scannerHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerCircleBtn}>
          <Ionicons name="close" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.scannerTitle}>{t.aiScannerTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scannerBody}>
        {/* Viewfinder Reticle matching Screen 57 */}
        <View style={styles.viewfinderBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderCamera}>
              <Ionicons name="camera-outline" size={54} color={COLORS.primary} />
              <Text style={styles.placeholderText}>
                {t.aiScannerPlaceholder}
              </Text>
            </View>
          )}
          {/* Green Corner Brackets & Laser Line */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <View style={styles.laserLine} />
        </View>

        {isAnalyzing && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator size="small" color="#212121" />
            <Text style={styles.loadingText}>
              {t.aiAnalyzing}
            </Text>
          </View>
        )}

        {/* Camera / Gallery Trigger Row matching Screen 57 bottom controls */}
        <View style={styles.shutterRow}>
          <TouchableOpacity
            style={styles.secondaryRoundBtn}
            onPress={() => pickImage(false)}
          >
            <Ionicons name="folder-open-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shutterOuter}
            onPress={() => pickImage(true)}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryRoundBtn}
            onPress={() => pickImage(false)}
          >
            <Ionicons name="images-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Cost-Efficient Model Selector Bar */}
        <View style={styles.modelSelectorBox}>
          <Text style={styles.presetHeader}>{t.activeVisionModel}</Text>
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
                      active && { color: '#212121', fontWeight: '800' },
                    ]}
                  >
                    {m.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Natural Language AI Meal Description Input */}
        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>
            {t.describeMealLabel}
          </Text>
          <View style={styles.promptInputRow}>
            <TextInput
              style={styles.promptInput}
              value={promptText}
              onChangeText={setPromptText}
              placeholder={t.describeMealPlaceholder}
              placeholderTextColor="#9E9E9E"
            />
            <TouchableOpacity
              style={styles.analyzeGoBtn}
              onPress={() =>
                triggerAnalysis(promptText || 'Grilled Chicken Avocado Salad', base64Data || undefined)
              }
            >
              <Ionicons name="sparkles" size={18} color="#212121" />
              <Text style={styles.analyzeGoText}>{t.analyze}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.presetHeader}>{t.instantSamples}</Text>
          <View style={styles.presetsGrid}>
            {SAMPLE_FOOD_PRESETS.map((p) => (
              <TouchableOpacity
                key={p.label}
                style={styles.presetChip}
                onPress={() => {
                  setPromptText(p.prompt);
                  triggerAnalysis(p.prompt);
                }}
              >
                <Text style={styles.presetChipText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scannerRoot: {
    flex: 1,
    backgroundColor: '#14171D',
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 14,
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scannerBody: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    alignItems: 'center',
  },
  viewfinderBox: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1E232D',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderCamera: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  placeholderText: {
    color: '#D0D5DD',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  corner: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderColor: COLORS.primary,
  },
  cornerTL: {
    top: 20,
    left: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 20,
    right: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 20,
    left: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 20,
    right: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  laserLine: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 3,
    backgroundColor: COLORS.primary,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 1000,
    gap: 10,
    marginBottom: 18,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#212121',
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 24,
  },
  secondaryRoundBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  shutterInner: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
  },
  promptCard: {
    width: '100%',
    backgroundColor: '#1F2430',
    borderRadius: 18,
    padding: 16,
  },
  modelSelectorBox: {
    width: '100%',
    backgroundColor: '#1F2430',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  promptLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  promptInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  promptInput: {
    flex: 1,
    backgroundColor: '#14171D',
    color: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
  },
  analyzeGoBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  analyzeGoText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#212121',
  },
  presetHeader: {
    color: '#9E9E9E',
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
    backgroundColor: 'rgba(161, 206, 80, 0.16)',
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 1000,
  },
  presetChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  resultNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 12,
  },
  resultNavTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  resultScroll: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  resultCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  scannedImageThumb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  emojiAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  aiTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 1000,
    gap: 4,
    marginBottom: 10,
  },
  aiTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#212121',
  },
  resultFoodTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  confidenceText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  detectedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  detectedChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
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
    gap: 16,
  },
  donutCals: {
    fontSize: 24,
    fontWeight: '800',
  },
  macroListCol: {
    flex: 1,
    gap: 12,
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
  microGrid: {
    width: '100%',
    gap: 12,
  },
  microRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 26,
    borderTopWidth: 1,
    gap: 12,
  },
  mealTargetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  mealChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  servingControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightGramsText: {
    fontSize: 20,
    fontWeight: '800',
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingCountText: {
    fontSize: 20,
    fontWeight: '800',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#212121',
  },
});
