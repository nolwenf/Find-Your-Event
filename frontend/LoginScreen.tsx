// LoginScreen.js

import React, { useState } from 'react';
import { View, ImageBackground, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [isTwoFAEnabled, setIsTwoFAEnabled] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://10.0.2.2:8000/api/auth/login', {
        telephone,
        password,
      });
      if (response.data.token && response.data.username) {
        Alert.alert("Success", "Login successful!");
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('username', response.data.username);
        navigation.navigate('Home');
      } else if (response.data.two_fa) {
        setIsTwoFAEnabled(true);
        Alert.alert("Two Factor Authentication Required", "Please enter the code from your authenticator app.");
        navigation.navigate('TwoFA', { telephone, password });
      } else {
        Alert.alert("Error", response.data.message || "Login failed");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "An error occurred");
    }
  };

  return (
    <View style={styles.container}>
            <ImageBackground source={require('./logo.png')} imageStyle={styles.logo} style={styles.background}/>

            <Text style={styles.title}>
              Trouvez des évenements prêt de chez vous avec Find your Event
            </Text>
      <Text style={styles.label}>Numéro de téléphone :</Text>
      <TextInput
        style={styles.input}
        value={telephone}
        onChangeText={setTelephone}
        placeholder="Entrez votre numéro de téléphone"
        placeholderTextColor='#114943'
      />
      <Text style={styles.label}>Mot de passe :</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Entrez votre mot de passe"
        secureTextEntry
        placeholderTextColor='#114943'
      />
      <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
      <Text style={styles.label2}>Vous n'avez pas encore de compte ?</Text>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signupButton}>S'inscrire</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    color: "#a2ece410",
    backgroundColor: '#a2ece450',
  },
  logo: {
    opacity: 1,
    overflow: 'visible',
    resizeMode: 'cover',
  },
  background: {
    paddingBottom: 200,
    paddingTop: 96,
    paddingHorizontal: 32,
  },
  title: {
    paddingTop: 25,
    paddingHorizontal: 5,
    marginTop: 2,
    marginBottom: 10,
    color: '#114943',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    color: "#7443c6",
  },
  label2: {
      fontSize: 18,
      marginBottom: 8,
      color: "#7443c6",
      textAlign: 'center',
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
    //flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },

  signupButton: {
    color: '#114943',
    marginTop: 5,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoginScreen;
