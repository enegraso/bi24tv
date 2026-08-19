export default {
  expo: {
    name: "Bragado Informa 24 TV",
    slug: "bragado-informa-24-tv",
    version: "1.0.4",
    runtimeVersion: "1.0.0",
    orientation: "default",          // "default" permite rotar en celus y fijar en TVs
    icon: "./assets/icon.png",       // Reemplaza por tu nuevo ícono cuando lo tengas
    scheme: "bi24tv",
    owner: "enegraso",
    userInterfaceStyle: "dark",
    extra: {
      eas: {
        projectId: "9bf10626-fede-43f0-a546-5c477ee1fd63"
      }
    },
    
    // OTA updates activados para buscar actualizaciones en Play Store
    updates: {
      enabled: true,
      checkAutomatically: "ON_LAUNCH",
      fallbackToCacheTimeout: 0
    },
    
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "cover",
      backgroundColor: "#FFFFFF"
    },
    
    // Configuración obligatoria para Android Celulares y Android TV
    android: {
      package: "com.bi24.tv",        // ID de paquete único
      versionCode: 5,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
      supportsPictureInPicture: true,
      resizeableActivity: true,
      // Required for Android 13+ to request runtime notification permission
      permissions: ["POST_NOTIFICATIONS"],
    },

    // Plugins de Expo
    plugins: [
      [
        "@react-native-tvos/config-tv",
        {
          androidTVBanner: "./assets/bannertvplay.png"
        }
      ],
      "./plugins/fix-microphone",
      "./plugins/fix-tv-manifest",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#FFFFFF"
        }
      ],
      [
        "expo-video",
        {
          supportsBackgroundPlayback: true,
          supportsPictureInPicture: true
        }
      ],
      "./plugins/with-file-provider",
    ],

    /* COMENTADO: NO SE CONTEMPLA IOS POR EL MOMENTO
    ios: {
      bundleIdentifier: "com.bi24.tv",
      supportsTablet: true
    }
    */
    assetBundlePatterns: ["**/*"],
    androidStatusBar: {
      translucent: true,
      backgroundColor: "#000000"
    },
  }
};

