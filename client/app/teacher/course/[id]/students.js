import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, RefreshControl,
  TextInput, TouchableOpacity, StyleSheet, Linking, Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../../../src/api';

export default function CourseStudents() {
  const { id: courseId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await api.get(`/api/courses/${courseId}/students`);
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load students');
    } finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return students;
    return students.filter(s =>
      (s.name || '').toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term)
    );
  }, [students, q]);

  const mailTo = (email) => {
    const url = `mailto:${email}`;
    Linking.canOpenURL(url).then(ok => ok && Linking.openURL(url)).catch(() => {
      Alert.alert('Error', 'Unable to open mail app.');
    });
  };

  if (loading && students.length === 0) {
    return <View style={s.center}><ActivityIndicator /><Text style={{marginTop:8}}>Loading…</Text></View>;
  }
  if (error) return <View style={s.center}><Text style={s.err}>{error}</Text></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.h1}>Enrolled Students</Text>
        <Text style={s.count}>{students.length}</Text>
      </View>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search by name or email…"
        autoCapitalize="none"
        style={s.search}
      />

      <FlatList
        data={filtered}
        keyExtractor={(u, i) => u._id || String(i)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text style={s.empty}>{q ? 'No matches.' : 'No students enrolled yet.'}</Text>}
        renderItem={({ item }) => (
          <View style={s.row}>
            <View style={s.avatar}><Text style={s.avatarText}>{(item.name?.[0] || item.email?.[0] || '?').toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.name} numberOfLines={1}>{item.name || '(no name)'}</Text>
              <Text style={s.email} numberOfLines={1}>{item.email}</Text>
            </View>
            {!!item.email && (
              <TouchableOpacity style={s.mailBtn} onPress={() => mailTo(item.email)}>
                <Text style={s.mailText}>Email</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  err: { color: '#b91c1c' },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  h1: { fontSize: 20, fontWeight: '700', color: '#111827' },
  count: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, backgroundColor: '#eef2ff', color: '#4f46e5', fontWeight: '700' },

  search: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, backgroundColor: '#fafafa' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2ff' },
  avatarText: { color: '#4f46e5', fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '600', color: '#111827' },
  email: { color: '#6b7280', marginTop: 2 },
  mailBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#e0f2fe' },
  mailText: { color: '#0369a1', fontWeight: '700' },
});
