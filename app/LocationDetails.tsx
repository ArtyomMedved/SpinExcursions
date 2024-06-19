import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Button, Image, Alert } from 'react-native';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import uuid from 'uuid-js'; // Используем uuid-js для генерации UUID

const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3/payments';
const SECRET_KEY = 'test_AuJsuu_1Akmyg3Vzy7DCq-ob_jhDlAR-jqiIZep0ViY';
const SHOP_ID = '401474';  // Замените 'your_shop_id' на ваш реальный магазин ID

export default function LocationDetailsScreen() {
  const { title, street, description } = useLocalSearchParams();
  const navigation = useNavigation();

  const [selectedScooter, setSelectedScooter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const scooters = [
    { id: '1', name: 'Скутер 1', image: require('/Users/artemmedvedev/Desktop/SpinExcursions/assets/scooter.png') },
    { id: '2', name: 'Скутер 2', image: require('/Users/artemmedvedev/Desktop/SpinExcursions/assets/scooter.png') },
    { id: '3', name: 'Скутер 3', image: require('/Users/artemmedvedev/Desktop/SpinExcursions/assets/scooter.png') },
    { id: '4', name: 'Скутер 4', image: require('/Users/artemmedvedev/Desktop/SpinExcursions/assets/scooter.png') },
  ];

  const handleScooterPress = (scooter) => {
    setSelectedScooter(scooter);
    setModalVisible(true);
  };

  const handleRentPress = async () => {
    try {
      const idempotenceKey = uuid.create().toString(); // Генерируем новый UUID

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
        description: `Аренда ${selectedScooter.name}`,
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

      console.log('Payment response:', response.data);

      const paymentUrl = response.data.confirmation.confirmation_url;
      setModalVisible(false);
      router.push({
        pathname: 'PaymentWebView',
        params: { url: paymentUrl },
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      Alert.alert('Ошибка', 'Не удалось создать платеж');
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
        <Text style={styles.sectionTitle}>Список самокатов</Text>
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
              <Text style={styles.modalTitle}>Вы выбрали {selectedScooter.name}</Text>
              <Image source={selectedScooter.image} style={styles.modalImage} />
              <Button title="Арендовать самокат" onPress={handleRentPress} color="#4CAF50" />
              <Button title="Отмена" onPress={() => setModalVisible(false)} color="#F44336" />
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