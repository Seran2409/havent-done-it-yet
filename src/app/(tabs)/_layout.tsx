import { Slot } from 'expo-router';
import { View } from 'react-native';
import { TabBar, TopBar } from '../../features/shell/Shell';
import { lastTouch } from '../../ui/overlays';

export default function TabsLayout() {
  return (
    <View
      style={{ flex: 1 }}
      onTouchStart={(e) => {
        lastTouch.x = e.nativeEvent.pageX;
        lastTouch.y = e.nativeEvent.pageY;
      }}
    >
      <Slot />
      <TopBar />
      <TabBar />
    </View>
  );
}
