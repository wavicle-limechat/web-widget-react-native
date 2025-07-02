import { 
  WidgetError, 
  safeJsonParse, 
  reportError, 
  validators,
  safeOpenURL 
} from '../utils/errorUtils';
import { ERROR_CODES, ERROR_TYPES, ERROR_SEVERITY } from '../constants';

// Suppress console errors and warnings during tests
// eslint-disable-next-line no-console
const originalError = console.error;
// eslint-disable-next-line no-console
const originalWarn = console.warn;

beforeAll(() => {
  // eslint-disable-next-line no-console
  console.error = jest.fn();
  // eslint-disable-next-line no-console
  console.warn = jest.fn();
});

afterAll(() => {
  // eslint-disable-next-line no-console
  console.error = originalError;
  // eslint-disable-next-line no-console
  console.warn = originalWarn;
});

describe('ErrorUtils', () => {
  describe('WidgetError', () => {
    it('should create a WidgetError with correct properties', () => {
      const error = new WidgetError(
        ERROR_CODES.CONFIG_ERROR,
        'Test error message',
        new Error('Original error'),
        { testContext: 'value' }
      );

      expect(error.name).toBe('WidgetError');
      expect(error.code).toBe(ERROR_CODES.CONFIG_ERROR);
      expect(error.message).toBe('Test error message');
      expect(error.type).toBe(ERROR_TYPES.CONFIGURATION);
      expect(error.severity).toBe(ERROR_SEVERITY.CRITICAL);
      expect(error.context).toEqual({ testContext: 'value' });
      expect(error.originalError).toBeInstanceOf(Error);
      expect(error.timestamp).toBeDefined();
    });

    it('should serialize to JSON correctly', () => {
      const error = new WidgetError(
        ERROR_CODES.WEBVIEW_ERROR,
        'WebView failed'
      );

      const json = error.toJSON();
      expect(json.name).toBe('WidgetError');
      expect(json.code).toBe(ERROR_CODES.WEBVIEW_ERROR);
      expect(json.message).toBe('WebView failed');
      expect(json.type).toBe(ERROR_TYPES.WEBVIEW);
      expect(json.severity).toBe(ERROR_SEVERITY.HIGH);
    });

    it('should determine error type correctly', () => {
      const configError = new WidgetError(ERROR_CODES.CONFIG_ERROR, 'Config error');
      expect(configError.type).toBe(ERROR_TYPES.CONFIGURATION);

      const webviewError = new WidgetError(ERROR_CODES.WEBVIEW_ERROR, 'WebView error');
      expect(webviewError.type).toBe(ERROR_TYPES.WEBVIEW);

      const networkError = new WidgetError(ERROR_CODES.NETWORK_ERROR, 'Network error');
      expect(networkError.type).toBe(ERROR_TYPES.NETWORK);
    });

    it('should determine error severity correctly', () => {
      const criticalError = new WidgetError(ERROR_CODES.CONFIG_ERROR, 'Critical');
      expect(criticalError.severity).toBe(ERROR_SEVERITY.CRITICAL);

      const highError = new WidgetError(ERROR_CODES.WEBVIEW_ERROR, 'High');
      expect(highError.severity).toBe(ERROR_SEVERITY.HIGH);

      const mediumError = new WidgetError(ERROR_CODES.COMPONENT_ERROR, 'Medium');
      expect(mediumError.severity).toBe(ERROR_SEVERITY.MEDIUM);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"test": "value"}');
      expect(result).toEqual({ test: 'value' });
    });

    it('should return fallback for invalid JSON', () => {
      const result = safeJsonParse('invalid json', { default: 'value' });
      expect(result).toEqual({ default: 'value' });
    });

    it('should return null for invalid JSON without fallback', () => {
      const result = safeJsonParse('invalid json');
      expect(result).toBeNull();
    });
  });

  describe('reportError', () => {
    it('should call onError callback with WidgetError', () => {
      const onError = jest.fn();
      const error = new WidgetError(ERROR_CODES.UNKNOWN_ERROR, 'Test error');

      reportError(error, onError);

      expect(onError).toHaveBeenCalledWith(error, error.toJSON());
    });

    it('should convert regular Error to WidgetError', () => {
      const onError = jest.fn();
      const error = new Error('Regular error');

      reportError(error, onError);

      expect(onError).toHaveBeenCalledWith(
        expect.any(WidgetError),
        expect.objectContaining({
          code: ERROR_CODES.UNKNOWN_ERROR,
          message: 'Regular error'
        })
      );
    });

    it('should not throw if onError is not provided', () => {
      const error = new Error('Test error');
      expect(() => reportError(error, null)).not.toThrow();
    });

    it('should handle errors in onError callback', () => {
      const onError = jest.fn(() => {
        throw new Error('Callback error');
      });
      const error = new Error('Test error');

      expect(() => reportError(error, onError)).not.toThrow();
    });
  });

  describe('validators', () => {
    describe('websiteToken', () => {
      it('should not throw for valid website token', () => {
        expect(() => validators.websiteToken('valid-token')).not.toThrow();
      });

      it('should throw for missing website token', () => {
        expect(() => validators.websiteToken('')).toThrow(WidgetError);
        expect(() => validators.websiteToken(null)).toThrow(WidgetError);
        expect(() => validators.websiteToken(undefined)).toThrow(WidgetError);
      });

      it('should throw for non-string website token', () => {
        expect(() => validators.websiteToken(123)).toThrow(WidgetError);
        expect(() => validators.websiteToken({})).toThrow(WidgetError);
      });
    });

    describe('user', () => {
      it('should not throw for valid user object', () => {
        expect(() => validators.user({ name: 'John' })).not.toThrow();
        expect(() => validators.user({})).not.toThrow();
        expect(() => validators.user(null)).not.toThrow();
        expect(() => validators.user(undefined)).not.toThrow();
      });

      it('should throw for invalid user data', () => {
        expect(() => validators.user('string')).toThrow(WidgetError);
        expect(() => validators.user(123)).toThrow(WidgetError);
      });
    });

    describe('customAttributes', () => {
      it('should not throw for valid custom attributes', () => {
        expect(() => validators.customAttributes({ key: 'value' })).not.toThrow();
        expect(() => validators.customAttributes({})).not.toThrow();
        expect(() => validators.customAttributes(null)).not.toThrow();
        expect(() => validators.customAttributes(undefined)).not.toThrow();
      });

      it('should throw for invalid custom attributes', () => {
        expect(() => validators.customAttributes('string')).toThrow(WidgetError);
        expect(() => validators.customAttributes(123)).toThrow(WidgetError);
      });
    });
  });

  describe('safeOpenURL', () => {
    // Mock react-native Linking
    jest.mock('react-native', () => ({
      Linking: {
        canOpenURL: jest.fn(),
        openURL: jest.fn(),
      },
    }));

    it('should open valid URL', async () => {
      const { Linking } = require('react-native');
      Linking.canOpenURL.mockResolvedValue(true);
      Linking.openURL.mockResolvedValue(true);

      await expect(safeOpenURL('https://example.com')).resolves.not.toThrow();
      expect(Linking.canOpenURL).toHaveBeenCalledWith('https://example.com');
      expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
    });

    it('should throw WidgetError for unsupported URL', async () => {
      const { Linking } = require('react-native');
      Linking.canOpenURL.mockResolvedValue(false);

      await expect(safeOpenURL('invalid://url')).rejects.toThrow(WidgetError);
    });

    it('should throw WidgetError when openURL fails', async () => {
      const { Linking } = require('react-native');
      Linking.canOpenURL.mockResolvedValue(true);
      Linking.openURL.mockRejectedValue(new Error('Failed to open'));

      await expect(safeOpenURL('https://example.com')).rejects.toThrow(WidgetError);
    });
  });
}); 