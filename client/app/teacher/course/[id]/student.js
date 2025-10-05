// app/teacher/course/[id]/students.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { api } from '../../../../src/api'

export default function CourseStudents() {
  const { id } = useLocalSearchParams();        // <-- courseId from the URL
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      // THIS is the correct place for your call:
      const res = await api.get(`/api/courses/${id}/students`);
      setStudents(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    navigation.setOptions?.({ title: 'Enrolled Students' });
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading…</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id || item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name || item.fullName}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No students enrolled yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  name: { fontSize: 16, fontWeight: '600', color: '#111827' },
  email: { marginTop: 2, color: '#6b7280' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  error: { color: '#b91c1c' },
});
