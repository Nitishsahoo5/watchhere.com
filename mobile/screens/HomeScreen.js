import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import VideoCard from '../components/VideoCard';
import { videoAPI } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');

  const categories = ['all', 'Entertainment', 'Education', 'Music', 'Gaming', 'Sports', 'News'];

  useEffect(() => {
    fetchVideos();
  }, [category]);

  const fetchVideos = async () => {
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (category !== 'all') params.category = category;

      const response = await videoAPI.getVideos(params);
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchVideos();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVideos();
  };

  const renderVideoCard = ({ item }) => (
    <VideoCard
      video={item}
      onPress={(video) => navigation.navigate('VideoPlayer', { video })}
    />
  );

  const renderCategoryButton = (cat) => (
    <TouchableOpacity
      key={cat}
      style={[
        styles.categoryButton,
        category === cat && styles.activeCategoryButton,
      ]}
      onPress={() => setCategory(cat)}
    >
      <Text
        style={[
          styles.categoryText,
          category === cat && styles.activeCategoryText,
        ]}
      >
        {cat.charAt(0).toUpperCase() + cat.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎬 WatchHere</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos..."
            placeholderTextColor="#ccc"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={({ item }) => renderCategoryButton(item)}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={videos}
        renderItem={renderVideoCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.videosList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No videos found</Text>
            </View>
          )
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    padding: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoriesList: {
    paddingRight: 16,
  },
  categoryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeCategoryButton: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  categoryText: {
    color: '#ccc',
    fontSize: 14,
  },
  activeCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  videosList: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
  },
});