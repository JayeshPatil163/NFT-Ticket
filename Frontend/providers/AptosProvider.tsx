import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

interface AptosContextType {
  aptos: Aptos;
  isWalletConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signAndSubmitTransaction: (payload: any) => Promise<any>;
}

const AptosContext = createContext<AptosContextType | undefined>(undefined);

const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);

export function AptosProvider({ children }: { children: ReactNode }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      // Mock wallet connection for demo purposes
      const mockAddress = '0x' + Math.random().toString(16).substring(2, 42).padStart(40, '0');
      setWalletAddress(mockAddress);
      setIsWalletConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsWalletConnected(false);
  };

  const signAndSubmitTransaction = async (payload: any) => {
    // Mock transaction submission for demo
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockHash = '0x' + Math.random().toString(16).substring(2, 66);
        resolve({ hash: mockHash });
      }, 1500);
    });
  };

  return (
    <AptosContext.Provider
      value={{
        aptos,
        isWalletConnected,
        walletAddress,
        connectWallet,
        disconnectWallet,
        signAndSubmitTransaction,
      }}>
      {children}
    </AptosContext.Provider>
  );
}

export function useAptos() {
  const context = useContext(AptosContext);
  if (context === undefined) {
    throw new Error('useAptos must be used within an AptosProvider');
  }
  return context;
}