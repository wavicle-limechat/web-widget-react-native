import React from 'react';
import { render } from '@testing-library/react-native';

let mockLastProps;
jest.mock('react-native-webview', () => ({
  WebView: (props) => {
    mockLastProps = props;
    return null;
  },
}));

const WebViewComponent = require('../components/WebViewComponent').default;

describe('WebViewComponent', () => {
  it('keeps the url stable when the conversation token arrives', () => {
    const props = { baseUrl: 'https://app.limechat.ai', websiteToken: 'tok' };
    const { rerender } = render(<WebViewComponent {...props} />);
    const firstUri = mockLastProps.source.uri;
    expect(firstUri).not.toContain('cw_conversation');

    rerender(<WebViewComponent {...props} cwConversation="jwt-1" />);
    expect(mockLastProps.source.uri).toBe(firstUri);
  });
});
