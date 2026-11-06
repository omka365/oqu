import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { generateStudySet } from '../src/api';
import { getSets, loadSets, setActiveSet } from '../src/store';

const colors = { ink: '#171321', muted: '#766D82', purple: '#7047EB', lime: '#D7F36B', bg: '#F8F6FB', card: '#FFFFFF' };
export default function Home() {
  const [sets, setSets] = useState(getSets());
  const [loading, setLoading] = useState(false);
  useEffect(() => { void loadSets().then(setSets); }, []);
  const choose = async (kind: 'pdf' | 'photo') => {
    const result = kind === 'pdf' ? await DocumentPicker.getDocumentAsync({ type: 'application/pdf' }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    setLoading(true);
    try {
      const file = kind === 'pdf'
        ? { uri: asset.uri, name: (asset as DocumentPicker.DocumentPickerAsset).name, type: (asset as DocumentPicker.DocumentPickerAsset).mimeType || 'application/pdf' }
        : { uri: asset.uri, name: `material-${Date.now()}.jpg`, type: (asset as ImagePicker.ImagePickerAsset).mimeType || 'image/jpeg' };
      const set = await generateStudySet({ file });
      setActiveSet(set);
      setSets(current => [set, ...current]);
      Alert.alert('Готово', 'Учебный набор создан.');
    } catch (error) { Alert.alert('Не удалось создать набор', error instanceof Error ? error.message : 'Проверьте сервер и подключение.'); }
    finally { setLoading(false); }
  };
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.page}>
    <View style={s.top}><View><Text style={s.eyebrow}>OQU • SMART STUDY</Text><Text style={s.title}>Учись проще.{"\n"}<Text style={{ color: colors.purple }}>Запоминай больше.</Text></Text></View><View style={s.avatar}><Text style={s.avatarText}>О</Text></View></View>
    <View style={s.hero}><View style={{ flex: 1 }}><Text style={s.heroLabel}>ТВОЙ УМНЫЙ ПОМОЩНИК</Text><Text style={s.heroTitle}>Материал →{ '\n' }карточки →{ '\n' }результат</Text><Text style={s.heroCopy}>Загрузи конспект — мы соберём план подготовки.</Text></View><Text style={s.heroIcon}>✦</Text></View>
    <Text style={s.section}>Создать набор</Text><View style={s.actions}><Pressable style={[s.action, { backgroundColor: colors.purple }]} onPress={() => choose('pdf')}><Text style={s.actionIcon}>↥</Text><Text style={s.actionText}>{loading ? 'Создаём набор…' : 'Загрузить PDF'}</Text><Text style={s.actionHint}>Учебник или лекция</Text></Pressable><Pressable style={[s.action, { backgroundColor: '#E8F7A6' }]} onPress={() => choose('photo')}><Text style={s.actionIcon}>▧</Text><Text style={[s.actionText, { color: colors.ink }]}>{loading ? 'Создаём набор…' : 'Фото конспекта'}</Text><Text style={[s.actionHint, { color: '#5F6840' }]}>Распознаем текст</Text></Pressable></View>
    <Pressable style={s.textButton} onPress={() => router.push('/create')}><Text style={s.textButtonText}>Или вставить текст вручную  →</Text></Pressable>
    <View style={s.row}><Text style={s.section}>Мои наборы</Text><Text style={s.count}>{sets.length} набор</Text></View>
    {sets.map(set => <Pressable key={set.id} style={s.setCard} onPress={() => { setActiveSet(set); router.push('/set'); }}><View style={s.setIcon}><Text>📚</Text></View><View style={{ flex: 1 }}><Text style={s.setTitle}>{set.title}</Text><Text style={s.setMeta}>{set.cards.length} карточки  •  {set.questions.length} вопроса</Text><View style={s.progress}><View style={[s.progressFill, { width: '38%' }]} /></View></View><Text style={s.chevron}>›</Text></Pressable>)}
  </ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.bg }, page: { padding: 20, paddingBottom: 32, width: '100%', maxWidth: 720, alignSelf: 'center' }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16, marginBottom: 25 }, eyebrow: { color: colors.purple, fontWeight: '800', letterSpacing: 1.5, fontSize: 11 }, title: { color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '800', marginTop: 8 }, avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }, avatarText: { fontSize: 20, fontWeight: '800', color: colors.ink }, hero: { backgroundColor: colors.ink, borderRadius: 26, padding: 22, minHeight: 190, flexDirection: 'row', overflow: 'hidden', marginBottom: 28 }, heroLabel: { color: colors.lime, fontWeight: '800', fontSize: 10, letterSpacing: 1.2 }, heroTitle: { color: '#FFF', fontWeight: '800', fontSize: 27, lineHeight: 29, marginTop: 10 }, heroCopy: { color: '#B9B0C7', fontSize: 12, marginTop: 14, maxWidth: 190, lineHeight: 17 }, heroIcon: { color: colors.lime, fontSize: 90, position: 'absolute', right: -8, bottom: -20 }, section: { fontSize: 20, fontWeight: '800', color: colors.ink, marginBottom: 13 }, actions: { flexDirection: 'row', gap: 12 }, action: { flex: 1, minHeight: 134, borderRadius: 20, padding: 16 }, actionIcon: { color: '#FFF', fontSize: 24, fontWeight: '700' }, actionText: { color: '#FFF', fontWeight: '800', fontSize: 14, marginTop: 20 }, actionHint: { color: '#D6CFFF', fontSize: 11, marginTop: 5 }, textButton: { alignItems: 'center', paddingVertical: 18 }, textButtonText: { color: colors.purple, fontWeight: '700', fontSize: 13 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }, count: { color: colors.muted, fontSize: 12 }, setCard: { backgroundColor: colors.card, borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#24153D', shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 }, setIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center' }, setTitle: { fontWeight: '800', color: colors.ink, fontSize: 15 }, setMeta: { color: colors.muted, fontSize: 11, marginTop: 4 }, progress: { height: 5, backgroundColor: '#ECE8F1', borderRadius: 3, marginTop: 11 }, progressFill: { height: 5, backgroundColor: colors.purple, borderRadius: 3 }, chevron: { fontSize: 28, color: colors.muted } });
