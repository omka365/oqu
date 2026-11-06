import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StudySet } from '@oqu/contracts';
import { demoSet } from './data';
const KEY = 'oqu.study-sets';
let sets: StudySet[] = [demoSet];
let activeSet: StudySet = demoSet;
export function getActiveSet() { return activeSet; }
export function setActiveSet(value: StudySet) { activeSet = value; if (!sets.some(item => item.id === value.id)) sets = [value, ...sets]; void AsyncStorage.setItem(KEY, JSON.stringify(sets)); }
export function getSets() { return sets; }
export async function loadSets() { try { const saved = await AsyncStorage.getItem(KEY); if (saved) sets = JSON.parse(saved) as StudySet[]; activeSet = sets[0] || demoSet; } catch { sets = [demoSet]; activeSet = demoSet; } return sets; }
