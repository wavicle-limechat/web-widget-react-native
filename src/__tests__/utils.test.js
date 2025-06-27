import {
  isJsonString,
  buildWidgetUrl,
  fetchWidgetConfig,
  createWootPostMessage,
  getMessage,
  generateScripts,
} from '../utils';
import { WidgetError } from '../utils/errorUtils';
import { WOOT_PREFIX, POST_MESSAGE_EVENTS } from '../constants';

describe('Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('isJsonString', () => {
    it('returns true for valid JSON strings', () => {
      expect(isJsonString('{"key": "value"}')).toBe(true);
      expect(isJsonString('[]')).toBe(true);
      expect(isJsonString('null')).toBe(true);
      expect(isJsonString('"string"')).toBe(true);
    });

    it('returns false for invalid JSON strings', () => {
      expect(isJsonString('invalid json')).toBe(false);
      expect(isJsonString('{key: value}')).toBe(false);
      expect(isJsonString('')).toBe(false);
    });
  });

  describe('createWootPostMessage', () => {
    it('creates properly formatted post message scripts', () => {
      const object = { event: 'test', data: 'value' };
      const result = createWootPostMessage(object);
      const expected = `window.postMessage('${WOOT_PREFIX}${JSON.stringify(object)}');`;
      expect(result).toBe(expected);
    });
  });

  describe('getMessage', () => {
    it('removes the widget prefix from messages', () => {
      const message = 'test message';
      const data = `${WOOT_PREFIX}${message}`;
      expect(getMessage(data)).toBe(message);
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
      expect(url).toContain('https://app.limechat.ai/widget?');
      expect(url).toContain('website_token=test-token');
      expect(url).toContain('locale=en');
      expect(url).toContain('color_scheme=light');
      expect(url).toContain('custom_attributes=');
      // cw_conversation is not included in validParams, so it shouldn't be in the URL
      expect(url).not.toContain('cw_conversation');
    });

    it('handles missing optional parameters', () => {
      const minimalParams = {
        baseUrl: 'https://app.limechat.ai',
        websiteToken: 'test-token',
      };

      const url = buildWidgetUrl(minimalParams);
      expect(url).toContain('https://app.limechat.ai/widget?');
      expect(url).toContain('website_token=test-token');
      expect(url).toContain('locale=en'); // default
      expect(url).toContain('color_scheme=light'); // default
      expect(url).not.toContain('custom_attributes');
      expect(url).not.toContain('cw_conversation');
    });

    it('includes cw_conversation when provided', () => {
      const paramsWithConversation = {
        ...validParams,
        cwConversation: 'eyJhbGciOiJIUzI1NiJ9.eyJzb3VyY2VfaWQiOiJjMDUyNWE0Ni1jZTRjLTRhZGMtOWUxNi1iMTI2ZmEyNjQ1ZTIiLCJpbmJveF9pZCI6MzQxODh9.MMNCTPInQRkpKYEMCRyssB1U9z_rOQZt_pzXjXAT1uo',
      };

      const url = buildWidgetUrl(paramsWithConversation);
      expect(url).toContain('cw_conversation=eyJhbGciOiJIUzI1NiJ9.eyJzb3VyY2VfaWQiOiJjMDUyNWE0Ni1jZTRjLTRhZGMtOWUxNi1iMTI2ZmEyNjQ1ZTIiLCJpbmJveF9pZCI6MzQxODh9.MMNCTPInQRkpKYEMCRyssB1U9z_rOQZt_pzXjXAT1uo');
    });

    it('properly encodes special characters in parameters', () => {
      const paramsWithSpecialChars = {
        baseUrl: 'https://app.limechat.ai',
        websiteToken: 'test-token',
        customAttributes: { 
          key: 'value with spaces & symbols!',
          unicode: 'café résumé 中文' 
        }
      };

      const url = buildWidgetUrl(paramsWithSpecialChars);
      expect(url).toContain('custom_attributes=');
      // Should be properly URL encoded
      expect(decodeURIComponent(url)).toContain('value with spaces & symbols!');
      expect(decodeURIComponent(url)).toContain('café résumé 中文');
    });

    it('handles empty custom attributes object', () => {
      const paramsWithEmptyAttributes = {
        baseUrl: 'https://app.limechat.ai',
        websiteToken: 'test-token',
        customAttributes: {}
      };

      const url = buildWidgetUrl(paramsWithEmptyAttributes);
      expect(url).not.toContain('custom_attributes');
    });

    it('handles null and undefined values in parameters', () => {
      const paramsWithNullValues = {
        baseUrl: 'https://app.limechat.ai',
        websiteToken: 'test-token',
        locale: null,
        colorScheme: undefined,
        customAttributes: null,
        cwConversation: undefined
      };

      const url = buildWidgetUrl(paramsWithNullValues);
      expect(url).toContain('website_token=test-token');
      expect(url).toContain('locale=en'); // should use default
      expect(url).toContain('color_scheme=light'); // should use default
      expect(url).not.toContain('custom_attributes');
      expect(url).not.toContain('cw_conversation');
    });
  });

  describe('generateScripts', () => {
    it('generates user data scripts', () => {
      const userData = {
        user: { name: 'John Doe', email: 'john@example.com' },
        locale: 'en',
        colorScheme: 'dark',
        customAttributes: { plan: 'premium' }
      };

      const scripts = generateScripts(userData);
      expect(scripts).toContain(POST_MESSAGE_EVENTS.SET_USER);
      expect(scripts).toContain(POST_MESSAGE_EVENTS.SET_LOCALE);
      expect(scripts).toContain(POST_MESSAGE_EVENTS.SET_COLOR_SCHEME);
      expect(scripts).toContain(POST_MESSAGE_EVENTS.SET_CUSTOM_ATTRIBUTES);
      expect(scripts).toContain('john@example.com');
    });

    it('handles empty user data', () => {
      const scripts = generateScripts({});
      expect(scripts).toBe('');
    });
  });

  describe('fetchWidgetConfig', () => {
    it('fetches widget configuration successfully', async () => {
      const mockConfig = { color: '#000000', position: 'right' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ config: mockConfig }),
      });

      const result = await fetchWidgetConfig('https://app.limechat.ai', 'test-token');
      expect(result).toEqual(mockConfig);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://app.limechat.ai/widget_config?website_token=test-token'
      );
    });

    it('throws WidgetError on fetch error', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(fetchWidgetConfig('https://app.limechat.ai', 'test-token')).rejects.toThrow(WidgetError);
      await expect(fetchWidgetConfig('https://app.limechat.ai', 'test-token')).rejects.toThrow('Network error while fetching widget config');
    });

    it('throws WidgetError on HTTP error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(fetchWidgetConfig('https://app.limechat.ai', 'test-token')).rejects.toThrow(WidgetError);
      await expect(fetchWidgetConfig('https://app.limechat.ai', 'test-token')).rejects.toThrow('Failed to fetch widget config: HTTP 500');
    });
  });
}); 