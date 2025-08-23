import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Modal,
  TouchableOpacity 
} from 'react-native';
import { Ticket, QrCode, X } from 'lucide-react-native';
import { WalletButton } from '@/components/WalletButton';
import { LoadingButton } from '@/components/LoadingButton';
import { EventCard } from '@/components/EventCard';
import { TicketCard } from '@/components/TicketCard';
import { useAptos } from '@/providers/AptosProvider';
import QRCode from 'react-native-qrcode-svg';

export default function UserScreen() {
  const { isWalletConnected, signAndSubmitTransaction } = useAptos();
  const [isBuying, setIsBuying] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const [availableEvents] = useState([
    {
      id: '1',
      name: 'Aptos Blockchain Conference',
      date: 'March 15, 2025',
      location: 'San Francisco, CA',
      price: 0.5,
      totalTickets: 100,
      soldTickets: 67,
    },
    {
      id: '3',
      name: 'Web3 Developer Meetup',
      date: 'March 28, 2025',
      location: 'Austin, TX',
      price: 0.2,
      totalTickets: 50,
      soldTickets: 23,
    },
  ]);

  const [ownedTickets, setOwnedTickets] = useState([
    {
      id: '1',
      eventName: 'DeFi Summit 2025',
      date: 'March 22, 2025',
      location: 'New York, NY',
      price: 0.8,
      transactionHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    },
  ]);

  const handleBuyTicket = async (event: any) => {
    setIsBuying(true);

    try {
      const payload = {
        function: `0x123::ticketing::buy_ticket`,
        type_arguments: [],
        arguments: [
          '0x456', // Organizer address (would come from event data)
          event.name,
        ],
      };

      const response = await signAndSubmitTransaction(payload);
      
      const newTicket = {
        id: response.hash.slice(0, 8),
        eventName: event.name,
        date: event.date,
        location: event.location,
        price: event.price,
        transactionHash: response.hash,
      };

      setOwnedTickets(prev => [newTicket, ...prev]);
      Alert.alert('Success', 'Ticket purchased successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to purchase ticket');
    } finally {
      setIsBuying(false);
    }
  };

  const openQRModal = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowQRModal(true);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Event Tickets</Text>
          <Text style={styles.subtitle}>Buy tickets and manage your collection</Text>
        </View>
        <WalletButton />
      </View>

      {isWalletConnected && (
        <>
          {ownedTickets.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Tickets</Text>
                <View style={styles.ticketCount}>
                  <Ticket size={16} color="#6366F1" strokeWidth={2} />
                  <Text style={styles.ticketCountText}>{ownedTickets.length}</Text>
                </View>
              </View>
              {ownedTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onPress={() => openQRModal(ticket)}
                />
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Events</Text>
            {availableEvents.map((event) => (
              <View key={event.id}>
                <EventCard event={event} />
                <View style={styles.buyButtonContainer}>
                  <LoadingButton
                    title={`Buy Ticket - ${event.price} APT`}
                    onPress={() => handleBuyTicket(event)}
                    loading={isBuying}
                    disabled={event.totalTickets === event.soldTickets}
                  />
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {!isWalletConnected && (
        <View style={styles.connectPrompt}>
          <QrCode size={64} color="#6366F1" strokeWidth={1.5} />
          <Text style={styles.connectTitle}>Connect Your Wallet</Text>
          <Text style={styles.connectText}>
            Connect your Petra wallet to buy tickets and access your NFT collection on the Aptos blockchain.
          </Text>
        </View>
      )}

      <Modal
        visible={showQRModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQRModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Event Ticket</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQRModal(false)}>
              <X size={24} color="#64748B" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          {selectedTicket && (
            <View style={styles.modalContent}>
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={selectedTicket.transactionHash}
                  size={250}
                  backgroundColor="#FFFFFF"
                  color="#1E293B"
                />
              </View>
              
              <View style={styles.ticketDetails}>
                <Text style={styles.eventNameLarge}>{selectedTicket.eventName}</Text>
                <Text style={styles.eventDate}>{selectedTicket.date}</Text>
                <Text style={styles.eventLocation}>{selectedTicket.location}</Text>
                
                <View style={styles.verificationInfo}>
                  <Text style={styles.verificationTitle}>Verification Info</Text>
                  <Text style={styles.transactionHash}>
                    TX: {selectedTicket.transactionHash.slice(0, 16)}...
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    margin: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  ticketCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ticketCountText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6366F1',
  },
  buyButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  connectPrompt: {
    margin: 20,
    marginTop: 100,
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    gap: 16,
  },
  connectTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  connectText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    alignItems: 'center',
    padding: 40,
    gap: 32,
  },
  qrCodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  ticketDetails: {
    alignItems: 'center',
    gap: 8,
  },
  eventNameLarge: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  eventDate: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6366F1',
  },
  eventLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  verificationInfo: {
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  verificationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#475569',
  },
  transactionHash: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});