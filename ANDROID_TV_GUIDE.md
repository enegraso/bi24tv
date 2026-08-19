# Especificación de Compatibilidad con Android TV (Guía de Refactorización)

> **Destinatario:** Agentes de IA / LLMs (OpenCode, GPT-5, etc.)  
> **Objetivo:** Refactorizar el código de React Native / Expo de este proyecto para garantizar la compatibilidad con Android TV y lograr la aprobación automática en Google Play Console, alineándolo con el estándar funcional del proyecto base (`App_2.js`, `HomeScreen_2.js`, `PlayerScreen_2.js`).

---

## 1. Diagnóstico del Problema

El proyecto actual genera un archivo AAB válido pero es **excluido de Android TV por Google Play Console** debido a tres fallas críticas de UX/UI en entorno TV:

1. **Incompatibilidad de Foco con Control Remoto (D-Pad):** Existen componentes navegables (`TouchableOpacity`, `Pressable`) que carecen de la propiedad `focusable={true}` o de retroalimentación visual al recibir foco (`onFocus`/`onBlur`).
2. **Falta de Adaptación de Interfaz para TV (`Platform.isTV`):** En TV no se deben mostrar filas complejas de botones sociales no optimizados; se debe presentar una interfaz limpia con acciones claras y navegables.
3. **Bloqueo en Pantallas Secundarias (Web/Player):** Pantallas como `WebScreen` o los menús de reintento en `PlayerScreen` no permiten regresar o reintentar mediante las flechas del control remoto.

---

## 2. Reglas de Implementación y Estándar Integrado

### A. Patrón de Botón Enfocable (`FocusableButton`)
Todos los elementos interactivos de la aplicación deben utilizar un componente customizado de botón enfocable que aplique transformación y borde resaltado al recibir el foco del D-Pad.

```javascript
function FocusableButton({ label, onPress, buttonStyle, textStyle, focusBorderColor = '#ffffff', focusBorderWidth = 3 }) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(anim, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  };

  const onBlur = () => {
    setFocused(false);
    Animated.timing(anim, { toValue: 0, duration: 120, easing: Easing.in(Easing.ease), useNativeDriver: true }).start();
  };

  return (
    <Pressable
      focusable={true}
      onFocus={onFocus}
      onBlur={onBlur}
      onPress={onPress}
    >
      <Animated.View
        style={[
          buttonStyle,
          { transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }] },
          focused ? { borderWidth: focusBorderWidth, borderColor: focusBorderColor } : null
        ]}
      >
        <Text style={textStyle}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}
```

---

### B. Adaptación de Interfaz en `HomeScreen`

1. **Pantalla TV vs. Móvil:**
   - En modo **TV** (`Platform.isTV === true`), ocultar la fila de redes sociales y mostrar el botón principal de salida: **`CERRAR`** que ejecuta `BackHandler.exitApp()`.
   - En modo **Móvil**, renderizar la fila de iconos de redes sociales y los accesos rápidos superiores (Estrella/Salir).

2. **Estructura de `HomeScreen`:**
   ```javascript
   {/* Botón principal de acción */}
   <FocusableButton 
     label="VER EN VIVO" 
     onPress={onStart} 
     buttonStyle={[buttonStyle, styles.buttonLarge]} 
     textStyle={textStyle} 
     focusBorderColor={buttonFocusBorder} 
     focusBorderWidth={buttonFocusWidth} 
   />

   {/* Botón de navegación web */}
   <FocusableButton 
     label="WEB OFICIAL" 
     onPress={() => setShowWeb(true)} 
     buttonStyle={[buttonStyle, styles.buttonLarge]} 
     textStyle={textStyle} 
     focusBorderColor={buttonFocusBorder} 
     focusBorderWidth={buttonFocusWidth} 
   />

   {/* Condicional de interfaz TV vs Celular */}
   {Platform.isTV ? (
     <FocusableButton 
       label="CERRAR" 
       onPress={() => BackHandler.exitApp()} 
       buttonStyle={[buttonStyle, styles.buttonLarge]} 
       textStyle={textStyle} 
       focusBorderColor={buttonFocusBorder} 
       focusBorderWidth={buttonFocusWidth} 
     />
   ) : (
     <View style={styles.socialRow}>
       {/* Iconos de redes sociales adaptados */}
     </View>
   )}
   ```

---

### C. Navegación e Historial en `PlayerScreen` y Modales

1. **Captura del Botón Físico "Atrás" (`BackHandler`):**
   Garantizar que en todas las pantallas secundarias y modales se capture el evento físico de retroceso para volver a la pantalla principal o cerrar la app sin congelar la interfaz.

   ```javascript
   useEffect(() => {
     const onHardwareBack = () => {
       if (onBack) {
         try { onBack(); } catch (e) {}
         return true;
       }
       return false;
     };
     const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
     return () => sub?.remove();
   }, [onBack]);
   ```

2. **Botón de Reintento Enfocable en Reproductor:**
   En caso de error en el streaming, el botón `REINTENTAR` dentro de `PlayerScreen` debe implementarse con `Pressable` y `focusable={true}`.

---

### D. Optimización de Iconos de Redes Sociales

Para la versión móvil, los iconos de redes sociales deben envolverse individualmente en componentes enfocables para no romper la navegación si se usa emulador o dispositivo híbrido:

```javascript
function SocialIcon({ icon, url, bg }) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  return (
    <Pressable 
      focusable={true} 
      onFocus={() => setFocused(true)} 
      onBlur={() => setFocused(false)} 
      onPress={() => Linking.openURL(url)} 
      style={styles.socialBtn}
    >
      <Animated.View 
        style={[
          styles.socialIcon, 
          { backgroundColor: bg }, 
          focused ? { borderWidth: 3, borderColor: '#ffffff' } : null
        ]}
      >
        <Image source={icon} style={styles.socialLogo} resizeMode="contain" />
      </Animated.View>
    </Pressable>
  );
}
```

---

## 3. Plan de Acción para la Refactorización

1. **Revisar `HomeScreen`:** Implementar `FocusableButton`, condicionar la renderización de redes sociales vs. botón `CERRAR` con `Platform.isTV`, y ajustar los margenes y dimensiones de logo para TV.
2. **Revisar `PlayerScreen`:** Asegurar el control de `KeepAwake`, el manejo de `BackHandler` y verificar que la superposición de error contenga un botón de reintento enfocado.
3. **Revisar `WebScreen` / Modal Web:** Reemplazar cualquier `TouchableOpacity` por componentes con estado de foco D-Pad y manejo de navegación hacia atrás con el control remoto.
4. **Verificación de Borde de Foco Configurable:** Mantener las variables `buttonFocusBorder` y `buttonFocusWidth` provenientes del remote config para permitir personalización del resaltado de foco.
