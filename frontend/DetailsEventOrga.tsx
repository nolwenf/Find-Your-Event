import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const EventDetailsScreen = ({ route }) => {
  const { event } = route.params;
  const navigation = useNavigation();

  const handleDeleteEvent = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        Alert.alert("Error", "No token found, please log in again.");
        return;
      }

      console.log(`Sending delete request for event id: ${event.id}`);
      const response = await axios.post(
        `http://10.0.2.2:8000/api/event/remove/${event.id}`,
        {},
        {
          headers: {
            'Authorization': `${storedToken}`
          },
        }
      );

      console.log(response.data.message);
      Alert.alert("Success", response.data.message);
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting event:", error);
      Alert.alert("Error", error.response?.data?.message || "An error occurred while deleting the event.");
    }
  };

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
          <Text style={styles.detailLabel}>Participants :  </Text>
          <Text style={styles.detailValue}>{event.billets_vendus}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Prix :  </Text>
          <Text style={styles.detailValue}>{event.prix}€</Text>
        </View>

        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteEvent}>
          <Text style={styles.buttonText1}>Supprimer un évènement</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Scan', { eventId: event.id })}>
          <Text style={styles.buttonText2}>Scanner la place</Text>
        </TouchableOpacity>
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

  deleteButton: {
    backgroundColor: '#a2ece4',
  },
  buttonText1: {
    color: '#114943',
    fontSize: 16,
  },
  buttonText2: {
        color: 'white',
        fontSize: 16,
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

export default EventDetailsScreen;
