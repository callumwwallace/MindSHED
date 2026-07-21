import { Ellipse } from 'react-native-svg';

interface GroundShadowProps {
  cx: number;
  cy: number;
  rx: number;
  ry?: number;
  opacity?: number;
  rotate?: number;
}

/** Shared contact shadow for objects drawn inside an SVG scene. */
export function GroundShadow({
  cx,
  cy,
  rx,
  ry = Math.max(5, rx * 0.14),
  opacity = 0.2,
  rotate = 0,
}: GroundShadowProps) {
  return (
    <Ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="#294A40"
      opacity={opacity}
      transform={rotate ? `rotate(${rotate} ${cx} ${cy})` : undefined}
      pointerEvents="none"
    />
  );
}
