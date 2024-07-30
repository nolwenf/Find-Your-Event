import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, FlatList, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HomeScreen = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const navigation = useNavigation();
  const { width } = Dimensions.get('window');

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUsername = await AsyncStorage.getItem('username');
        setToken(storedToken);
        if (storedToken && storedUsername) {
          const response = await axios.get(`http://10.0.2.2:8000/api/users/${storedUsername}`, {
            headers: {
              'Authorization': `${storedToken}`
            }
          });
          if (response.data.user) {
            setUser(response.data.user[0]);
          } else {
            Alert.alert("Error", "User not found!");
          }
        }
      } catch (error) {
        console.error('Error retrieving user data', error);
        Alert.alert("Error", error.message || "An error occurred");
      }
    };

    getUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
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
            setEvents(response.data.events);
          } else {
            Alert.alert('Error', 'No events found.');
          }
          console.log(response.data);
        } catch (error) {
          console.error('Error fetching events', error);
          Alert.alert('Error', 'Failed to fetch events.');
        }
      };

      fetchEvents();
    }, [navigation])
  );

  const handleLogout = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        await axios.post('http://10.0.2.2:8000/api/auth/logout', {}, {
          headers: {
            'Authorization': `${storedToken}`
          }
        });
      }
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('username');
      Alert.alert("Success", "You have been logged out.");
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert("Error", "An error occurred while logging out.");
    }
  };

  const renderEvent = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.eventContainer}
        onPress={() => navigation.navigate('DetailsEvent', { eventId: item.id })}
      >
        <Text style={styles.eventTitle}>{item.nom}</Text>
        <Text style={styles.eventDate}>{item.date}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
        <View style={styles.buttonContainer}>
      {user && user.is_organisateur && (
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreateEvent')} >
          <Text style={styles.buttonText}>Créer un évènement</Text>
        </TouchableOpacity>
      )}
      </View>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
        numColumns={1}
        contentContainerStyle={styles.eventList}
      />
      <View style={styles.bannerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('UserAccount')} style={styles.bannerButton}>
          <Text style={styles.bannerButtonText}>Mon profil</Text>
        </TouchableOpacity>
        <Image source={require('./logo.png')} style={styles.bannerImage} />
        <TouchableOpacity onPress={() => navigation.navigate('Maps')} style={styles.bannerButton}>
                  <Text style={styles.bannerButtonText}>Carte</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#a2ece440',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: "#7443c6",
    padding: 10,
    borderRadius: 5,
    width: 200,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  createButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#a2ece4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#7443c6',
  },
  bannerButton: {
    backgroundColor: "#7443c6",
    padding: 10,
    borderRadius: 5,
  },
  bannerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  bannerImage: {
    width: 60,
    height: 59,
    resizeMode: 'contain',
  },
  eventList: {
    alignItems: 'center',
    width: '100%',
  },
  eventContainer: {
    width: 330,
    height: 150,
    marginVertical: 10,
    backgroundColor: '#a0a7ef50',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: "#7443c6",
  },
  eventDate: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 5,
    color: "#7443c690",
  },
});

export default HomeScreen;

