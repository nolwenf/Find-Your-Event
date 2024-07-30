import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const API_KEY = 'AIzaSyAN2SoPcKNCy-NWsmkxj5AxqW_e73rG-1U';

const getCoordinatesFromAddress = async (address) => {
  try {
    const response = await axios.get(GEOCODING_API_URL, {
      params: {
        address: address,
        key: API_KEY
      }
    });
    if (response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    } else {
      throw new Error('No results found');
    }
  } catch (error) {
    console.error('Error fetching coordinates: ', error);
    return null;
  }
};

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (!storedToken) {
          Alert.alert("Error", "No token found, please log in again.");
          navigation.navigate('Login');
          return;
        }

        const response = await axios.get('http://10.0.2.2:8000/api/events/all', {
          headers: {
            'Authorization': `${storedToken}`
          }
        });

        if (response.data && response.data.events) {
          const eventsWithCoordinates = await Promise.all(response.data.events.map(async (event) => {
            const coordinates = await getCoordinatesFromAddress(event.lieu);
            return { ...event, coordinates };
          }));
          setEvents(eventsWithCoordinates);
        } else {
          Alert.alert('Error', 'No events found.');
        }
      } catch (error) {
        console.error('Error fetching events', error);
        Alert.alert('Error', 'Failed to fetch events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 43.7101728,
          longitude: 7.2619532,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {events.map(event => (
          <Marker
            key={event.id}
            coordinate={event.coordinates}
            title={event.title}
            description={event.description}
            onPress={() => navigation.navigate('DetailsEvent', { eventId: event.id })}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
