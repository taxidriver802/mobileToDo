// FireFlickerGradient.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '@/hooks/useTheme'; // your hook

const AnimatedLG = Animated.createAnimatedComponent(LinearGradient);

export default function FireFlickerGradient({
  style,
  variant = 'background', // 'background' | 'surface' | 'primary' etc.
}: {
  style?: object;
  variant?: keyof ReturnType<typeof useTheme>['colors']['gradients'];
}) {
  const { colors } = useTheme();

  // Base theme gradient (e.g. background) as the “neutral flame”
  const base = colors.gradients[variant];

  // Two warmer variants to layer in (tweak these to taste)
  const warm1: [string, string] = [
    shift(base[0], 20, 10),
    shift(base[1], -10, 15),
  ];
  const warm2: [string, string] = [
    shift(base[0], 35, 20),
    shift(base[1], 10, 25),
  ];

  // Opacity drivers
  const o1 = useRef(new Animated.Value(1)).current; // base layer (steady)
  const o2 = useRef(new Animated.Value(0)).current; // warm1 (flicker in/out)
  const o3 = useRef(new Animated.Value(0)).current; // warm2 (occasional burst)

  useEffect(() => {
    const jitter = (val: Animated.Value, min = 120, max = 260) =>
      Animated.timing(val, {
        toValue: Math.random() * 0.5 + 0.25, // 0.25–0.75
        duration: Math.floor(Math.random() * (max - min)) + min,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });

    const loop = Animated.loop(
      Animated.sequence([
        jitter(o2),
        jitter(o3, 80, 180),
        jitter(o2, 150, 300),
        jitter(o3, 120, 220),
      ]),
      { resetBeforeIteration: true }
    );

    loop.start();
    return () => loop.stop();
  }, [o2, o3]);

  return (
    <View style={[styles.wrap, style]}>
      {/* Steady base glow */}
      <AnimatedLG
        style={StyleSheet.absoluteFill}
        colors={base}
        start={{ x: 0.2, y: 0.0 }}
        end={{ x: 0.8, y: 1.0 }}
        pointerEvents="none"
      />
      {/* Mid warmth */}
      <AnimatedLG
        style={[StyleSheet.absoluteFill, { opacity: o2 }]}
        colors={warm1}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        pointerEvents="none"
      />
      {/* Hot bursts */}
      <AnimatedLG
        style={[StyleSheet.absoluteFill, { opacity: o3 }]}
        colors={warm2}
        start={{ x: 0.3, y: 0.0 }}
        end={{ x: 0.7, y: 1.0 }}
        pointerEvents="none"
      />
    </View>
  );
}

// --- helpers ---
// small HSL-ish hue/brightness nudge to keep colors in the same family
function shift(hex: string, hueNudge = 15, lightNudge = 10) {
  const [r, g, b] = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return hslToHex(
    (h + hueNudge) % 360,
    s,
    Math.max(0, Math.min(100, l + lightNudge))
  );
}

function hexToRgb(hex: string) {
  const s = hex.replace('#', '');
  const n = parseInt(
    s.length === 3
      ? s
          .split('')
          .map(c => c + c)
          .join('')
      : s,
    16
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;
  const d = max - min;
  if (d === 0) s = 0;
  else {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject },
});
