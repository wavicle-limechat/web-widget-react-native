import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Text, View, TouchableOpacity } from 'react-native';
import LimeChatWidget from '../LimeChatWidget';
import { WOOT_PREFIX } from '../constants';
import { validators } from '../utils/errorUtils';

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

// Mock the components and hooks
const mockInject = jest.fn();
const mockReload = jest.fn();

jest.mock('../components/ErrorBoundary', () => {
  return function MockErrorBoundary({ children }) {
    return children;
  };
});

jest.mock('../components/WidgetIcon', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function MockWidgetIcon() {
    return React.createElement(Text, { testID: 'default-widget-icon' }, 'Default Icon');
  };
});

// real WidgetModal and WebViewComponent run; only the native modules are replaced
let mockKeepModalMounted = false;
let mockWebViewProps;
let mockWebViewMounts = 0;
jest.mock('react-native-modal', () => {
  const React = require('react');
  const { View } = require('react-native');
  // eslint-disable-next-line react/prop-types
  return function MockModal({ isVisible, children }) {
    if (!isVisible && !mockKeepModalMounted) return null;
    return React.createElement(View, { testID: 'widget-modal' }, children);
  };
});

jest.mock('react-native-webview', () => {
  const React = require('react');
  return {
    WebView: React.forwardRef((props, ref) => {
      mockWebViewProps = props;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      React.useEffect(() => { mockWebViewMounts += 1; }, []);
      React.useImperativeHandle(ref, () => ({ injectJavaScript: mockInject, reload: mockReload }));
      return null;
    }),
  };
});

jest.mock('../hooks/useWidgetConfig', () => {
  return jest.fn(() => ({
    widgetConfig: {},
    isLoading: false,
    error: null,
  }));
});

const widgetListens = () =>
  mockWebViewProps.onMessage({
    nativeEvent: { data: '{"event":"set-cw-conversation","cw_conversation":"jwt"}' },
  });

const closeFromWidget = () =>
  mockWebViewProps.onMessage({ nativeEvent: { data: '{"type":"close-widget"}' } });

describe('LimeChatWidget', () => {
  beforeEach(() => {
    mockKeepModalMounted = false;
  });

  const defaultProps = {
    websiteToken: 'test-token',
  };

  it('passes a trimmed baseUrl to useWidgetConfig', () => {
    const useWidgetConfig = require('../hooks/useWidgetConfig');
    useWidgetConfig.mockClear();
    render(<LimeChatWidget {...defaultProps} baseUrl="https://staging.example.com//" />);

    expect(useWidgetConfig.mock.calls[0][0]).toBe('https://staging.example.com');
  });

  it('uses the default baseUrl when none is given', () => {
    const useWidgetConfig = require('../hooks/useWidgetConfig');
    useWidgetConfig.mockClear();
    render(<LimeChatWidget {...defaultProps} />);

    expect(useWidgetConfig.mock.calls[0][0]).toBe('https://app.limechat.ai');
  });

  it('reports invalid props once and does not loop when user and customAttributes are omitted', () => {
    // cap failures so a render loop ends the test instead of hanging it
    const real = validators.websiteToken;
    let calls = 0;
    const spy = jest.spyOn(validators, 'websiteToken').mockImplementation((token) => {
      calls += 1;
      if (calls > 50) return true;
      return real(token);
    });
    const onError = jest.fn();
    render(<LimeChatWidget websiteToken="" onError={onError} />);
    spy.mockRestore();

    expect(calls).toBe(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('reports the same validation error once when onError sets host state', () => {
    const real = validators.websiteToken;
    let calls = 0;
    const spy = jest.spyOn(validators, 'websiteToken').mockImplementation((token) => {
      calls += 1;
      if (calls > 50) return true;
      return real(token);
    });
    const onError = jest.fn();
    const Host = () => {
      const [, setCount] = React.useState(0);
      return (
        <LimeChatWidget
          websiteToken=""
          onError={(e) => {
            onError(e);
            setCount((c) => c + 1);
          }}
        />
      );
    };
    render(<Host />);
    spy.mockRestore();

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('holds an open message until the webview loads, then sends it once', () => {
    mockInject.mockClear();
    const ref = React.createRef();
    const { getByTestId, queryByTestId } = render(<LimeChatWidget {...defaultProps} ref={ref} />);
    expect(queryByTestId('widget-modal')).toBeNull();

    act(() => ref.current.open('hi'));
    expect(getByTestId('widget-modal')).toBeTruthy();
    expect(mockWebViewProps.source.uri).not.toContain('lc_open');
    expect(mockInject).not.toHaveBeenCalled();

    act(() => mockWebViewProps.onLoad());
    act(() => widgetListens());
    expect(mockInject).toHaveBeenCalledTimes(1);
    expect(mockInject.mock.calls[0][0]).toContain('open-with-message');
    expect(mockInject.mock.calls[0][0]).toContain('"openMessage":"hi"');

    act(() => mockWebViewProps.onLoad());
    expect(mockInject).toHaveBeenCalledTimes(1);
  });

  it('does not send the held open message on onLoad alone', () => {
    mockInject.mockClear();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} ref={ref} />);

    act(() => ref.current.open('hi'));
    act(() => mockWebViewProps.onLoad());
    act(() => mockWebViewProps.onLoad());
    expect(mockInject).not.toHaveBeenCalled();
  });

  it('sends the held open message once when the widget event comes before onLoad', () => {
    mockInject.mockClear();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} ref={ref} />);

    act(() => ref.current.open('hi'));
    act(() => widgetListens());
    expect(mockInject).not.toHaveBeenCalled();
    act(() => mockWebViewProps.onLoad());
    expect(mockInject).toHaveBeenCalledTimes(1);
    expect(mockInject.mock.calls[0][0]).toContain('"openMessage":"hi"');
  });

  it('calls onWidgetLoad once when onLoad and the widget event each fire twice', () => {
    const onWidgetLoad = jest.fn();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} onWidgetLoad={onWidgetLoad} ref={ref} />);

    act(() => ref.current.open());
    act(() => mockWebViewProps.onLoad());
    act(() => mockWebViewProps.onLoad());
    act(() => widgetListens());
    act(() => widgetListens());
    expect(onWidgetLoad).toHaveBeenCalledTimes(1);
  });

  it('does not call onWidgetLoad on onLoad alone', () => {
    const onWidgetLoad = jest.fn();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} onWidgetLoad={onWidgetLoad} ref={ref} />);

    act(() => ref.current.open());
    act(() => mockWebViewProps.onLoad());
    expect(onWidgetLoad).not.toHaveBeenCalled();
  });

  it('calls onWidgetLoad once at ready, whichever signal comes last', () => {
    const onWidgetLoad = jest.fn();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} onWidgetLoad={onWidgetLoad} ref={ref} />);

    act(() => ref.current.open());
    act(() => mockWebViewProps.onLoad());
    expect(onWidgetLoad).not.toHaveBeenCalled();
    act(() => widgetListens());
    expect(onWidgetLoad).toHaveBeenCalledTimes(1);

    // widget event first, then onLoad, on a fresh webview
    act(() => closeFromWidget());
    act(() => ref.current.open());
    act(() => widgetListens());
    expect(onWidgetLoad).toHaveBeenCalledTimes(1);
    act(() => mockWebViewProps.onLoad());
    expect(onWidgetLoad).toHaveBeenCalledTimes(2);
  });

  it('calls onWidgetLoad after onConversationTokenChange', () => {
    const calls = [];
    const ref = React.createRef();
    render(
      <LimeChatWidget
        {...defaultProps}
        onConversationTokenChange={() => calls.push('token')}
        onWidgetLoad={() => calls.push('loaded')}
        ref={ref}
      />
    );

    act(() => ref.current.open());
    act(() => mockWebViewProps.onLoad());
    act(() => widgetListens());
    expect(calls).toEqual(['token', 'loaded']);
  });

  it.each([
    ['onLoad first', () => { act(() => mockWebViewProps.onLoad()); act(() => widgetListens()); }],
    ['token event first', () => { act(() => widgetListens()); act(() => mockWebViewProps.onLoad()); }],
  ])('sends attributes and open before the token and loaded, %s', (_name, signals) => {
    const calls = [];
    mockInject.mockReset();
    mockInject.mockImplementation((js) => {
      calls.push(js.includes('set-message-attributes') ? 'attrs' : 'open');
    });
    const ref = React.createRef();
    render(
      <LimeChatWidget
        {...defaultProps}
        onConversationTokenChange={() => calls.push('token')}
        onWidgetLoad={() => calls.push('loaded')}
        ref={ref}
      />
    );

    act(() => ref.current.open('hi'));
    act(() => { ref.current.setMessageAttributes({ a: 1 }); });
    signals();
    expect(calls).toEqual(['attrs', 'open', 'token', 'loaded']);
    mockInject.mockReset();
  });

  it('calls onWidgetLoad even when the token callback throws', () => {
    const onWidgetLoad = jest.fn();
    const onError = jest.fn();
    const ref = React.createRef();
    render(
      <LimeChatWidget
        {...defaultProps}
        onConversationTokenChange={() => { throw new Error('host bug'); }}
        onWidgetLoad={onWidgetLoad}
        onError={onError}
        ref={ref}
      />
    );

    act(() => ref.current.open());
    act(() => mockWebViewProps.onLoad());
    act(() => widgetListens());
    expect(onWidgetLoad).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('a throwing token callback reaches onError when the event comes first', () => {
    const onError = jest.fn();
    const onWidgetLoad = jest.fn();
    const ref = React.createRef();
    render(
      <LimeChatWidget
        {...defaultProps}
        onConversationTokenChange={() => { throw new Error('host bug'); }}
        onWidgetLoad={onWidgetLoad}
        onError={onError}
        ref={ref}
      />
    );

    act(() => ref.current.open());
    act(() => widgetListens());
    act(() => mockWebViewProps.onLoad());
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][1].context.action).toBe('conversationToken');
    expect(onWidgetLoad).toHaveBeenCalledTimes(1);
  });

  it('ignores an empty conversation token', () => {
    const onConversationTokenChange = jest.fn();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} onConversationTokenChange={onConversationTokenChange} ref={ref} />);

    act(() => ref.current.open());
    act(() => mockWebViewProps.onLoad());
    act(() => mockWebViewProps.onMessage({
      nativeEvent: { data: '{"event":"set-cw-conversation","cw_conversation":" "}' },
    }));
    expect(onConversationTokenChange).not.toHaveBeenCalled();
  });

  it('does not resend on a repeat set-cw-conversation', () => {
    mockInject.mockClear();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} ref={ref} />);

    act(() => ref.current.open('hi'));
    act(() => mockWebViewProps.onLoad());
    act(() => widgetListens());
    act(() => widgetListens());
    act(() => mockWebViewProps.onLoad());
    expect(mockInject).toHaveBeenCalledTimes(1);
  });

  it('opens without a message and sends open-with-message right away when loaded', () => {
    mockInject.mockClear();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} ref={ref} />);

    act(() => ref.current.open());
    act(() => mockWebViewProps.onLoad());
    act(() => widgetListens());
    expect(mockInject).not.toHaveBeenCalled();

    act(() => ref.current.open('again'));
    expect(mockInject).toHaveBeenCalledTimes(1);
    expect(mockInject.mock.calls[0][0]).toContain('"openMessage":"again"');
  });

  it('still delivers an open message when reopened while the webview is mounted during close', () => {
    mockInject.mockClear();
    const ref = React.createRef();
    const { getByTestId } = render(<LimeChatWidget {...defaultProps} ref={ref} />);

    act(() => ref.current.open());
    act(() => mockWebViewProps.onLoad());
    act(() => widgetListens());
    mockKeepModalMounted = true;
    act(() => closeFromWidget());
    act(() => ref.current.open('back'));
    mockKeepModalMounted = false;

    expect(getByTestId('widget-modal')).toBeTruthy();
    expect(mockInject).toHaveBeenCalledTimes(1);
    expect(mockInject.mock.calls[0][0]).toContain('"openMessage":"back"');
  });

  it('drops a pending open message when the widget is closed', () => {
    mockInject.mockClear();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} ref={ref} />);

    act(() => ref.current.open('stale'));
    act(() => closeFromWidget());
    act(() => ref.current.open());
    act(() => mockWebViewProps.onLoad());
    expect(mockInject).not.toHaveBeenCalled();
  });

  it('delivers an open message from a stale open reference after the widget opened', () => {
    mockInject.mockClear();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} ref={ref} />);
    const { open } = ref.current;

    act(() => open());
    act(() => mockWebViewProps.onLoad());
    act(() => widgetListens());
    act(() => open('late'));
    expect(mockInject).toHaveBeenCalledTimes(1);
    expect(mockInject.mock.calls[0][0]).toContain('"openMessage":"late"');
  });

  it('open with an empty string or object shows the widget and sends nothing', () => {
    mockInject.mockClear();
    const ref = React.createRef();
    const { getByTestId } = render(<LimeChatWidget {...defaultProps} ref={ref} />);

    act(() => ref.current.open(''));
    expect(getByTestId('widget-modal')).toBeTruthy();
    act(() => mockWebViewProps.onLoad());
    act(() => widgetListens());
    expect(mockInject).not.toHaveBeenCalled();

    act(() => ref.current.open({}));
    act(() => ref.current.open(''));
    expect(mockInject).not.toHaveBeenCalled();
  });

  it('reopen keeps the live token when the host has a callback but no prop', () => {
    const onConversationTokenChange = jest.fn();
    const ref = React.createRef();
    render(
      <LimeChatWidget {...defaultProps} onConversationTokenChange={onConversationTokenChange} ref={ref} />
    );

    act(() => ref.current.open());
    expect(mockWebViewProps.source.uri).not.toContain('cw_conversation');
    act(() => mockWebViewProps.onLoad());
    act(() => widgetListens());
    expect(onConversationTokenChange).toHaveBeenCalledWith('jwt');

    act(() => closeFromWidget());
    act(() => ref.current.open());
    expect(mockWebViewProps.source.uri).toContain('cw_conversation=jwt');
  });

  it('a host token prop wins over the live token', () => {
    const ref = React.createRef();
    render(
      <LimeChatWidget {...defaultProps} conversationToken="host-jwt" onConversationTokenChange={jest.fn()} ref={ref} />
    );

    act(() => ref.current.open());
    act(() => widgetListens());
    act(() => closeFromWidget());
    act(() => ref.current.open());
    expect(mockWebViewProps.source.uri).toContain('cw_conversation=host-jwt');
  });

  it('clearing conversationToken drops the live token', () => {
    const ref = React.createRef();
    const onConversationTokenChange = jest.fn();
    const props = { ...defaultProps, onConversationTokenChange };
    const { rerender } = render(<LimeChatWidget {...props} conversationToken="userA" ref={ref} />);

    act(() => ref.current.open());
    act(() => mockWebViewProps.onLoad());
    act(() => widgetListens());
    act(() => closeFromWidget());

    // logout: the host clears the prop
    rerender(<LimeChatWidget {...props} conversationToken={undefined} ref={ref} />);
    act(() => ref.current.open());
    expect(mockWebViewProps.source.uri).not.toContain('cw_conversation');

    // next user gets their own live token
    act(() => mockWebViewProps.onLoad());
    act(() => widgetListens());
    act(() => closeFromWidget());
    act(() => ref.current.open());
    expect(mockWebViewProps.source.uri).toContain('cw_conversation=jwt');

    // a new host token still wins
    act(() => closeFromWidget());
    rerender(<LimeChatWidget {...props} conversationToken="userC" ref={ref} />);
    act(() => ref.current.open());
    expect(mockWebViewProps.source.uri).toContain('cw_conversation=userC');
  });

  it('an old page token event after reload does not mark ready', () => {
    const now = jest.spyOn(Date, 'now');
    const withTimestamp = (timestamp) =>
      mockWebViewProps.onMessage({
        nativeEvent: { data: JSON.stringify({ event: 'set-cw-conversation', cw_conversation: 'jwt', timestamp }) },
      });
    const onWidgetLoad = jest.fn();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} onWidgetLoad={onWidgetLoad} ref={ref} />);

    act(() => ref.current.open());
    act(() => mockWebViewProps.onLoad());
    act(() => withTimestamp(900));
    expect(onWidgetLoad).toHaveBeenCalledTimes(1);

    now.mockReturnValue(1000);
    act(() => { ref.current.reload(); });
    mockInject.mockClear();
    act(() => { ref.current.setMessageAttributes({ a: 1 }); });
    act(() => ref.current.open('hi'));

    // the old page answers after the reload started, then the new page loads
    act(() => withTimestamp(950));
    act(() => mockWebViewProps.onLoad());
    expect(mockInject).not.toHaveBeenCalled();
    expect(onWidgetLoad).toHaveBeenCalledTimes(1);

    // the new page answers
    act(() => withTimestamp(1100));
    expect(mockInject).toHaveBeenCalledTimes(2);
    expect(onWidgetLoad).toHaveBeenCalledTimes(2);
    now.mockRestore();
  });

  it('passes onMessage through the modal to the webview', () => {
    const onMessage = jest.fn();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} onMessage={onMessage} ref={ref} />);

    act(() => ref.current.open());
    act(() => mockWebViewProps.onMessage({
      nativeEvent: { data: '{"event":"something-new"}' },
    }));
    expect(onMessage).toHaveBeenCalledWith({ event: 'something-new' });
  });

  it('sendMessage returns false while closed and injects when open', () => {
    mockInject.mockClear();
    const ref = React.createRef();
    render(<LimeChatWidget {...defaultProps} ref={ref} />);

    let result;
    act(() => { result = ref.current.sendMessage('set-label', { label: 'vip' }); });
    expect(result).toBe(false);
    expect(mockInject).not.toHaveBeenCalled();

    act(() => ref.current.open());
    act(() => { result = ref.current.sendMessage('set-label', { label: 'vip' }); });
    expect(result).toBe(true);
    expect(mockInject.mock.calls[0][0]).toContain('"label":"vip"');
    expect(mockInject.mock.calls[0][0]).toContain('"event":"set-label"');
  });

  it('renders default widget icon when no customButton is provided', () => {
    const { getByTestId } = render(<LimeChatWidget {...defaultProps} />);
    
    expect(getByTestId('default-widget-icon')).toBeTruthy();
  });

  it('renders custom button when customButton is provided', () => {
    const CustomButton = () => (
      <View testID="custom-button">
        <Text>Custom Button</Text>
      </View>
    );

    const { getByTestId, queryByTestId } = render(
      <LimeChatWidget {...defaultProps} customButton={<CustomButton />} />
    );
    
    expect(getByTestId('custom-button')).toBeTruthy();
    expect(queryByTestId('default-widget-icon')).toBeNull();
  });

  it('opens modal when custom button is pressed', () => {
    const CustomButton = () => (
      <View testID="custom-button">
        <Text>Custom Button</Text>
      </View>
    );

    const { getByTestId, queryByTestId } = render(
      <LimeChatWidget {...defaultProps} customButton={<CustomButton />} />
    );
    
    // Initially modal should not be visible
    expect(queryByTestId('widget-modal')).toBeNull();
    
    // Press the custom button
    fireEvent.press(getByTestId('custom-button'));
    
    // Modal should now be visible
    expect(getByTestId('widget-modal')).toBeTruthy();
  });

  it('calls both custom button onPress and opens widget when custom button with onPress is provided', () => {
    const mockCustomOnPress = jest.fn();
    
    const CustomButton = ({ onPress }) => {
      CustomButton.propTypes = {
        onPress: require('prop-types').func,
      };
      
      return (
        <TouchableOpacity testID="custom-button" onPress={onPress}>
          <Text>Custom Button</Text>
        </TouchableOpacity>
      );
    };

    const { getByTestId, queryByTestId } = render(
      <LimeChatWidget 
        {...defaultProps} 
        customButton={<CustomButton onPress={mockCustomOnPress} />} 
      />
    );
    
    // Initially modal should not be visible
    expect(queryByTestId('widget-modal')).toBeNull();
    
    // Press the custom button
    fireEvent.press(getByTestId('custom-button'));
    
    // Both the custom onPress and widget modal opening should happen
    expect(mockCustomOnPress).toHaveBeenCalled();
    expect(getByTestId('widget-modal')).toBeTruthy();
  });

  it('opens modal when default icon is pressed', () => {
    const { getByTestId, queryByTestId } = render(<LimeChatWidget {...defaultProps} />);
    
    // Initially modal should not be visible
    expect(queryByTestId('widget-modal')).toBeNull();
    
    // Press the default icon (now we need to press the text since it's wrapped by TouchableOpacity)
    fireEvent.press(getByTestId('default-widget-icon'));
    
    // Modal should now be visible
    expect(getByTestId('widget-modal')).toBeTruthy();
  });

  it('renders the unreadCount prop as a badge', () => {
    const { getByText } = render(<LimeChatWidget {...defaultProps} unreadCount={3} />);

    expect(getByText('3')).toBeTruthy();
  });

  it('caps the badge at 99+', () => {
    const { getByText, queryByText, rerender } = render(<LimeChatWidget {...defaultProps} unreadCount={99} />);
    expect(getByText('99')).toBeTruthy();

    rerender(<LimeChatWidget {...defaultProps} unreadCount={100} />);
    expect(getByText('99+')).toBeTruthy();
    expect(queryByText('100')).toBeNull();
  });

  it('renders no badge when unreadCount is 0', () => {
    const { queryByText } = render(<LimeChatWidget {...defaultProps} unreadCount={0} />);

    expect(queryByText('0')).toBeNull();
  });

  describe('setMessageAttributes', () => {
    // run the injected script and return the object it posts
    const postedBy = (script) => {
      const posted = [];
      // eslint-disable-next-line no-new-func
      new Function('window', script)({ postMessage: (msg) => posted.push(msg) });
      return JSON.parse(posted[0].replace(WOOT_PREFIX, ''));
    };
    const attributeCalls = () =>
      mockInject.mock.calls.filter(([script]) => script.includes('set-message-attributes'));
    const makeReady = () => {
      act(() => mockWebViewProps.onLoad());
      act(() => widgetListens());
    };

    beforeEach(() => mockInject.mockClear());

    it('returns false for null, array, empty, string and a cycle, and injects nothing', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);
      act(() => ref.current.open());
      makeReady();

      const cycle = {};
      cycle.self = cycle;
      [null, undefined, [], [1], {}, 'text', 5, cycle].forEach((value) => {
        let result;
        act(() => { result = ref.current.setMessageAttributes(value); });
        expect(result).toBe(false);
      });
      expect(mockInject).not.toHaveBeenCalled();
    });

    it('holds attributes while closed and sends them at ready', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);

      let result;
      act(() => { result = ref.current.setMessageAttributes({ plan: 'gold' }); });
      expect(result).toBe(true);
      expect(mockInject).not.toHaveBeenCalled();

      act(() => ref.current.open());
      makeReady();
      expect(attributeCalls()).toHaveLength(1);
      expect(postedBy(attributeCalls()[0][0])).toEqual({
        event: 'set-message-attributes',
        attributes: { plan: 'gold' },
      });
    });

    it('does not send on onLoad alone', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);
      act(() => ref.current.open());
      act(() => { ref.current.setMessageAttributes({ a: 1 }); });
      act(() => mockWebViewProps.onLoad());
      expect(mockInject).not.toHaveBeenCalled();
    });

    it('merges repeat calls, later keys win', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);
      act(() => { ref.current.setMessageAttributes({ a: 1, b: 1 }); });
      act(() => { ref.current.setMessageAttributes({ b: 2, c: 3 }); });
      act(() => ref.current.open());
      makeReady();
      expect(attributeCalls()).toHaveLength(1);
      expect(postedBy(attributeCalls()[0][0]).attributes).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('sends attributes before a held open message', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);
      act(() => ref.current.open('hi'));
      act(() => { ref.current.setMessageAttributes({ a: 1 }); });
      makeReady();
      expect(mockInject).toHaveBeenCalledTimes(2);
      expect(mockInject.mock.calls[0][0]).toContain('set-message-attributes');
      expect(mockInject.mock.calls[1][0]).toContain('open-with-message');
    });

    it('sends at once when ready', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);
      act(() => ref.current.open());
      makeReady();
      act(() => { ref.current.setMessageAttributes({ a: 1 }); });
      expect(attributeCalls()).toHaveLength(1);
      act(() => { ref.current.setMessageAttributes({ b: 2 }); });
      expect(attributeCalls()).toHaveLength(2);
      expect(postedBy(attributeCalls()[1][0]).attributes).toEqual({ b: 2 });
    });

    it('does not resend after close and reopen once flushed', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);
      act(() => { ref.current.setMessageAttributes({ a: 1 }); });
      act(() => ref.current.open());
      makeReady();
      expect(attributeCalls()).toHaveLength(1);

      act(() => closeFromWidget());
      act(() => ref.current.open());
      makeReady();
      expect(attributeCalls()).toHaveLength(1);
    });

    it('keeps unflushed attributes through close and reopen', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);
      act(() => ref.current.open());
      act(() => { ref.current.setMessageAttributes({ a: 1 }); });
      act(() => closeFromWidget());
      expect(attributeCalls()).toHaveLength(0);

      act(() => ref.current.open());
      makeReady();
      expect(attributeCalls()).toHaveLength(1);
      expect(postedBy(attributeCalls()[0][0]).attributes).toEqual({ a: 1 });
    });

    it('apostrophe, quote, backslash and newline stay in valid json', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);
      const attributes = { name: "O'Brien \"q\"", path: 'a\\b', text: 'l1\nl2' };
      act(() => ref.current.open());
      makeReady();
      act(() => { ref.current.setMessageAttributes(attributes); });
      expect(postedBy(attributeCalls()[0][0]).attributes).toEqual(attributes);
    });
  });

  describe('failed page', () => {
    const failLoad = () =>
      mockWebViewProps.onError({ nativeEvent: { description: 'offline', url: 'https://x/y' } });

    it('open with a message after a failed load remounts and sends at ready', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);
      act(() => ref.current.open());
      act(() => failLoad());
      const mounts = mockWebViewMounts;
      mockInject.mockClear();

      act(() => ref.current.open('hi'));
      expect(mockWebViewMounts).toBe(mounts + 1);
      expect(mockInject).not.toHaveBeenCalled();

      act(() => mockWebViewProps.onLoad());
      act(() => widgetListens());
      expect(mockInject).toHaveBeenCalledTimes(1);
      expect(mockInject.mock.calls[0][0]).toContain('open-with-message');
    });

    it('open with no message after a failed load does not remount', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);
      act(() => ref.current.open());
      act(() => mockWebViewProps.onHttpError({ nativeEvent: { statusCode: 500, url: 'https://x/y' } }));
      const mounts = mockWebViewMounts;

      act(() => ref.current.open());
      expect(mockWebViewMounts).toBe(mounts);
    });
  });

  describe('process death', () => {
    const ready = () => {
      act(() => mockWebViewProps.onLoad());
      act(() => widgetListens());
    };

    it.each(['onContentProcessDidTerminate', 'onRenderProcessGone'])(
      'process death reloads once, then reports until ready (%s)',
      (prop) => {
        const onError = jest.fn();
        const ref = React.createRef();
        render(<LimeChatWidget {...defaultProps} onError={onError} ref={ref} />);
        act(() => ref.current.open());
        ready();
        const mounts = mockWebViewMounts;

        // first death: remount, no error
        act(() => mockWebViewProps[prop]());
        expect(mockWebViewMounts).toBe(mounts + 1);
        expect(onError).not.toHaveBeenCalled();

        // second death before ready: no remount, one error
        act(() => mockWebViewProps[prop]());
        expect(mockWebViewMounts).toBe(mounts + 1);
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError.mock.calls[0][0].code).toBe('WIDGET_ERROR_1100');
        expect(onError.mock.calls[0][0].message).toBe('Widget web process died again before ready');
        expect(onError.mock.calls[0][1].context.action).toBe('webViewProcessGone');

        // a later reload still loads the page
        act(() => { ref.current.reload(); });
        expect(mockWebViewMounts).toBe(mounts + 2);

        // ready resets the flag, so the next death reloads again
        ready();
        act(() => mockWebViewProps[prop]());
        expect(mockWebViewMounts).toBe(mounts + 3);
        expect(onError).toHaveBeenCalledTimes(1);
      }
    );

    it('open with a message after the second death retries the page', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} onError={jest.fn()} ref={ref} />);
      act(() => ref.current.open());
      act(() => mockWebViewProps.onRenderProcessGone());
      act(() => mockWebViewProps.onRenderProcessGone());
      const mounts = mockWebViewMounts;

      act(() => ref.current.open('hi'));
      expect(mockWebViewMounts).toBe(mounts + 1);
    });

    it('held work goes out at ready after a process death', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);
      act(() => ref.current.open());
      ready();
      mockInject.mockClear();

      act(() => mockWebViewProps.onRenderProcessGone());
      act(() => { ref.current.setMessageAttributes({ a: 1 }); });
      act(() => ref.current.open('hi'));
      expect(mockInject).not.toHaveBeenCalled();

      ready();
      expect(mockInject).toHaveBeenCalledTimes(2);
      expect(mockInject.mock.calls[0][0]).toContain('set-message-attributes');
      expect(mockInject.mock.calls[1][0]).toContain('open-with-message');
    });
  });

  describe('reload', () => {
    beforeEach(() => {
      mockInject.mockClear();
      mockReload.mockClear();
    });

    it('reload returns false while closed', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);

      let result;
      act(() => { result = ref.current.reload(); });
      expect(result).toBe(false);
      expect(mockReload).not.toHaveBeenCalled();
    });

    it('reload resets ready, so attributes wait and onWidgetLoad fires again', () => {
      const onWidgetLoad = jest.fn();
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} onWidgetLoad={onWidgetLoad} ref={ref} />);
      act(() => ref.current.open());
      act(() => mockWebViewProps.onLoad());
      act(() => widgetListens());
      expect(onWidgetLoad).toHaveBeenCalledTimes(1);

      let result;
      act(() => { result = ref.current.reload(); });
      expect(result).toBe(true);

      act(() => { ref.current.setMessageAttributes({ a: 1 }); });
      expect(mockInject).not.toHaveBeenCalled();

      act(() => mockWebViewProps.onLoad());
      act(() => widgetListens());
      expect(onWidgetLoad).toHaveBeenCalledTimes(2);
      expect(mockInject).toHaveBeenCalledTimes(1);
      expect(mockInject.mock.calls[0][0]).toContain('set-message-attributes');
    });

    it('reload uses the live token', () => {
      const onConversationTokenChange = jest.fn();
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} onConversationTokenChange={onConversationTokenChange} ref={ref} />);
      act(() => ref.current.open());
      expect(mockWebViewProps.source.uri).not.toContain('cw_conversation');
      act(() => mockWebViewProps.onLoad());
      act(() => widgetListens());
      expect(onConversationTokenChange).toHaveBeenCalledWith('jwt');

      act(() => { ref.current.reload(); });
      expect(mockWebViewProps.source.uri).toContain('cw_conversation=jwt');
    });
  });

  describe('close', () => {
    it('close hides the widget and calls onWidgetClose', () => {
      const onWidgetClose = jest.fn();
      const ref = React.createRef();
      const { queryByTestId } = render(<LimeChatWidget {...defaultProps} onWidgetClose={onWidgetClose} ref={ref} />);
      act(() => ref.current.open());
      expect(queryByTestId('widget-modal')).toBeTruthy();

      act(() => ref.current.close());
      expect(queryByTestId('widget-modal')).toBeNull();
      expect(onWidgetClose).toHaveBeenCalledTimes(1);
    });

    it('close does nothing while the widget is closed', () => {
      const onWidgetClose = jest.fn();
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} onWidgetClose={onWidgetClose} ref={ref} />);

      act(() => ref.current.close());
      expect(onWidgetClose).not.toHaveBeenCalled();
    });

    it('close drops a held open message, like the widget close event', () => {
      const ref = React.createRef();
      render(<LimeChatWidget {...defaultProps} ref={ref} />);
      act(() => ref.current.open('hi'));
      act(() => ref.current.close());
      mockInject.mockClear();

      act(() => ref.current.open());
      act(() => mockWebViewProps.onLoad());
      act(() => widgetListens());
      expect(mockInject).not.toHaveBeenCalled();
    });

    it('close dismisses a blank widget after a second process death', () => {
      const onWidgetClose = jest.fn();
      const ref = React.createRef();
      const { queryByTestId } = render(
        <LimeChatWidget {...defaultProps} onWidgetClose={onWidgetClose} ref={ref} />
      );
      act(() => ref.current.open());
      act(() => mockWebViewProps.onRenderProcessGone());
      act(() => mockWebViewProps.onRenderProcessGone());

      act(() => ref.current.close());
      expect(queryByTestId('widget-modal')).toBeNull();
      expect(onWidgetClose).toHaveBeenCalledTimes(1);
    });
  });
});
