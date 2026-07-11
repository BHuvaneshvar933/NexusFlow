import { Action, ActionResult } from './action.interface';

export class IteratorAction implements Action {
  type = 'ITERATOR';

  async execute(config: any): Promise<ActionResult> {
    const { arraySource } = config;

    if (!arraySource) {
      return { success: false, error: 'Array Source is required for Iterator' };
    }

    let items: any[] = [];

    if (Array.isArray(arraySource)) {
      items = arraySource;
    } else if (typeof arraySource === 'string') {
      try {
        // Try to parse if it's a JSON stringified array
        const parsed = JSON.parse(arraySource);
        if (Array.isArray(parsed)) {
          items = parsed;
        } else {
          return { success: false, error: `Array Source resolved to a valid JSON but it is not an array. Value: ${arraySource}` };
        }
      } catch (e: any) {
        return { success: false, error: `Array Source failed to parse as JSON. Value: '${arraySource}'. Error: ${e.message}` };
      }
    } else {
      return { success: false, error: `Array Source must resolve to an array. Found type: ${typeof arraySource}` };
    }

    const MAX_ITEMS = 50;
    if (items.length > MAX_ITEMS) {
      console.warn(`Iterator received ${items.length} items. Truncating to max limit of ${MAX_ITEMS}.`);
      items = items.slice(0, MAX_ITEMS);
    }

    return { 
      success: true, 
      data: { 
        items, 
        count: items.length 
      } 
    };
  }
}
