import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const CreatePostScreen = () => {
  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const router = useRouter();

  const addPost = async () => {
    if (newPostText.trim() || selectedImage) {
      const userInfo = await AsyncStorage.getItem("@user");
      const user = userInfo ? JSON.parse(userInfo) : null;

      const newPost = {
        id: Date.now().toString(),
        text: newPostText,
        image: selectedImage,
        likes: 0,
        dislikes: 0,
        comments: [],
        author: user ? { name: user.name, email: user.email, picture: user.picture } : null,
      };

      AsyncStorage.getItem('posts')
        .then(storedPosts => {
          let posts = [];
          if (storedPosts) {
            posts = JSON.parse(storedPosts);
          }
          const updatedPosts = [...posts, newPost];
          AsyncStorage.setItem('posts', JSON.stringify(updatedPosts))
            .then(() => {
              setUpdateTrigger(prev => !prev);
            })
            .catch(error => {
              console.error('Failed to save updated posts', error);
            });
        })
        .catch(error => {
          console.error('Failed to add post', error);
        });

      setNewPostText('');
      setSelectedImage(null);
    }
  };
  
  const chooseImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.error && response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0].uri);
      }
    });
  };

  useEffect(() => {
    if (updateTrigger) {
      router.replace('/AllPosts');
    }
  }, [updateTrigger]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 20,
      paddingTop: 40,
    },
    header: {
      fontSize: 28,
      marginBottom: 20,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    input: {
      backgroundColor: '#F0F0F0',
      marginBottom: 20,
      paddingHorizontal: 20,
      paddingVertical: 2,
      borderRadius: 10,
      elevation: 3,
      fontSize: 18,
    },
    imagePickerButton: {
      backgroundColor: '#D3D3D3',
      borderRadius: 10,
      elevation: 2,
      marginBottom: 20,
    },
    imagePickerButtonText: {
      textTransform: 'uppercase',
      fontWeight: 'bold',
      color: '#333333',
    },
    selectedImage: {
      width: '100%',
      height: 200,
      marginBottom: 20,
      borderRadius: 12,
      overflow: 'hidden',
    },
    addButton: {
      backgroundColor: '#A9A9A9',
      borderRadius: 10,
      elevation: 2,
    },
    addButtonText: {
      textTransform: 'uppercase',
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Создать Пост</Text>
        <TextInput
          mode="flat"
          placeholder="Опишите ваш пост"
          value={newPostText}
          onChangeText={setNewPostText}
          style={styles.input}
          multiline
          numberOfLines={6}
        />
        <Button
          mode="contained"
          onPress={chooseImage}
          style={styles.imagePickerButton}
          labelStyle={styles.imagePickerButtonText}
        >
          Выбрать изображение
        </Button>
        {selectedImage && <Image source={{ uri: selectedImage }} style={styles.selectedImage} />}
        <Button
          mode="contained"
          onPress={addPost}
          style={styles.addButton}
          labelStyle={styles.addButtonText}
        >
          Добавить пост
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreatePostScreen;