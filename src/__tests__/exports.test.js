// react-native-modal pulls an untranspiled dependency that jest does not transform
jest.mock('react-native-modal', () => 'Modal');
jest.mock('react-native-webview', () => ({ WebView: 'WebView' }));

describe('package exports', () => {
  it('exposes everything index.d.ts declares', () => {
    const api = require('../../index');
    [
      'LimeChatWidget',
      'default',
      'buildWidgetUrl',
      'generateScripts',
      'POST_MESSAGE_EVENTS',
      'WIDGET_CONFIG',
      'ERROR_CODES',
      'ERROR_TYPES',
      'ERROR_SEVERITY',
      'WidgetError',
      'safeJsonParse',
      'reportError',
    ].forEach((name) => {
      expect(api[name]).toBeDefined();
    });
  });
});
