import { Text, type TextProps } from 'react-native';

import { MS } from '@/constants/mindshed';

interface MsTextProps extends TextProps {
  size?: number;
  color?: string;
}

export function Heading({ size = 18, color = MS.color.ink, style, ...rest }: MsTextProps) {
  return (
    <Text
      style={[{ fontFamily: MS.font.heading, fontSize: size, lineHeight: size * 1.2, color }, style]}
      {...rest}
    />
  );
}

export function Display({ size = 24, color = MS.color.ink, style, ...rest }: MsTextProps) {
  return (
    <Text
      style={[{ fontFamily: MS.font.display, fontSize: size, lineHeight: size * 1.25, color }, style]}
      {...rest}
    />
  );
}

export function CharacterText({ size = 14, color = MS.color.ink, style, ...rest }: MsTextProps) {
  return (
    <Text
      style={[{ fontFamily: MS.font.display, fontSize: Math.max(size, 11), lineHeight: Math.max(size, 11) * 1.35, color }, style]}
      {...rest}
    />
  );
}

export function Body({ size = 14, color = MS.color.ink, style, ...rest }: MsTextProps) {
  return (
    <Text
      style={[{ fontFamily: MS.font.body, fontSize: Math.max(size, 10.5), color, lineHeight: Math.max(size, 10.5) * 1.45 }, style]}
      {...rest}
    />
  );
}

export function BodyBold({ size = 14, color = MS.color.ink, style, ...rest }: MsTextProps) {
  return (
    <Text
      style={[{ fontFamily: MS.font.bodyBold, fontSize: Math.max(size, 10), color, lineHeight: Math.max(size, 10) * 1.45 }, style]}
      {...rest}
    />
  );
}
