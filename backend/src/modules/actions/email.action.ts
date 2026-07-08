import { Action, ActionResult } from './action.interface';
import { Resend } from 'resend';

export class EmailAction implements Action {
  type = 'SEND_EMAIL';

  async execute(payload: any): Promise<ActionResult> {
    const { to, subject, body } = payload;
    
    if (!to || !subject || !body) {
      return { success: false, error: 'Recipient email (to), subject, and body are required' };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'RESEND_API_KEY is not configured in environment variables' };
    }

    try {
      console.log(`[EmailAction] Sending email via Resend to: ${to}`);
      
      const resend = new Resend(apiKey);
      
      const { data, error } = await resend.emails.send({
        from: 'NexusFlow <onboarding@resend.dev>', // Resend's free tier default sandbox sender
        to,
        subject,
        html: body
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: { 
          message: `Email successfully sent to ${to}`,
          id: data?.id
        } 
      };
    } catch (error: any) {
      console.error('[EmailAction] Error:', error);
      return { success: false, error: error.message || 'Error sending email' };
    }
  }
}
