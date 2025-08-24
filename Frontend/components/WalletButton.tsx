import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAptos } from '../providers/AptosProvider'; // Adjust path if needed

export const WalletButton = () => {
  const { isWalletConnected, account, connectWallet, disconnectWallet } = useAptos();

  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  if (isWalletConnected && account) {
    return (
      <TouchableOpacity style={styles.connectedButton} onPress={disconnectWallet}>
        <Text style={styles.connectedButtonText}>{truncateAddress(account.address)}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.connectButton} onPress={connectWallet}>
      <Text style={styles.connectButtonText}>Connect Wallet</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  connectButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  connectedButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  connectedButtonText: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 16,
  },
});
