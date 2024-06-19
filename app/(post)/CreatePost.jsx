import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, SafeAreaView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePosts } from '../(menu)/utils';
import { useRouter } from 'expo-router';

const CreatePostScreen = () => {
  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(false); // Добавляем состояние для триггера обновления
  const router = useRouter();

  const addPost = () => {
    if (newPostText.trim() || selectedImage) {
      const newPost = {
        id: Date.now().toString(),
        text: newPostText,
        image: selectedImage,
        likes: 0,
        dislikes: 0,
        comments: []
      };

      AsyncStorage.getItem('posts').then(storedPosts => {
        let posts = [];
        if (storedPosts) {
          posts = JSON.parse(storedPosts);
        }
        const updatedPosts = [...posts, newPost];
        AsyncStorage.setItem('posts', JSON.stringify(updatedPosts)) // Сохраняем обновленные посты
          .then(() => {
            // После успешного сохранения устанавливаем триггер обновления
            setUpdateTrigger(prev => !prev);
          })
          .catch(error => {
            console.error('Failed to save updated posts', error);
          });
      }).catch(error => {
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

  // useEffect для перенаправления на экран всех постов после обновления триггера
  useEffect(() => {
    if (updateTrigger) {
      router.replace('/AllPosts');
    }
  }, [updateTrigger]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Мои Посты</Text>
      <TextInput
        mode="outlined"
        placeholder="Напишите что-нибудь..."
        value={newPostText}
        onChangeText={setNewPostText}
        style={styles.input}
      />
      <Button mode="outlined" onPress={chooseImage} style={styles.imagePickerButton}>
        Выбрать изображение
      </Button>
      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.selectedImage} />}
      <Button mode="contained" onPress={addPost} style={styles.addButton}>
        Добавить пост
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  imagePickerButton: {
    marginBottom: 10,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  addButton: {
    marginBottom: 10,
  },
});

export default CreatePostScreen;
