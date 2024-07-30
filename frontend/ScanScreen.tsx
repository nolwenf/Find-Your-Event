import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'react-native-camera-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const TicketScannerScreen = ({ route }) => {
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigation = useNavigation();
  const { eventId } = route.params;

  const handleBarcodeRead = async (event) => {
    const qrCodeData = event.nativeEvent.codeStringValue;
    console.log('QR Code data:', qrCodeData);
    setScanning(false);
    setLoading(true);

    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        setIsError(true);
        setScanMessage('No token found, please log in again.');
        return;
      }

      const response = await axios.post(
        `http://10.0.2.2:8000/api/event/${eventId}/validate`,
        { qr_code_data: qrCodeData },
        {
          headers: {
            'Authorization': `${storedToken}`,
          },
        }
      );

      setLoading(false);

      if (response.data.message) {
        setIsError(false);
        setScanMessage('La place est valide. Merci pour votre participation!');
      } else if (response.data.error) {
        setIsError(true);
        setScanMessage(response.data.error);
      }
      else {
        setIsError(true);
        setScanMessage('Une erreur s\'est produite lors de la validation du code QR. Veuillez réessayer.');
      }
    } catch (error) {
      setLoading(false);
      setIsError(true);
      setScanMessage('Une erreur s\'est produite lors de la validation du code QR. Veuillez réessayer.');
    }
  };

  const handleRescan = () => {
    setScanMessage('');
    setIsError(false);
    setScanning(true);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scanner la place</Text>
      {scanning && (
        <Modal visible={scanning} transparent={true}>
          <View style={styles.cameraContainer}>
            <Camera
              style={styles.camera}
              scanBarcode={true}
              onReadCode={handleBarcodeRead}
              showFrame={true}
              laserColor='red'
              frameColor='white'
            />
          </View>
        </Modal>
      )}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Validation...</Text>
        </View>
      )}
      {!scanning && !loading && scanMessage && (
        <View style={styles.messageContainer}>
          <Text style={[styles.messageText, isError ? styles.errorText : styles.successText]}>
            {scanMessage}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleRescan}>
            <Text style={styles.buttonText}>Scanner une autre place</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleGoBack}>
            <Text style={styles.buttonText}>Revenir en arrière</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  camera: {
    width: '100%',
    height: '80%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
  messageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 18,
    marginBottom: 20,
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#f44336',
  },
  button: {
    backgroundColor: '#7443c6',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default TicketScannerScreen;
