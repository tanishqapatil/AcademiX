import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function StudentCourseBase() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace({ pathname: '/dashboard/course/[id]/materials', params: { id } });
    }
  }, [id]);

  return null;
}
