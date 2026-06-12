import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';

import { MS } from '@/constants/mindshed';
import { BodyBold } from './text';

interface TaskRowProps {
  title: string;
  icon: string;
  color: string;
  done: boolean;
  onToggle: () => void;
}

export function TaskRow({ title, icon, color, done, onToggle }: TaskRowProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: MS.space.md,
        backgroundColor: color,
        borderRadius: MS.radius.lg,
        borderWidth: MS.border,
        borderColor: MS.color.ink,
        paddingVertical: 12,
        paddingHorizontal: 14,
      }}>
      <Feather name={icon as never} size={18} color={MS.color.ink} />
      <BodyBold size={14} style={{ flex: 1, opacity: done ? 0.55 : 1 }}>
        {title}
      </BodyBold>
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          borderWidth: MS.border,
          borderColor: MS.color.ink,
          backgroundColor: MS.color.white,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {done && <Feather name="check" size={17} color={MS.color.ink} />}
      </View>
    </Pressable>
  );
}
