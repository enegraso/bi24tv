import React, { useState, useRef } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Linking, Modal, ScrollView, Animated, Easing, Platform, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SettingsScreen from '../app/screens/SettingsScreen';
import WebScreen from './WebScreen';

export default function HomeScreen({ onStart, logoUrl, bgColor = '#000', buttonBg = 'rgba(255,255,255,0.08)', textColor = '#fff', slogan = 'Canal de streaming en vivo desde Bragado. Programación local, noticias y entrevistas.', webUrl = 'https://bragadoinforma.com.ar', whatsapp, facebook, instagram, twitter, tiktok, youtube, mail, buttonFocusBorder = '#fff', buttonFocusWidth = 3 }) {
  const source = logoUrl ? { uri: logoUrl } : require('../assets/react-logo.png');

  const containerStyle = [styles.container, { backgroundColor: bgColor }];
  const buttonStyle = [styles.button, { backgroundColor: buttonBg }];
  const textStyle = [styles.buttonText, { color: textColor }];
  const subtitleStyle = [styles.subtitle, { color: textColor }];

  const [showSettings, setShowSettings] = useState(false);
  const [showWeb, setShowWeb] = useState(false);
  const [gearFocused, setGearFocused] = useState(false);
  const [starFocused, setStarFocused] = useState(false);
  const gearAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  return (
    <View style={[containerStyle, { paddingTop: (insets.top || 12) + 40 }]}> 
      <Pressable
        style={[styles.gear, { top: (insets.top || 10) + 8 }]}
        focusable={true}
        accessible={true}
        onFocus={() => { setGearFocused(true); Animated.timing(gearAnim, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(); }}
        onBlur={() => { setGearFocused(false); Animated.timing(gearAnim, { toValue: 0, duration: 120, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(); }}
        onPress={() => setShowSettings(true)}
        accessibilityLabel="Abrir configuración"
      >
        <Animated.View style={[{ transform: [{ scale: gearAnim.interpolate({ inputRange: [0,1], outputRange: [1, 1.06] }) }] }, gearFocused ? { borderWidth: buttonFocusWidth, borderColor: buttonFocusBorder, borderRadius: 8, padding: 6 } : { padding: 6 }] }>
          <Text style={{color:textColor,fontSize:20}}>⚙️</Text>
        </Animated.View>
      </Pressable>

      {!Platform.isTV && (
        <Pressable
          style={[styles.gear, { top: (insets.top || 10) + 48 }]}
          focusable={true}
          accessible={true}
          onFocus={() => { setStarFocused(true); Animated.timing(starAnim, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(); }}
          onBlur={() => { setStarFocused(false); Animated.timing(starAnim, { toValue: 0, duration: 120, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(); }}
          onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.bi24.tv')}
          accessibilityLabel="Calificar app en Play Store"
        >
          <Animated.View style={[{ transform: [{ scale: starAnim.interpolate({ inputRange: [0,1], outputRange: [1, 1.06] }) }] }, starFocused ? { borderWidth: buttonFocusWidth, borderColor: buttonFocusBorder, borderRadius: 8, padding: 6 } : { padding: 6 }] }>
            <Text style={{color:textColor,fontSize:20}}>⭐</Text>
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
            {whatsapp ? <SocialIcon label="w" color="#25D366" url={`https://wa.me/${whatsapp}`} /> : null}
            {facebook ? <SocialIcon label="f" color="#1877F2" url={facebook} /> : null}
            {instagram ? <SocialIcon label="ig" color="#E4405F" url={instagram} /> : null}
            {twitter ? <SocialIcon label="X" color="#000" url={twitter} /> : null}
            {tiktok ? <SocialIcon label="♪" color="#000" url={tiktok} /> : null}
            {youtube ? <SocialIcon label="▶" color="#FF0000" url={youtube} /> : null}
            {mail ? <SocialIcon label="✉" color="#EA4335" url={`mailto:${mail}`} /> : null}
          </View>
        )}
      </ScrollView>

      <Modal visible={showSettings} animationType="slide" onRequestClose={() => setShowSettings(false)}>
        <SettingsScreen onClose={() => setShowSettings(false)} />
      </Modal>

      <Modal visible={showWeb} animationType="slide" onRequestClose={() => setShowWeb(false)}>
        <WebScreen url={webUrl} onBack={() => setShowWeb(false)} bgColor={bgColor} textColor={textColor} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 8,
    minWidth: 220,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  }
  ,
  gear: {
    position: 'absolute',
    right: 10,
    padding: 8,
    zIndex: 10,
    backgroundColor: 'transparent'
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
    marginTop: 16,
  },
  socialBtn: {
    margin: 4,
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

function FocusableButton({ label, onPress, buttonStyle, textStyle, focusBorderColor, focusBorderWidth }) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const onFocus = () => { setFocused(true); Animated.timing(anim, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(); };
  const onBlur = () => { setFocused(false); Animated.timing(anim, { toValue: 0, duration: 120, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(); };
  return (
    <Pressable
      focusable={true}
      onFocus={onFocus}
      onBlur={onBlur}
      onPress={onPress}
    >
      <Animated.View style={[buttonStyle, { transform: [{ scale: anim.interpolate({ inputRange: [0,1], outputRange: [1, 1.04] }) }] }, focused ? { borderWidth: focusBorderWidth, borderColor: focusBorderColor } : null]}>
        <Text style={textStyle}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function SocialIcon({ label, color, url }) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const onFocus = () => { setFocused(true); Animated.timing(anim, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(); };
  const onBlur = () => { setFocused(false); Animated.timing(anim, { toValue: 0, duration: 120, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(); };
  return (
    <Pressable
      focusable={true}
      onFocus={onFocus}
      onBlur={onBlur}
      onPress={() => Linking.openURL(url)}
      style={styles.socialBtn}
    >
      <Animated.View style={[styles.socialIcon, { backgroundColor: color }, { transform: [{ scale: anim.interpolate({ inputRange: [0,1], outputRange: [1, 1.1] }) }] }, focused ? { borderWidth: 3, borderColor: '#fff' } : null]}>
        <Text style={styles.socialLabel}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}
