// app/teacher/courses.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { api } from '../../src/api';

export default function TeacherCourses() {
  const params = useLocalSearchParams();
  // mode can be string or string[] depending on how it was passed
  const rawMode = params.mode;
  const isStudentsMode = Array.isArray(rawMode) ? rawMode.includes('students') : rawMode === 'students';

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await api.get('/api/courses/courses');
      setCourses(data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load courses');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && courses.length === 0) {
    return <View style={s.center}><ActivityIndicator /><Text>Loading…</Text></View>;
  }
  if (error) {
    return <View style={s.center}><Text style={{ color: '#b91c1c' }}>{error}</Text></View>;
  }

  return (
    <View style={s.container}>
      <FlatList
        data={courses}
        keyExtractor={(it) => String(it._id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text style={s.empty}>No courses yet.</Text>}
        renderItem={({ item }) => {
          const href = isStudentsMode
            ? { pathname: '/teacher/course/[id]/students', params: { id: String(item._id) } }
            : { pathname: '/teacher/course/[id]/materials', params: { id: String(item._id) } };
          return (
            <Link href={href} asChild>
              <TouchableOpacity style={s.card}>
                <Text style={s.title}>{item.title}</Text>
                <Text style={s.desc}>{item.description || 'No description'}</Text>
                <Text style={s.link}>{isStudentsMode ? 'View Students ›' : 'Open Materials ›'}</Text>
              </TouchableOpacity>
            </Link>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:{ flex:1, padding:16, backgroundColor:'#fff' },
  center:{ flex:1, alignItems:'center', justifyContent:'center' },
  card:{ padding:16, borderRadius:12, backgroundColor:'#f3f4f6', marginBottom:12 },
  title:{ fontSize:18, fontWeight:'600', color:'#111827' },
  desc:{ marginTop:6, color:'#6b7280' },
  link:{ marginTop:10, color:'#2563eb', fontWeight:'600' },
  empty:{ textAlign:'center', color:'#6b7280', marginTop:40 },
});
