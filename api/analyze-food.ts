import { GoogleGenAI } from '@google/genai';

const FOOD_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    emoji: { type: 'string' },
    servingGrams: { type: 'number' },
    unit: { type: 'string' },
    calories: { type: 'number' },
    carbs: { type: 'number' },
    protein: { type: 'number' },
    fat: { type: 'number' },
    cholesterolMg: { type: 'number' },
    sodiumMg: { type: 'number' },
    calciumMg: { type: 'number' },
    ironMg: { type: 'number' },
    potassiumMg: { type: 'number' },
    confidenceNote: { type: 'string' },
    itemsDetected: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: [
    'name',
    'emoji',
    'servingGrams',
    'unit',
    'calories',
    'carbs',
    'protein',
    'fat',
    'cholesterolMg',
    'sodiumMg',
    'calciumMg',
    'ironMg',
    'potassiumMg',
    'confidenceNote',
    'itemsDetected',
  ],
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    '';

  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const {
      promptText,
      base64Image,
      mimeType = 'image/jpeg',
      model = 'gemini-3.5-flash-lite',
      languageName = 'English',
    } = req.body || {};

    // Use v1beta so inline image blocks are supported in Interactions API
    const client = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

    const inputParts: any[] = [
      {
        type: 'text',
        text: `You are Nutrio AI, an expert clinical nutritionist and food recognition system. Analyze the provided food ${
          base64Image ? 'image' : 'description'
        }${
          promptText ? ` ("${promptText}")` : ''
        } and return accurate calorie, macronutrient (carbs, protein, fat), and micronutrient estimates in JSON format. Write the food name, unit, confidenceNote, and itemsDetected in ${languageName}.`,
      },
    ];

    if (base64Image) {
      const cleanedBase64 = base64Image.includes(',')
        ? base64Image.split(',')[1]
        : base64Image;
      inputParts.push({
        type: 'image',
        data: cleanedBase64,
        mime_type: mimeType,
        resolution: 'medium',
      });
    }

    const interaction = await client.interactions.create({
      model,
      store: false,
      input: inputParts,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: FOOD_SCHEMA,
      },
    });

    const parsed = JSON.parse(interaction.output_text || '{}');
    return res.status(200).json({ ...parsed, modelUsed: model });
  } catch (err: any) {
    return res.status(err?.status || 500).json({
      error: err?.message || 'Gemini API request failed',
    });
  }
}
