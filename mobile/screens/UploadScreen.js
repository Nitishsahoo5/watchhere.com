import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { videoAPI } from '../services/api';

export default function UploadScreen({ navigation }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('General');
  const [uploading, setUploading] = useState(false);

  const categories = ['General', 'Entertainment', 'Education', 'Music', 'Gaming', 'Sports', 'News'];

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking video:', error);
    }
  };

  const handleUpload = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Login Required', 'Please login to upload videos');
      return;
    }

    if (!file || !title.trim()) {
      Alert.alert('Missing Information', 'Please select a video and enter a title');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('video', {
      uri: file.uri,
      type: file.mimeType,
      name: file.name,
    });
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    formData.append('category', category);

    try {
      await videoAPI.uploadVideo(formData);
      Alert.alert('Success', 'Video uploaded successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Profile') }
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Upload Video</Text>

        <TouchableOpacity style={styles.filePicker} onPress={pickVideo}>
          <View style={styles.filePickerContent}>
            {file ? (
              <>
                <Ionicons name="videocam" size={40} color="white" />
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileSize}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={40} color="white" />
                <Text style={styles.filePickerText}>Tap to select video</Text>
                <Text style={styles.filePickerSubtext}>MP4, MOV, AVI supported</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter video title"
              placeholderTextColor="#ccc"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter video description"
              placeholderTextColor="#ccc"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
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
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="gaming, tutorial, fun"
              placeholderTextColor="#ccc"
            />
          </View>

          <TouchableOpacity
            style={[styles.uploadButton, (!file || !title.trim() || uploading) && styles.disabledButton]}
            onPress={handleUpload}
            disabled={!file || !title.trim() || uploading}
          >
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Uploading...' : 'Upload Video'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
  },
  filePicker: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    padding: 32,
    marginBottom: 24,
  },
  filePickerContent: {
    alignItems: 'center',
  },
  filePickerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  filePickerSubtext: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 4,
  },
  fileName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  fileSize: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 4,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
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
  uploadButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});