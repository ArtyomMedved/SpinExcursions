import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Post = ({ post, onLike, onDislike }) => {
  return (
    <Card style={styles.post}>
      <View style={styles.cardContentWrapper}>
        {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
        <Card.Content>
          <View style={styles.userInfo}>
            {post.author_picture && <Image source={{ uri: post.author_picture }} style={styles.userImage} />}
            <View style={styles.userInfoText}>
              <Text style={styles.userName}>{post.author_name ? post.author_name : 'Unknown User'}</Text>
              <Text style={styles.userEmail}>{post.author_email ? post.author_email : 'No Email'}</Text>
            </View>
          </View>
          <Text style={styles.postText}>{post.text}</Text>
        </Card.Content>
        <Card.Actions style={styles.postActions}>
          <IconButton
            icon="thumb-up"
            color={post.liked ? 'blue' : 'grey'}
            size={24}
            onPress={() => onLike(post.id)}
            disabled={post.loading} // Отключаем кнопку лайка при загрузке
          />
          <Text>{post.likes}</Text>
          <IconButton
            icon="thumb-down"
            color={post.disliked ? 'red' : 'grey'}
            size={24}
            onPress={() => onDislike(post.id)}
            disabled={post.loading} // Отключаем кнопку дизлайка при загрузке
          />
          <Text>{post.dislikes}</Text>
          {post.loading && <ActivityIndicator size="small" color="#0000ff" />}
        </Card.Actions>
      </View>
    </Card>
  );
};

const AllPostsScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Состояние загрузки данных

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch('http://localhost:3000/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
        setLoading(false); // Устанавливаем loading в false после загрузки данных
      } catch (error) {
        console.error('Failed to load posts', error);
        setLoading(false); // Устанавливаем loading в false в случае ошибки
      }
    };

    loadPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      // Устанавливаем loading для поста с указанным postId
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, loading: true } : post
        )
      );
  
      const response = await fetch(`http://localhost:3000/posts/${postId}/like`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to like post');
      }
      const updatedPost = await response.json();
      await updatePostInList(updatedPost); // Обновляем пост в списке после успешного лайка
    } catch (error) {
      console.error('Error liking post:', error);
      // Сброс loading и восстановление предыдущего состояния постов в случае ошибки
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, loading: false } : post
        )
      );
    }
  };
  
  const updatePostInList = async (updatedPost) => {
    try {
      // Имитируем задержку перед обновлением состояния
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === updatedPost.id ? updatedPost : post
        )
      );
    } catch (error) {
      console.error('Error updating post in list:', error);
    }
  };

  const handleDislike = async (postId) => {
    try {
      // Локальное обновление состояния поста для мгновенного отображения изменений
      const updatedPosts = posts.map(post =>
        post.id === postId ? { ...post, dislikes: post.dislikes + 1, disliked: true, loading: true } : post
      );
      setPosts(updatedPosts);

      const response = await fetch(`http://localhost:3000/posts/${postId}/dislike`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to dislike post');
      }
      const updatedPost = await response.json();
      await updatePostInList(updatedPost); // Обновляем пост в списке после успешного дизлайка
    } catch (error) {
      console.error('Error disliking post:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <Post
            post={{ ...item, loading: false }} // Передаем состояние загрузки для конкретного поста
            onLike={handleLike}
            onDislike={handleDislike}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  post: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'visible',
    elevation: 2,
    width: '100%', // Adjust width as needed
  },
  cardContentWrapper: {
    overflow: 'hidden',
    borderRadius: 10,
  },
  postImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfoText: {
    flexDirection: 'column',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  userEmail: {
    color: 'grey',
  },
  postText: {
    marginBottom: 10,
    fontSize: 16,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AllPostsScreen;