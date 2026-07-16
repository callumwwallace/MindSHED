import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';

import { MS } from '@/constants/mindshed';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 46,
        height: 30,
        backgroundColor: focused ? MS.color.sageSoft : 'transparent',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Feather name={name as never} size={18} color={focused ? MS.color.forest : MS.color.faint} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: MS.color.surface,
          borderTopWidth: 1,
          borderTopColor: `${MS.color.ink}18`,
          height: Platform.OS === 'ios' ? 82 : 70,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 8 : 6,
          shadowColor: MS.color.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        },
        tabBarIconStyle: { height: 32 },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarActiveTintColor: MS.color.forest,
        tabBarInactiveTintColor: MS.color.faint,
        tabBarLabelStyle: { fontFamily: MS.font.bodyBold, fontSize: 10.5 },
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
          title: 'Wellbeing',
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
