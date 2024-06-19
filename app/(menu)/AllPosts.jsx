import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, StyleSheet, SafeAreaView } from 'react-native';
import { Card, Text, TextInput, Button, IconButton, Avatar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Компонент для отображения отдельного комментария
const Comment = ({ comment }) => (
  <View style={styles.comment}>
    <Avatar.Icon size={24} icon="account" style={styles.commentAvatar} />
    <Text style={styles.commentText}>{comment.text}</Text>
  </View>
);

// Компонент для отображения отдельного поста
const Post = ({ post, onLike, onDislike, onAddComment, onDeletePost }) => {
  const [commentText, setCommentText] = useState('');

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(post.id, commentText);
      setCommentText('');
    }
  };

  return (
    <Card style={styles.post}>
      {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
      <Card.Content>
        <Text style={styles.postText}>{post.text}</Text>
      </Card.Content>
      <Card.Actions style={styles.postActions}>
        <IconButton
          icon="thumb-up"
          color={post.liked ? 'blue' : 'grey'}
          size={24}
          onPress={() => onLike(post.id)}
        />
        <Text>{post.likes}</Text>
        <IconButton
          icon="thumb-down"
          color={post.disliked ? 'red' : 'grey'}
          size={24}
          onPress={() => onDislike(post.id)}
        />
        <Text>{post.dislikes}</Text>
        <IconButton
          icon="delete"
          color="red"
          size={24}
          onPress={() => onDeletePost(post.id)}
        />
      </Card.Actions>
      <Card.Content>
        <FlatList
          data={post.comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Comment comment={item} />}
        />
        <TextInput
          mode="outlined"
          placeholder="Добавьте комментарий..."
          value={commentText}
          onChangeText={setCommentText}
          style={styles.commentInput}
        />
        <Button mode="contained" onPress={handleAddComment} style={styles.commentButton}>
          Комментировать
        </Button>
      </Card.Content>
    </Card>
  );
};

// Экран для отображения всех постов
const AllPostsScreen = () => {
  const [posts, setPosts] = useState([]);

  // Загрузка постов из AsyncStorage при запуске экрана
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const storedPosts = await AsyncStorage.getItem('posts');
        if (storedPosts) {
          setPosts(JSON.parse(storedPosts));
        }
      } catch (error) {
        console.error('Failed to load posts', error);
      }
    };

    loadPosts();
  }, []);

  const savePosts = async (updatedPosts) => {
    try {
      await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
    } catch (error) {
      console.error('Failed to save posts', error);
    }
  };

  // Функция для обработки лайков
  const handleLike = (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        if (post.liked) {
          return {
            ...post,
            likes: post.likes - 1,
            liked: false,
          };
        } else {
          const newLikes = post.likes + 1;
          const newDislikes = post.disliked ? post.dislikes - 1 : post.dislikes;
          return {
            ...post,
            likes: newLikes,
            dislikes: newDislikes,
            liked: true,
            disliked: false,
          };
        }
      }
      return post;
    });
    setPosts(updatedPosts);
    savePosts(updatedPosts);
  };

  // Функция для обработки дизлайков
  const handleDislike = (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        if (post.disliked) {
          return {
            ...post,
            dislikes: post.dislikes - 1,
            disliked: false,
          };
        } else {
          const newDislikes = post.dislikes + 1;
          const newLikes = post.liked ? post.likes - 1 : post.likes;
          return {
            ...post,
            dislikes: newDislikes,
            likes: newLikes,
            disliked: true,
            liked: false,
          };
        }
      }
      return post;
    });
    setPosts(updatedPosts);
    savePosts(updatedPosts);
  };

  // Функция для добавления комментария
  const handleAddComment = (postId, commentText) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            { id: `${post.comments.length + 1}`, text: commentText },
          ],
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    savePosts(updatedPosts);
  };

  const handleDeletePost = (postId) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    setPosts(updatedPosts); // Удаление поста из состояния
    savePosts(updatedPosts); // Сохранение обновленных постов в AsyncStorage
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Все Посты</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Post
            post={item}
            onLike={handleLike}
            onDislike={handleDislike}
            onAddComment={handleAddComment}
            onDeletePost={handleDeletePost}
          />
        )}
      />
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
    left: 20,
  },
  post: {
    marginBottom: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  postText: {
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentAvatar: {
    marginRight: 10,
  },
  commentText: {
    flex: 1,
  },
  commentInput: {
    marginBottom: 10,
  },
  commentButton: {
    alignSelf: 'flex-end',
  },
});

export default AllPostsScreen;
