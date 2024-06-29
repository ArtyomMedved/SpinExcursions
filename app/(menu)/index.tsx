import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button, Image, SafeAreaView, TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import WelcomeScreen from "@/components/WelcomeScreen";
import { FontAwesome, Ionicons } from "@expo/vector-icons";  // Импортируем Ionicons

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
    const [token, setToken] = useState("");
    const [userInfo, setUserInfo] = useState(null);
    const [isFirstLaunch, setIsFirstLaunch] = useState(true);
    const [loadingAppleSignIn, setLoadingAppleSignIn] = useState(false); 
    const [coins, setCoins] = useState(0);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "264256222540-or7nbototcrpji70jlmag9semhklg942.apps.googleusercontent.com",
        iosClientId: "264256222540-0so4ikl54o31i3og721lvmnfdaamiuq4.apps.googleusercontent.com",
    });

    useEffect(() => {
        checkFirstLaunch();
        handleEffect();
    }, [response, token]);

    useEffect(() => {
        if (userInfo) {
            fetchCoins(userInfo.id);
        }
    }, [userInfo]);

    const checkFirstLaunch = async () => {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        if (hasLaunched) {
            setIsFirstLaunch(false);
        } else {
            await AsyncStorage.setItem("hasLaunched", "true");
            setIsFirstLaunch(true);
        }
    };

    async function handleEffect() {
        const user = await getLocalUser();
        if (!user) {
            if (response?.type === "success") {
                getUserInfo(response.authentication.accessToken);
            }
        } else {
            setUserInfo(user);
        }
    }

    const getLocalUser = async () => {
        const data = await AsyncStorage.getItem("@user");
        if (!data) return null;
        return JSON.parse(data);
    };

    const logRegistration = async (user) => {
        try {
            await fetch('http://192.168.1.97:3000/log-registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
        } catch (error) {
            console.error('Error logging registration:', error);
        }
    };
    
    const getUserInfo = async (token) => {
        if (!token) return;
        try {
            const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            const user = await response.json();
            await AsyncStorage.setItem("@user", JSON.stringify(user));
            setUserInfo(user);
            logRegistration(user);
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const resetFirstLaunch = async () => {
        await AsyncStorage.removeItem("hasLaunched");
        setIsFirstLaunch(true);
    };

    const handleAppleSignIn = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            
            const user = {
                id: credential.user,
                name: `${credential.fullName?.givenName} ${credential.fullName?.familyName}`,
                email: credential.email,
                verified_email: true,
                picture: null, 
            };
            await AsyncStorage.setItem("@user", JSON.stringify(user));
            setUserInfo(user);
        } catch (e) {
            if (e.code === 'ERR_CANCELED') {
                console.log('User canceled the sign-in flow');
            } else {
                console.log('Apple sign-in error:', e);
            }
        }
    }

    const fetchCoins = async (userId) => {
        try {
            const response = await fetch(`http://192.168.1.97:3000/coins/${userId}`);
            const data = await response.json();
            setCoins(data.coins);
        } catch (error) {
            console.error('Error fetching coins:', error);
        }
    };

    if (isFirstLaunch) {
        return <WelcomeScreen onDismiss={() => setIsFirstLaunch(false)} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.coinContainer}>
                <Ionicons name="star" size={24} color="#4285F4" />
                <Text style={styles.coinText}>Coins: {coins}</Text>
            </View>
            {!userInfo ? (
                <View style={styles.card}>
                    <Text style={styles.text}>У вас нет аккаунта</Text>
                    <Text style={styles.text}>Пожалуйста, пройдите регистрацию через сервисы прикрепленные ниже:</Text>
                    <TouchableOpacity
                        style={styles.googleButton}
                        disabled={!request}
                        onPress={async () => {
                            await promptAsync();
                        }}
                    >
                        <FontAwesome name="google" size={24} color="#fff" style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.appleButton, { opacity: loadingAppleSignIn ? 0.5 : 1 }]}
                        onPress={handleAppleSignIn}
                        disabled={loadingAppleSignIn}
                    >
                        <FontAwesome name="apple" size={24} color="#fff" style={styles.appleIcon} />
                        <Text style={styles.appleButtonText}>Sign in with Apple</Text>
                    </TouchableOpacity>
                    <Button title="Сбросить первый запуск" onPress={resetFirstLaunch} />
                </View>
            ) : (
                <View style={styles.card}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {userInfo?.picture && <Image source={{ uri: userInfo?.picture }} style={styles.image} />}
                        <Text style={styles.text}>{userInfo.name}</Text>
                    </View>
                    <Text style={styles.text}>Почта: {userInfo.email}</Text>
                    <Text style={styles.text}>
                        Верификация: {userInfo.verified_email ? "верифицирован" : "не верифицирован"}
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={async () => {
                            await AsyncStorage.removeItem("@user");
                            setUserInfo(null);
                            setCoins(0); // Сбрасываем количество коинов
                        }}>
                        <Text style={styles.buttonText}>Выйти из аккаунта</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push("/CreatePost")}>
                        <Text style={styles.buttonText}>Сделать пост</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={resetFirstLaunch}
                    >
                        <Text style={styles.buttonText}>Сбросить первый запуск</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginHorizontal: 20,
    marginTop: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DB4437",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  appleIcon: {
    marginRight: 12,
  },
  appleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  button: {
    backgroundColor: "#4285F4",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  coinContainer: {
    position: "absolute",
    top: 35,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4285F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  coinText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#4285F4",
  },
  coinIcon: {
    width: 24,
    height: 24,
  },
});