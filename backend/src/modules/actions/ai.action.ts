import { Action, ActionResult } from './action.interface';
import Groq from 'groq-sdk';

export class AIAction implements Action {
  type = 'AI_ANALYZE';

  async execute(payload: any): Promise<ActionResult> {
    const { prompt } = payload;
    
    if (!prompt) {
      return { success: false, error: 'Prompt is required for AI analysis' };
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'GROQ_API_KEY is not configured in environment variables' };
    }

    try {
      console.log(`[AIAction] Analyzing with prompt using Groq: ${prompt.substring(0, 50)}...`);
      
      const groq = new Groq({ apiKey });
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful workflow automation assistant that returns concise, accurate results without conversational filler.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
      });

      const aiResult = chatCompletion.choices[0]?.message?.content || '';

      return { 
        success: true, 
        data: { 
          result: aiResult
        } 
      };
    } catch (error: any) {
      console.error('[AIAction] Error:', error);
      return { success: false, error: error.message };
    }
  }
}
