import { useRef } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Rive, { Fit, type RiveRef } from 'rive-react-native';

// Rive-powered animation surface. Until the real Bramble rig (bramble.riv,
// built in the Rive editor per docs/BRAMBLE-RIG.md) exists, this renders any
// .riv by URL — used by the pipeline test screen. Once bramble.riv lands,
// the Bramble component switches from the SVG placeholder to this.
interface RiveBoxProps {
  url: string;
  stateMachineName?: string;
  artboardName?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function RiveBox({ url, stateMachineName, artboardName, height = 260, style }: RiveBoxProps) {
  const riveRef = useRef<RiveRef>(null);
  return (
    <View style={[{ height, width: '100%' }, style]}>
      <Rive
        ref={riveRef}
        url={url}
        artboardName={artboardName}
        stateMachineName={stateMachineName}
        autoplay
        fit={Fit.Contain}
        style={{ flex: 1 }}
      />
    </View>
  );
}
