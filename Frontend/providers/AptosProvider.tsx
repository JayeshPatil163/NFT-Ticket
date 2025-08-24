import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Linking } from 'react-native';
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

// Create the context
const AptosContext = createContext<AptosContextState | undefined>(undefined);

// Custom hook to use the context
export const useAptos = () => {
  const context = useContext(AptosContext);
  if (!context) {
    throw new Error('useAptos must be used within an AptosProvider');
  }
  return context;
};

// The provider component
export function AptosProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<{ address: string; publicKey: string } | null>(null);
  const DAPP_URL = LinkingExpo.createURL('/'); // Deep link back to your app
  const PETRA_DEEPLINK = "petra://";

  // Initialize Aptos client
  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);

  // Function to handle parsing the URL from Petra
  const handleDeepLink = (url: string | null) => {
    if (!url) return;
    try {
      const urlObject = new URL(url);
      const params = urlObject.searchParams;
      
      // Petra wallet sends back data in a 'data' parameter for connect
      if (urlObject.hostname === 'v1' && urlObject.pathname.includes('connect')) {
        const address = params.get('address');
        const publicKey = params.get('publicKey');
        
        if (address && publicKey) {
          setAccount({ address, publicKey });
          Alert.alert('Success', 'Wallet connected successfully!');
        }
      }
      // You can add handlers for other methods like 'signAndSubmitTransaction' here
      // which might use a different structure.
    } catch (error) {
      console.error('Failed to handle deep link:', error);
      Alert.alert('Error', 'Failed to process wallet response.');
    }
  };

  // --- FIX APPLIED HERE ---
  useEffect(() => {
    // 1. Handle the initial URL that the app was opened with
    const getInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };
    getInitialUrl();

    // 2. Listen for subsequent URLs that come in while the app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Cleanup listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  const connectWallet = async () => {
    try {
      // Construct the connection request URL for Petra
      const connectUrl = new URL(`${PETRA_DEEPLINK}v1/connect`);
      connectUrl.searchParams.set('dapp_url', DAPP_URL);
      
      // Check if Petra is installed
      const canOpen = await Linking.canOpenURL(PETRA_DEEPLINK);
      if (!canOpen) {
          throw new Error("Petra wallet is not installed.");
      }
      
      await Linking.openURL(connectUrl.toString());
    } catch (error) {
      console.error('Failed to open Petra Wallet:', error);
      Alert.alert('Error', 'Could not open Petra Wallet. Please ensure it is installed on your device.');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    Alert.alert('Disconnected', 'Wallet has been disconnected.');
  };

  const signAndSubmitTransaction = async (payload: any): Promise<{ hash: string }> => {
    if (!account) {
      throw new Error("Wallet not connected");
    }
    console.log("Simulating transaction with payload:", payload);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const simulatedHash = `0x${Math.random().toString(16).slice(2, 66)}`;
    return { hash: simulatedHash };
  };

  const value = {
    aptos,
    account,
    isWalletConnected: !!account,
    connectWallet,
    disconnectWallet,
    signAndSubmitTransaction,
  };

  return <AptosContext.Provider value={value}>{children}</AptosContext.Provider>;
}
