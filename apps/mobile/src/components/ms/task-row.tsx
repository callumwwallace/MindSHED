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
  onRemove?: () => void;
}

export function TaskRow({ title, icon, color, done, onToggle, onRemove }: TaskRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 12,
        paddingHorizontal: 2,
      }}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityLabel={title}
        accessibilityHint={done ? 'Marks this as not complete' : 'Marks this as complete'}
        accessibilityState={{ checked: done }}
        style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: MS.space.md, opacity: pressed ? 0.64 : 1 })}>
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}><Feather name={icon as never} size={16} color={MS.color.inkSoft} /></View>
        <BodyBold size={13} color={done ? MS.color.faint : MS.color.inkSoft} style={{ flex: 1, textDecorationLine: done ? 'line-through' : 'none' }}>{title}</BodyBold>
        <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: done ? MS.color.forest : `${MS.color.ink}55`, backgroundColor: done ? MS.color.mint : MS.color.surface, alignItems: 'center', justifyContent: 'center' }}>{done && <Feather name="check" size={14} color={MS.color.forest} />}</View>
      </Pressable>
      {!!onRemove && <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remove ${title} from today's plan`} hitSlop={5} style={({ pressed }) => ({ width: 38, height: 38, marginLeft: 3, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}><Feather name="x" size={15} color={MS.color.faint} /></Pressable>}
    </View>
  );
}
