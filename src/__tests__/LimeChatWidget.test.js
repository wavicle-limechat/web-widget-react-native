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
      React.useImperativeHandle(ref, () => ({ injectJavaScript: mockInject }));
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
    nativeEvent: { data: `${WOOT_PREFIX}{"event":"set-cw-conversation","cw_conversation":"jwt"}` },
  });

const closeFromWidget = () =>
  mockWebViewProps.onMessage({ nativeEvent: { data: `${WOOT_PREFIX}{"type":"close-widget"}` } });

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

  it('renders no badge when unreadCount is 0', () => {
    const { queryByText } = render(<LimeChatWidget {...defaultProps} unreadCount={0} />);

    expect(queryByText('0')).toBeNull();
  });
});
