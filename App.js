import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, StatusBar, Platform, AppState, Alert, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
// Use expo-av player in a dedicated PlayerScreen for compatibility with Expo Go
import * as Application from 'expo-application';

import AsyncStorage from '@react-native-async-storage/async-storage';

// ───────────── Config ─────────────
const DEFAULT_STREAM_URL = 'https://vivo.solumedia.com:19360/bi24/bi24.m3u8';

import { getConfig } from './services/remoteConfig';

import HomeScreen from './screens/HomeScreen';
import PlayerScreen from './screens/PlayerScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { checkForApkUpdate } from './services/checkUpdate';
import UpdateModal from './components/UpdateModal';

export default function App() {
  const isTV = Platform.isTV;
  const appState = useRef(AppState.currentState);
  const [streamUrl, setStreamUrl] = useState(DEFAULT_STREAM_URL);
  const [logoUrl, setLogoUrl] = useState(null);
  const [bgColor, setBgColor] = useState('#000000');
  const [buttonBg, setButtonBg] = useState('rgba(255,255,255,0.08)');
  const [textColor, setTextColor] = useState('#ffffff');
  const [slogan, setSlogan] = useState('Canal de streaming en vivo desde Bragado...');
  const [webUrl, setWebUrl] = useState('https://bragadoinforma.com.ar');
  const [whatsapp, setWhatsapp] = useState(null);
  const [facebook, setFacebook] = useState(null);
  const [instagram, setInstagram] = useState(null);
  const [twitter, setTwitter] = useState(null);
  const [tiktok, setTiktok] = useState(null);
  const [youtube, setYoutube] = useState(null);
  const [mail, setMail] = useState(null);
  const [buttonFocusBorder, setButtonFocusBorder] = useState('#ffffff');
  const [buttonFocusWidth, setButtonFocusWidth] = useState(3);
  const [showHome, setShowHome] = useState(true);
  const [apkUpdate, setApkUpdate] = useState(null);

  // Note: the original implementation used expo-video's native player.
  // For Expo Go compatibility we render a separate expo-av based PlayerScreen.

  // ───────────── Config loader (reusable) ─────────────
  async function loadConfig() {
    try {
      const cfg = await getConfig();
      if (cfg?.stream) setStreamUrl(cfg.stream);
      if (cfg?.logo) setLogoUrl(cfg.logo);
      if (cfg?.fondo) setBgColor(cfg.fondo);
      if (cfg?.botonfondo) setButtonBg(cfg.botonfondo);
      if (cfg?.colorletras) setTextColor(cfg.colorletras);
      if (cfg?.slogan) setSlogan(cfg.slogan);
      if (cfg?.web_url) setWebUrl(cfg.web_url);
      if (cfg?.whatsapp) setWhatsapp(cfg.whatsapp);
      if (cfg?.facebook) setFacebook(cfg.facebook);
      if (cfg?.instagram) setInstagram(cfg.instagram);
      if (cfg?.twitter) setTwitter(cfg.twitter);
      if (cfg?.tiktok) setTiktok(cfg.tiktok);
      if (cfg?.youtube) setYoutube(cfg.youtube);
      if (cfg?.mail) setMail(cfg.mail);
      if (cfg?.boton_border) setButtonFocusBorder(cfg.boton_border);
      if (cfg?.boton_border_width) setButtonFocusWidth(parseInt(cfg.boton_border_width,10) || 3);
    } catch (e) {
      console.log('Config remota no disponible, usando default');
    }
  }

  // ───────────── Init: remote config ─────────────
  useEffect(() => {
    loadConfig();

    // Check for APK update (only on sideloaded installs)
    checkForApkUpdate().then((update) => {
      if (update) setApkUpdate(update);
    });

    // Request notification permission on first app start (one-time prompt)
    (async () => {
      try {
        const asked = await AsyncStorage.getItem('NOTIF_PROMPTED_V1');
        if (!asked) {
          const perm = await Notifications.getPermissionsAsync();
          if (perm.status !== 'granted') {
            await Notifications.requestPermissionsAsync();
          }
          await AsyncStorage.setItem('NOTIF_PROMPTED_V1', '1');
        }
      } catch (e) {
        console.log('error requesting notif perm on start', e);
      }
    })();
  }, []);

  // ───────────── Refresh config when returning to HomeScreen ─────────────
  useEffect(() => {
    if (showHome) loadConfig();
  }, [showHome]);

  // Notification handlers: foreground display via an Alert/modal and response handling
  useEffect(() => {
    // Configure handler so system notifications don't auto-show while app is foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowAlert: false, shouldPlaySound: true, shouldSetBadge: false }),
    });

    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      // Received in foreground. We avoid showing an in-app Alert here so the system
      // notification UI can display the notification (configured via setNotificationHandler).
      try {
        console.log('Notification received (foreground):', notification.request.content);
      } catch (e) {
        console.log('notification received handler error', e);
      }
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const data = response.notification.request.content.data || {};
        if (data.url) {
          Linking.openURL(data.url).catch(() => {});
        } else if (data.type === 'programacion') {
          // Navigate to the player (Live) when a "programacion" notification is tapped.
          // If the notification provides a stream URL, use it; otherwise use the current streamUrl.
          try {
            if (data.stream) setStreamUrl(data.stream);
          } catch (e) {}
          setShowHome(false);
        }
      } catch (e) {
        console.log('notification response handler error', e);
      }
    });

    return () => {
      try { receivedSub && receivedSub.remove && receivedSub.remove(); } catch (e) {}
      try { responseSub && responseSub.remove && responseSub.remove(); } catch (e) {}
    };
  }, []);

  // ───────────── AppState handling ─────────────
  // The PlayerScreen will manage playback lifecycle when active. No global player here.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  // ───────────── Render ─────────────
  return (
    <>
    <SafeAreaProvider>
      {showHome ? (
        <HomeScreen
          onStart={() => setShowHome(false)}
          logoUrl={logoUrl}
          bgColor={bgColor}
          buttonBg={buttonBg}
          textColor={textColor}
          slogan={slogan}
          webUrl={webUrl}
          whatsapp={whatsapp}
          facebook={facebook}
          instagram={instagram}
          twitter={twitter}
          tiktok={tiktok}
          youtube={youtube}
          mail={mail}
          buttonFocusBorder={buttonFocusBorder}
          buttonFocusWidth={buttonFocusWidth}
        />
      ) : (
        <PlayerScreen streamUrl={streamUrl} onBack={() => setShowHome(true)} bgColor={bgColor} buttonBg={buttonBg} textColor={textColor} slogan={slogan} buttonFocusBorder={buttonFocusBorder} buttonFocusWidth={buttonFocusWidth} />
      )}
    </SafeAreaProvider>

    <UpdateModal
      visible={!!apkUpdate}
      version={apkUpdate?.version}
      apkUrl={apkUpdate?.apkUrl}
      changelog={apkUpdate?.changelog}
      onClose={() => setApkUpdate(null)}
    />
    </>
  );
}

// ───────────── Styles ─────────────
const styles = StyleSheet.create({
  tvContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  tvVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  mobileVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
});
