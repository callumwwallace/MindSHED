import Feather from '@expo/vector-icons/Feather';
import { Pressable, Switch, View } from 'react-native';

import { MS } from '@/constants/mindshed';
import { Body, BodyBold } from './text';

export function SettingsRow({
  icon,
  title,
  detail,
  onPress,
  danger = false,
  value,
  onValueChange,
  last = false,
}: {
  icon: string;
  title: string;
  detail?: string;
  onPress?: () => void;
  danger?: boolean;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  last?: boolean;
}) {
  const toggle = typeof value === 'boolean' && !!onValueChange;
  return (
    <View>
      <Pressable
        onPress={toggle ? () => onValueChange(!value) : onPress}
        disabled={!onPress && !toggle}
        accessibilityRole={toggle ? 'switch' : onPress ? 'button' : undefined}
        accessibilityLabel={title}
        accessibilityHint={detail}
        accessibilityState={toggle ? { checked: value } : undefined}
        style={({ pressed }) => ({
          minHeight: 66,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 11,
          opacity: pressed ? 0.62 : 1,
        })}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          backgroundColor: danger ? '#F8DFD7' : MS.color.sageSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Feather name={icon as never} size={17} color={danger ? MS.color.danger : MS.color.forest} />
        </View>
        <View style={{ flex: 1 }}>
          <BodyBold size={13} color={danger ? MS.color.danger : MS.color.inkSoft}>{title}</BodyBold>
          {!!detail && <Body size={10.5} color={MS.color.muted} style={{ marginTop: 1 }}>{detail}</Body>}
        </View>
        {toggle ? (
          <Switch
            value={value}
            pointerEvents="none"
            accessible={false}
            trackColor={{ false: '#D9D8CC', true: MS.color.sage }}
            thumbColor={value ? MS.color.forest : MS.color.surface}
          />
        ) : onPress ? (
          <Feather name="chevron-right" size={17} color={MS.color.faint} />
        ) : null}
      </Pressable>
      {!last && <View style={{ height: 1, backgroundColor: `${MS.color.ink}0D`, marginLeft: 52 }} />}
    </View>
  );
}
