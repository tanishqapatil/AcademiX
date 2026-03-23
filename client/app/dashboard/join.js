import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { api } from '../../src/api';

export default function JoinCourse() {
  const [courseId, setCourseId] = useState('');
  const [code, setCode] = useState('');

  async function join() {
    try {
      if (!courseId.trim() || !code.trim()) return Alert.alert('Missing', 'Enter course id and access key');
      await api.post(`/api/courses/${courseId.trim()}/join`, { code: code.trim().toUpperCase() });
      Alert.alert('Joined', 'You are enrolled in the course.');
      setCourseId(''); setCode('');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to join course');
    }
  }

  return (
    <View style={s.box}>
      <Text style={s.h1}>Join a Course</Text>
      <TextInput style={s.input} placeholder="Course ID (e.g., 6704e7...)" value={courseId} onChangeText={setCourseId} autoCapitalize="none" />
      <TextInput style={s.input} placeholder="Access Key (e.g., ABC123)" value={code} onChangeText={setCode} autoCapitalize="characters" />
      <Button title="Join Course" onPress={join} />
    </View>
  );
}
const s = StyleSheet.create({
  box:{ flex:1, backgroundColor:'#fff', padding:16, justifyContent:'center' },
  h1:{ fontSize:20, fontWeight:'700', marginBottom:12 },
  input:{ borderWidth:1, borderColor:'#e5e7eb', padding:12, borderRadius:10, marginBottom:12 },
});
