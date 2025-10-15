import React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';

type Props = {
  open: boolean;
  onOpenStart?: () => void;
  onOpenEnd?: () => void;
  onCloseStart?: () => void;
  onCloseEnd?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
  heightPct?: number;
  backdropOpacity?: number;
  durationMs?: number;
  withBackdrop?: boolean;
  sheetStyle?: StyleProp<ViewStyle>;
  backdropStyle?: StyleProp<ViewStyle>;
  dismissOnBackdropPress?: boolean;
};

const { height: SCREEN_H } = Dimensions.get('window');

export default function SlideUpSheet({
  open,
  onOpenStart,
  onOpenEnd,
  onCloseStart,
  onCloseEnd,
  onClose,
  children,
  heightPct = 0.9,
  backdropOpacity = 0.35,
  durationMs = 260,
  withBackdrop = true,
  sheetStyle,
  backdropStyle,
  dismissOnBackdropPress = true,
}: Props) {
  const sheetH = Math.round(SCREEN_H * heightPct);

  const [mounted, setMounted] = React.useState(open);
  const translateY = React.useRef(new Animated.Value(sheetH)).current;
  const fade = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      onOpenStart?.();
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: durationMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: withBackdrop ? backdropOpacity : 0,
          duration: durationMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onOpenEnd?.();
      });
    } else if (mounted) {
      onCloseStart?.();

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: sheetH,
          duration: durationMs,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0,
          duration: durationMs,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMounted(false);
        onCloseEnd?.();
      });
    }
  }, [
    open,
    mounted,
    translateY,
    fade,
    sheetH,
    backdropOpacity,
    durationMs,
    withBackdrop,
  ]);

  if (!mounted) return null;

  const Backdrop = (
    <Animated.View
      style={[styles.backdrop, { opacity: fade }, backdropStyle]}
    />
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop (optional) */}
      {withBackdrop ? (
        dismissOnBackdropPress ? (
          <TouchableWithoutFeedback onPress={onClose}>
            {Backdrop}
          </TouchableWithoutFeedback>
        ) : (
          Backdrop
        )
      ) : null}

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { height: sheetH, transform: [{ translateY }] },
          sheetStyle,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#1e1e1e',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
});
