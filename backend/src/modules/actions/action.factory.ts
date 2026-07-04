import { Action } from './action.interface';
import { EmailAction } from './email.action';
import { AIAction } from './ai.action';
import { DatabaseAction } from './database.action';

export class ActionFactory {
  static create(type: string): Action {
    switch (type) {
      case 'SEND_EMAIL':
        return new EmailAction();
      case 'AI_ANALYZE':
        return new AIAction();
      case 'SAVE_TO_DB':
        return new DatabaseAction();
      default:
        throw new Error(`Unsupported action type: ${type}`);
    }
  }
}
