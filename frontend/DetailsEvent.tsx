import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const response = await axios.get(`http://10.0.2.2:8000/api/event/${eventId}`, {
          headers: {
            'Authorization': `${storedToken}`
          }
        });
        if (response.data.event) {
          setEvent(response.data.event[0]);
        } else {
          Alert.alert('Error', 'Event not found');
        }
      } catch (error) {
        console.error('Error fetching event details', error);
        Alert.alert('Error', 'Failed to fetch event details');
      }
    };

    const getUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUsername = await AsyncStorage.getItem('username');
        const response = await axios.get(`http://10.0.2.2:8000/api/users/${storedUsername}`, {
          headers: {
            'Authorization': `${storedToken}`
          }
        });
        if (response.data.user) {
          setUser(response.data.user[0]);
        }
      } catch (error) {
        console.error('Error retrieving user data', error);
        Alert.alert("Error", error.message || "An error occurred");
      }
    };

    fetchEventDetails();
    getUserData();
  }, [eventId]);

  const handleJoinEvent = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const response = await axios.post(`http://10.0.2.2:8000/api/event/join/${eventId}`, {}, {
        headers: {
          'Authorization': `${storedToken}`
        }
      });
      if (response.data.message) {
        setQrCode(response.data.qr_code);
        Alert.alert('Success', response.data.message);
      } else {
        Alert.alert('Error', 'Failed to join event');
      }
    } catch (error) {
      console.error('Error joining event', error);
      Alert.alert('Error', 'Failed to join event');
    }
  };

  if (!event) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{event.nom}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date :  </Text>
          <Text style={styles.detailValue}>{event.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Lieu :  </Text>
          <Text style={styles.detailValue}>{event.lieu}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description :  </Text>
          <Text style={styles.detailValue}>{event.description}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Prix :  </Text>
          <Text style={styles.detailValue}>{event.prix}€</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Places disponibles :  </Text>
          <Text style={styles.detailValue}>{event.nb_billets}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleJoinEvent}>
          <Text style={styles.buttonText}>Participer à l'évènement</Text>
        </TouchableOpacity>
        {qrCode && (
          <View style={styles.qrCodeContainer}>
            <Text style={styles.qrCodeText}> Vous pouvez retrouver votre QR Code dans votre espace utilisateur</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.bannerContainer}>
        <View style={styles.centeredContainer}>
          <Image source={require('./logo.png')} style={styles.bannerImage} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingBottom: 60,
    backgroundColor: '#a2ece440',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#114943',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 13,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#114943',
  },
  detailValue: {
    fontSize: 18,
    color: '#114943',
    flex: 3,
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#7443c6',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  qrCodeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrCodeText: {
    fontSize: 18,
    marginBottom: 10,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
  },
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#a2ece4',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#7443c6',
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: 60,
    height: 59,
    resizeMode: 'contain',
  },
});

export default EventDetailScreen;
