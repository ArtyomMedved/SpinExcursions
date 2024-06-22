import { AppState } from "react-native";
import { MMKV } from "react-native-mmkv";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Импортируем AsyncStorage

const storage = new MMKV({
    id: 'UserInactivity',
});

const LOCK_TIME = 1000;

export const UserInactivityProvider = ({ children }: any) => {
    const appState = useRef(AppState.currentState);
    const router = useRouter();
    const [password, setPassword] = useState(""); // Change null to ""

    useEffect(() => {
        const getPassword = async () => {
            const storedCode = await AsyncStorage.getItem('code');
            if (storedCode) {
                const parsedPassword = JSON.parse(storedCode);
                setPassword(parsedPassword.toString()); // Convert to string before setting
            }
        };
    
        getPassword();
        console.log("password import: ", password)

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, []);

    const handleAppStateChange = (nextAppState: any) => {
        console.log('appState', appState.current, nextAppState);
        if (nextAppState === 'inactive') {
            router.push('/(modals)/white');
        } else {
            if (router.canGoBack()) {
                router.back();
            }
        }

        if (nextAppState === 'background') {
            recordStartTime();
        } else if (nextAppState === 'active' && appState.current.match(/background/)) {
            const elapsed = Date.now() - (storage.getNumber('startTime') || 0)
            router.push('/(modals)/lock');
        }

        appState.current = nextAppState;
    };

    const recordStartTime = () => {
        storage.set('startTime', Date.now());
    }

    return children;
}