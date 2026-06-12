import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { MS } from '@/constants/mindshed';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View
      style={{
        backgroundColor: focused ? MS.color.mint : 'transparent',
        borderWidth: focused ? MS.border : 0,
        borderColor: MS.color.ink,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 3,
      }}>
      <Feather name={name as never} size={19} color={focused ? MS.color.ink : MS.color.faint} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: MS.color.white,
          borderTopWidth: MS.border,
          borderTopColor: MS.color.ink,
          height: 86,
          paddingTop: 6,
        },
        tabBarActiveTintColor: MS.color.ink,
        tabBarInactiveTintColor: MS.color.faint,
        tabBarLabelStyle: { fontFamily: MS.font.bodyBold, fontSize: 11 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ focused }) => <TabIcon name="trending-up" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="places"
        options={{
          title: 'Places',
          tabBarIcon: ({ focused }) => <TabIcon name="map-pin" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
