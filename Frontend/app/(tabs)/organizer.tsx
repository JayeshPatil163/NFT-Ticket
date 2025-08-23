import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { Plus, TrendingUp, Users, DollarSign } from 'lucide-react-native';
import { WalletButton } from '@/components/WalletButton';
import { LoadingButton } from '@/components/LoadingButton';
import { EventCard } from '@/components/EventCard';
import { useAptos } from '@/providers/AptosProvider';

export default function OrganizerScreen() {
  const { isWalletConnected, signAndSubmitTransaction } = useAptos();
  const [isCreating, setIsCreating] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  
  const [createdEvents, setCreatedEvents] = useState([
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
      id: '2',
      name: 'DeFi Summit 2025',
      date: 'March 22, 2025',
      location: 'New York, NY',
      price: 0.8,
      totalTickets: 150,
      soldTickets: 150,
    },
  ]);

  const handleCreateEvent = async () => {
    if (!eventName || !eventDate || !eventLocation || !ticketPrice || !totalTickets) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsCreating(true);

    try {
      const payload = {
        function: `0x123::ticketing::create_event`,
        type_arguments: [],
        arguments: [
          eventName,
          parseFloat(ticketPrice),
          parseInt(totalTickets),
        ],
      };

      const response = await signAndSubmitTransaction(payload);
      
      const newEvent = {
        id: response.hash.slice(0, 8),
        name: eventName,
        date: eventDate,
        location: eventLocation,
        price: parseFloat(ticketPrice),
        totalTickets: parseInt(totalTickets),
        soldTickets: 0,
      };

      setCreatedEvents(prev => [newEvent, ...prev]);
      
      // Reset form
      setEventName('');
      setEventDate('');
      setEventLocation('');
      setTicketPrice('');
      setTotalTickets('');

      Alert.alert('Success', 'Event created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  const totalRevenue = createdEvents.reduce((sum, event) => sum + (event.price * event.soldTickets), 0);
  const totalSoldTickets = createdEvents.reduce((sum, event) => sum + event.soldTickets, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Event Organizer</Text>
          <Text style={styles.subtitle}>Create and manage your events</Text>
        </View>
        <WalletButton />
      </View>

      {isWalletConnected && (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#6366F1" strokeWidth={2} />
              <Text style={styles.statValue}>{totalRevenue.toFixed(2)} APT</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
            <View style={styles.statCard}>
              <Users size={24} color="#10B981" strokeWidth={2} />
              <Text style={styles.statValue}>{totalSoldTickets}</Text>
              <Text style={styles.statLabel}>Tickets Sold</Text>
            </View>
            <View style={styles.statCard}>
              <DollarSign size={24} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.statValue}>{createdEvents.length}</Text>
              <Text style={styles.statLabel}>Events Created</Text>
            </View>
          </View>

          <View style={styles.createEventSection}>
            <Text style={styles.sectionTitle}>Create New Event</Text>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Event Name"
                value={eventName}
                onChangeText={setEventName}
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={styles.input}
                placeholder="Date (e.g., March 15, 2025)"
                value={eventDate}
                onChangeText={setEventDate}
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                value={eventLocation}
                onChangeText={setEventLocation}
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={styles.input}
                placeholder="Ticket Price (APT)"
                value={ticketPrice}
                onChangeText={setTicketPrice}
                keyboardType="decimal-pad"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={styles.input}
                placeholder="Total Tickets"
                value={totalTickets}
                onChangeText={setTotalTickets}
                keyboardType="number-pad"
                placeholderTextColor="#94A3B8"
              />
              <LoadingButton
                title="Create Event"
                onPress={handleCreateEvent}
                loading={isCreating}
                style={styles.createButton}
              />
            </View>
          </View>

          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Your Events</Text>
            {createdEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="organizer"
              />
            ))}
          </View>
        </>
      )}

      {!isWalletConnected && (
        <View style={styles.connectPrompt}>
          <Text style={styles.connectTitle}>Connect Your Wallet</Text>
          <Text style={styles.connectText}>
            Connect your Petra wallet to start creating events and managing tickets on the Aptos blockchain.
          </Text>
        </View>
      )}
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  createEventSection: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  createButton: {
    marginTop: 8,
  },
  eventsSection: {
    margin: 20,
    marginTop: 0,
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
  },
  connectTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  connectText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});