import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CourseBaseRedirect() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  useEffect(() => {
    if (id) router.replace({ pathname: '/teacher/course/[id]/materials', params: { id } });
  }, [id]);
  return null;
}
