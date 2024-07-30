// TwoFAScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TwoFAScreen = ({ route }) => {
  const [twoFACode, setTwoFACode] = useState('');
  const navigation = useNavigation();
  const { telephone, password } = route.params;

  const handleVerifyTwoFA = async () => {
    try {
      const response = await axios.post('http://10.0.2.2:8000/api/auth/verify_twofa', {
        telephone,
        password,
        code: twoFACode,
      });
      if (response.data.token && response.data.username) {
        Alert.alert("Success", "Login successful!");
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('username', response.data.username);
        navigation.navigate('Home');
      } else {
        Alert.alert("Error", response.data.message || "Verification failed");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "An error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>2FA Code:</Text>
      <TextInput
        style={styles.input}
        value={twoFACode}
        onChangeText={setTwoFACode}
        placeholder="Entrez le code 2FA"
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyTwoFA}>
        <Text style={styles.buttonText}>Vérifier 2FA</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#a2ece450',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#7443c6',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default TwoFAScreen;
