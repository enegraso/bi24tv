import React, { useRef, useState } from 'react';
import { Pressable, Animated, Text, Easing } from 'react-native';

export default function FocusableButton({
  label,
  onPress,
  buttonStyle,
  textStyle,
  focusBorderColor = '#ffffff',
  focusBorderWidth = 3,
}) {
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
          focused ? { borderWidth: focusBorderWidth, borderColor: focusBorderColor } : null,
        ]}
      >
        <Text style={textStyle}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}
