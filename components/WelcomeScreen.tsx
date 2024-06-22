import React from "react";
import { StyleSheet, Text, View, Button, Image } from "react-native";

const WelcomeScreen: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
    return (
        <View style={styles.container}>
            <Image source={require("../assets/scooter.png")} style={styles.image} />
            <Text style={styles.title}>Добро пожаловать в аренду электросамокатов!</Text>
            <Text style={styles.subtitle}>Быстро и удобно арендуйте самокат в вашем городе</Text>
            <Button title="Начать" onPress={onDismiss} color="#FF6347" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
    },
});

export default WelcomeScreen;