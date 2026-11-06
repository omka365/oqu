import { z } from 'zod';

export const LanguageSchema = z.enum(['ru', 'kk']);
export const CardSchema = z.object({ id: z.string(), question: z.string().min(1), answer: z.string().min(1) });
export const QuestionSchema = z.object({
  id: z.string(), question: z.string().min(1), options: z.array(z.string().min(1)).length(4), correctIndex: z.number().int().min(0).max(3), explanation: z.string().min(1)
});
export const StudySetSchema = z.object({
  id: z.string(), title: z.string().min(1), language: LanguageSchema, sourceName: z.string().min(1), summary: z.string().min(1), cards: z.array(CardSchema), questions: z.array(QuestionSchema), createdAt: z.string()
});
export const GenerateResponseSchema = StudySetSchema;
export type Language = z.infer<typeof LanguageSchema>;
export type StudySet = z.infer<typeof StudySetSchema>;
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;
