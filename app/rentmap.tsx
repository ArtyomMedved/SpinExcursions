import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Image, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Modal from 'react-native-modal';
import * as Location from 'expo-location';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import MapViewDirections from 'react-native-maps-directions';
import uuid from 'uuid-js';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0422;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const OPENWEATHER_API_KEY = 'a1d3e04065ee9b6bbf351467362cfdf5';
const GOOGLE_MAPS_APIKEY = 'AIzaSyChiFJsHXD6u1ymneTtBMFC5JlYs_sX6hY';

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [timer, setTimer] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [isRouteVisible, setIsRouteVisible] = useState(false);
  const navigation = useNavigation();
  const mapRef = useRef(null);

  const attractions = [
    {
      id: 1,
      title: 'парк культуры и отдыха имени Горького',
      coordinates: {
        latitude: 54.608500,
        longitude: 52.448803,
      },
    },
    {
      id: 2,
      title: 'озеро Нижнее',
      coordinates: {
        latitude: 54.605976,
        longitude: 52.455149,
      },
    },
    {
      id: 3,
      title: 'парк Мэхэббэт',
      coordinates: {
        latitude: 54.606630,
        longitude: 52.461796,
      },
    },
    {
      id: 4,
      title: 'Фантан нефти',
      coordinates: {
        latitude: 54.604793,
        longitude: 52.451907,
      },
    },
    {
      id: 5,
      title: 'озеро Верхнее',
      coordinates: {
        latitude: 54.603199,
        longitude: 52.432841,
      },
    },
    {
      id: 6,
      title: 'Вечный огонь',
      coordinates: {
        latitude: 54.602850,
        longitude: 52.455575,
      },
    },
    {
      id: 7,
      title: 'Парк Победы',
      coordinates: {
        latitude: 54.601189,
        longitude: 52.458581,
      },
    },
    {
      id: 8,
      title: 'парк Юбилейный',
      coordinates: {
        latitude: 54.596617,
        longitude: 52.454705,
      },
    },
    {
      id: 9,
      title: 'Центральная аллея',
      coordinates: {
        latitude: 54.602428,
        longitude: 52.448443,
      },
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);

        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (newLocation) => {
            setLocation(newLocation);
          }
        );
      } catch (error) {
        console.error('Error while requesting location permissions or getting location', error);
        setErrorMsg('Error while requesting location permissions or getting location');
      }
    })();
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeather(location.coords.latitude, location.coords.longitude);
    }
  }, [location]);

  useEffect(() => {
    if (errorMsg) {
      Alert.alert('Location Error', errorMsg);
    }
  }, [errorMsg]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
      if (timer % 60 === 0) {
        setEarnings((prevEarnings) => prevEarnings + 5);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timer]);

  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather data', error);
      Alert.alert('Error', 'Failed to fetch weather data. Please check your API key.');
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleMarkerPress = (location) => {
    setSelectedLocation(location);
    setDestination({
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
    });
    setIsRouteVisible(true);
    toggleModal();
  };

  const goToCurrentLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
        1000
      );
    }
  };

  const finishTrip = () => {
    setShowConfirmation(true);
  };

  const confirmFinishTrip = async () => {
    setShowConfirmation(false);
    try {
      const idempotenceKey = uuid.create().toString();

      const response = await axios.post('https://api.yookassa.ru/v3/payments', {
        amount: {
          value: earnings.toString(),
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: 'https://ya.ru/?clid=1955454&win=644',
        },
        capture: true,
        description: 'Оплата поездки',
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': idempotenceKey,
        },
        auth: {
          username: '401474',
          password: 'test_AuJsuu_1Akmyg3Vzy7DCq-ob_jhDlAR-jqiIZep0ViY',
        },
      });
      Alert.alert('Успешно', 'Оплата прошла успешно');
      router.push("(menu)")
    } catch (error) {
      console.error('Ошибка при оплате', error);
      Alert.alert('Ошибка', 'Не удалось завершить оплату. Попробуйте еще раз.');
    }
  };

  const cancelFinishTrip = () => {
    setShowConfirmation(false);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 55.732399,
          longitude: 52.454630,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showsUserLocation={true}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
      >
        {attractions.map((attraction) => (
          <Marker
            key={attraction.id}
            coordinate={attraction.coordinates}
            title={attraction.title}
            onPress={() => handleMarkerPress(attraction)}
          />
        ))}
        {isRouteVisible && location && destination && (
          <MapViewDirections
            origin={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={5}
            strokeColor="blue"
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.locationButton} onPress={goToCurrentLocation}>
      <Text style={styles.locationButtonText}>Где я?</Text>
      </TouchableOpacity>

      <View style={styles.weatherContainer}>
        <Text style={styles.weatherText}>
          Погода {weather ? `${weather.main.temp}°C` : 'Загрузка...'}
        </Text>
      </View>

      <View style={styles.earningsContainer}>
        <Text style={styles.earningsText}>Сумма: {earnings} рублей</Text>
        <Text style={styles.timerText}>{formatTime(timer)}</Text>
        <TouchableOpacity style={styles.finishButton} onPress={finishTrip}>
          <Text style={styles.finishButtonText}>Завершить поездку</Text>
        </TouchableOpacity>
      </View>

      <Modal isVisible={showConfirmation}>
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationText}>Завершить поездку и оплатить {earnings} рублей?</Text>
          <View style={styles.confirmationButtons}>
            <TouchableOpacity style={styles.confirmButton} onPress={confirmFinishTrip}>
              <Text style={styles.confirmButtonText}>Да</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelFinishTrip}>
              <Text style={styles.cancelButtonText}>Нет</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  locationButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 20,
  },
  locationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  weatherContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
  },
  weatherText: {
    fontSize: 16,
  },
  earningsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 5,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  earningsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 16,
    marginTop: 5,
  },
  finishButton: {
    marginTop: 10,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
  },
  finishButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmationContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmationText: {
    fontSize: 18,
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  confirmButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MapScreen;