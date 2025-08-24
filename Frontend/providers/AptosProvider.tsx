import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import * as LinkingExpo from 'expo-linking';

// Define the structure of the context
interface AptosContextState {
  aptos: Aptos;
  account: { address: string; publicKey: string } | null;
  isWalletConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signAndSubmitTransaction: (payload: any) => Promise<{ hash: string }>;
}

const AptosContext = createContext<AptosContextState | undefined>(undefined);

export const useAptos = () => {
  const context = useContext(AptosContext);
  if (!context) {
    throw new Error('useAptos must be used within an AptosProvider');
  }
  return context;
};

export function AptosProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<{ address: string; publicKey: string } | null>(null);
  const DAPP_URL = LinkingExpo.createURL('/');
  const PETRA_DEEPLINK = "petra://";

  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);

  // --- Mobile Deep Link Handler ---
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const handleDeepLink = (url: string | null) => {
        if (!url) return;
        try {
          const urlObject = new URL(url);
          const params = urlObject.searchParams;
          if (urlObject.hostname === 'v1' && urlObject.pathname.includes('connect')) {
            const address = params.get('address');
            const publicKey = params.get('publicKey');
            if (address && publicKey) {
              setAccount({ address, publicKey });
              Alert.alert('Success', 'Wallet connected successfully!');
            }
          }
        } catch (error) {
          console.error('Failed to handle deep link:', error);
        }
      };

      const getInitialUrl = async () => {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) handleDeepLink(initialUrl);
      };
      getInitialUrl();

      const subscription = Linking.addEventListener('url', (event) => {
        handleDeepLink(event.url);
      });

      return () => subscription.remove();
    }
  }, []);

  const connectWallet = async () => {
    // --- WEB BROWSER LOGIC ---
    if (Platform.OS === 'web') {
      try {
        // @ts-ignore - Petra injects this into the window object
        if (window.petra) {
          // @ts-ignore
          const response = await window.petra.connect();
          setAccount({
            address: response.address,
            publicKey: response.publicKey,
          });
          Alert.alert('Success', 'Wallet connected!');
        } else {
          Alert.alert('Petra Not Found', 'Please install the Petra Wallet browser extension.');
        }
      } catch (error) {
        console.error('Petra connection error:', error);
      }
    } 
    // --- MOBILE LOGIC ---
    else {
      try {
        const connectUrl = new URL(`${PETRA_DEEPLINK}v1/connect`);
        connectUrl.searchParams.set('dapp_url', DAPP_URL);
        await Linking.openURL(connectUrl.toString());
      } catch (error) {
        Alert.alert('Error', 'Could not open Petra Wallet. This only works in a development build, not Expo Go.');
      }
    }
  };

  const disconnectWallet = async () => {
    if (Platform.OS === 'web') {
      // @ts-ignore
      if (window.petra) {
        // @ts-ignore
        await window.petra.disconnect();
      }
    }
    setAccount(null);
    Alert.alert('Disconnected', 'Wallet has been disconnected.');
  };

  const signAndSubmitTransaction = async (payload: any): Promise<{ hash: string }> => {
    if (!account) throw new Error("Wallet not connected");

    // This part would also need to be adapted for web vs. mobile
    // For now, we continue with the simulation
    console.log("Simulating transaction with payload:", payload);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const simulatedHash = `0x${Math.random().toString(16).slice(2, 66)}`;
    return { hash: simulatedHash };
  };

  const value = { aptos, account, isWalletConnected: !!account, connectWallet, disconnectWallet, signAndSubmitTransaction };

  return <AptosContext.Provider value={value}>{children}</AptosContext.Provider>;
}
