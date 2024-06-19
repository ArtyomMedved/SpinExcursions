import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button, Image, SafeAreaView } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { router } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function index() {
  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [password, setPassword] = useState(""); // Change null to ""

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "264256222540-or7nbototcrpji70jlmag9semhklg942.apps.googleusercontent.com",
    iosClientId: "264256222540-0so4ikl54o31i3og721lvmnfdaamiuq4.apps.googleusercontent.com",
  });

  useEffect(() => {
    handleEffect();
  }, [response, token]);

  async function handleEffect() {
    const user = await getLocalUser();
    console.log("user", user);
    if (!user) {
      if (response?.type === "success") {
        // setToken(response.authentication.accessToken);
        getUserInfo(response.authentication.accessToken);
      }
    } else {
      setUserInfo(user);
      console.log("loaded locally");
    }
  }

  const getPassword = async () => {
    const storedCode = await AsyncStorage.getItem('code');
    if (storedCode) {
        const parsedPassword = JSON.parse(storedCode);
        setPassword(parsedPassword.toString()); // Convert to string before setting
    }
};

getPassword();

const functionOne = () =>{
  async () => await AsyncStorage.removeItem("code")
  console.log("Delete")
  }
  
const functionTwo = () =>{
  console.log("deleted password. Password: ", password)
  }

const functionCombined = async () => {
   await functionOne();
    functionTwo();
}

  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };

  const getUserInfo = async (token: string) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      // Add your own error handler here
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!userInfo ? (
        <View style={styles.card}>
          <Text style={styles.text}>У вас нет акканута</Text>
          <Text style={styles.text}>Пожалуйста, пройдите регистрацию через сервисы прикрепленные ниже:</Text>
        <Button
  title="Sign in with Google"
  disabled={!request}
  onPress={async () => {
    await promptAsync();
    setTimeout(() => {
      router.replace('/setlock');
    }, 5000); // Задержка в 5000 миллисекунд (5 секунд)
  }}
/>

        </View>
      ) : (
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {userInfo?.picture && (
              <Image source={{ uri: userInfo?.picture }} style={styles.image} />
            )}
            <Text style={styles.text}>{userInfo.name}</Text>
          </View>
          <Text style={styles.text}>Почта: {userInfo.email}</Text>
          <Text style={styles.text}>
            Верификация: {userInfo.verified_email ? "верифицирован" : "не верифицирован"}
          </Text>
          {/* <Text style={styles.text}>{JSON.stringify(userInfo, null, 2)}</Text> */}
          <Button
        title="Выйти из аккаунта"
        onPress={async () => await AsyncStorage.removeItem("@user")}
        />
        <Button
        title="Поставить новый пароль"
        onPress={async () => router.replace('/setlock')}
        />
        <Button
        title="Сделать пост"
        onPress={async () => router.push('/CreatePost')}
        />
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
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10
  },
  card: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center'
  },
});