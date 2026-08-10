export default {
  expo: {
    name: "Bragado Informa 24 TV",
    slug: "bragado-informa-24-tv",
    version: "1.0.0",               // Iniciamos en versión 1.0.0
    orientation: "default",          // "default" permite rotar en celus y fijar en TVs
    icon: "./assets/icon.png",       // Reemplaza por tu nuevo ícono cuando lo tengas
    scheme: "bi24tv",
    userInterfaceStyle: "dark",
    
    splash: {
      image: "./assets/splash.png",  // Reemplaza por tu nueva pantalla de carga
      resizeMode: "contain",
      backgroundColor: "#050505"
    },
    
    // Configuración obligatoria para Android Celulares y Android TV
    android: {
      package: "com.bi24.tv",        // Tu nuevo ID de paquete único
      versionCode: 1,
      intentFilters: [],
      // Mantenemos la compatibilidad nativa con controles de Smart TV
      intentFilters: [
        {
          action: "MAIN",
          category: ["LEANBACK_LAUNCHER", "LAUNCHER"] // Permite que aparezca en el menú de Android TV
        }
      ],
      /* COMENTADO HASTA TENER EL ARCHIVO DE FIREBASE
      googleServicesFile: "./google-services.json"
      */
    },

    /* COMENTADO: NO SE CONTEMPLA IOS POR EL MOMENTO
    ios: {
      bundleIdentifier: "com.bi24.tv",
      supportsTablet: true
    }
    */
  }
};

