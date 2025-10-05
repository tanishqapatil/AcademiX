import React, { useState } from 'react';
import { Alert, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { api } from '../../src/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const res = await api.post('/api/auth/login', { email, password });

      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userType', res.data.user.role);

      if (res.data.user.role === 'teacher') {
        router.replace('/teacher/dashboard');
      } else {
        router.replace('/dashboard/student');
      }

    } catch (err) {
      if (err.response) {
        setErrorMessage(`❌ ${err.response.data.message || "Server error"}`);
      } else {
        setErrorMessage(`❌ Network error: ${err.message}`);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>

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

      {errorMessage ? <Text style={{ color: "red", marginBottom: 10 }}>{errorMessage}</Text> : null}

      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login
      </Button>

      <Text
        style={styles.signupText}
        onPress={() => router.push('/auth/signup')}
      >
        Don’t have an account? Sign Up
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
  signupText: { marginTop: 10, color: '#1e90ff', fontWeight: 'bold' },
});
