import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio } from '@/context/NutrioContext';
import { NutrioLogo } from '@/components/NutrioLogo';

interface Article {
  id: string;
  section: 'Calorie & Nutrition' | 'Physical Activity' | 'Hydration & AI';
  title: string;
  readTime: string;
  emoji: string;
  body: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'art-1',
    section: 'Calorie & Nutrition',
    title: 'Macronutrients 101: Carbs, Protein, & Fat',
    readTime: '4 min read',
    emoji: '🍎',
    body: [
      'Sustainable fat loss is not just about cutting calories—it is about preserving lean muscle mass and keeping satiety hormones stable throughout the day.',
      'Aim for 1.6g to 2.2g of protein per kilogram of target body weight. Protein has the highest thermic effect of food (TEF), meaning your body burns 20–30% of protein calories just digesting it.',
      'Pair complex carbohydrates (oats, quinoa, sweet potatoes, berries) around your active hours and workouts, while including monounsaturated fats like avocado and olive oil to support hormone health.',
    ],
  },
  {
    id: 'art-2',
    section: 'Calorie & Nutrition',
    title: 'Understanding Caloric Needs & BMR',
    readTime: '3 min read',
    emoji: '🔥',
    body: [
      'Your Basal Metabolic Rate (BMR) accounts for 60–75% of daily energy burn. Nutrio computes your Mifflin-St Jeor target automatically from your height, weight, age, and activity multiplier.',
    ],
  },
  {
    id: 'art-3',
    section: 'Calorie & Nutrition',
    title: 'Nutrient-Dense Foods: What Are They?',
    readTime: '5 min read',
    emoji: '🥬',
    body: [
      'Leafy greens, wild salmon, berries, Greek yogurt, and legumes deliver high micronutrient density (potassium, iron, calcium, fiber) per 100 kcal—keeping you full in a deficit.',
    ],
  },
  {
    id: 'art-4',
    section: 'Physical Activity',
    title: 'Why Daily Steps Matter for Fat Loss',
    readTime: '3 min read',
    emoji: '👣',
    body: [
      'Non-Exercise Activity Thermogenesis (NEAT) from walking 6,000–10,000 steps per day burns 250–450 extra kcal without spiking cortisol or hunger.',
    ],
  },
  {
    id: 'art-5',
    section: 'Physical Activity',
    title: 'Walking vs. Running: Which Burns More?',
    readTime: '4 min read',
    emoji: '🏃',
    body: [
      'Both burn similar calories per kilometer, but incline walking is easier to recover from daily while preserving strength training intensity.',
    ],
  },
  {
    id: 'art-6',
    section: 'Hydration & AI',
    title: 'Snap Better Meal Photos for Gemini AI',
    readTime: '3 min read',
    emoji: '📸',
    body: [
      'Capture your plate from a 45-degree angle in good lighting so all components—proteins, grains, vegetables, and sauces—are clearly visible to Gemini 3.5 Flash-Lite.',
    ],
  },
];

const SECTIONS: Article['section'][] = [
  'Calorie & Nutrition',
  'Physical Activity',
  'Hydration & AI',
];

export default function ArticlesScreen() {
  const { themeMode, t } = useNutrio();
  const theme = getThemeColors(themeMode);

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filtered = ARTICLES.filter((a) =>
    searchText.trim()
      ? a.title.toLowerCase().includes(searchText.trim().toLowerCase())
      : true
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header matching 100_Dark_articles & Stage 1 Slide 3 */}
      <View style={styles.header}>
        <NutrioLogo size={28} color={COLORS.primary} eyeColor={theme.background} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {t.articlesTitle}
        </Text>
        <TouchableOpacity onPress={() => setSearchOpen((v) => !v)}>
          <Ionicons name="search-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {searchOpen && (
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
            <Ionicons name="search-outline" size={18} color={theme.textMuted} />
            <TextInput
              style={{ flex: 1, color: theme.text, fontSize: 15 }}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search nutrition & wellness articles..."
              placeholderTextColor={theme.textMuted}
            />
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {SECTIONS.map((sectionName) => {
          const items = filtered.filter((a) => a.section === sectionName);
          if (items.length === 0) return null;
          return (
            <View key={sectionName} style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionHeading, { color: theme.text }]}>
                  {sectionName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalShelf}
              >
                {items.map((art) => (
                  <TouchableOpacity
                    key={art.id}
                    style={[styles.shelfCard, { backgroundColor: theme.card }]}
                    onPress={() => setSelectedArticle(art)}
                    activeOpacity={0.85}
                  >
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                      <Text
                        style={[styles.shelfTitle, { color: theme.text }]}
                        numberOfLines={2}
                      >
                        {art.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: theme.textMuted }}>
                        {art.readTime}
                      </Text>
                    </View>
                    <View style={[styles.emojiGlow, { backgroundColor: theme.background }]}>
                      <Text style={{ fontSize: 34 }}>{art.emoji}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={!!selectedArticle}
        animationType="slide"
        onRequestClose={() => setSelectedArticle(null)}
      >
        {selectedArticle && (
          <View style={{ flex: 1, backgroundColor: theme.background }}>
            <View style={styles.modalNav}>
              <TouchableOpacity onPress={() => setSelectedArticle(null)}>
                <Ionicons name="arrow-back" size={26} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                {t.articleDetails}
              </Text>
              <View style={{ width: 26 }} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
              <View style={[styles.heroBanner, { backgroundColor: theme.card }]}>
                <Text style={{ fontSize: 64 }}>{selectedArticle.emoji}</Text>
              </View>
              <Text style={styles.catBadge}>{selectedArticle.section}</Text>
              <Text style={[styles.detailTitle, { color: theme.text }]}>
                {selectedArticle.title}
              </Text>
              <Text style={{ fontSize: 13, color: theme.textMuted }}>
                Nutrio Clinical Nutrition Team · {selectedArticle.readTime}
              </Text>
              {selectedArticle.body.map((p, i) => (
                <Text
                  key={i}
                  style={[styles.paragraph, { color: theme.textSecondary }]}
                >
                  {p}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  scrollContent: {
    paddingBottom: 32,
    gap: 24,
  },
  sectionBlock: {
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: '800',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  horizontalShelf: {
    paddingHorizontal: 20,
    gap: 14,
  },
  shelfCard: {
    width: 268,
    height: 112,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  shelfTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  emojiGlow: {
    width: 68,
    height: 68,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 12,
  },
  heroBanner: {
    height: 160,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
  },
});
