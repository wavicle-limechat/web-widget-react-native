import {
  buildWidgetUrl,
  fetchWidgetConfig,
  createWootPostMessage,
  generateScripts,
  shouldOpenExternally,
} from '../utils';
import { WidgetError } from '../utils/errorUtils';
import { WOOT_PREFIX, POST_MESSAGE_EVENTS } from '../constants';

describe('Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('createWootPostMessage', () => {
    it('creates properly formatted post message scripts', () => {
      const object = { event: 'test', data: 'value' };
      const result = createWootPostMessage(object);
      const expected = `window.postMessage('${WOOT_PREFIX}' + JSON.stringify(${JSON.stringify(object)}), '*');`;
      expect(result).toBe(expected);
    });

    it('survives apostrophes, backslashes and newlines', () => {
      const object = { name: "O'Brien", path: 'a\\b', text: 'l1\nl2' };
      const script = createWootPostMessage(object);
      const posted = [];
      // eslint-disable-next-line no-new-func
      new Function('window', script)({ postMessage: (msg) => posted.push(msg) });
      expect(posted).toHaveLength(1);
      expect(JSON.parse(posted[0].replace(WOOT_PREFIX, ''))).toEqual(object);
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

    it('the url has platform react-native after website_token', () => {
      const url = buildWidgetUrl(validParams);
      expect(url).toContain('website_token=test-token&platform=react-native&locale=en');
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

    it('adds hide_file_picker only when hideFilePicker is true', () => {
      const base = { baseUrl: 'https://app.limechat.ai', websiteToken: 'test-token' };
      expect(buildWidgetUrl({ ...base, hideFilePicker: true })).toContain('hide_file_picker=true');
      expect(buildWidgetUrl(base)).not.toContain('hide_file_picker');
      expect(buildWidgetUrl({ ...base, hideFilePicker: false })).not.toContain('hide_file_picker');
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

  describe('shouldOpenExternally', () => {
    const base = 'https://app.limechat.ai';
    const nav = (url, isTopFrame = true) => ({ url, isTopFrame });

    it('keeps same-origin urls in the webview', () => {
      expect(shouldOpenExternally(nav(`${base}/widget?a=1`), base)).toBe(false);
      expect(shouldOpenExternally(nav(base), base)).toBe(false);
    });

    it('opens other hosts externally', () => {
      expect(shouldOpenExternally(nav('https://example.com/x'), base)).toBe(true);
      expect(shouldOpenExternally(nav('https://app.limechat.ai.evil.com'), base)).toBe(true);
    });

    it('treats upper case host and an explicit default port as same origin', () => {
      expect(shouldOpenExternally(nav('https://APP.LimeChat.ai/widget'), base)).toBe(false);
      expect(shouldOpenExternally(nav('https://app.limechat.ai:443/widget'), base)).toBe(false);
      expect(shouldOpenExternally(nav('HTTPS://app.limechat.ai/widget'), base)).toBe(false);
    });

    it('keeps a query with no path inside the webview', () => {
      expect(shouldOpenExternally(nav(`${base}?a=1`), base)).toBe(false);
      expect(shouldOpenExternally(nav(`${base}#top`), base)).toBe(false);
    });

    it('opens userinfo, other ports, other schemes and mailto externally', () => {
      expect(shouldOpenExternally(nav('https://app.limechat.ai@evil.com/x'), base)).toBe(true);
      expect(shouldOpenExternally(nav('https://app.limechat.ai:8443/x'), base)).toBe(true);
      expect(shouldOpenExternally(nav('http://app.limechat.ai/x'), base)).toBe(true);
      expect(shouldOpenExternally(nav('mailto:a@b.com'), base)).toBe(true);
    });

    it('reads ipv6 hosts and backslashes the way a browser does', () => {
      expect(shouldOpenExternally(nav('http://[::2]:9999/x'), 'http://[::1]:9999')).toBe(true);
      expect(shouldOpenExternally(nav('http://[::1]:9999/x'), 'http://[::1]:9999')).toBe(false);
      expect(shouldOpenExternally(nav('https://evil.com\\@app.limechat.ai/x'), base)).toBe(true);
    });

    it('ignores subframes and internal schemes', () => {
      expect(shouldOpenExternally(nav('https://example.com/x', false), base)).toBe(false);
      expect(shouldOpenExternally(nav('about:blank'), base)).toBe(false);
      expect(shouldOpenExternally(nav('blob:https://app.limechat.ai/1'), base)).toBe(false);
    });
  });

  describe('generateScripts', () => {
    it('generates rnUser without set-user when identifier is missing', () => {
      const scripts = generateScripts({
        user: { name: 'John Doe', email: 'john@example.com', identifier_hash: 'hash-1' },
      });
      expect(scripts).toContain('rnUser');
      expect(scripts).toContain('john@example.com');
      expect(scripts).not.toContain(POST_MESSAGE_EVENTS.SET_USER);
      expect(scripts).not.toContain('set-locale');
    });

    it('generates set-user when identifier and hash are both present', () => {
      const scripts = generateScripts({
        user: { name: 'John Doe', identifier: 'id-1', identifier_hash: 'hash-1' },
      });
      expect(scripts).toContain(POST_MESSAGE_EVENTS.SET_USER);
      expect(scripts).toContain('"identifier":"id-1"');
      expect(scripts).toContain('chatwoot-widget:');
    });

    it('does not generate set-user for a hash without identifier', () => {
      const scripts = generateScripts({ user: { identifier_hash: 'hash-1' } });
      expect(scripts).not.toContain(POST_MESSAGE_EVENTS.SET_USER);
    });

    const rnUserOf = (scripts) => {
      const win = {};
      // eslint-disable-next-line no-new-func
      new Function('window', 'document', scripts)(win, { readyState: 'loading' });
      return win.chatwootWebChannel.rnUser;
    };

    it('rnUser carries custom_attributes when set', () => {
      const scripts = generateScripts({
        user: { name: 'John', custom_attributes: { plan: 'gold', n: 2 } },
      });
      expect(rnUserOf(scripts).custom_attributes).toEqual({ plan: 'gold', n: 2 });
    });

    it('rnUser has no custom_attributes key when unset', () => {
      const scripts = generateScripts({ user: { name: 'John' } });
      expect(rnUserOf(scripts)).toEqual({ name: 'John', email: '', phone_number: '' });
    });

    it('set-user script posts once when injected twice', () => {
      const scripts = generateScripts({
        user: { name: 'John Doe', identifier: 'id-1', identifier_hash: 'hash-1' },
      });
      const win = { postMessage: jest.fn() };
      const doc = { readyState: 'complete' };
      // eslint-disable-next-line no-new-func
      const run = new Function('window', 'document', scripts);
      run(win, doc);
      run(win, doc);
      expect(win.postMessage).toHaveBeenCalledTimes(1);
      expect(win.postMessage.mock.calls[0][0]).toContain('set-user');
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