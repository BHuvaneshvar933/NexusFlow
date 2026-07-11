import { Action } from './action.interface';
import { EmailAction } from './email.action';
import { AIAction } from './ai.action';
import { DatabaseAction } from './database.action';
import { HttpAction } from './http.action';
import { CustomCodeAction } from './code.action';
import { ConditionAction } from './condition.action';
import { IteratorAction } from './iterator.action';

export class ActionFactory {
  static create(type: string): Action {
    switch (type) {
      case 'SEND_EMAIL':
        return new EmailAction();
      case 'AI_ANALYZE':
        return new AIAction();
      case 'SAVE_TO_DB':
        return new DatabaseAction();
      case 'HTTP_REQUEST':
        return new HttpAction();
      case 'CUSTOM_CODE':
        return new CustomCodeAction();
      case 'CONDITION':
        return new ConditionAction();
      case 'ITERATOR':
        return new IteratorAction();
      default:
        throw new Error(`Unsupported action type: ${type}`);
    }
  }
}
