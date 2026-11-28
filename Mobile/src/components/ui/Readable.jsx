import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { c, font } from '../../styles/theme';

function RichText({ text, style }) {
  const parts = String(text ?? '').split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={[s.body, style]}>
      {parts.map((part, index) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <Text key={index} style={s.bold}>
            {part.slice(2, -2)}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
}

export function Readable({ content, style }) {
  const lines = String(content ?? '').trim().split(/\r?\n/);
  return (
    <View style={s.wrap}>
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();
        if (!line) return <View key={index} style={s.spacer} />;

        if (/^#{1,6}\s+/.test(line)) {
          return (
            <RichText
              key={index}
              text={line.replace(/^#{1,6}\s+/, '')}
              style={[s.heading, style]}
            />
          );
        }

        const numbered = line.match(/^(\d+)[.)]\s+(.*)$/);
        if (numbered) {
          return (
            <View key={index} style={s.listRow}>
              <View style={s.numBadge}>
                <Text style={s.numText}>{numbered[1]}</Text>
              </View>
              <View style={s.fill}>
                <RichText text={numbered[2]} style={style} />
              </View>
            </View>
          );
        }

        if (/^[-*•]\s+/.test(line)) {
          return (
            <View key={index} style={s.listRow}>
              <View style={s.dot} />
              <View style={s.fill}>
                <RichText text={line.replace(/^[-*•]\s+/, '')} style={style} />
              </View>
            </View>
          );
        }

        return <RichText key={index} text={line} style={style} />;
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 7 },
  spacer: { height: 4 },
  fill: { flex: 1, minWidth: 0 },
  body: {
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 23,
    color: c.ink,
    includeFontPadding: false,
  },
  bold: {
    fontFamily: font.semi,
    color: c.ink,
  },
  heading: {
    fontFamily: font.serifBold,
    fontSize: 18,
    lineHeight: 25,
    color: c.ink,
    marginTop: 6,
    includeFontPadding: false,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: c.terracotta,
    marginTop: 9,
  },
  numBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: c.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    paddingHorizontal: 5,
  },
  numText: {
    fontFamily: font.semi,
    fontSize: 11.5,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
});
