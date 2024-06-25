import React, { useState } from "react";
import { StyleSheet, Text, View, Button, Image, Modal, ScrollView, SafeAreaView } from "react-native";

const WelcomeScreen: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
    const [showTermsModal, setShowTermsModal] = useState(true); // состояние для отображения модального окна с соглашением
    const [showWelcomeScreen, setShowWelcomeScreen] = useState(false); // состояние для отображения основного экрана приложения

    const handleAcceptTerms = () => {
        setShowTermsModal(false); // закрыть модальное окно после согласия
        setShowWelcomeScreen(true); // отобразить основной экран приложения
    };

    return (
        <SafeAreaView style={styles.container}>
            {showWelcomeScreen ? (
                <SafeAreaView>
                    <Image source={require("../assets/scooter.png")} style={styles.image} />
                    <Text style={styles.title}>Добро пожаловать в аренду электросамокатов!</Text>
                    <Text style={styles.subtitle}>Быстро и удобно арендуйте самокат в вашем городе</Text>
                    <Button title="Начать" onPress={onDismiss} color="#FF6347" />
                </SafeAreaView>
            ) : null}

            {/* Модальное окно с пользовательским соглашением */}
            <Modal visible={showTermsModal} animationType="slide">
                <SafeAreaView style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Пользовательское соглашение</Text>
                        <Text style={styles.modalText}>
                            Введение{"\n\n"}
                            Данное Пользовательское соглашение (далее - “Соглашение”) устанавливает условия использования мобильного приложения для аренды электросамокатов (далее - “Приложение”). Пожалуйста, внимательно ознакомьтесь с этим Соглашением перед использованием Приложения.{"\n\n"}
                            Определения{"\n\n"}
                            - Приложение: мобильное приложение для аренды электросамокатов.{"\n"}
                            - Пользователь: физическое лицо, использующее Приложение для аренды электросамокатов.{"\n"}
                            - Самокат: электрический самокат, предоставляемый для аренды через Приложение.{"\n"}
                            - Арендодатель: компания, предоставляющая электросамокаты для аренды.{"\n\n"}
                            Условия использования Приложения{"\n\n"}
                            1. Регистрация: Для использования Приложения необходимо зарегистрироваться, предоставив достоверные данные.{"\n\n"}
                            2. Возраст: Пользователь должен быть старше 18 лет или иметь разрешение законного представителя.{"\n\n"}
                            3. Обязательства пользователя:{"\n\n"}
                            - Соблюдать все правила дорожного движения и местные законы при использовании электросамоката.{"\n"}
                            - Нести ответственность за сохранность электросамоката во время его использования.{"\n"}
                            - Соблюдать честность и корректное использование Приложения.{"\n\n"}
                            4. Использование данных: При использовании Приложения Пользователь соглашается с обработкой своих персональных данных в соответствии с политикой конфиденциальности.{"\n\n"}
                            Ограничение ответственности{"\n\n"}
                            1. Безопасность: Пользователь использует Приложение и арендованные электросамокаты на свой страх и риск.{"\n\n"}
                            2. Технические проблемы: Арендодатель не несет ответственность за любые технические проблемы, возникшие в результате использования Приложения или электросамоката.{"\n\n"}
                            Заключительные положения{"\n\n"}
                            1. Изменения в Соглашении: Арендодатель вправе вносить изменения в данное Соглашение. Изменения вступают в силу с момента их публикации в Приложении.{"\n\n"}
                            2. Применимое право и разрешение споров: Данное Соглашение регулируется и толкуется в соответствии с законодательством [страны/региона]. Все споры и разногласия, возникающие в связи с исполнением Соглашения, подлежат разрешению в судебном порядке.{"\n\n"}
                            3. Контактная информация: Для связи с Арендодателем по вопросам, касающимся использования Приложения, можно использовать контактные данные, предоставленные в Приложении.{"\n\n"}
                            Настоящее Пользовательское соглашение составлено на [язык], и в случае разночтений или несоответствий перевода, текст на [язык] имеет приоритет.{"\n\n"}
                            Пользователь, регистрируясь и используя Приложение, подтверждает, что он ознакомлен с условиями данного Соглашения и принимает их полностью и безоговорочно.
                        </Text>
                        <Button title="Я согласен" onPress={handleAcceptTerms} color="#FF6347" />
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
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
        marginLeft: '23%',
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
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20,
    },
    modalContent: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    modalText: {
        fontSize: 16,
        textAlign: "justify",
        marginBottom: 20,
    },
});

export default WelcomeScreen;