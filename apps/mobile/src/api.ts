import { GenerateResponseSchema, type Language, type StudySet } from '@oqu/contracts';
import Constants from 'expo-constants';

const developmentHost = Constants.expoConfig?.hostUri?.split(':')[0];
export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${developmentHost || 'localhost'}:8787`;

export async function generateStudySet(input: { text?: string; file?: { uri: string; name: string; type: string }; language?: Language }): Promise<StudySet> {
  const form = new FormData();
  if (input.text) form.append('text', input.text);
  form.append('language', input.language || 'ru');
  if (input.file) form.append('file', { uri: input.file.uri, name: input.file.name, type: input.file.type } as any);
  const response = await fetch(`${API_URL}/api/generate`, { method: 'POST', body: form });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Не удалось подключиться к серверу');
  return GenerateResponseSchema.parse(body);
}
