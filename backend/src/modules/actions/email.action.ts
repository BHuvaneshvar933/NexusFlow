import { Action, ActionResult } from './action.interface';

export class EmailAction implements Action {
  type = 'SEND_EMAIL';

  async execute(payload: any): Promise<ActionResult> {
    console.log(`[EmailAction] Sending email to: ${payload.to}`);
    // In a real application, we would use Nodemailer or SendGrid here
    
    // Simulating async work
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!payload.to) {
      return { success: false, error: 'Recipient email is required' };
    }

    return { 
      success: true, 
      data: { message: `Email successfully sent to ${payload.to}` } 
    };
  }
}
