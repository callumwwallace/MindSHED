import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { MS } from '@/constants/mindshed';

interface TapSliderProps {
  value: number; // 0–10
  onChange: (v: number) => void;
  fillColor?: string;
  label?: string;
}

// Shell-phase slider: tap (or tap-drag) anywhere on the track to set 0–10.
export function TapSlider({ value, onChange, fillColor = MS.color.mint, label = 'Value' }: TapSliderProps) {
  const [width, setWidth] = useState(0);
  const pct = Math.max(0, Math.min(1, value / 10));
  const updateAt = (locationX: number) => {
    if (width > 0) onChange(Math.max(0, Math.min(10, Math.round((locationX / width) * 10))));
  };

  return (
    <Pressable
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 10, now: value, text: `${value} out of 10` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'increment') onChange(Math.min(10, value + 1));
        if (event.nativeEvent.actionName === 'decrement') onChange(Math.max(0, value - 1));
      }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onPress={(e) => updateAt(e.nativeEvent.locationX)}
      onTouchMove={(e) => updateAt(e.nativeEvent.locationX)}
      style={{
        height: 44,
        justifyContent: 'center',
      }}>
      <View
        style={{
          height: 12,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: `${MS.color.ink}44`,
          backgroundColor: MS.color.surfaceWarm,
          overflow: 'hidden',
        }}>
        <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: fillColor }} />
      </View>
      <View
        style={{
          position: 'absolute',
          left: Math.max(0, Math.min(width - 26, pct * width - 13)),
          top: 9,
          width: 26,
          height: 26,
          borderRadius: 13,
          borderWidth: MS.border,
          borderColor: MS.color.forest,
          backgroundColor: MS.color.surface,
          shadowColor: MS.color.shadow,
          shadowOpacity: 0.14,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      />
    </Pressable>
  );
}
