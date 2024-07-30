import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, SafeAreaView, Platform,TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { format } from 'date-fns';
import { ScrollView } from 'react-native-gesture-handler';

const CreateEventScreen = ({ navigation }) => {
  const [token, setToken] = useState(null);
  const [nom, setNom] = useState('');
  const [date, setDate] = useState(format(new Date(), 'dd/MM/yyyy HH:mm'));
  const [lieu, setLieu] = useState('');
  const [description, setDescription] = useState('');
  const [nbBillets, setNbBillets] = useState('');
  const [prix, setPrix] = useState('');
  const [scanMessage, setMessage] = useState('');

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
        } else {
          Alert.alert("Error", "No token found, please log in again.");
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error("Error retrieving token", error);
      }
    };
    getToken();
  }, []);

  const handleCreateEvent = async () => {
    if (!token) {
      Alert.alert("Error", "No token found, please log in again.");
      return;
    }

    if (!nom || !date || !lieu || !description || !nbBillets || !prix) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4} \d{2}h\d{2}$/.test(date)) {
      Alert.alert("Error", "Invalid date format. Please use dd/mm/yyyy HHhMM.");
      return;
    }

    const event = {
      nom,
      date,
      lieu,
      description,
      nb_billets: parseInt(nbBillets, 10),
      prix: parseFloat(prix),
    };

    try {
      const response = await fetch('http://10.0.2.2:8000/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(event)
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Event created successfully!");
        navigation.goBack();
      } else {
        console.error("Error creating event:", data);
        Alert.alert("Error", data.message || "Failed to create event.");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "Network request failed");
    }
  };

  return (
      <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Nom de votre évènement"
          value={nom}
          onChangeText={setNom}
        />
      <GooglePlacesAutocomplete
        placeholder='Recherchez votre lieu'
        onPress={(data, details = null) => {
          setLieu(details ? details.formatted_address : data.description);
        }}
        query={{
          key: 'AIzaSyAN2SoPcKNCy-NWsmkxj5AxqW_e73rG-1U',
          language: 'en',
        }}
        styles={{
          textInputContainer: styles.textInputContainer,
          textInput: styles.textInput,
          listView: styles.listView,
          container :{
            flex: 0,
            position: 'relative',
          }
        }}
        fetchDetails={true}
        debounce={200}
      />

        <TextInput
          style={styles.input}
          value={lieu}
          onChangeText={setLieu}
          placeholder="Lieu"
          editable={false}
        />
        <TextInput
                style={styles.input}
                placeholder="Date et heure (jj/mm/aaaa  HH h MM)"
                value={date}
                onChangeText={setDate}
              />
        <TextInput
          style={styles.input}
          placeholder="Nombre de places"
          keyboardType="numeric"
          value={nbBillets}
          onChangeText={setNbBillets}
        />
        <TextInput
          style={styles.input}
          placeholder="Prix de la place"
          keyboardType="numeric"
          value={prix}
          onChangeText={setPrix}
        />
        <TextInput
          style={styles.input}
          placeholder="Description de votre évènement"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleCreateEvent}>
              <Text style={styles.buttonText}>Créer votre évènement</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#a2ece440',
  },
  input: {
    height: 40,
    borderColor: "#7443c6",
    backgroundColor: '#a2ece470',
    borderWidth: 2,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 6,
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
  datePicker: {
    marginVertical: 8,
  },
  textInput: {
    height: 35,
    backgroundColor: '#a2ece470',
  },
  listView: {
    borderWidth: 2,
    marginBottom: 10,
    zIndex: 0,
    borderColor: "#7443c6",
    backgroundColor: '#a2ece470',
  },

  textInputContainer: {
    height: 40,
    borderColor: "#7443c6",
    backgroundColor: '#a2ece470',
    borderWidth: 2,
    marginBottom: 10,
    borderRadius: 6,
    width: "100%",
},
});

export default CreateEventScreen;
