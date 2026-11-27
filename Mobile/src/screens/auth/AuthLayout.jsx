import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Leaf } from 'lucide-react-native';
import { Page, Title, Notice, ui } from '../../components/ui/Kit';
import { c } from '../../styles/theme';

export function AuthLayout({ navigation, title, detail, step, error, children }) {
  return <Page title="VeggieAI" back={navigation.goBack} keyboard>
    <View style={styles.band}>
      <Leaf size={23} color={c.primary} />
      <Text style={ui.label}>Sổ tay bếp chay</Text>
    </View>
    <Title title={title} detail={detail} eyebrow={step} />
    <Notice error>{error}</Notice>
    <View style={ui.card}>{children}</View>
  </Page>;
}

const styles = StyleSheet.create({
  band: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 15, backgroundColor: c.primaryLight, gap: 9 },
});
