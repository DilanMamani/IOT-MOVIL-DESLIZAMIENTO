import { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const TRACK_WIDTH = 46;
const TRACK_HEIGHT = 26;
const THUMB_SIZE = 22;
const THUMB_MARGIN = 2;

export function ToggleSwitch({ value, onValueChange }: ToggleSwitchProps) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#DFCBA0", "#84592B"],
  });

  const thumbTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [THUMB_MARGIN, TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN],
  });

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: trackColor,
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: "#FFFFFF",
            transform: [{ translateX: thumbTranslate }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}