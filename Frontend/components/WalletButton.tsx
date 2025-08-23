import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Wallet, LogOut } from 'lucide-react-native';
import { useAptos } from '@/providers/AptosProvider';

export function WalletButton() {
  const { isWalletConnected, walletAddress, connectWallet, disconnectWallet } = useAptos();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isWalletConnected) {
    return (
      <TouchableOpacity style={styles.connectButton} onPress={connectWallet}>
        <Wallet size={20} color="#FFFFFF" strokeWidth={2} />
        <Text style={styles.connectButtonText}>Connect Wallet</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.connectedContainer}>
      <View style={styles.addressContainer}>
        <View style={styles.statusDot} />
        <Text style={styles.addressText}>
          {walletAddress ? truncateAddress(walletAddress) : 'Connected'}
        </Text>
      </View>
      <TouchableOpacity style={styles.disconnectButton} onPress={disconnectWallet}>
        <LogOut size={16} color="#64748B" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#475569',
  },
  disconnectButton: {
    padding: 4,
  },
});