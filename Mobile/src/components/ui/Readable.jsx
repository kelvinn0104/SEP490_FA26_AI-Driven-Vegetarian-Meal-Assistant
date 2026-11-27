import React from 'react';
import { Text, View } from 'react-native';
import { c } from '../../styles/theme';
import { ui } from './Kit';

export function Readable({ content, style }) {
  const lines = String(content ?? '').trim().split(/\r?\n/);
  return <View style={{ gap: 4 }}>
    {lines.map((line, index) => {
      const heading = /^#{1,6}\s+/.test(line);
      const parts = line.replace(/^#{1,6}\s+/, '').replace(/^[-*]\s+/, '•  ').split(/(\*\*[^*]+\*\*)/g);
      return line ? <Text key={index} style={[ui.body, { color: c.ink }, heading && ui.h2, style]}>
        {parts.map((part, n) => part.startsWith('**') && part.endsWith('**')
          ? <Text key={n} style={{ fontWeight: '700' }}>{part.slice(2, -2)}</Text> : part)}
      </Text> : <View key={index} style={{ height: 4 }} />;
    })}
  </View>;
}
