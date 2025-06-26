import {
  isJsonString,
  buildWidgetUrl,
  fetchWidgetConfig,
  createWootPostMessage,
  getMessage,
  generateScripts,
} from '../utils';

describe('Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
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

  describe('createWootPostMessage', () => {
    it('creates properly formatted post message scripts', () => {
      const testObject = { event: 'test', data: 'value' };
      const script = createWootPostMessage(testObject);
      
      expect(script).toContain('window.postMessage');
      expect(script).toContain('limechat-widget:');
      expect(script).toContain(JSON.stringify(testObject));
    });
  });

  describe('getMessage', () => {
    it('removes the widget prefix from messages', () => {
      const message = 'limechat-widget:{"event":"test"}';
      const result = getMessage(message);
      
      expect(result).toBe('{"event":"test"}');
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

    it('handles missing optional parameters', () => {
      const minimalParams = {
        baseUrl: 'https://app.limechat.ai',
        websiteToken: 'test-token',
      };

      const url = buildWidgetUrl(minimalParams);
      expect(url).toContain('https://app.limechat.ai/widget');
      expect(url).toContain('website_token=test-token');
      expect(url).toContain('locale=en'); // default
      expect(url).toContain('color_scheme=light'); // default
    });
  });

  describe('generateScripts', () => {
    it('generates user data scripts', () => {
      const user = { name: 'John', email: 'john@test.com' };
      const script = generateScripts({ user });
      
      expect(script).toContain('chatwootWebChannel');
      expect(script).toContain('John');
      expect(script).toContain('john@test.com');
    });

    it('handles empty user data', () => {
      const script = generateScripts({});
      expect(script).toBe('');
    });
  });

  describe('fetchWidgetConfig', () => {
    it('fetches widget configuration successfully', async () => {
      const mockConfig = { theme: 'light', icon: 'icon.png' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ config: mockConfig }),
      });

      const result = await fetchWidgetConfig('https://api.test.com', 'token123');
      expect(result).toEqual(mockConfig);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/widget_config?website_token=token123'
      );
    });

    it('returns empty config on fetch error', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      const result = await fetchWidgetConfig('https://api.test.com', 'token123');
      expect(result).toEqual({});
    });

    it('returns empty config on HTTP error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await fetchWidgetConfig('https://api.test.com', 'token123');
      expect(result).toEqual({});
    });
  });
}); 