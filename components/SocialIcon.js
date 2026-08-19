import React, { useRef, useState } from 'react';
import { Pressable, Animated, Image, Easing } from 'react-native';

export default function SocialIcon({ icon, url, bg, onPress, style, imageStyle }) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const onFocus = () => { setFocused(true); Animated.timing(anim, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(); };
  const onBlur = () => { setFocused(false); Animated.timing(anim, { toValue: 0, duration: 120, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(); };

  const handlePress = () => {
    if (onPress) return onPress();
    try { url && (require('react-native').Linking.openURL(url)); } catch (e) {}
  };

  return (
    <Pressable focusable={true} onFocus={onFocus} onBlur={onBlur} onPress={handlePress} style={style}>
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, { transform: [{ scale: anim.interpolate({ inputRange: [0,1], outputRange: [1,1.1] }) }] }, focused ? { borderWidth: 3, borderColor: '#fff' } : null, { backgroundColor: bg }] }>
        <Image source={icon} style={imageStyle} resizeMode="contain" />
      </Animated.View>
    </Pressable>
  );
}
