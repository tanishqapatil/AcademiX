import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, RefreshControl,
  TouchableOpacity, StyleSheet, Linking, Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api, BASE_URL } from '../../../../src/api';

const POLL_MS = 2000;
const POLL_TRIES = 5;

export default function StudentCourseMaterials() {
  const { id: courseId } = useLocalSearchParams();
  const [items, setItems] = useState([]);
  const [conversions, setConversions] = useState({});   // materialId -> conversions[]
  const [busy, setBusy] = useState({});                 // materialId -> boolean
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const buildUrl = (u) => (u?.startsWith('http') ? u : `${BASE_URL}${u || ''}`);

  const fetchConversions = useCallback(async (materialId) => {
    try {
      const { data } = await api.get(`/api/materials/${materialId}/conversions`);
      const list = Array.isArray(data) ? data : [];
      setConversions((prev) => ({ ...prev, [materialId]: list }));
      return list;
    } catch {
      return conversions[materialId] || [];
    }
  }, [conversions]);

  const loadMaterials = useCallback(async () => {
    try {
      setErr(''); setLoading(true);
      const { data } = await api.get(`/api/courses/${courseId}/materials`);
      const list = Array.isArray(data) ? data : [];
      setItems(list);

      const out = {};
      await Promise.all(list.map(async (m) => {
        try {
          const { data: conv } = await api.get(`/api/materials/${m._id}/conversions`);
          out[m._id] = Array.isArray(conv) ? conv : [];
        } catch { out[m._id] = []; }
      }));
      setConversions(out);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load materials');
    } finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { loadMaterials(); }, [loadMaterials]);

  async function openUrl(url) {
    if (!url) return;
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else Alert.alert('Cannot open', 'No app found to open this file.');
    } catch { Alert.alert('Error', 'Failed to open file.'); }
  }

  // ✅ Only ONE API call. Choose either the path style (kept) OR body style (commented).
  async function convert(materialId, kind) {
    if (busy[materialId]) return;
    setBusy((b) => ({ ...b, [materialId]: true }));
    try {
      // ---- keep ONE of these lines; we use the path style:
      await api.post(`/api/materials/${materialId}/convert/${kind}`);  // kind = 'audio' | 'video'
      // await api.post(`/api/materials/${materialId}/convert`, { kind }); // <-- alternative

      // Optimistic: show queued right away
      setConversions((prev) => {
        const curr = prev[materialId] || [];
        return { ...prev, [materialId]: [{ kind, status: 'queued', _id: `tmp-${Date.now()}` }, ...curr] };
      });

      // Short polling so UI flips to ready without manual refresh
      for (let i = 0; i < POLL_TRIES; i++) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        const conv = await fetchConversions(materialId);
        const ready = conv.find((c) => c.kind === kind && c.status === 'ready');
        if (ready) {
          Alert.alert('Done', kind === 'audio' ? 'Audio ready' : 'PPT created');
          break;
        }
      }
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Conversion failed');
    } finally {
      setBusy((b) => ({ ...b, [materialId]: false }));
    }
  }

  function latestByKind(list, kind) {
    const filtered = (list || []).filter((c) => c.kind === kind);
    const rank = { ready: 0, processing: 1, queued: 2, failed: 3 };
    return filtered.sort((a, b) => {
      const r = (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
      if (r !== 0) return r;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    })[0];
  }

  function StatusChip({ status }) {
    const map = {
      ready: { bg: '#dcfce7', fg: '#166534', text: 'ready' },
      processing: { bg: '#e0f2fe', fg: '#075985', text: 'processing' },
      queued: { bg: '#fef9c3', fg: '#854d0e', text: 'queued' },
      failed: { bg: '#fee2e2', fg: '#991b1b', text: 'failed' },
    };
    const s = map[status] || map.queued;
    return <View style={[chip.c, { backgroundColor: s.bg }]}><Text style={[chip.t, { color: s.fg }]}>{s.text}</Text></View>;
  }

  function Row({ m }) {
    const conv = conversions[m._id] || [];
    const audio = latestByKind(conv, 'audio');
    const video = latestByKind(conv, 'video');
    const isBusy = !!busy[m._id];

    return (
      <View style={st.row}>
        <View style={{ flex: 1 }}>
          <Text style={st.title} numberOfLines={1}>{m.title}</Text>
          <Text style={st.meta}>{m.type} • {new Date(m.createdAt).toLocaleString()}</Text>

          <View style={st.line}>
            <Text style={st.label}>Audio</Text>
            {audio ? <StatusChip status={audio.status} /> : <Text style={st.dim}>—</Text>}
            {audio?.status === 'ready' && audio.outputUrl && (
              <TouchableOpacity onPress={() => openUrl(buildUrl(audio.outputUrl))}><Text style={st.link}>Play</Text></TouchableOpacity>
            )}
          </View>

          <View style={st.line}>
            <Text style={st.label}>PPT</Text>
            {video ? <StatusChip status={video.status} /> : <Text style={st.dim}>—</Text>}
            {video?.status === 'ready' && video.outputUrl && (
              <TouchableOpacity onPress={() => openUrl(buildUrl(video.outputUrl))}><Text style={st.link}>Open</Text></TouchableOpacity>
            )}
          </View>
        </View>

        <View style={st.actions}>
          <TouchableOpacity style={[st.btn, isBusy && st.btnDis]} disabled={isBusy} onPress={() => convert(m._id, 'audio')}>
            <Text style={st.btnTxt}>{isBusy ? '…' : 'Audio'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.btn, isBusy && st.btnDis]} disabled={isBusy} onPress={() => convert(m._id, 'video')}>
            <Text style={st.btnTxt}>{isBusy ? '…' : 'PPT'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading && items.length === 0) {
    return <View style={st.center}><ActivityIndicator /><Text>Loading…</Text></View>;
  }
  if (err) {
    return <View style={st.center}><Text style={{ color: '#b91c1c' }}>{err}</Text></View>;
  }

  return (
    <View style={st.container}>
      <Text style={st.h1}>Materials</Text>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it._id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadMaterials} />}
        ListEmptyComponent={<Text style={st.empty}>No materials yet</Text>}
        renderItem={({ item }) => <Row m={item} />}
      />
    </View>
  );
}

const chip = StyleSheet.create({
  c: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  t: { fontSize: 12, fontWeight: '700' },
});

const st = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fff', padding:16 },
  center:{ flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#fff' },
  h1:{ fontSize:20, fontWeight:'700', marginBottom:12 },
  empty:{ textAlign:'center', color:'#6b7280', marginTop:40 },

  row:{ paddingVertical:12, borderBottomWidth:StyleSheet.hairlineWidth, borderBottomColor:'#e5e7eb',
        flexDirection:'row', alignItems:'center', gap:12 },
  title:{ fontSize:16, fontWeight:'600', color:'#111827' },
  meta:{ marginTop:4, color:'#6b7280' },

  line:{ flexDirection:'row', alignItems:'center', gap:8, marginTop:6 },
  label:{ fontSize:13, fontWeight:'700', color:'#111827' },
  dim:{ color:'#9ca3af' },
  link:{ color:'#2563eb', fontWeight:'700' },

  actions:{ gap:8, marginLeft:8 },
  btn:{ backgroundColor:'#e5e7eb', paddingHorizontal:10, paddingVertical:6, borderRadius:8, alignItems:'center' },
  btnDis:{ opacity:0.6 },
  btnTxt:{ fontWeight:'700', color:'#111827' },
});
