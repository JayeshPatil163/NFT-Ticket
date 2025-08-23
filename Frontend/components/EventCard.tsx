import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react-native';

interface EventCardProps {
  event: {
    id: string;
    name: string;
    date: string;
    location: string;
    price: number;
    totalTickets: number;
    soldTickets: number;
  };
  onPress?: () => void;
  variant?: 'default' | 'organizer';
}

export function EventCard({ event, onPress, variant = 'default' }: EventCardProps) {
  const availableTickets = event.totalTickets - event.soldTickets;
  const soldPercentage = (event.soldTickets / event.totalTickets) * 100;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.cardHeader}>
        <Text style={styles.eventName}>{event.name}</Text>
        <View style={[styles.statusBadge, availableTickets > 0 ? styles.availableBadge : styles.soldOutBadge]}>
          <Text style={[styles.statusText, availableTickets > 0 ? styles.availableText : styles.soldOutText]}>
            {availableTickets > 0 ? 'Available' : 'Sold Out'}
          </Text>
        </View>
      </View>

      <View style={styles.eventDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#64748B" strokeWidth={2} />
          <Text style={styles.detailText}>{event.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color="#64748B" strokeWidth={2} />
          <Text style={styles.detailText}>{event.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <DollarSign size={16} color="#64748B" strokeWidth={2} />
          <Text style={styles.detailText}>{event.price} APT</Text>
        </View>
        <View style={styles.detailRow}>
          <Users size={16} color="#64748B" strokeWidth={2} />
          <Text style={styles.detailText}>
            {event.soldTickets}/{event.totalTickets} sold
          </Text>
        </View>
      </View>

      {variant === 'organizer' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${soldPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>{soldPercentage.toFixed(0)}% sold</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  availableBadge: {
    backgroundColor: '#DCFCE7',
  },
  soldOutBadge: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  availableText: {
    color: '#166534',
  },
  soldOutText: {
    color: '#DC2626',
  },
  eventDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  progressContainer: {
    marginTop: 16,
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
});