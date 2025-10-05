import React, { useState } from 'react';
import { Alert, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { api } from '../../src/api';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const handleSignup = async () => {
    if (!name || !email || !password || !role) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const isGmail = /^[^\s@]+@gmail\.com$/i.test(email);
      if (!isGmail) {
        Alert.alert('Error', 'Please use a @gmail.com email');
        return;
      }
      if (!['teacher','student'].includes(role)) {
        Alert.alert('Error', "Role must be 'teacher' or 'student'");
        return;
      }

      const res = await api.post('/api/auth/register', { name, email, password, role });

      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userType', res.data.user.role);

      Alert.alert('Success', 'Account created successfully');

      if (res.data.user.role === 'teacher') {
        router.replace('/teacher/dashboard');
      } else {
        router.replace('/dashboard/student');
      }

    } catch (err) {
  console.log("Signup error:", err.response?.data || err.message);
  Alert.alert('Signup Failed', err.response?.data?.message || err.message || 'Try again');
}

  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        label="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        mode="outlined"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        mode="outlined"
      />
      <TextInput
        label="Role (teacher/student)"
        value={role}
        onChangeText={setRole}
        style={styles.input}
        mode="outlined"
      />

      <Button mode="contained" onPress={handleSignup} style={styles.button}>
        Sign Up
      </Button>

      <Text
        style={styles.loginText}
        onPress={() => router.push('/auth/login')}
      >
        Already have an account? Login here
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 30 },
  input: { width: '100%', marginBottom: 15 },
  button: { width: '100%', marginVertical: 10, padding: 5 },
  loginText: { marginTop: 10, color: '#1e90ff', fontWeight: 'bold' },
});
