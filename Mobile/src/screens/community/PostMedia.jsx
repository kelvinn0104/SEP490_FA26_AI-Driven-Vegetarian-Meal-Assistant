import React, { useState } from 'react';
import { Image, Linking, Text, View, StyleSheet } from 'react-native';
import { ArrowUpRight, Film } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { Notice, ui } from '../../components/ui/Kit';
import { imgUrl } from '../../api/client';
import { c } from '../../styles/theme';

export function PostMedia({ value, video }) {
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState('');
  const url = imgUrl(value);
  if (!url) return null;
  const image = !video && /\.(jpe?g|png|webp|gif)(?:[?#]|$)/i.test(url);
  if (image && !failed) return <Image source={{ uri: url }} style={s.cover} resizeMode="cover" onError={() => setFailed(true)} />;
  return <View style={ui.group}>
    {failed && <Text style={ui.small}>Chưa tải được ảnh.</Text>}
    <Button title={video ? 'Mở video' : 'Mở liên kết'} variant="secondary" icon={video ? Film : ArrowUpRight}
      onPress={() => Linking.openURL(url).catch(() => setError('Chưa mở được liên kết này.'))} />
    <Notice error>{error}</Notice>
  </View>;
}
const s = StyleSheet.create({ cover: { width: '100%', height: 204, borderRadius: 14, backgroundColor: c.primaryLight } });
