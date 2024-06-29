import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Button, Image, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import uuid from 'uuid-js';
import urlParse from 'url-parse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios'; // Импортируем библиотеку уведомлений для iOS
import { Linking } from 'react-native';

const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3/payments';
const SECRET_KEY = 'test_AuJsuu_1Akmyg3Vzy7DCq-ob_jhDlAR-jqiIZep0ViY';
const SHOP_ID = '401474';

export default function LocationDetailsScreen() {
  const { title, street, description } = useLocalSearchParams();
  const navigation = useNavigation();

  const [selectedScooter, setSelectedScooter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  const scooters = [
    { id: '1', name: 'Scooter 1', image: require('../assets/scooter.png') },
    { id: '2', name: 'Scooter 2', image: require('../assets/scooter.png') },
    { id: '3', name: 'Scooter 3', image: require('../assets/scooter.png') },
    { id: '4', name: 'Scooter 4', image: require('../assets/scooter.png') },
  ];

  useEffect(() => {
    // Push notification configuration
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('LOCAL NOTIFICATION ==>', notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      requestPermissions: Platform.OS === 'ios'
    });

    // Deep linking handler
    const handleDeepLink = async (event) => {
      try {
        const parsedUrl = urlParse(event.url, true);
        const { protocol, host } = parsedUrl;

        if (protocol === 'spinexapp:' && host === 'callback' && paymentId) {
          const paymentInfo = await axios.get(`${YOOKASSA_API_URL}/${paymentId}`, {
            auth: {
              username: SHOP_ID,
              password: SECRET_KEY,
            },
          });

          console.log('Payment info response:', paymentInfo.data);

          const paymentMethodId = paymentInfo.data.payment_method ? paymentInfo.data.payment_method.id : null;

          if (paymentMethodId) {
            const user = await AsyncStorage.getItem('@user');
            if (user) {
              const userId = JSON.parse(user).id;
              await axios.post('http://192.168.1.97:3000/save-payment-method', {
                userId,
                paymentMethodId,
              });
            } else {
              console.warn('User not found in local storage');
            }
          } else {
            console.warn('No payment_method in response');
          }

          navigation.push('rentmap');
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    const linkingEventListener = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      linkingEventListener.remove();
    };
  }, [navigation, paymentId, selectedScooter]);

  const handleScooterPress = (scooter) => {
    setSelectedScooter(scooter);
    setModalVisible(true);
  };

  const handleRentPress = async (useCoins) => {
    try {
      const idempotenceKey = uuid.create().toString();

      const response = await axios.post(YOOKASSA_API_URL, {
        amount: {
          value: '100.00',
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: 'spinexapp://callback'
        },
        capture: true,
        description: `Rent ${selectedScooter.name}`,
        save_payment_method: true,
      }, {
        auth: {
          username: SHOP_ID,
          password: SECRET_KEY,
        },
        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': idempotenceKey,
        },
      });

      console.log('Payment creation response:', response.data);

      const paymentUrl = response.data.confirmation.confirmation_url;
      const paymentId = response.data.id; // Save payment id for later use
      setPaymentId(paymentId);

      setModalVisible(false);

      if (useCoins) {
        const user = await AsyncStorage.getItem('@user');
        if (user) {
          const userId = JSON.parse(user).id;

          // Check user's coin balance
          const coinsResponse = await axios.get(`http://192.168.1.97:3000/coins/${userId}`);
          const currentCoins = coinsResponse.data.coins;

          if (currentCoins >= 100) {
            // Deduct coins from user's account
            await axios.post(`http://192.168.1.97:3000/coins/${userId}`, {
              coins: currentCoins - 100
            });

            // Notify user and navigate to rentmap
            Alert.alert('Оплата', 'Оплата прошла успешно, с вашего счета было списано 100 коинов');
            navigation.push('rentmap');
          } else {
            Alert.alert('Ошибка', 'Недостаточно коинов чтобы оплатить старт аренды');
          }
        } else {
          console.warn('User not found in local storage');
        }
      } else {
        // Navigate to YooKassa payment webview
        navigation.push('PaymentWebView', { url: paymentUrl });
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      Alert.alert('Error', 'Failed to create payment');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleScooterPress(item)} style={styles.scooterItem}>
      <Image source={item.image} style={styles.scooterImage} />
      <Text style={styles.scooterName}>{item.name}</Text>
      <Ionicons name="chevron-forward-outline" size={24} color="#333" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.street}>{street}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.scooters}>
        <Text style={styles.sectionTitle}>Scooter List</Text>
        <FlatList
          data={scooters}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scooterList}
        />
      </View>
      {selectedScooter && (
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>You selected {selectedScooter.name}</Text>
              <Image source={selectedScooter.image} style={styles.modalImage} />
              <Button title="Арендовать" onPress={() => handleRentPress(false)} color="#4CAF50" />
              <Button title="Арендовать коинами (100)" onPress={() => handleRentPress(true)} color="#4CAF50" />
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#F44336" />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  street: {
    fontSize: 18,
    color: '#777',
    marginVertical: 5,
  },
  description: {
    fontSize: 16,
    color: '#555',
  },
  scooters: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  scooterList: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
  },
  scooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  scooterImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  scooterName: {
    fontSize: 18,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
});