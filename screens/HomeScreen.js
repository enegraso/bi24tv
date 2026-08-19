import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Linking, Modal, ScrollView, Animated, Easing, Platform, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getExpoPushTokenAsync } from '../app/services/notifications';
import SettingsScreen from '../app/screens/SettingsScreen';
import WebScreen from './WebScreen';
import FocusableButton from '../components/FocusableButton';
import SocialIcon from '../components/SocialIcon';

function darkenColor(hex, factor = 0.7) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
}

function lightenColor(hex, factor = 1.3) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) * factor);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) * factor);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) * factor);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function isValidHex(color) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

export default function HomeScreen({ onStart, logoUrl, bgColor = '#000', buttonBg = 'rgba(255,255,255,0.08)', textColor = '#fff', slogan = 'Canal de streaming en vivo desde Bragado. Programación local, noticias y entrevistas.', webUrl = 'https://bragadoinforma.com.ar', whatsapp, facebook, instagram, twitter, tiktok, youtube, mail, buttonFocusBorder = '#fff', buttonFocusWidth = 3 }) {
  const source = logoUrl ? { uri: logoUrl } : require('../assets/react-logo.png');

  const gradientColors = isValidHex(bgColor)
    ? [darkenColor(bgColor, 0.6), bgColor, lightenColor(bgColor, 1.1)]
    : [bgColor, bgColor, bgColor];

  const buttonStyle = [styles.button, { backgroundColor: buttonBg }];
  const textStyle = [styles.buttonText, { color: textColor }];
  const subtitleStyle = [styles.subtitle, { color: textColor }];

  const [showSettings, setShowSettings] = useState(false);
  const [showWeb, setShowWeb] = useState(false);
  const [gearFocused, setGearFocused] = useState(false);
  const [starFocused, setStarFocused] = useState(false);
  const [exitFocused, setExitFocused] = useState(false);
  const gearAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(0)).current;
  const exitAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!Platform.isTV) {
      getExpoPushTokenAsync();
    }
  }, []);

  return (
    <LinearGradient colors={gradientColors} style={[styles.container, { paddingTop: (insets.top || 12) + 40 }]}>
      <Pressable
        style={[styles.topButton, { top: (insets.top || 10) + 4 }]}
        focusable={true}
        accessible={true}
        onFocus={() => { setGearFocused(true); Animated.timing(gearAnim, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(); }}
        onBlur={() => { setGearFocused(false); Animated.timing(gearAnim, { toValue: 0, duration: 120, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(); }}
        onPress={() => setShowSettings(true)}
        accessibilityLabel="Abrir configuración"
      >
        <Animated.View style={[styles.topButtonInner, gearFocused && { borderColor: buttonFocusBorder, borderWidth: buttonFocusWidth }, { transform: [{ scale: gearAnim.interpolate({ inputRange: [0,1], outputRange: [1, 1.08] }) }] }]}>
          <Text style={{color:textColor, fontSize:22}}>⚙️</Text>
        </Animated.View>
      </Pressable>

      {!Platform.isTV && (
        <Pressable
          style={[styles.topButton, { top: (insets.top || 10) + 60 }]}
          focusable={true}
          accessible={true}
          onFocus={() => { setStarFocused(true); Animated.timing(starAnim, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(); }}
          onBlur={() => { setStarFocused(false); Animated.timing(starAnim, { toValue: 0, duration: 120, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(); }}
          onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.bi24.tv')}
          accessibilityLabel="Calificar app en Play Store"
        >
          <Animated.View style={[styles.topButtonInner, starFocused && { borderColor: buttonFocusBorder, borderWidth: buttonFocusWidth }, { transform: [{ scale: starAnim.interpolate({ inputRange: [0,1], outputRange: [1, 1.08] }) }] }]}>
            <Text style={{color:textColor, fontSize:22}}>⭐</Text>
          </Animated.View>
        </Pressable>
      )}

      {!Platform.isTV && (
        <Pressable
          style={[styles.topButton, { top: (insets.top || 10) + 116 }]}
          focusable={true}
          accessible={true}
          onFocus={() => { setExitFocused(true); Animated.timing(exitAnim, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(); }}
          onBlur={() => { setExitFocused(false); Animated.timing(exitAnim, { toValue: 0, duration: 120, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(); }}
          onPress={() => BackHandler.exitApp()}
          accessibilityLabel="Salir de la app"
        >
          <Animated.View style={[styles.topButtonInner, exitFocused && { borderColor: buttonFocusBorder, borderWidth: buttonFocusWidth }, { transform: [{ scale: exitAnim.interpolate({ inputRange: [0,1], outputRange: [1, 1.08] }) }] }]}>
            <Text style={{color:textColor, fontSize:22}}>🚪</Text>
          </Animated.View>
        </Pressable>
      )}

      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: (insets.bottom || 12) + 24 }] }>
        <Image source={source} style={styles.logo} resizeMode="contain" />
        <Text style={subtitleStyle}>{slogan}</Text>

        <FocusableButton label="VER EN VIVO" onPress={onStart} buttonStyle={buttonStyle} textStyle={textStyle} focusBorderColor={buttonFocusBorder} focusBorderWidth={buttonFocusWidth} />

        <FocusableButton label="WEB OFICIAL" onPress={() => setShowWeb(true)} buttonStyle={buttonStyle} textStyle={textStyle} focusBorderColor={buttonFocusBorder} focusBorderWidth={buttonFocusWidth} />

        {Platform.isTV ? (
          <FocusableButton label="CERRAR" onPress={() => BackHandler.exitApp()} buttonStyle={buttonStyle} textStyle={textStyle} focusBorderColor={buttonFocusBorder} focusBorderWidth={buttonFocusWidth} />
        ) : (
          <View style={styles.socialRow}>
            {whatsapp ? <SocialIcon icon={require('../assets/social-whatsapp.webp')} url={`https://wa.me/${whatsapp}`} bg={buttonBg} imageStyle={styles.socialLogo} style={styles.socialBtn} /> : null}
            {facebook ? <SocialIcon icon={require('../assets/social-facebook.webp')} url={facebook} bg={buttonBg} imageStyle={styles.socialLogo} style={styles.socialBtn} /> : null}
            {instagram ? <SocialIcon icon={require('../assets/social-instagram.webp')} url={instagram} bg={buttonBg} imageStyle={styles.socialLogo} style={styles.socialBtn} /> : null}
            {twitter ? <SocialIcon icon={require('../assets/social-twitter.webp')} url={twitter} bg={buttonBg} imageStyle={styles.socialLogo} style={styles.socialBtn} /> : null}
            {tiktok ? <SocialIcon icon={require('../assets/social-tiktok.webp')} url={tiktok} bg={buttonBg} imageStyle={styles.socialLogo} style={styles.socialBtn} /> : null}
            {youtube ? <SocialIcon icon={require('../assets/social-youtube.webp')} url={youtube} bg={buttonBg} imageStyle={styles.socialLogo} style={styles.socialBtn} /> : null}
            {mail ? <SocialIcon icon={require('../assets/social-mail.webp')} url={`mailto:${mail}`} bg={buttonBg} imageStyle={styles.socialLogo} style={styles.socialBtn} /> : null}
          </View>
        )}
      </ScrollView>

      <Modal visible={showSettings} animationType="slide" onRequestClose={() => setShowSettings(false)}>
        <SettingsScreen onClose={() => setShowSettings(false)} />
      </Modal>

      <Modal visible={showWeb} animationType="slide" onRequestClose={() => setShowWeb(false)}>
        <WebScreen url={webUrl} onBack={() => setShowWeb(false)} bgColor={bgColor} textColor={textColor} buttonFocusBorder={buttonFocusBorder} buttonFocusWidth={buttonFocusWidth} />
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 28,
  },
  subtitle: {
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 28,
    fontSize: 16,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 240,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  topButton: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  topButtonInner: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },
  socialBtn: {
    margin: 4,
  },
  socialIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLogo: {
    width: 28,
    height: 28,
  },
});

// FocusableButton and SocialIcon implemented as reusable components in ../components/
