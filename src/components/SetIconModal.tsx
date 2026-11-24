import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemeColors } from '@/constants/theme';
import { useNutrio } from '@/context/NutrioContext';

interface FoodIconOption {
  emoji: string;
  keywords: string;
}

// 5-column food icon grid matching Stage 9 Set Icon order + multilingual search keywords
export const FOOD_ICONS: FoodIconOption[] = [
  { emoji: '🌭', keywords: 'hot dog sausage хотдог сосиска хот-дог' },
  { emoji: '🍇', keywords: 'grapes fruit виноград' },
  { emoji: '🥑', keywords: 'avocado авокадо' },
  { emoji: '🍞', keywords: 'bread loaf toast хлеб хліб' },
  { emoji: '🍱', keywords: 'bento sushi box бенто суши суші' },
  { emoji: '🦀', keywords: 'crab seafood краб' },
  { emoji: '🍆', keywords: 'eggplant aubergine баклажан' },
  { emoji: '🥐', keywords: 'croissant pastry круассан круасан' },
  { emoji: '🦞', keywords: 'lobster seafood лобстер омар' },
  { emoji: '🍦', keywords: 'ice cream cone мороженое морозиво' },
  { emoji: '🥛', keywords: 'milk glass drink молоко напиток напій' },
  { emoji: '🍉', keywords: 'watermelon fruit арбуз кавун' },
  { emoji: '🥔', keywords: 'potato картофель картошка картопля' },
  { emoji: '🥖', keywords: 'baguette bread багет хлеб хліб' },
  { emoji: '🍙', keywords: 'onigiri rice ball онигири рис' },
  { emoji: '🍤', keywords: 'shrimp prawn fried креветка' },
  { emoji: '🍨', keywords: 'ice cream sundae dessert десерт мороженое' },
  { emoji: '☕', keywords: 'coffee espresso latte кофе кава' },
  { emoji: '🍊', keywords: 'orange tangerine citrus апельсин мандарин' },
  { emoji: '🥕', keywords: 'carrot vegetable морковь морква' },
  { emoji: '🍚', keywords: 'rice bowl рис каша' },
  { emoji: '🍩', keywords: 'donut doughnut пончик' },
  { emoji: '🍋', keywords: 'lemon citrus лимон' },
  { emoji: '🌽', keywords: 'corn maize кукуруза кукурудза' },
  { emoji: '🍪', keywords: 'cookie biscuit печенье печиво' },
  { emoji: '🍵', keywords: 'tea green matcha чай' },
  { emoji: '🍌', keywords: 'banana fruit банан' },
  { emoji: '🌶️', keywords: 'chili pepper spicy перец чили перець' },
  { emoji: '🥯', keywords: 'bagel pastry бейгл бублик' },
  { emoji: '🍜', keywords: 'noodles ramen soup лапша рамен суп' },
  { emoji: '🎂', keywords: 'birthday cake торт' },
  { emoji: '🫑', keywords: 'bell pepper vegetable перец перець' },
  { emoji: '🥞', keywords: 'pancakes breakfast блины панкейки млинці' },
  { emoji: '🍰', keywords: 'cake slice cheesecake торт чизкейк чізкейк' },
  { emoji: '🥭', keywords: 'mango fruit манго' },
  { emoji: '🥒', keywords: 'cucumber pickle огурец огірок' },
  { emoji: '🧁', keywords: 'cupcake muffin кекс капкейк маффин' },
  { emoji: '🍷', keywords: 'wine drink вино' },
  { emoji: '🍎', keywords: 'apple fruit яблоко яблуко' },
  { emoji: '🥬', keywords: 'lettuce greens salad салат зелень капуста' },
  { emoji: '🧀', keywords: 'cheese сыр сир' },
  { emoji: '🍐', keywords: 'pear fruit груша' },
  { emoji: '🥦', keywords: 'broccoli vegetable брокколи броколі' },
  { emoji: '🍗', keywords: 'chicken poultry meat курица курка мясо' },
  { emoji: '🍣', keywords: 'sushi sashimi суши суші' },
  { emoji: '🍔', keywords: 'burger cheeseburger бургер чизбургер' },
  { emoji: '🍕', keywords: 'pizza пицца піца' },
  { emoji: '🥙', keywords: 'flatbread stuffed wrap pita шаурма лаваш пита піта' },
  { emoji: '🥗', keywords: 'salad bowl салат' },
  { emoji: '🌮', keywords: 'taco quesadilla wrap тако кесадилья' },
];

interface SetIconModalProps {
  visible: boolean;
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function SetIconModal({
  visible,
  selectedEmoji,
  onSelect,
  onClose,
}: SetIconModalProps) {
  const { themeMode, t } = useNutrio();
  const theme = getThemeColors(themeMode);
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FOOD_ICONS;
    return FOOD_ICONS.filter(
      (item) => item.keywords.toLowerCase().includes(q) || item.emoji.includes(q)
    );
  }, [search]);

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalBackdrop}>
        <TouchableOpacity
          style={styles.backdropDismissArea}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View
          style={[
            styles.setIconSheet,
            { backgroundColor: theme.background, borderColor: theme.divider },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: theme.inputBorder }]} />
          <Text style={[styles.setIconTitle, { color: theme.text }]}>
            {t.setIcon}
          </Text>
          <View style={[styles.sheetDivider, { backgroundColor: theme.divider }]} />

          <View style={[styles.iconSearchBox, { backgroundColor: theme.card }]}>
            <Ionicons name="search-outline" size={20} color={theme.textMuted} />
            <TextInput
              style={[styles.iconSearchInput, { color: theme.text }]}
              value={search}
              onChangeText={setSearch}
              placeholder={t.search}
              placeholderTextColor={theme.textMuted}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.iconGridContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconGrid}>
              {filteredIcons.map((item) => {
                const selected = selectedEmoji === item.emoji;
                return (
                  <TouchableOpacity
                    key={item.emoji}
                    style={[
                      styles.iconGridCell,
                      selected && {
                        backgroundColor: theme.card,
                        borderColor: COLORS.primary,
                        borderWidth: 1.5,
                      },
                    ]}
                    onPress={() => {
                      onSelect(item.emoji);
                      setSearch('');
                      onClose();
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.iconGridEmoji}>{item.emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.68)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdropDismissArea: {
    flex: 1,
    width: '100%',
  },
  setIconSheet: {
    width: '100%',
    maxWidth: 440,
    height: '86%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  setIconTitle: {
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  sheetDivider: {
    height: 1,
    width: '100%',
    marginBottom: 18,
  },
  iconSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    gap: 10,
    marginBottom: 18,
  },
  iconSearchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  iconGridContent: {
    paddingBottom: 28,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  iconGridCell: {
    width: '20%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconGridEmoji: {
    fontSize: 36,
  },
});
