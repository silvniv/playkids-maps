import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  return (
    <Tabs initialRouteName="map" screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: "Parquinhos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Salvos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Conta",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="index" options={{ href: null, title: "Início" }} />
      <Tabs.Screen name="place/[id]" options={{ href: null, title: "Detalhes" }} />
      <Tabs.Screen name="review/[placeId]" options={{ href: null, title: "Avaliar" }} />
      <Tabs.Screen name="report/[placeId]" options={{ href: null, title: "Relatar problema" }} />
    </Tabs>
  );
}
