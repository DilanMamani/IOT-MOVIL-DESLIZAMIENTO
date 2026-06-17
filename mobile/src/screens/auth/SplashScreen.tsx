import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;
  const sloganFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
      Animated.timing(sloganFade, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => navigation.replace('Login'), 3200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>

      <Animated.View style={[styles.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
        
        {/* Badge minimalista */}
        <View style={styles.badge}>
          <Ionicons name="layers-outline" size={26} color="#FAF7F2" />
        </View>

        {/* Nombre */}
        <Text style={styles.appName}>SlideWatch</Text>
        <Text style={styles.tagline}>Sistema de alerta temprana</Text>

      </Animated.View>

      {/* Slogan */}
      <Animated.View style={[styles.sloganWrap, { opacity: sloganFade }]}>
        <View style={styles.divider} />
        <Text style={styles.slogan}>
          El terreno{' '}
          <Text style={styles.sloganAccent}>siempre avisa.</Text>
        </Text>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C1A0E',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    paddingHorizontal: 48,
  },
  content: {
    alignItems: 'center',
    gap: 14,
  },
  badge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#3D2010',
    borderWidth: 1,
    borderColor: '#C4622D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appName: {
    color: '#FAF7F2',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tagline: {
    color: '#7A6055',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sloganWrap: {
    alignItems: 'center',
    gap: 16,
  },
  divider: {
    width: 32,
    height: 1,
    backgroundColor: '#C4622D',
    opacity: 0.5,
  },
  slogan: {
    color: '#A89080',
    fontSize: 18,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  sloganAccent: {
    color: '#C4622D',
    fontWeight: '600',
    fontStyle: 'italic',
  },
});