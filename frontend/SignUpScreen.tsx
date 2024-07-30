import React, { useState } from 'react';
import { View, Text, ImageBackground, TextInput, Button, StyleSheet, Alert, Switch, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [isOrganisateur, setIsOrganisateur] = useState(false);

  const handleSignUp = async () => {
    try {
      const response = await axios.post('http://10.0.2.2:8000/api/users/create', {
        username,
        nom,
        prenom,
        email,
        telephone,
        password,
        is_organisateur: isOrganisateur,
      });
      if (response.data.message === "User created!") {
        Alert.alert("Success", "User created successfully!");
        navigation.navigate('Login');
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "An error occurred");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <ImageBackground source={require('./logo.png')} imageStyle={styles.logo} style={styles.background} />
        <Text style={styles.title}>
          Trouvez des évènements prêt de chez vous avec Find your Event
        </Text>
        <Text style={styles.label2}>Inscription à Find your Event</Text>
        <Text style={styles.label}>Nom d'utilisateur :</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Choisissez un nom d'utilisateur"
          placeholderTextColor='#114943'
        />
        <Text style={styles.label}>Nom :</Text>
        <TextInput
          style={styles.input}
          value={nom}
          onChangeText={setNom}
          placeholder="Entrez votre nom"
          placeholderTextColor='#114943'
        />
        <Text style={styles.label}>Prénom :</Text>
        <TextInput
          style={styles.input}
          value={prenom}
          onChangeText={setPrenom}
          placeholder="Entrez votre prénom"
          placeholderTextColor='#114943'
        />
        <Text style={styles.label}>E-mail :</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Entrez votre adresse mail"
          keyboardType="email-address"
          placeholderTextColor='#114943'
        />
        <Text style={styles.label}>Téléphone :</Text>
        <TextInput
          style={styles.input}
          value={telephone}
          onChangeText={setTelephone}
          placeholder="Entrez votre numéro de téléphone"
          keyboardType="phone-pad"
          placeholderTextColor='#114943'
        />
        <Text style={styles.label}>Mot de passe :</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Créez un mot de passe"
          secureTextEntry
          placeholderTextColor='#114943'
        />
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Organisateur : </Text>
          <Switch
            value={isOrganisateur}
            onValueChange={setIsOrganisateur}
            trackColor={{ false: '#82d4ca', true: '#50a59c' }}
            thumbColor={isOrganisateur ? '#7443c6' : '#7443c6'}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
      padding: 16,
      justifyContent: 'center',
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
    fontSize: 20,
    marginBottom: 10,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    color: '#114943',
  },
});

export default SignUpScreen;
