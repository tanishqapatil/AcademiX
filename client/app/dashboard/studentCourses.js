import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { api } from '../../src/api';

export default function MyCourses() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/courses/mine/student');
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.response?.data?.message || 'Failed to load');
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <View style={s.c}><ActivityIndicator /><Text>Loading…</Text></View>;
  if (err) return <View style={s.c}><Text style={{color:'#b91c1c'}}>{err}</Text></View>;

  return (
    <View style={s.box}>
      <FlatList
        data={items}
        keyExtractor={(c) => String(c._id)}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: '/dashboard/course/[id]/materials', params: { id: String(item._id) } }}
            asChild
          >
            <TouchableOpacity style={s.card}>
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.subtitle}>{item.description || 'No description'}</Text>
              <Text style={s.link}>Open Materials ›</Text>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={<Text style={{color:'#6b7280'}}>No enrolled courses</Text>}
      />
    </View>
  );
}
const s = StyleSheet.create({
  c:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#fff'},
  box:{flex:1,backgroundColor:'#fff',padding:16},
  card:{padding:14,borderRadius:12,backgroundColor:'#f3f4f6',marginBottom:10},
  title:{fontWeight:'700',fontSize:16}, subtitle:{color:'#6b7280',marginTop:4},
  link:{ color:'#2563eb', marginTop:8, fontWeight:'600' },
});
