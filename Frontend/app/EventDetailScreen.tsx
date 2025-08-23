import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { Calendar, Clock, Ticket, Barcode, CheckCircle, XCircle, DollarSign } from 'lucide-react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';

// --- Type Definitions ---

interface Event {
  id: string;
  name: string;
  // Store the primary date object as an ISO string for reliability
  eventDateTimeISO: string; 
  // Keep human-readable versions for display
  date: string;
  time: string;
  location: string;
  price: number;
  totalTickets: number;
  soldTickets: number;
  checkedInAttendees: string[];
  imageUrl: string;
}

// --- Main Component ---

export default function EventDetailScreen() {
    const params = useLocalSearchParams<{ eventId: string, events: string, scannedData?: string }>();
    
    const events: Event[] = useMemo(() => {
        try {
            return params.events ? JSON.parse(params.events) : [];
        } catch (e) {
            console.error("Failed to parse events JSON string:", e);
            return [];
        }
    }, [params.events]);

    const event = events.find(e => e.id === params.eventId);
    
    const [isCheckInActive, setIsCheckInActive] = useState(false);
    const [checkedInList, setCheckedInList] = useState(event?.checkedInAttendees || []);

    const isCheckInAvailable = () => {
        if (!event || !event.eventDateTimeISO) return false;
        try {
            // --- FIX: Always parse from the reliable ISO string ---
            const eventDateTime = new Date(event.eventDateTimeISO);
            
            // This check is now much more reliable
            if (isNaN(eventDateTime.getTime())) {
                console.error("Invalid ISO date format for event:", event.name);
                return false;
            }

            const now = new Date();
            const twelveHours = 12 * 60 * 60 * 1000;
            const endTime = new Date(eventDateTime.getTime() + twelveHours);
            
            return now >= eventDateTime && now <= endTime;
        } catch (error) {
            console.error("Error parsing date:", error);
            return false;
        }
    };

    if (params.scannedData) {
        // Handle scanned data logic if needed
    }

    if (!event) {
        return (
            <View style={styles.container}><Text style={styles.errorText}>Event not found.</Text></View>
        );
    }

    const revenue = (event.price * event.soldTickets).toFixed(2);

    return (
        <>
            <Stack.Screen options={{ title: "Event Details" }} />
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Image source={{ uri: event.imageUrl }} style={styles.headerImage} />
                    <View style={styles.headerOverlay} />
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Text style={styles.eventLocation}>{event.location}</Text>
                </View>

                <View style={styles.detailsSection}>
                    {/* Displaying the human-readable date and time */}
                    <DetailRow icon={Calendar} label="Date" value={event.date} />
                    <DetailRow icon={Clock} label="Time" value={event.time} />
                    <DetailRow icon={Ticket} label="Tickets Sold" value={`${event.soldTickets} / ${event.totalTickets}`} />
                    <DetailRow icon={DollarSign} label="Revenue" value={`${revenue} APT`} />
                </View>
                
                <View style={styles.checkInSection}>
                    <Text style={styles.sectionTitle}>Check-in Management</Text>
                    {isCheckInAvailable() ? (
                        !isCheckInActive ? (
                            <TouchableOpacity style={styles.checkInButton} onPress={() => setIsCheckInActive(true)}>
                                <Barcode color="#FFFFFF" size={20} /><Text style={styles.checkInButtonText}>Start Check-in</Text>
                            </TouchableOpacity>
                        ) : (
                            <View>
                                <TouchableOpacity style={[styles.checkInButton, styles.scanButton]} onPress={() => router.push('/ScannerScreen')}>
                                    <Barcode color="#FFFFFF" size={20} /><Text style={styles.checkInButtonText}>Scan Ticket QR Code</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.checkInButton, styles.closeButton]} onPress={() => setIsCheckInActive(false)}>
                                    <XCircle color="#FFFFFF" size={20} /><Text style={styles.checkInButtonText}>Close Check-in</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    ) : (
                        <View style={styles.checkInDisabled}><Text style={styles.checkInDisabledText}>Check-in will be available on the event date.</Text></View>
                    )}
                </View>

                <View style={styles.attendeesSection}>
                    <Text style={styles.sectionTitle}>Checked-in Attendees ({checkedInList.length})</Text>
                    {checkedInList.length > 0 ? (
                        checkedInList.map((ticketId, index) => (
                            <View key={index} style={styles.attendeeRow}>
                                <CheckCircle color="#10B981" size={18} /><Text style={styles.attendeeText}>Ticket ID: {ticketId}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noAttendeesText}>No attendees have checked in yet.</Text>
                    )}
                </View>
            </ScrollView>
        </>
    );
}

const DetailRow: React.FC<{ icon: React.ElementType, label: string, value: string }> = ({ icon: Icon, label, value }) => (
    <View style={styles.detailRow}><Icon color="#64748B" size={20} style={styles.detailIcon} /><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { backgroundColor: '#000', height: 200, justifyContent: 'flex-end', padding: 24, paddingTop: Platform.OS === 'android' ? 50 : 70 },
    headerImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
    headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    eventName: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 },
    eventLocation: { fontSize: 16, color: '#FFFFFF', marginTop: 4, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 },
    detailsSection: { margin: 20, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
    detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    detailIcon: { marginRight: 16 },
    detailLabel: { fontSize: 16, color: '#334155', flex: 1 },
    detailValue: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
    checkInSection: { marginHorizontal: 20, marginBottom: 20 },
    checkInButton: { backgroundColor: '#6366F1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
    checkInButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    scanButton: { backgroundColor: '#10B981', marginBottom: 12 },
    closeButton: { backgroundColor: '#F43F5E' },
    checkInDisabled: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, alignItems: 'center' },
    checkInDisabledText: { color: '#64748B', textAlign: 'center' },
    attendeesSection: { marginHorizontal: 20, marginBottom: 40 },
    attendeeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 8 },
    attendeeText: { marginLeft: 12, fontSize: 16, color: '#334155' },
    noAttendeesText: { color: '#64748B' },
    errorText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#EF4444' }
});
