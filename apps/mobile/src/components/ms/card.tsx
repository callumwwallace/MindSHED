import { View, type ViewProps } from 'react-native';

import { MS } from '@/constants/mindshed';

interface CardProps extends ViewProps {
  color?: string;
  radius?: number;
  padding?: number;
}

export function Card({
  color = MS.color.white,
  radius = MS.radius.lg,
  padding = MS.space.lg,
  style,
  ...rest
}: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: color,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: `${MS.color.ink}1F`,
          padding,
        },
        style,
      ]}
      {...rest}
    />
  );
}
