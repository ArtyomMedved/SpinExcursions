// utils.js

import AsyncStorage from '@react-native-async-storage/async-storage';

export const savePosts = async (newPosts) => {
  try {
    await AsyncStorage.setItem('posts', JSON.stringify(newPosts));
  } catch (error) {
    console.error('Failed to save posts', error);
  }
};

export const loadPosts = async () => {
  try {
    const storedPosts = await AsyncStorage.getItem('posts');
    if (storedPosts) {
      return JSON.parse(storedPosts);
    }
  } catch (error) {
    console.error('Failed to load posts', error);
  }
  return [];
};
