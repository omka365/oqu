import { readFileSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
if (existsSync(new URL('../.env', import.meta.url))) {
  for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import OpenAI from 'openai';
import { StudySetSchema } from '@oqu/contracts';
import { ZodError } from 'zod';

const app = Fastify({ logger: false });
await app.register(cors, { origin: true });
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024, files: 1 } });

app.get('/health', async () => ({ ok: true, service: 'oqu-server' }));

app.post('/api/generate', async (req, reply) => {
  try {
    const parts = req.parts();
    let text = '';
    let sourceName = 'Материал';
    let filePart: { buffer: Buffer; mimetype: string } | undefined;
    let language = 'ru';

    for await (const part of parts) {
      if (part.type === 'file') {
        sourceName = part.filename;
        if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(part.mimetype)) {
          return reply.code(415).send({ error: 'Поддерживаются PDF, JPG, PNG и WEBP' });
        }
        filePart = { buffer: await part.toBuffer(), mimetype: part.mimetype };
      } else if (part.fieldname === 'text') text = String(part.value);
      else if (part.fieldname === 'language') language = String(part.value);
    }

    if (!text.trim() && !filePart) return reply.code(400).send({ error: 'Добавьте материал для подготовки' });
    if (!process.env.OPENAI_API_KEY) return reply.code(503).send({ error: 'ИИ пока не подключён. Добавьте OPENAI_API_KEY на сервер.' });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL || undefined, timeout: 90_000 });
    const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      { type: 'text', text: `Язык результата: ${language}. Создай учебный набор только по переданному материалу.` }
    ];
    if (text.trim()) userContent.push({ type: 'text', text: text.slice(0, 30_000) });
    if (filePart && filePart.mimetype.startsWith('image/')) {
      userContent.push({ type: 'image_url', image_url: { url: `data:${filePart.mimetype};base64,${filePart.buffer.toString('base64')}` } });
    } else if (filePart) {
      userContent.push({ type: 'text', text: `PDF-файл «${sourceName}» загружен. Если в нём нет переданного текста, сообщи, что нужен текстовый слой или вставка текста.` });
    }

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini', response_format: { type: 'json_object' }, temperature: 0.2,
      messages: [
        { role: 'system', content: 'Ты создаёшь учебные материалы. Возвращай JSON: title, summary, cards[{id,question,answer}], questions[{id,question,options[4],correctIndex,explanation}], language. Не выдумывай факты. Нужны 3-12 карточек и 2-8 вопросов.' },
        { role: 'user', content: userContent }
      ]
    });
    const raw = JSON.parse(completion.choices[0]?.message?.content || '{}');
    // IDs belong to the application; models may return numeric or missing IDs.
    const withIds = (items: unknown) => Array.isArray(items)
      ? items.map(item => item && typeof item === 'object' ? { ...item, id: randomUUID() } : item)
      : items;
    return StudySetSchema.parse({ ...raw, cards: withIds(raw.cards), questions: withIds(raw.questions), language, id: randomUUID(), sourceName, createdAt: new Date().toISOString() });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error('Generation API error:', { status: error.status, code: error.code, type: error.type });
      if (error.status === 401 || error.status === 403) return reply.code(502).send({ error: 'ИИ-сервис отклонил API-ключ или доступ к модели. Проверьте настройки сервера.' });
      if (error.status === 429) return reply.code(503).send({ error: 'ИИ-сервис сообщил о лимите запросов или недостаточном балансе. Проверьте баланс и повторите позже.' });
      if (error instanceof OpenAI.APIConnectionError) return reply.code(502).send({ error: 'Сервер не смог связаться с ИИ-сервисом. Проверьте интернет и адрес OPENAI_BASE_URL.' });
      return reply.code(502).send({ error: `ИИ-сервис отклонил запрос${error.status ? ` (код ${error.status})` : ''}. Проверьте модель и поддержку выбранного материала.` });
    }
    if (error instanceof ZodError || error instanceof SyntaxError) {
      console.error('Invalid generation response:', error instanceof ZodError ? error.issues : error.message);
      return reply.code(502).send({ error: 'ИИ вернул ответ в неверном формате. Попробуйте создать набор ещё раз.' });
    }
    console.error('Generation failed:', error instanceof Error ? error.name + ': ' + error.message : 'Unknown error');
    return reply.code(500).send({ error: 'Не удалось создать набор из-за внутренней ошибки сервера. Посмотрите сообщение в окне сервера.' });
  }
});

await app.listen({ port: Number(process.env.PORT || 8787), host: '0.0.0.0' });
console.log('Oqu API: http://localhost:8787');
