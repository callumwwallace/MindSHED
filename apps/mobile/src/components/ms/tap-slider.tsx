import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { MS } from '@/constants/mindshed';

interface TapSliderProps {
  value: number; // 0–10
  onChange: (v: number) => void;
  fillColor?: string;
}

// Shell-phase slider: tap (or tap-drag) anywhere on the track to set 0–10.
export function TapSlider({ value, onChange, fillColor = MS.color.mint }: TapSliderProps) {
  const [width, setWidth] = useState(0);
  const pct = Math.max(0, Math.min(1, value / 10));

  return (
    <Pressable
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onPress={(e) => {
        if (width > 0) {
          onChange(Math.round((e.nativeEvent.locationX / width) * 10));
        }
      }}
      hitSlop={{ top: 10, bottom: 10 }}
      style={{
        height: 16,
        borderRadius: 9,
        borderWidth: MS.border,
        borderColor: MS.color.ink,
        backgroundColor: MS.color.white,
        justifyContent: 'center',
      }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${pct * 100}%`,
          backgroundColor: fillColor,
          borderTopLeftRadius: 6,
          borderBottomLeftRadius: 6,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: `${pct * 88}%`,
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: MS.border,
          borderColor: MS.color.ink,
          backgroundColor: MS.color.white,
        }}
      />
    </Pressable>
  );
}
