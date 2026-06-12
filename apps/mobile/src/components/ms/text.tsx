import { Text, type TextProps } from 'react-native';

import { MS } from '@/constants/mindshed';

interface MsTextProps extends TextProps {
  size?: number;
  color?: string;
}

export function Heading({ size = 18, color = MS.color.ink, style, ...rest }: MsTextProps) {
  return (
    <Text
      style={[{ fontFamily: MS.font.display, fontSize: size, color }, style]}
      {...rest}
    />
  );
}

export function Body({ size = 14, color = MS.color.ink, style, ...rest }: MsTextProps) {
  return (
    <Text
      style={[{ fontFamily: MS.font.body, fontSize: size, color, lineHeight: size * 1.45 }, style]}
      {...rest}
    />
  );
}

export function BodyBold({ size = 14, color = MS.color.ink, style, ...rest }: MsTextProps) {
  return (
    <Text
      style={[{ fontFamily: MS.font.bodyBold, fontSize: size, color, lineHeight: size * 1.45 }, style]}
      {...rest}
    />
  );
}
