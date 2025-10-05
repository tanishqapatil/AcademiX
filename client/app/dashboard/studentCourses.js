import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [accessKey, setAccessKey] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // list my courses
      const res = await api.get('/api/courses/student/courses');
      // join by key
      await api.post(`/api/courses/${courseId}/join`, { code: accessKey });

      setCourses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const joinCourse = async () => {
    if (!accessKey) return;
    try {
      await axios.post('https://your-backend.com/api/student/join', { key: accessKey });
      setAccessKey('');
      fetchCourses();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={{
          backgroundColor: '#3b82f6', // blue
          paddingVertical: 8,          // smaller height
          paddingHorizontal: 16,       // smaller width
          borderRadius: 12,
          alignSelf: 'flex-start',     // button aligns to left
          marginBottom: 32,
          marginTop: 32,
        }}
        onPress={() => router.push('/dashboard/student')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>← Back</Text>
      </TouchableOpacity>



      <Text style={styles.title}>My Courses</Text>
      <Text style={styles.subtitle}>Manage all the courses you are enrolled in</Text>

      <TextInput
        placeholder="Enter Access Key"
        style={styles.input}
        value={accessKey}
        onChangeText={setAccessKey}
      />
      <TouchableOpacity style={styles.actionBtn} onPress={joinCourse}>
        <Text style={styles.actionBtnText}>Join Course</Text>
      </TouchableOpacity>

      <FlatList
        data={courses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.courseName}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  actionBtn: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24, // spacing between buttons and other content
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});
