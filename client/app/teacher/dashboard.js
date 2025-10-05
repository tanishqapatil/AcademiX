import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function TeacherDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Dashboard</Text>
      <Text style={styles.subtitle}>Manage your courses and students effectively</Text>

      {/* My Courses */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: '#3b82f6' }]} 
        onPress={() => router.push('/teacher/courses')}
      >
        <Text style={styles.cardTitle}>📚 My Courses</Text>
        <Text style={styles.cardDesc}>View and manage all your created courses</Text>
      </TouchableOpacity>

      {/* Create Course */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: '#10b981' }]} 
        onPress={() => router.push('/teacher/CreateCourse')}
      >
        <Text style={styles.cardTitle}>➕ Create Course</Text>
        <Text style={styles.cardDesc}>Easily add a new course for your students</Text>
      </TouchableOpacity>

      {/* Enrolled Students */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: '#f59e0b' }]} 
        onPress={() => router.push('/teacher/students')}
      >
        <Text style={styles.cardTitle}>👩‍🎓 Enrolled Students</Text>
        <Text style={styles.cardDesc}>Check students who joined your courses</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: '#ef4444' }]} 
        onPress={() => router.push('/auth/login')}
      >
        <Text style={styles.cardTitle}>🚪 Logout</Text>
        <Text style={styles.cardDesc}>Sign out of your teacher account safely</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 20 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#1e3a8a', textAlign: 'center', marginTop: 20, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 28 },
  card: { borderRadius: 18, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  cardDesc: { fontSize: 14, color: '#f1f5f9' },
});
