import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { WorldTabIcon } from '@/components/ms/world-tab-icon';
import { MS } from '@/constants/mindshed';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FAF0D5',
          borderTopWidth: 1,
          borderTopColor: `${MS.color.forest}14`,
          height: Platform.OS === 'ios' ? 80 : 68,
          paddingTop: 7,
          paddingBottom: Platform.OS === 'ios' ? 8 : 6,
          shadowColor: MS.color.shadow,
          shadowOpacity: 0.03,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        },
        tabBarIconStyle: { height: 30 },
        tabBarItemStyle: { paddingVertical: 1 },
        tabBarActiveTintColor: MS.color.forest,
        tabBarInactiveTintColor: '#7A8077',
        tabBarLabelStyle: { fontFamily: MS.font.bodyBold, fontSize: 10 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <WorldTabIcon name="shed" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Wellbeing',
          tabBarIcon: ({ focused }) => <WorldTabIcon name="wellbeing" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="places"
        options={{
          title: 'Places',
          tabBarIcon: ({ focused }) => <WorldTabIcon name="gate" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <WorldTabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
