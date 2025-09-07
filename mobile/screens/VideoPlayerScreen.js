import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { videoAPI, commentAPI, profileAPI } from '../services/api';

export default function VideoPlayerScreen({ route, navigation }) {
  const { video } = route.params;
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes?.length || 0);
  const [subscribed, setSubscribed] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    fetchComments();
  }, []);

  const checkUser = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id });
        setLiked(video.likes?.includes(payload.id) || false);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getComments(video._id);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to like videos');
      return;
    }

    try {
      const response = await videoAPI.likeVideo(video._id);
      setLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to subscribe');
      return;
    }

    try {
      const response = await profileAPI.subscribe(video.uploader._id);
      setSubscribed(response.data.subscribed);
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to comment');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const response = await commentAPI.addComment(video._id, newComment);
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView>
        <Video
          source={{ uri: video.url }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
          shouldPlay={false}
        />

        <View style={styles.content}>
          <Text style={styles.title}>{video.title}</Text>

          <View style={styles.metadata}>
            <View style={styles.uploaderInfo}>
              <Text style={styles.uploader}>{video.uploader?.username}</Text>
              <Text style={styles.views}>{video.views} views</Text>
            </View>

            {user && user.id !== video.uploader?._id && (
              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  subscribed && styles.subscribedButton,
                ]}
                onPress={handleSubscribe}
              >
                <Text style={styles.subscribeText}>
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, liked && styles.likedButton]}
              onPress={handleLike}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={20}
                color="white"
              />
              <Text style={styles.actionText}>{likesCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color="white" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>

          {video.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>{video.description}</Text>
            </View>
          )}

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              Comments ({comments.length})
            </Text>

            {user && (
              <View style={styles.commentInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Add a comment..."
                  placeholderTextColor="#ccc"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity
                  style={styles.postButton}
                  onPress={handleAddComment}
                >
                  <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>
              </View>
            )}

            {comments.map((comment) => (
              <View key={comment._id} style={styles.comment}>
                <Text style={styles.commentUser}>{comment.user.username}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
                <Text style={styles.commentDate}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    width: '100%',
    height: 250,
    backgroundColor: 'black',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploaderInfo: {
    flex: 1,
  },
  uploader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  views: {
    fontSize: 14,
    color: '#ccc',
  },
  subscribeButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribedButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  subscribeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  likedButton: {
    backgroundColor: 'rgba(255,100,100,0.3)',
  },
  actionText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  description: {
    color: 'white',
    lineHeight: 20,
  },
  commentsSection: {
    marginTop: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  commentInput: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: 'white',
    marginRight: 8,
  },
  postButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  comment: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  commentUser: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentText: {
    color: 'white',
    marginBottom: 4,
  },
  commentDate: {
    color: '#ccc',
    fontSize: 12,
  },
});