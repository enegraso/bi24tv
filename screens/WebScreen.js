import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, BackHandler, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FocusableButton from '../components/FocusableButton';

export default function WebScreen({ url, onBack, bgColor = '#000', textColor = '#fff', buttonFocusBorder = '#fff', buttonFocusWidth = 3 }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const onHardwareBack = () => {
      try { onBack && onBack(); } catch (e) {}
      return true;
    };
    if (Platform.OS === 'android' || Platform.isTV) {
      const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
      return () => sub?.remove();
    }
    return undefined;
  }, [onBack]);

  return (
    <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      <FocusableButton
        label="← Volver"
        onPress={onBack}
        buttonStyle={[styles.backBtn, { top: insets.top + 8 }]}
        textStyle={[styles.backText, { color: textColor }]}
        focusBorderColor={buttonFocusBorder}
        focusBorderWidth={buttonFocusWidth}
      />
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator size="large" color="#f59e0b" style={styles.loader} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
  },
});
