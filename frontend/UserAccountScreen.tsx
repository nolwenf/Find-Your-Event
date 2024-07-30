import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Alert, SectionList, TouchableOpacity, Modal, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import QRCode from 'react-native-qrcode-svg';




const UserAccountScreen = () => {
  const [user, setUser] = useState(null);
  const [sections, setSections] = useState([]);
  const [token, setToken] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [twoFaModalVisible, setTwoFaModalVisible] = useState(false);
  const navigation = useNavigation();

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
        if (response.data && response.data.user) {
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

  const fetchUserEvents = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:8000/api/events/', {
        headers: {
          'Authorization': `${token}`
        }
      });
      console.log(response.data);
      if (response.data) {
        const events = response.data.events || [];
        setSections(prevSections => [
          ...prevSections,
          {
            title: 'Evènements auxquels vous participez',
            data: events
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to fetch participated events');
      }
    } catch (error) {
      console.error('Error fetching participated events', error);
      Alert.alert('Error', 'Failed to fetch participated events');
    }
  };

  const fetchOrganizedEvents = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:8000/api/events/organised', {
        headers: {
          'Authorization': `${token}`
        }
      });
      if (response.data) {
        const events = response.data.events || [];
        setSections(prevSections => [
          ...prevSections,
          {
            title: 'Evènements organisés par vous',
            data: events
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to fetch organized events');
      }
    } catch (error) {
      console.error('Error fetching organized events', error);
      Alert.alert('Error', 'Failed to fetch organized events');
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (user && !initialized) {
        fetchUserEvents();
        if (user.is_organisateur) {
          fetchOrganizedEvents();
        }
        setInitialized(true);
      }
    }, [user, initialized])
  );

  const enable2FA = async () => {
    try {
      const response = await axios.post('http://10.0.2.2:8000/api/auth/toogle_twofa', {}, {
        headers: {
          'Authorization': `${token}`
        },
      });
      if (response.data.qr_code) {
        setQrCode(response.data.qr_code);
        setTwoFaModalVisible(true);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to enable 2FA');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred');
    }
  };

  const renderItem = ({ item, section }) => {
    if (section.title === 'User Information') {
      return (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>Username: {item.username}</Text>
          <Text style={styles.userInfoText}>Name: {item.nom}</Text>
          <Text style={styles.userInfoText}>Surname: {item.prenom}</Text>
          <Text style={styles.userInfoText}>Email: {item.email}</Text>
          <Text style={styles.userInfoText}>Phone: {item.telephone}</Text>
        </View>
      );
    } else if (section.title === 'Evènements auxquels vous participez') {
      return (
        <View style={styles.eventContainer}>
          <Text style={styles.eventTitle}>{item.nom}</Text>
          <Text style={styles.eventDate}>{item.date}</Text>
          <TouchableOpacity onPress={() => handleQRCodeClick(item.qr_code_data)}>
            <QRCode value={item.qr_code_data} size={150} />
          </TouchableOpacity>
        </View>
      );
    } else if (section.title === 'Evènements organisés par vous') {
      return (
        <View style={styles.eventContainer}>
          <Text style={styles.eventTitle}>{item.nom}</Text>
          <Text style={styles.eventDate}>{item.date}</Text>
          <Text style={styles.participantCount}>Participants: {item.billets_vendus}</Text>
          <TouchableOpacity style={styles.Button} onPress={() => navigation.navigate('DetailsEventOrga', { event: item })} >
                  <Text style={styles.buttonText}>Détails de l'évènement</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const handleQRCodeClick = (qrCode) => {
    setSelectedQRCode(qrCode);
    setModalVisible(true);
  };

  const renderSectionHeader = ({ section }) => (
    <Text style={styles.sectionTitle}>{section.title}</Text>
  );

  const handleLogout = async () => {
    try {
      if (token) {
        await axios.post('http://10.0.2.2:8000/api/auth/logout', {}, {
          headers: {
            'Authorization': `${token}`
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

  if (!user) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.sectionContainer}
      />
      {selectedQRCode && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <QRCode value={selectedQRCode} size={300} />
            <Button color={styles.Button.color} title="Fermer" onPress={() => setModalVisible(false)} />
          </View>
        </Modal>
      )}
      {qrCode && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={twoFaModalVisible}
          onRequestClose={() => setTwoFaModalVisible(false)}
        >
          <View style={styles.modalView}>
            <QRCode value={qrCode} size={300} />
            <Button title="Close" onPress={() => setTwoFaModalVisible(false)} />
          </View>
        </Modal>
      )}
      <TouchableOpacity style={styles.Button} onPress={enable2FA}>
        <Text style={styles.buttonText}>Activer la 2FA</Text>
      </TouchableOpacity>
      <View style={styles.bannerContainer}>
        <View style={styles.leftContainer} />
        <View style={styles.centeredContainer}>
                  <Image source={require('./logo.png')} style={styles.bannerImage} />
        </View>
        <View style={styles.rightAlignedContainer}>
          <TouchableOpacity onPress={handleLogout} style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>Déconnexion</Text>
          </TouchableOpacity>
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
    backgroundColor: '#a2ece480',
  },
  userInfo: {
    marginBottom: 20
  },
  userInfoText: {
    fontSize: 18,
    marginBottom: 5
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10
  },
  eventContainer: {
      marginBottom: 10,
      padding: 10,
      backgroundColor: '#a0a7ef50',
      borderRadius: 10,
      alignItems: 'center'
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
      marginBottom: 5,
      color: "#7443c690",
    },
    participantCount: {
      fontSize: 18,
      textAlign: 'center',
      color: "#7443c690",
    },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#a2ece440'
  },
  Button: {
    backgroundColor: '#7443c6',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    margin: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18
  },
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#a2ece4',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#7443c6',
  },
  leftContainer: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightAlignedContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 16,
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

});

export default UserAccountScreen;