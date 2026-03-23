import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StudentDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try { await AsyncStorage.clear(); } finally { router.replace('/auth/login'); }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.title}>Student Dashboard</Text>
      <Text style={s.subtitle}>Welcome! Manage your courses and learning here.</Text>

      <TouchableOpacity style={[s.card, s.leftPurple]} onPress={() => router.push('/dashboard/join')}>
        <Text style={[s.cardTitle, { color: '#8b5cf6' }]}>Join a Course</Text>
        <Text style={s.cardDesc}>Enter course ID and access key to enroll.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.card, s.leftIndigo]} onPress={() => router.push('/dashboard/studentCourses')}>
        <Text style={[s.cardTitle, { color: '#4f46e5' }]}>My Courses</Text>
        <Text style={s.cardDesc}>See all courses you’re enrolled in.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.card, s.leftBlue]} onPress={() => router.push('/dashboard/studentCourses')}>
        <Text style={[s.cardTitle, { color: '#3b82f6' }]}>Materials</Text>
        <Text style={s.cardDesc}>Pick a course to view materials.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.card, s.leftRed]} onPress={handleLogout}>
        <Text style={[s.cardTitle, { color: '#ef4444' }]}>Logout</Text>
        <Text style={s.cardDesc}>Sign out of your account safely.</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#f9fafb', padding:16 },
  title:{ fontSize:28, fontWeight:'bold', marginTop:40, marginBottom:8, textAlign:'center', color:'#111827' },
  subtitle:{ fontSize:16, color:'#6b7280', textAlign:'center', marginBottom:28 },
  card:{ backgroundColor:'#fff', borderRadius:20, padding:20, marginBottom:16, elevation:5,
    shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.08, shadowRadius:6 },
  cardTitle:{ fontSize:20, fontWeight:'600', marginBottom:8 },
  cardDesc:{ fontSize:14, color:'#6b7280' },
  leftPurple:{ borderLeftColor:'#8b5cf6', borderLeftWidth:6 },
  leftIndigo:{ borderLeftColor:'#4f46e5', borderLeftWidth:6 },
  leftBlue:{ borderLeftColor:'#3b82f6', borderLeftWidth:6 },
  leftRed:{ borderLeftColor:'#ef4444', borderLeftWidth:6 },
});
