import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Calendar, MapPin, Hash } from 'lucide-react-native';

interface TicketCardProps {
  ticket: {
    id: string;
    eventName: string;
    date: string;
    location: string;
    price: number;
    transactionHash: string;
  };
  onPress?: () => void;
}

export function TicketCard({ ticket, onPress }: TicketCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.ticketHeader}>
        <View style={styles.ticketInfo}>
          <Text style={styles.eventName}>{ticket.eventName}</Text>
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Calendar size={14} color="#64748B" strokeWidth={2} />
              <Text style={styles.detailText}>{ticket.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={14} color="#64748B" strokeWidth={2} />
              <Text style={styles.detailText}>{ticket.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Hash size={14} color="#64748B" strokeWidth={2} />
              <Text style={styles.detailText}>
                {ticket.transactionHash.slice(0, 8)}...{ticket.transactionHash.slice(-6)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.qrContainer}>
          <QRCode
            value={ticket.transactionHash}
            size={80}
            backgroundColor="transparent"
            color="#1E293B"
          />
        </View>
      </View>
      
      <View style={styles.ticketFooter}>
        <View style={styles.validBadge}>
          <View style={styles.validDot} />
          <Text style={styles.validText}>Valid Ticket</Text>
        </View>
        <Text style={styles.priceText}>{ticket.price} APT</Text>
      </View>
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
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 16,
  },
  eventName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  qrContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  validBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  validText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#6366F1',
  },
});