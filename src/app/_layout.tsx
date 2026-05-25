import {
  Krub_400Regular,
  Krub_700Bold,
  useFonts,
} from "@expo-google-fonts/krub";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Krub_400Regular,
    Krub_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [fontsLoaded]);
 
  if (!fontsLoaded) {
    return null;
  }
  //------------------------------------
 
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#302b63",
        },
        headerTitleStyle: {
          fontFamily: "Krub_400Regular",
          fontSize: 20,
          color: "#fff",
        },
        headerTitleAlign: "center",
        headerTintColor: "#fff",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="income" options={{ headerShown: false }} />
      <Stack.Screen name="expense" options={{ headerShown: false }} />
    </Stack>
  );
}