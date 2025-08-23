// import { useEffect } from 'react';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useFrameworkReady } from '@/hooks/useFrameworkReady';
// import { useFonts } from 'expo-font';
// import {
//   Inter_400Regular,
//   Inter_500Medium,
//   Inter_600SemiBold,
//   Inter_700Bold,
// } from '@expo-google-fonts/inter';
// import * as SplashScreen from 'expo-splash-screen';
// import { AptosProvider } from '@/providers/AptosProvider';

// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   useFrameworkReady();

//   const [fontsLoaded] = useFonts({
//     'Inter-Regular': Inter_400Regular,
//     'Inter-Medium': Inter_500Medium,
//     'Inter-SemiBold': Inter_600SemiBold,
//     'Inter-Bold': Inter_700Bold,
//   });

//   useEffect(() => {
//     if (fontsLoaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [fontsLoaded]);

//   if (!fontsLoaded) {
//     return null;
//   }

//   return (
//     <AptosProvider>
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="EventDetailScreen" options={{ title: 'Event Details' }} />
//         <Stack.Screen name="ScannerScreen" options={{ title: 'Scan Ticket', presentation: 'modal' }} />
//         <Stack.Screen name="(tabs)" />
//         <Stack.Screen name="+not-found" />
//       </Stack>
//       <StatusBar style="auto" />
//     </AptosProvider>
//   );
// }

// In app/_layout.tsx
import { Stack } from 'expo-router';
// Make sure this path is correct for your project
import { AptosProvider } from '../providers/AptosProvider'; 

// This component defines the navigation structure
function RootLayoutNav() {
  return (
    <Stack>
      {/* The (tabs) directory is treated as a single screen group */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* These are the screens that can be navigated to from the tabs */}
      <Stack.Screen 
        name="EventDetailScreen" 
        options={{ title: 'Event Details' }} 
      />
      <Stack.Screen 
        name="ScannerScreen" 
        options={{ title: 'Scan Ticket', presentation: 'modal' }} 
      />
    </Stack>
  );
}

// This is the main export. The Provider wraps the entire app navigation.
export default function RootLayout() {
  return (
    <AptosProvider>
      <RootLayoutNav />
    </AptosProvider>
  );
}