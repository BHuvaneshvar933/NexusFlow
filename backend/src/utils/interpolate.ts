export function interpolateString(template: string, context: any): string {
  if (typeof template !== 'string') return template;

  return template.replace(/\{\{([\w\.]+)\}\}/g, (match, path) => {
    const keys = path.split('.');
    let value = context;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return match; // If path not found, keep the original {{...}} string
      }
    }

    if (value === undefined || value === null) return '';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  });
}

export function interpolateConfig(config: Record<string, any>, context: any): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      result[key] = interpolateString(value, context);
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        result[key] = value.map(item => 
          typeof item === 'string' ? interpolateString(item, context) : item
        );
      } else {
        result[key] = interpolateConfig(value, context);
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}
