import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import {
  useFonts,
  LexendDeca_300Light,
  LexendDeca_400Regular,
  LexendDeca_500Medium,
  LexendDeca_600SemiBold,
  LexendDeca_700Bold,
  LexendDeca_800ExtraBold,
  LexendDeca_900Black,
} from '@expo-google-fonts/lexend-deca';

// Providers
import { ToastProvider } from './src/store/ToastContext';
import { AuthProvider } from './src/store/AuthContext';
import { AddressProvider } from './src/store/AddressContext';
import { PrescriptionProvider } from './src/store/PrescriptionContext';
import { CartProvider } from './src/store/CartContext';
import { OfferProvider } from './src/store/OfferContext';
import { OrderProvider } from './src/store/OrderContext';

// Navigation
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    LexendDeca_300Light,
    LexendDeca_400Regular,
    LexendDeca_500Medium,
    LexendDeca_600SemiBold,
    LexendDeca_700Bold,
    LexendDeca_800ExtraBold,
    LexendDeca_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A2986" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ToastProvider>
          <AuthProvider>
            <AddressProvider>
              <PrescriptionProvider>
                <CartProvider>
                  <OfferProvider>
                    <OrderProvider>
                      <StatusBar style="dark" />
                      <RootNavigator />
                    </OrderProvider>
                  </OfferProvider>
                </CartProvider>
              </PrescriptionProvider>
            </AddressProvider>
          </AuthProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
