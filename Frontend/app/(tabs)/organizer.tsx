import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { TrendingUp, Users, DollarSign, Calendar, Clock, Link } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// --- Core Imports ---
import { useAptos } from '../../providers/AptosProvider'; // Adjust path
import { WalletButton } from '../../components/WalletButton'; // Adjust path

// --- Type Definitions ---
interface Event {
  id: string;
  name: string;
  eventDateTimeISO: string; 
  date: string;
  time: string;
  location: string;
  price: number;
  totalTickets: number;
  soldTickets: number;
  checkedInAttendees: string[];
  imageUrl: string;
}

// --- Mock Components (keep if you don't have real ones yet) ---
const LoadingButton: React.FC<{ title: string; onPress: () => void; loading: boolean }> = ({ title, onPress, loading }) => (
  <TouchableOpacity onPress={onPress} style={[styles.mockButton, { backgroundColor: '#6366F1' }]} disabled={loading}>
    <Text style={[styles.mockButtonText, { color: '#FFF' }]}>{loading ? 'Creating...' : title}</Text>
  </TouchableOpacity>
);
const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <View style={styles.eventCardContainer}>
        <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
        <View style={styles.eventDetails}>
            <Text style={styles.eventCardTitle}>{event.name}</Text>
            <Text style={styles.eventCardSubtitle}>{event.date} at {event.time}</Text>
            <Text style={styles.eventCardSubtitle}>{event.location}</Text>
            <View style={styles.eventCardStats}>
                <Text style={styles.eventCardPrice}>{event.price} APT</Text>
                <Text style={styles.eventCardTickets}>{event.soldTickets} / {event.totalTickets} Sold</Text>
            </View>
             {event.soldTickets >= event.totalTickets && (<View style={styles.soldOutBadge}><Text style={styles.soldOutText}>SOLD OUT</Text></View>)}
        </View>
    </View>
);

// --- Main Component ---
export default function OrganizerScreen() {
  const { isWalletConnected, signAndSubmitTransaction } = useAptos();
  
  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [createdEvents, setCreatedEvents] = useState<Event[]>([
    { id: '1', name: 'Aptos Blockchain Conference', eventDateTimeISO: new Date('2025-03-15T10:00:00').toISOString(), date: 'March 15, 2025', time: '10:00 AM', location: 'San Francisco, CA', price: 0.5, totalTickets: 100, soldTickets: 67, checkedInAttendees: ['user1', 'user2'], imageUrl: 'https://placehold.co/800x400/6366f1/ffffff?text=Blockchain+Conf' },
    { id: '2', name: 'DeFi Summit 2025', eventDateTimeISO: new Date('2025-08-24T03:00:00').toISOString(), date: 'August 24, 2025', time: '03:00 AM', location: 'New York, NY', price: 0.8, totalTickets: 150, soldTickets: 150, checkedInAttendees: [], imageUrl: 'https://placehold.co/800x400/10b981/ffffff?text=DeFi+Summit' },
  ]);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const onChangeTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowTimePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleCreateEvent = async () => {
    if (!eventName || !eventLocation || !ticketPrice || !totalTickets || !imageUrl) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsCreating(true);
    try {
      const payload = { function: `0x123::ticketing::create_event`, type_arguments: [], arguments: [ eventName, date.toISOString(), parseFloat(ticketPrice), parseInt(totalTickets), imageUrl ] };
      const response = await signAndSubmitTransaction(payload);
      const newEvent: Event = { id: response.hash, name: eventName, eventDateTimeISO: date.toISOString(), date: date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }), time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }), location: eventLocation, price: parseFloat(ticketPrice), totalTickets: parseInt(totalTickets), soldTickets: 0, checkedInAttendees: [], imageUrl: imageUrl };
      setCreatedEvents(prev => [newEvent, ...prev]);
      setEventName(''); setEventLocation(''); setTicketPrice(''); setTotalTickets(''); setImageUrl(''); setDate(new Date());
      Alert.alert('Success', 'Event created successfully!');
    } catch (error) {
      console.error(error);
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

      {/* --- VALIDATION LOGIC --- */}
      {isWalletConnected ? (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}><TrendingUp size={24} color="#6366F1" /><Text style={styles.statValue}>{totalRevenue.toFixed(2)} APT</Text><Text style={styles.statLabel}>Total Revenue</Text></View>
            <View style={styles.statCard}><Users size={24} color="#10B981" /><Text style={styles.statValue}>{totalSoldTickets}</Text><Text style={styles.statLabel}>Tickets Sold</Text></View>
            <View style={styles.statCard}><DollarSign size={24} color="#F59E0B" /><Text style={styles.statValue}>{createdEvents.length}</Text><Text style={styles.statLabel}>Events Created</Text></View>
          </View>

          <View style={styles.createEventSection}>
            <Text style={styles.sectionTitle}>Create New Event</Text>
            <View style={styles.form}>
              <TextInput style={styles.input} placeholder="Event Name" value={eventName} onChangeText={setEventName} />
              <TextInput style={styles.input} placeholder="Location" value={eventLocation} onChangeText={setEventLocation} />
              <TextInput style={styles.input} placeholder="Event Image URL" value={imageUrl} onChangeText={setImageUrl} />
              <View style={styles.dateTimePickerContainer}>
                  <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}><Calendar size={20} color="#64748B"/><Text style={styles.pickerText}>{date.toLocaleDateString()}</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}><Clock size={20} color="#64748B"/><Text style={styles.pickerText}>{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text></TouchableOpacity>
              </View>
              {showDatePicker && (<DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />)}
              {showTimePicker && (<DateTimePicker value={date} mode="time" display="default" onChange={onChangeTime} />)}
              <TextInput style={styles.input} placeholder="Ticket Price (APT)" value={ticketPrice} onChangeText={setTicketPrice} keyboardType="decimal-pad" />
              <TextInput style={styles.input} placeholder="Total Tickets" value={totalTickets} onChangeText={setTotalTickets} keyboardType="number-pad" />
              <LoadingButton title="Create Event" onPress={handleCreateEvent} loading={isCreating} />
            </View>
          </View>

          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Your Events</Text>
            {createdEvents.map((event) => (
              <TouchableOpacity key={event.id} onPress={() => router.push({ pathname: '/EventDetailScreen', params: { eventId: event.id, events: JSON.stringify(createdEvents) }})}>
                <EventCard event={event} />
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.connectPrompt}>
          <Link size={64} color="#6366F1" strokeWidth={1.5} />
          <Text style={styles.connectTitle}>Connect Your Wallet</Text>
          <Text style={styles.connectText}>Please connect your Petra wallet to create and manage events.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 4 },
  statsContainer: { flexDirection: 'row', gap: 12, padding: 20 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#64748B', textAlign: 'center' },
  createEventSection: { padding: 20, paddingTop: 0 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  form: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  input: { backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, fontSize: 16, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  dateTimePickerContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  pickerButton: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  pickerText: { fontSize: 16, color: '#1E293B' },
  eventsSection: { padding: 20, paddingTop: 0 },
  connectPrompt: { margin: 20, marginTop: 100, alignItems: 'center', padding: 40, backgroundColor: '#FFFFFF', borderRadius: 20, gap: 16 },
  connectTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  connectText: { fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24 },
  mockButton: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  mockButtonText: { fontWeight: '600', color: '#FFF' },
  eventCardContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, overflow: 'hidden' },
  eventImage: { width: '100%', height: 150, backgroundColor: '#E2E8F0' },
  eventDetails: { padding: 16 },
  eventCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  eventCardSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  eventCardStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  eventCardPrice: { fontSize: 16, fontWeight: '600', color: '#10B981' },
  eventCardTickets: { fontSize: 14, color: '#64748B' },
  soldOutBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(239, 68, 68, 0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  soldOutText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
});
