import {
  isJsonString,
  isValidUrl,
  sanitizeInput,
  isValidWebsiteToken,
  buildWidgetUrl,
  fetchWidgetConfig,
  cacheUtils,
  retryWithBackoff,
  sleep,
  __setTestDependencies,
} from '../utils';
import { ERROR_MESSAGES } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    isWifiEnabled: true,
  })),
  addEventListener: jest.fn(() => jest.fn()),
  useNetInfo: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    isWifiEnabled: true,
  })),
}));

describe('Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    
    // Inject mocked dependencies into utils
    __setTestDependencies({
      AsyncStorage,
      NetInfo,
    });
  });

  describe('isJsonString', () => {
    it('returns true for valid JSON strings', () => {
      expect(isJsonString('{"key": "value"}')).toBe(true);
      expect(isJsonString('[]')).toBe(true);
      expect(isJsonString('"string"')).toBe(true);
      expect(isJsonString('123')).toBe(true);
    });

    it('returns false for invalid JSON strings', () => {
      expect(isJsonString('invalid json')).toBe(false);
      expect(isJsonString('{"key": value}')).toBe(false);
      expect(isJsonString('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('returns true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://app.limechat.ai/widget')).toBe(true);
    });

    it('returns false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('removes potentially dangerous characters', () => {
      expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
    });

    it('preserves safe content', () => {
      expect(sanitizeInput('John Doe')).toBe('John Doe');
      expect(sanitizeInput('user@example.com')).toBe('user@example.com');
      expect(sanitizeInput('  spaced content  ')).toBe('spaced content');
    });

    it('handles non-string inputs', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
  });

  describe('isValidWebsiteToken', () => {
    it('returns true for valid tokens', () => {
      expect(isValidWebsiteToken('valid-token-123')).toBe(true);
      expect(isValidWebsiteToken('abc123')).toBe(true);
    });

    it('returns false for invalid tokens', () => {
      expect(isValidWebsiteToken('')).toBe(false);
      expect(isValidWebsiteToken('<script>')).toBe(false);
      expect(isValidWebsiteToken('token"with"quotes')).toBe(false);
      expect(isValidWebsiteToken(null)).toBe(false);
      expect(isValidWebsiteToken(123)).toBe(false);
    });
  });

  describe('buildWidgetUrl', () => {
    const validParams = {
      baseUrl: 'https://app.limechat.ai',
      websiteToken: 'test-token',
      locale: 'en',
      colorScheme: 'light',
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        phone_number: '+1234567890',
        identifier_hash: 'user123',
      },
      customAttributes: {
        source: 'mobile',
        plan: 'premium',
      },
    };

    it('builds valid URLs with all parameters', () => {
      const url = buildWidgetUrl(validParams);
      expect(url).toContain('https://app.limechat.ai/widget');
      expect(url).toContain('website_token=test-token');
      expect(url).toContain('locale=en');
      expect(url).toContain('color_scheme=light');
      expect(url).toContain('user_name=John');
      expect(url).toContain('user_email=john%40example.com');
    });

    it('throws error for invalid base URL', () => {
      expect(() => {
        buildWidgetUrl({ ...validParams, baseUrl: 'invalid-url' });
      }).toThrow(ERROR_MESSAGES.INVALID_URL);
    });

    it('throws error for invalid website token', () => {
      expect(() => {
        buildWidgetUrl({ ...validParams, websiteToken: '<script>' });
      }).toThrow(ERROR_MESSAGES.INVALID_TOKEN);
    });

    it('sanitizes user input', () => {
      const maliciousParams = {
        ...validParams,
        user: {
          name: '<script>alert(1)</script>',
          email: 'javascript:alert(1)',
        },
      };

      const url = buildWidgetUrl(maliciousParams);
      expect(url).not.toContain('<script>');
      expect(url).not.toContain('javascript:');
    });
  });

  describe('cacheUtils', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      AsyncStorage.getItem.mockClear();
      AsyncStorage.setItem.mockClear();
      AsyncStorage.removeItem.mockClear();
    });

    describe('get', () => {
      it('retrieves and parses cached data', async () => {
        const testData = { test: 'data' };
        const cacheItem = {
          data: testData,
          timestamp: Date.now(),
          ttl: 60000
        };
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cacheItem));

        const result = await cacheUtils.get('test-key');
        expect(result).toEqual(testData);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('test-key');
      });

      it('returns null for non-existent keys', async () => {
        AsyncStorage.getItem.mockResolvedValue(null);

        const result = await cacheUtils.get('non-existent');
        expect(result).toBe(null);
      });

      it('handles invalid JSON gracefully', async () => {
        AsyncStorage.getItem.mockResolvedValue('invalid json');

        const result = await cacheUtils.get('invalid-key');
        expect(result).toBe(null);
      });
    });

    describe('set', () => {
      it('stores data with timestamp', async () => {
        const testData = { test: 'data' };
        const ttl = 60000;

        await cacheUtils.set('test-key', testData, ttl);

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'test-key',
          expect.stringContaining('"data":{"test":"data"}')
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'test-key',
          expect.stringContaining('"timestamp":')
        );
      });

      it('handles storage errors gracefully', async () => {
        AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

        // Should not throw
        await expect(cacheUtils.set('test-key', {})).resolves.toBeUndefined();
      });
    });

    describe('isExpired', () => {
      it('returns false for non-expired items', async () => {
        const recentItem = {
          data: { test: 'data' },
          timestamp: Date.now(),
          ttl: 60000,
        };
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(recentItem));

        const result = await cacheUtils.isExpired('test-key');
        expect(result).toBe(false);
      });

      it('returns true for expired items', async () => {
        const expiredItem = {
          data: { test: 'data' },
          timestamp: Date.now() - 120000, // 2 minutes ago
          ttl: 60000, // 1 minute TTL
        };
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(expiredItem));

        const result = await cacheUtils.isExpired('test-key');
        expect(result).toBe(true);
      });
    });
  });

  describe('sleep', () => {
    it('resolves after specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some variance
    });
  });

  describe('retryWithBackoff', () => {
    it('succeeds on first try', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await retryWithBackoff(mockFn, 3);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and eventually succeeds', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const result = await retryWithBackoff(mockFn, 3);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('throws after max retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      
      await expect(retryWithBackoff(mockFn, 2)).rejects.toThrow('Persistent failure');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetchWidgetConfig', () => {
    beforeEach(() => {
      NetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });
    });

    it('fetches and caches widget config successfully', async () => {
      const mockConfig = { widgetIcon: 'icon.png' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ config: mockConfig }),
      });

      const result = await fetchWidgetConfig('https://app.limechat.ai', 'test-token');
      
      expect(result).toEqual(mockConfig);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://app.limechat.ai/widget_config?website_token=test-token',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('throws error for invalid base URL', async () => {
      await expect(
        fetchWidgetConfig('invalid-url', 'test-token')
      ).rejects.toThrow(ERROR_MESSAGES.INVALID_URL);
    });

    it('throws error for invalid website token', async () => {
      await expect(
        fetchWidgetConfig('https://app.limechat.ai', '<script>')
      ).rejects.toThrow(ERROR_MESSAGES.INVALID_TOKEN);
    });

    it('handles network errors with cached fallback', async () => {
      // Setup cache
      const cachedConfig = { widgetIcon: 'cached-icon.png' };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        data: cachedConfig,
        timestamp: Date.now(),
        ttl: null,
      }));

      // Setup network failure
      global.fetch.mockRejectedValue(new Error('Network error'));
      NetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const result = await fetchWidgetConfig('https://app.limechat.ai', 'test-token');
      expect(result).toEqual(cachedConfig);
    });

    it('throws network error when offline with no cache', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      global.fetch.mockRejectedValue(new Error('Network error'));
      NetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      await expect(
        fetchWidgetConfig('https://app.limechat.ai', 'test-token')
      ).rejects.toThrow(ERROR_MESSAGES.NETWORK_ERROR);
    });
  });
}); 