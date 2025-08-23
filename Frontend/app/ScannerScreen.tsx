import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, Platform } from 'react-native';
// Updated imports from expo-camera
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// --- Type Definitions ---

type RootStackParamList = {
  EventDetail: { scannedData?: { ticketId: string } };
  // Add other screens here
};

type ScannerScreenNavigationProp = NavigationProp<RootStackParamList, 'EventDetail'>;

// --- Main Component ---

export default function ScannerScreen() {
  // Updated permission handling with the useCameraPermissions hook
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation<ScannerScreenNavigationProp>();

  // This useEffect will ask for permissions when the component mounts
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = (scanningResult: BarcodeScanningResult) => {
    // Check if there is data in the scanning result
    if (!scanningResult.data) {
        return;
    }
    setScanned(true);
    try {
        // Assuming the QR code data is a JSON string like: {"ticketId": "TICKET12345"}
        const parsedData = JSON.parse(scanningResult.data);
        if (parsedData.ticketId && typeof parsedData.ticketId === 'string') {
            // Navigate back to the detail screen with the scanned data
            navigation.navigate('EventDetail', { scannedData: parsedData });
        } else {
            Alert.alert('Invalid QR Code', 'This QR code is not a valid event ticket.', [{ text: 'OK', onPress: () => setScanned(false) }]);
        }
    } catch (e) {
        Alert.alert('Invalid QR Code', 'Could not read the QR code data.', [{ text: 'OK', onPress: () => setScanned(false) }]);
    }
  };

  // Show messages based on permission status
  if (!permission) {
    // Permissions are still loading
    return <View style={styles.permissionContainer}><Text>Requesting for camera permission...</Text></View>;
  }

  if (!permission.granted) {
    // Permissions are not granted yet
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Replaced Camera with CameraView */}
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
            barcodeTypes: ['qr'],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
          <Text style={styles.instructions}>Scan Ticket QR Code</Text>
          <View style={styles.scanBox} />
      </View>
      {scanned && <View style={styles.scanAgainButton}><Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} color={Platform.OS === 'ios' ? '#FFFFFF' : '#6366F1'} /></View>}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    instructions: {
        color: 'white',
        fontSize: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        textAlign: 'center',
        position: 'absolute',
        top: '20%',
    },
    scanBox: {
        width: 280,
        height: 280,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 16,
        backgroundColor: 'transparent',
    },
    scanAgainButton: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        backgroundColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.5)' : 'transparent',
        borderRadius: 12,
        padding: 4,
    }
});
