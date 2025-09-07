import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function VideoCard({ video, onPress }) {
  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <TouchableOpacity onPress={() => onPress(video)} style={styles.container}>
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.card}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: video.thumbnail || 'https://via.placeholder.com/300x200' }}
            style={styles.thumbnail}
          />
          {video.duration && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
          
          <View style={styles.metadata}>
            <Text style={styles.uploader}>{video.uploader?.username || 'Unknown'}</Text>
            <Text style={styles.views}>{formatViews(video.views)} views</Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.likes}>❤️ {video.likes?.length || 0}</Text>
            <Text style={styles.date}>
              {new Date(video.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  uploader: {
    color: '#ccc',
    fontSize: 14,
  },
  views: {
    color: '#ccc',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  likes: {
    color: '#ccc',
    fontSize: 12,
  },
  date: {
    color: '#ccc',
    fontSize: 12,
  },
});