import { StyleSheet, Text, View } from 'react-native';

import { MS } from '@/constants/mindshed';

export function WebUnavailable() {
  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.eyebrow}>MINDSHED PILOT</Text>
        <Text style={styles.title}>A private space for your phone</Text>
        <Text style={styles.body}>
          This pilot is available only in the native iOS and Android apps. The browser version does
          not load wellbeing records, pilot credentials, health data or the research service.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    alignItems: 'center',
    backgroundColor: MS.color.cream,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: MS.color.surface,
    borderColor: MS.color.sage,
    borderRadius: 24,
    borderWidth: 1.5,
    maxWidth: 520,
    padding: 28,
    width: '100%',
  },
  eyebrow: {
    color: MS.color.forest,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: MS.color.inkSoft,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
    marginTop: 10,
  },
  body: {
    color: MS.color.muted,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 14,
  },
});
