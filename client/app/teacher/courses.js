// app/teacher/courses.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/api';

export default function TeacherCourses() {
  const router = useRouter();
  const { mode } = useLocalSearchParams(); // undefined | 'students'
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const res = await api.get('/api/courses/courses'); // teacher's own courses
      setCourses(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={styles.center}><ActivityIndicator /><Text>Loading…</Text></View>;
  if (error)   return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              if (mode === 'students') {
                router.push(`/teacher/course/${item._id}/students`);
              } else {
                router.push(`/teacher/course/${item._id}`); // your course detail (optional)
              }
            }}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description || 'No description'}</Text>
            {mode === 'students' && <Text style={styles.link}>View Students ›</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No courses yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { padding: 16, borderRadius: 12, backgroundColor: '#f3f4f6', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600', color: '#111827' },
  desc: { marginTop: 6, color: '#6b7280' },
  link: { marginTop: 10, color: '#2563eb', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  error: { color: '#b91c1c' },
});
