import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform
} from 'react-native';
import { Ticket, QrCode, X, Search, ArrowUp, ArrowDown } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';

// --- Mock Components & Hooks (Replace with your actual imports) ---

const WalletButton = () => <TouchableOpacity style={styles.mockButton}><Text style={styles.mockButtonText}>Wallet</Text></TouchableOpacity>;
const LoadingButton: React.FC<{ title: string; onPress: () => void; loading: boolean, disabled?: boolean }> = ({ title, onPress, loading, disabled }) => (
  <TouchableOpacity onPress={onPress} style={[styles.mockButton, { backgroundColor: '#6366F1' }, disabled && styles.disabledButton]} disabled={loading || disabled}>
    <Text style={[styles.mockButtonText, { color: '#FFF' }]}>{loading ? 'Processing...' : title}</Text>
  </TouchableOpacity>
);
const EventCard: React.FC<{ event: any }> = ({ event }) => (
    <View style={styles.eventCardContainer}>
        <Text style={styles.eventCardTitle}>{event.name}</Text>
        <Text style={styles.eventCardSubtitle}>{event.date} - {event.location}</Text>
    </View>
);
const TicketCard: React.FC<{ ticket: any, onPress: () => void }> = ({ ticket, onPress }) => (
    <TouchableOpacity style={styles.ticketCardContainer} onPress={onPress}>
        <View>
            <Text style={styles.eventCardTitle}>{ticket.eventName}</Text>
            <Text style={styles.eventCardSubtitle}>{ticket.date} - {ticket.location}</Text>
        </View>
        <QrCode color="#6366F1" size={24} />
    </TouchableOpacity>
);
const useAptos = () => ({
    isWalletConnected: true,
    signAndSubmitTransaction: async (payload: any): Promise<{ hash: string }> => {
        console.log("Simulating transaction:", payload);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { hash: Math.random().toString(36).substring(2, 15) };
    }
});

// --- Main Component ---

type SortOption = 'date' | 'price';

export default function UserScreen() {
  const { isWalletConnected, signAndSubmitTransaction } = useAptos();
  
  // State for modals and interactions
  const [isBuying, setIsBuying] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [eventToBuy, setEventToBuy] = useState<any>(null);

  // State for booking details in the modal
  const [ticketQuantity, setTicketQuantity] = useState('1');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');

  // State for search and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date');

  const [availableEvents] = useState([
    { id: '1', name: 'Aptos Blockchain Conference', date: '2025-03-15', location: 'San Francisco, CA', price: 0.5, totalTickets: 100, soldTickets: 67 },
    { id: '3', name: 'Web3 Developer Meetup', date: '2025-03-28', location: 'Austin, TX', price: 0.2, totalTickets: 50, soldTickets: 23 },
    { id: '4', name: 'Crypto Art Gala', date: '2025-04-05', location: 'Miami, FL', price: 1.2, totalTickets: 75, soldTickets: 70 },
  ]);

  const [ownedTickets, setOwnedTickets] = useState([
    { id: 't1', eventName: 'DeFi Summit 2025', date: 'March 22, 2025', location: 'New York, NY', price: 0.8, transactionHash: '0xa1b2c3d4e5f6' },
  ]);

  // Derived state for filtered and sorted events
  const filteredAndSortedEvents = useMemo(() => {
    return availableEvents
      .filter(event => event.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortOption === 'price') {
          return a.price - b.price;
        }
        // Default to sorting by date
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [availableEvents, searchQuery, sortOption]);

  const handleOpenBuyModal = (event: any) => {
    setEventToBuy(event);
    setShowBuyModal(true);
    // Reset form
    setTicketQuantity('1');
    setBuyerName('');
    setBuyerEmail('');
  };

  const handleBuyTicket = async () => {
    if (!eventToBuy || !ticketQuantity || parseInt(ticketQuantity, 10) <= 0) {
        Alert.alert('Error', 'Please enter a valid number of tickets.');
        return;
    }
    
    setIsBuying(true);

    try {
      const payload = {
        function: `0x123::ticketing::buy_ticket`,
        type_arguments: [],
        arguments: [ '0x456', eventToBuy.name, parseInt(ticketQuantity, 10) ],
      };

      const response = await signAndSubmitTransaction(payload);
      
      const newTicket = {
        id: response.hash,
        eventName: eventToBuy.name,
        date: new Date(eventToBuy.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        location: eventToBuy.location,
        price: eventToBuy.price,
        transactionHash: response.hash,
      };

      setOwnedTickets(prev => [newTicket, ...prev]);
      setShowBuyModal(false);
      Alert.alert('Success', `Successfully purchased ${ticketQuantity} ticket(s)!`);
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

  const handleQuantityChange = (text: string) => {
    const num = parseInt(text, 10);
    if (text === '' || (num > 0 && num <= 5)) {
        setTicketQuantity(text);
    } else if (num > 5) {
        setTicketQuantity('5');
    }
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
                <View style={styles.ticketCount}><Ticket size={16} color="#6366F1" /><Text style={styles.ticketCountText}>{ownedTickets.length}</Text></View>
              </View>
              {ownedTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onPress={() => openQRModal(ticket)} />)}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Events</Text>
            
            {/* Search and Filter UI */}
            <View style={styles.filterContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color="#94A3B8" />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search events..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <View style={styles.sortButtons}>
                    <TouchableOpacity style={[styles.sortButton, sortOption === 'date' && styles.sortButtonActive]} onPress={() => setSortOption('date')}>
                        <Text style={[styles.sortButtonText, sortOption === 'date' && styles.sortButtonTextActive]}>By Date</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.sortButton, sortOption === 'price' && styles.sortButtonActive]} onPress={() => setSortOption('price')}>
                        <Text style={[styles.sortButtonText, sortOption === 'price' && styles.sortButtonTextActive]}>By Price</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {filteredAndSortedEvents.map((event) => (
              <View key={event.id} style={styles.eventItemContainer}>
                <EventCard event={event} />
                <View style={styles.buyButtonContainer}>
                  <LoadingButton
                    title={`Buy Ticket - ${event.price} APT`}
                    onPress={() => handleOpenBuyModal(event)}
                    loading={false} // Loading is handled in modal
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
          <Text style={styles.connectText}>Connect your wallet to buy tickets.</Text>
        </View>
      )}

      {/* QR Code Display Modal */}
      <Modal visible={showQRModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowQRModal(false)}>
        {/* ... (existing QR modal code is unchanged) ... */}
      </Modal>

      {/* Buy Ticket Modal */}
      <Modal visible={showBuyModal} animationType="slide" transparent={true} onRequestClose={() => setShowBuyModal(false)}>
        <View style={styles.modalBackdrop}>
            <View style={styles.buyModalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Buy Ticket</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setShowBuyModal(false)}><X size={24} color="#64748B" /></TouchableOpacity>
                </View>
                {eventToBuy && (
                    <View style={styles.buyModalContent}>
                        <Text style={styles.eventNameLarge}>{eventToBuy.name}</Text>
                        <Text style={styles.eventDate}>{new Date(eventToBuy.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {eventToBuy.location}</Text>
                        
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Number of Tickets (Max 5)</Text>
                            <TextInput 
                                style={styles.input}
                                value={ticketQuantity}
                                onChangeText={handleQuantityChange}
                                keyboardType="number-pad"
                                placeholder="1"
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput style={styles.input} value={buyerName} onChangeText={setBuyerName} placeholder="John Doe" />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput style={styles.input} value={buyerEmail} onChangeText={setBuyerEmail} keyboardType="email-address" placeholder="you@example.com" />
                        </View>

                        <View style={styles.priceSummary}>
                            <Text style={styles.priceLabel}>Total Price</Text>
                            <Text style={styles.priceValue}>
                                {(eventToBuy.price * (parseInt(ticketQuantity, 10) || 0)).toFixed(2)} APT
                            </Text>
                        </View>

                        <LoadingButton
                            title="Confirm Purchase"
                            onPress={handleBuyTicket}
                            loading={isBuying}
                        />
                    </View>
                )}
            </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 4 },
  section: { marginHorizontal: 20, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  ticketCount: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  ticketCountText: { fontSize: 14, fontWeight: '600', color: '#6366F1' },
  filterContainer: { marginBottom: 20, gap: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, height: 44, fontSize: 16, marginLeft: 8, color: '#1E293B' },
  sortButtons: { flexDirection: 'row', gap: 8 },
  sortButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  sortButtonActive: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  sortButtonText: { fontWeight: '600', color: '#475569' },
  sortButtonTextActive: { color: '#6366F1' },
  eventItemContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  buyButtonContainer: { padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  connectPrompt: { margin: 20, marginTop: 100, alignItems: 'center', padding: 40, backgroundColor: '#FFFFFF', borderRadius: 20, gap: 16 },
  connectTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  connectText: { fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  buyModalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingTop: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  closeButton: { padding: 8 },
  buyModalContent: { gap: 16 },
  eventNameLarge: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
  eventDate: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 16 },
  formGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155' },
  input: { backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, fontSize: 16, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  priceSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingVertical: 8 },
  priceLabel: { fontSize: 16, fontWeight: '500', color: '#475569' },
  priceValue: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  // Mock and Card Styles
  mockButton: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  mockButtonText: { fontWeight: '600' },
  disabledButton: { backgroundColor: '#CBD5E1' },
  eventCardContainer: { padding: 16 },
  eventCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  eventCardSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  ticketCardContainer: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
});
