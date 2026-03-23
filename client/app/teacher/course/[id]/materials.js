// app/teacher/course/[id]/materials.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, Button, Alert, StyleSheet,
  TouchableOpacity, Linking, Share
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { api, BASE_URL } from '../../../../src/api';

export default function TeacherMaterials() {
  const { id: courseId } = useLocalSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Access key state { code, expiresAt } | null
  const [keyInfo, setKeyInfo] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/courses/${courseId}/materials`);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const buildUrl = (u) => (u?.startsWith('http') ? u : `${BASE_URL}${u || ''}`);

  async function openItem(item) {
    const url = buildUrl(item.sourceUrl);
    if (!url) return;
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else Alert.alert('Cannot open', 'No app found to open this file.');
    } catch {
      Alert.alert('Error', 'Failed to open file.');
    }
  }

  async function remove(materialId) {
    try {
      await api.delete(`/api/materials/${materialId}`);
      setItems((prev) => prev.filter((m) => m._id !== materialId));
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Delete failed');
    }
  }

  async function pickAndUpload() {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
        type: [
          'application/pdf',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
      });
      if (res.canceled) return;

      const f = res.assets?.[0] || res;
      const uri = f.uri;
      const name = f.name || 'upload';
      const mime = f.mimeType || 'application/octet-stream';

      const form = new FormData();
      form.append('title', name);
      const type =
        mime.includes('pdf') ? 'pdf' :
        (mime.includes('presentation') || mime.includes('powerpoint')) ? 'ppt' :
        mime.includes('word') ? 'docx' :
        mime.includes('text') ? 'note' : 'pdf';
      form.append('type', type);
      form.append('file', { uri, name, type: mime });

      await api.post(`/api/courses/${courseId}/materials`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      Alert.alert('Uploaded', name);
      load();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Upload failed');
    }
  }

  // ----- Access key helpers -----
  async function rotateKey() {
    try {
      const { data } = await api.post(`/api/courses/${courseId}/rotate-key`);
      setKeyInfo(data); // { code, expiresAt }
      Alert.alert('New Access Key', `${data.code} (expires ${new Date(data.expiresAt).toLocaleTimeString()})`);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to rotate key');
    }
  }

  async function copyToClipboard(text, title = 'Copied') {
    try {
      await Clipboard.setStringAsync(String(text));
      Alert.alert(title, String(text));
    } catch {}
  }

  async function shareInvite() {
    try {
      const lines = [
        'Join my course:',
        `Course ID: ${courseId}`,
        keyInfo?.code ? `Access Key: ${keyInfo.code}` : 'Access Key: (generate a key first)',
        keyInfo?.expiresAt ? `Expires: ${new Date(keyInfo.expiresAt).toLocaleString()}` : '',
      ].filter(Boolean);
      await Share.share({ message: lines.join('\n') });
    } catch {}
  }

  function Row({ item }) {
    return (
      <View style={s.row}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => openItem(item)}>
          <Text style={s.title} numberOfLines={1}>{item.title}</Text>
          <Text style={s.meta}>{item.type} • {new Date(item.createdAt).toLocaleString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => remove(item._id)}>
          <Text style={s.delete}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Header row */}
      <View style={s.header}>
        <Text style={s.h1}>Materials</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Access Key" onPress={rotateKey} />
          <Button title="Upload" onPress={pickAndUpload} />
        </View>
      </View>

      {/* Share panel: Course ID + Access Key */}
      <View style={s.shareCard}>
        <View style={s.rowBetween}>
          <Text style={s.shareLabel}>Course ID</Text>
          <TouchableOpacity onPress={() => copyToClipboard(courseId, 'Course ID copied')}>
            <Text style={s.copy}>Copy</Text>
          </TouchableOpacity>
        </View>
        <Text selectable style={s.shareValue}>{courseId}</Text>

        <View style={s.sep} />

        <View style={s.rowBetween}>
          <Text style={s.shareLabel}>Access Key</Text>
          {!!keyInfo?.code && (
            <TouchableOpacity onPress={() => copyToClipboard(keyInfo.code, 'Access key copied')}>
              <Text style={s.copy}>Copy</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text selectable style={s.shareValue}>
          {keyInfo?.code
            ? `${keyInfo.code}  (expires ${new Date(keyInfo.expiresAt).toLocaleTimeString()})`
            : 'Tap "Access Key" to generate'}
        </Text>

        <View style={{ height: 8 }} />
        <Button title="Share Invite" onPress={shareInvite} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it._id)}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={<Text style={s.empty}>No materials yet</Text>}
        renderItem={({ item }) => <Row item={item} />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  h1: { fontSize: 20, fontWeight: '700' },

  shareCard: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: '#fafafa' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shareLabel: { fontWeight: '700', color: '#111827' },
  shareValue: { marginTop: 4, color: '#111827' },
  copy: { color: '#2563eb', fontWeight: '700' },
  sep: { height: 8 },

  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#111827' },
  meta: { marginTop: 4, color: '#6b7280' },
  delete: { color: '#b91c1c', fontWeight: '600', padding: 8 },
});
