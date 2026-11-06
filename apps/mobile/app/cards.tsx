import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getActiveSet } from '../src/store';

const C = { ink: '#171321', muted: '#766D82', purple: '#7047EB', lime: '#D7F36B', bg: '#F8F6FB' };

export default function Cards() {
  const set = getActiveSet();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { width, height } = useWindowDimensions();
  const compact = width < 360 || height < 700;
  if (index >= set.cards.length) return <SafeAreaView style={s.safe}>
    <ScrollView contentContainerStyle={s.done}>
      <Text style={s.big}>✦</Text><Text style={s.title}>Отличная работа!</Text>
      <Text style={s.copy}>Ты повторил все {set.cards.length} карточки. Теперь проверь себя в мини-тесте.</Text>
      <Pressable style={s.button} onPress={() => router.replace('/quiz')}><Text style={s.buttonText}>Перейти к тесту</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
  const card = set.cards[index];
  const content = flipped ? card.answer : card.question;
  const fontSize = content.length > 300 ? 18 : content.length > 150 || compact ? 21 : 25;
  const next = () => { setFlipped(false); setIndex(value => value + 1); };
  return <SafeAreaView style={s.safe}>
    <ScrollView contentContainerStyle={[s.page, compact && s.compactPage]}>
      <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.replace('/set')}>
        <Text style={s.back}>‹  {set.title}</Text>
      </Pressable>
      <View style={s.counter}>
        <Text style={s.kicker}>КАРТОЧКА {index + 1} ИЗ {set.cards.length}</Text>
        <Text style={s.progress}>{Math.round(index / set.cards.length * 100)}%</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={flipped ? 'Ответ. Нажмите, чтобы увидеть вопрос' : 'Вопрос. Нажмите, чтобы увидеть ответ'}
        style={[s.card, { minHeight: compact ? 250 : 340 }, flipped && s.cardBack]} onPress={() => setFlipped(value => !value)}>
        <Text style={s.cardLabel}>{flipped ? 'ОТВЕТ' : 'ВОПРОС'}</Text>
        <Text style={[s.cardText, { fontSize, lineHeight: Math.round(fontSize * 1.45) }]}>{content}</Text>
        <Text style={s.tap}>{flipped ? 'Нажми, чтобы увидеть вопрос' : 'Нажми, чтобы перевернуть'}</Text>
      </Pressable>
      <View style={s.actions}>
        <Pressable style={s.repeat} onPress={next}><Text style={s.repeatText}>Повторить</Text></Pressable>
        <Pressable style={s.know} onPress={next}><Text style={s.knowText}>Знаю  ✓</Text></Pressable>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  page: { padding: 20, paddingBottom: 28, flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
  compactPage: { padding: 16 },
  back: { color: C.purple, fontWeight: '700', fontSize: 15, lineHeight: 22, marginBottom: 22 },
  counter: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  kicker: { fontSize: 11, fontWeight: '800', color: C.purple, letterSpacing: 1 },
  progress: { fontSize: 12, color: C.muted },
  card: { flexGrow: 1, marginTop: 18, borderRadius: 26, backgroundColor: C.purple, padding: 24, alignItems: 'center', shadowColor: C.purple, shadowOpacity: 0.18, shadowRadius: 14, elevation: 4 },
  cardBack: { backgroundColor: C.ink },
  cardLabel: { color: C.lime, fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
  cardText: { color: '#FFF', fontWeight: '700', textAlign: 'center', marginVertical: 28, flexGrow: 1, width: '100%', textAlignVertical: 'center' },
  tap: { color: '#D9D0FF', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 18 },
  repeat: { flex: 1, minHeight: 52, borderRadius: 16, padding: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDE8F7' },
  know: { flex: 1, minHeight: 52, borderRadius: 16, padding: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: C.lime },
  repeatText: { color: C.purple, fontWeight: '800', textAlign: 'center' },
  knowText: { color: C.ink, fontWeight: '800', textAlign: 'center' },
  done: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, width: '100%', maxWidth: 720, alignSelf: 'center' },
  big: { fontSize: 64, color: C.purple },
  title: { fontSize: 28, lineHeight: 35, fontWeight: '800', color: C.ink, textAlign: 'center', marginTop: 12 },
  copy: { color: C.muted, textAlign: 'center', lineHeight: 22, marginTop: 12 },
  button: { backgroundColor: C.purple, borderRadius: 16, padding: 17, marginTop: 28, width: '100%', alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '800', textAlign: 'center' },
});
