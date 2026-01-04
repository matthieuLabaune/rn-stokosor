import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ACTION_WIDTH = 80;
const SWIPE_THRESHOLD = ACTION_WIDTH * 0.5;

interface SwipeAction {
  icon: string;
  color: string;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  leftAction,
  rightAction,
  onSwipeStart,
  onSwipeEnd,
}) => {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const isActive = useSharedValue(false);
  const hasTriggeredHaptic = useRef(false);

  const triggerHaptic = () => {
    if (!hasTriggeredHaptic.current) {
      hasTriggeredHaptic.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const resetHaptic = () => {
    hasTriggeredHaptic.current = false;
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onStart(() => {
      isActive.value = true;
      if (onSwipeStart) {
        runOnJS(onSwipeStart)();
      }
    })
    .onUpdate((event) => {
      // Limiter le déplacement selon les actions disponibles
      const maxLeft = leftAction ? ACTION_WIDTH : 0;
      const maxRight = rightAction ? -ACTION_WIDTH : 0;

      translateX.value = Math.max(maxRight, Math.min(maxLeft, event.translationX));

      // Haptic feedback au seuil
      if (Math.abs(translateX.value) >= SWIPE_THRESHOLD && !hasTriggeredHaptic.current) {
        runOnJS(triggerHaptic)();
      } else if (Math.abs(translateX.value) < SWIPE_THRESHOLD) {
        runOnJS(resetHaptic)();
      }
    })
    .onEnd(() => {
      isActive.value = false;
      runOnJS(resetHaptic)();

      // Si swipe suffisant, exécuter l'action
      if (translateX.value >= SWIPE_THRESHOLD && leftAction) {
        runOnJS(leftAction.onPress)();
      } else if (translateX.value <= -SWIPE_THRESHOLD && rightAction) {
        runOnJS(rightAction.onPress)();
      }

      // Retour à la position initiale
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
      });

      if (onSwipeEnd) {
        runOnJS(onSwipeEnd)();
      }
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.8, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, -SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, -SWIPE_THRESHOLD],
      [0.8, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Actions de fond */}
      <View style={styles.actionsContainer}>
        {leftAction && (
          <Animated.View
            style={[
              styles.action,
              styles.leftAction,
              { backgroundColor: leftAction.color },
              leftActionStyle,
            ]}
          >
            <Icon name={leftAction.icon as any} size={24} color="white" />
          </Animated.View>
        )}
        {rightAction && (
          <Animated.View
            style={[
              styles.action,
              styles.rightAction,
              { backgroundColor: rightAction.color },
              rightActionStyle,
            ]}
          >
            <Icon name={rightAction.icon as any} size={24} color="white" />
          </Animated.View>
        )}
      </View>

      {/* Contenu principal */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, contentStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  actionsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  action: {
    width: ACTION_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftAction: {
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
  },
  rightAction: {
    borderTopRightRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  content: {
    backgroundColor: 'transparent',
  },
});

export default SwipeableRow;
