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

  it('keeps the token and open message out of load error context', () => {
    const onError = jest.fn();
    const props = {
      baseUrl: 'https://app.limechat.ai',
      websiteToken: 'tok',
      cwConversation: 'secret-jwt',
      customAttributes: { plan: 'gold' },
      onError,
    };
    render(<WebViewComponent {...props} />);

    mockLastProps.onError({
      nativeEvent: {
        description: 'offline',
        url: 'https://app.limechat.ai/widget?cw_conversation=secret-jwt&lc_open_message=hi',
        canGoBack: false,
        title: 'https://app.limechat.ai/widget?cw_conversation=secret-jwt',
      },
    });

    const json = JSON.stringify(onError.mock.calls[0][1]);
    expect(json).not.toContain('secret-jwt');
    expect(json).not.toContain('cw_conversation');
    expect(json).not.toContain('lc_open_');
    expect(onError.mock.calls[0][1].context.url).toBe('https://app.limechat.ai/widget');
  });

  it('keeps the raw message out of error context when the token callback throws', () => {
    const onError = jest.fn();
    const onCwConversationUpdate = jest.fn(() => { throw new Error('boom'); });
    render(
      <WebViewComponent
        baseUrl="https://app.limechat.ai"
        websiteToken="tok"
        onError={onError}
        onCwConversationUpdate={onCwConversationUpdate}
      />
    );

    mockLastProps.onMessage({
      nativeEvent: { data: 'chatwoot-widget:{"event":"set-cw-conversation","cw_conversation":"secret-jwt"}' },
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(onError.mock.calls[0][1])).not.toContain('secret-jwt');
  });

  it('reports a main page http error without the query string', () => {
    const onError = jest.fn();
    render(
      <WebViewComponent
        baseUrl="https://app.limechat.ai"
        websiteToken="tok"
        cwConversation="secret-jwt"
        onError={onError}
      />
    );

    mockLastProps.onHttpError({
      nativeEvent: { statusCode: 503, url: 'https://app.limechat.ai/widget?cw_conversation=secret-jwt' },
    });

    expect(onError).toHaveBeenCalledTimes(1);
    const [error, info] = onError.mock.calls[0];
    expect(error.message).toBe('WebView HTTP error: 503');
    expect(error.code).toBe('WIDGET_ERROR_1100');
    expect(info.context.statusCode).toBe(503);
    expect(info.context.url).toBe('https://app.limechat.ai/widget');
    expect(JSON.stringify(info)).not.toContain('secret-jwt');
  });
});
