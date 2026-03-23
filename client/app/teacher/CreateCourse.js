import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/api';

export default function CreateCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const createCourse = async () => {
    const t = title.trim();
    const d = description.trim();
    if (!t || !d) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      // ✅ canonical endpoint: POST /api/courses
      const { data } = await api.post('/api/courses', { title: t, description: d });

      Alert.alert('Success', 'Course created successfully!', [
        { text: 'OK', onPress: () => router.replace('/teacher/courses') },
      ]);

      setTitle('');
      setDescription('');
      console.log('Created course:', data?._id || data);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || 'Failed to create course.';
      console.log('Create course error:', status, err?.response?.data || err?.message);
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>➕ Create New Course</Text>

      <TextInput
        placeholder="Course Name"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        editable={!submitting}
      />

      <TextInput
        placeholder="Course Description"
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        multiline
        editable={!submitting}
      />

      <TouchableOpacity
        style={[styles.createBtn, submitting && { opacity: 0.6 }]}
        onPress={createCourse}
        disabled={submitting}
      >
        <Text style={styles.createBtnText}>{submitting ? 'Creating…' : 'Create Course'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  backBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: 20,
  },
  backBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  title: {
    fontSize: 24, fontWeight: 'bold', color: '#1e3a8a',
    textAlign: 'center', marginBottom: 24,
  },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
    padding: 12, marginBottom: 16, backgroundColor: '#fff',
  },
  createBtn: {
    backgroundColor: '#10b981', padding: 14, borderRadius: 12,
    alignItems: 'center', marginTop: 10,
  },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
