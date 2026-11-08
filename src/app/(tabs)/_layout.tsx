import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return <Tabs screenOptions={{ tabBarActiveTintColor: '#2563eb', headerTitleStyle: { fontWeight: '700' } }}>
    <Tabs.Screen name="index" options={{ title: 'Reports', tabBarIcon: ({ focused, size }) => <Ionicons name="newspaper-outline" color={focused ? '#2563eb' : '#64748b'} size={size} /> }} />
    <Tabs.Screen name="categories" options={{ title: 'Categories', tabBarIcon: ({ focused, size }) => <Ionicons name="grid-outline" color={focused ? '#2563eb' : '#64748b'} size={size} /> }} />
    <Tabs.Screen name="report" options={{ title: 'Report', tabBarIcon: ({ focused, size }) => <Ionicons name="add-circle-outline" color={focused ? '#2563eb' : '#64748b'} size={size} /> }} />
    <Tabs.Screen name="my-reports" options={{ title: 'My Reports', tabBarIcon: ({ focused, size }) => <Ionicons name="list-outline" color={focused ? '#2563eb' : '#64748b'} size={size} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused, size }) => <Ionicons name="person-outline" color={focused ? '#2563eb' : '#64748b'} size={size} /> }} />
  </Tabs>;
}
