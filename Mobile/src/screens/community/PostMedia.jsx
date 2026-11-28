import React, { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowUpRight, Film, Play, VideoOff } from 'lucide-react-native';
import { Notice, ui } from '../../components/ui/Kit';
import { imgUrl } from '../../api/client';
import { c, r } from '../../styles/theme';

export function PostMedia({ value, video, height = 212 }) {
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const url = imgUrl(value);
  if (!url) return null;

  const image = !video;
  if (image && !failed) {
    return (
      <Image
        source={{ uri: url }}
        style={[s.cover, { height }]}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    );
  }

  async function openMedia() {
    if (checking) return;
    setChecking(true);
    setError('');
    try {
      if (video && url.startsWith(imgUrl('/uploads/'))) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 7000);
        try {
          const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
          if (response.status === 404 || response.status === 410) {
            setUnavailable(true);
            return;
          }
          if (response.status >= 500) throw new Error('Media server unavailable');
        } finally {
          clearTimeout(timer);
        }
      }
      await Linking.openURL(url);
    } catch {
      setError('Chưa mở được tệp đính kèm. Bạn có thể thử lại.');
    } finally {
      setChecking(false);
    }
  }

  if (video && unavailable) return <View style={s.mediaCard}>
    <VideoOff size={20} color={c.muted} />
    <Text style={[ui.small, ui.fill]}>Video đính kèm hiện không khả dụng.</Text>
  </View>;

  let host = '';
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    host = 'Liên kết ngoài';
  }

  return (
    <View style={{ gap: 6 }}>
      {failed ? <Text style={ui.small}>Chưa tải trực tiếp được ảnh đính kèm.</Text> : null}
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={video ? 'Mở video đính kèm' : 'Mở liên kết đính kèm'}
        accessibilityState={{ busy: checking, disabled: checking }}
        disabled={checking}
        onPress={openMedia}
        style={({ pressed }) => [s.mediaCard, video && s.videoCard, pressed && { opacity: 0.86 }]}
      >
        <View style={[s.mediaIcon, video && s.videoIcon]}>
          {video ? (
            <Play size={17} color="#FFFEFA" fill="#FFFEFA" />
          ) : (
            <Film size={17} color={c.terracotta} />
          )}
        </View>
        <View style={ui.fill}>
          <Text style={[ui.label, video && { color: '#FFFEFA' }]}>
            {checking ? 'Đang mở…' : video ? 'Xem video' : 'Mở tư liệu đính kèm'}
          </Text>
          <Text style={[ui.small, video && { color: c.primaryLight }]} numberOfLines={1}>
            {host}
          </Text>
        </View>
        <ArrowUpRight size={18} color={video ? c.peach : c.terracotta} />
      </Pressable>
      <Notice error>{error}</Notice>
    </View>
  );
}

const s = StyleSheet.create({
  cover: {
    width: '100%',
    borderRadius: r.lg,
    backgroundColor: c.surfaceMuted,
  },
  mediaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.lineStrong,
    backgroundColor: c.surfaceElevated,
  },
  videoCard: {
    backgroundColor: c.ink,
    borderColor: c.ink,
  },
  mediaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.terracottaSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIcon: {
    backgroundColor: c.terracotta,
  },
});
