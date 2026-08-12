# Bragado Informa 24 TV

App de streaming en vivo para Android y Android TV del canal local **Bragado Informa 24**.

## Características

- **Streaming en vivo** — Reproducción de HLS (m3u8) a pantalla completa
- **Android TV + Google TV** — Navegación con control remoto, banner para el launcher, soporte D-pad
- **Notificaciones push** — Categorías "Portal" (noticias) y "Programación" (agenda)
- **Configuración remota** — Tema, logo, stream y redes sociales se actualizan sin necesidad de nueva build
- **OTA Updates** — Actualizaciones automáticas vía Expo Updates
- **WebView integrado** — Navegación al sitio oficial sin salir de la app
- **Rate App** — Botón para calificar en Google Play Store (solo móviles)

## Stack tecnológico

| Tecnología | Versión |
|---|---|
| React Native | 0.81.5 |
| Expo SDK | 54 |
| expo-av | ^16.0.8 |
| expo-notifications | ~0.32.17 |
| react-native-webview | 13.15.0 |
| @react-native-tvos/config-tv | ^0.1.4 |

## Instalación

```bash
git clone https://github.com/enegraso/bi24tv.git
cd bi24tv
npm install
```

### Archivos necesarios (no incluidos en el repo)

- `google-services.json` — Configuración de Firebase (raíz del proyecto)

### Desarrollo

```bash
npm start          # Expo dev server
npm run android    # Ejecutar en dispositivo/emulador
```

## Build profiles (EAS)

| Perfil | Comando | Descripción |
|---|---|---|
| `preview` | `eas build -p android --profile preview` | APK para testing |
| `production` | `eas build -p android --profile production` | Build producción (móvil) |
| `production_tv` | `eas build -p android --profile production_tv` | Build producción (Android TV) |

### Auto-incremento de versión

```bash
npm run version:bump    # Incrementa versión en app.config.js
npm run build:android   # Bump + build producción TV
npm run build:preview   # Bump + build preview
```

## Configuración remota

La app carga configuración desde:
```
https://sib-2000.com.ar/bi24tv-app/config.txt
```

Campos disponibles: `logoUrl`, `streamUrl`, `bgColor`, `buttonBg`, `textColor`, `slogan`, `webUrl`, `whatsapp`, `facebook`, `instagram`, `twitter`, `tiktok`, `youtube`, `mail`, `buttonFocusBorder`, `buttonFocusWidth`.

## Admin Panel (PHP)

Panel de administración en `admin/` para gestionar notificaciones push y configuración remota.

Archivos principales:
- `index.php` — Login y dashboard
- `send_notification.php` — Envío de notificaciones
- `register_token.php` — Registro de tokens (público)
- `edit_config.php` — Editor de configuración remota

Deploy por SFTP a `sib-2000.com.ar/bi24tv-app/`.

## Estructura del proyecto

```
bi24tv/
├── app.config.js          # Configuración Expo
├── eas.json               # Perfiles de build EAS
├── assets/                # Iconos, splash, logos sociales
├── screens/
│   ├── HomeScreen.js      # Pantalla principal
│   ├── PlayerScreen.js    # Reproductor de video
│   ├── WebScreen.js       # WebView integrado
│   └── SettingsScreen.js  # Configuración de notificaciones
├── plugins/               # Config plugins Expo (TV manifest)
├── admin/                 # Panel PHP de administración
└── google-services.json   # Firebase (gitignored)
```

## Google Play Store

[Instalar desde Google Play](https://play.google.com/store/apps/details?id=com.bi24.tv)

## Licencia

Privada — Bragado Informa 24
