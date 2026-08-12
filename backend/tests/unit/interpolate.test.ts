import { describe, it, expect } from '@jest/globals';
import { interpolateString, interpolateConfig } from '../../src/utils/interpolate';

describe('interpolate utils', () => {
  describe('interpolateString', () => {
    it('should interpolate a simple variable from context', () => {
      const context = { user: { name: 'Alice' } };
      const result = interpolateString('Hello, {{user.name}}!', context);
      expect(result).toBe('Hello, Alice!');
    });

    it('should leave template unchanged if path is not found', () => {
      const context = { user: {} };
      const result = interpolateString('Hello, {{user.name}}!', context);
      expect(result).toBe('Hello, {{user.name}}!');
    });

    it('should stringify object values', () => {
      const context = { trigger: { body: { data: [1, 2, 3] } } };
      const result = interpolateString('{{trigger.body.data}}', context);
      expect(result).toBe('[1,2,3]');
    });

    it('should handle undefined or null context gracefully', () => {
      const result = interpolateString('{{value}}', null);
      expect(result).toBe('{{value}}');
    });

    it('should return original value if not a string', () => {
      const result = interpolateString(123 as any, {});
      expect(result).toBe(123);
    });
  });

  describe('interpolateConfig', () => {
    it('should recursively interpolate properties in an object', () => {
      const context = { env: { apiUrl: 'https://api.example.com' } };
      const config = {
        url: '{{env.apiUrl}}/users',
        retry: 3,
        headers: {
          Origin: '{{env.apiUrl}}'
        }
      };

      const result = interpolateConfig(config, context);
      expect(result).toEqual({
        url: 'https://api.example.com/users',
        retry: 3,
        headers: {
          Origin: 'https://api.example.com'
        }
      });
    });

    it('should interpolate arrays inside config', () => {
      const context = { ids: [1, 2] };
      const config = {
        items: ['{{ids}}', 'static']
      };

      const result = interpolateConfig(config, context);
      expect(result).toEqual({
        items: ['[1,2]', 'static']
      });
    });
  });
});
