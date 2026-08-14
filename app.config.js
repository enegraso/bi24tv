export default {
  expo: {
    name: "Bragado Informa 24 TV",
    slug: "bragado-informa-24-tv",
    version: "1.0.1",               // Iniciamos en versión 1.0.0
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
      checkAutomatically: "ON_LAUNCH"
    },
    
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "cover",
      backgroundColor: "#FFFFFF"
    },
    
    // Configuración obligatoria para Android Celulares y Android TV
    android: {
      package: "com.bi24.tv",        // Tu nuevo ID de paquete único
      versionCode: 2,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
      tvBanner: "./assets/icon.png",
      // Mantenemos la compatibilidad nativa con controles de Smart TV
      intentFilters: [
        {
          action: "MAIN",
          category: ["LEANBACK_LAUNCHER", "LAUNCHER"]
        }
      ],
    },

    // Plugins de Expo
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#FFFFFF"
        }
      ],
      "./plugins/with-file-provider"
    ],

    /* COMENTADO: NO SE CONTEMPLA IOS POR EL MOMENTO
    ios: {
      bundleIdentifier: "com.bi24.tv",
      supportsTablet: true
    }
    */
  }
};

