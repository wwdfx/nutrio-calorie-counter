import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Animated,
  PanResponder,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SwipeableDeleteRowProps {
  children: React.ReactNode;
  enabled?: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDeletePress: () => void;
  deleteAccessibilityLabel?: string;
  /** Optional chevron rendered on the right that smoothly fades out as the delete tile reveals */
  rightAccessory?: React.ReactNode;
}

const SWIPE_SHIFT = 42; // Slides the row left so half of the '+' circle clips cleanly at the card edge
const DELETE_BTN_WIDTH = 66;

export function SwipeableDeleteRow({
  children,
  enabled = true,
  isOpen,
  onOpen,
  onClose,
  onDeletePress,
  deleteAccessibilityLabel = 'Delete',
  rightAccessory,
}: SwipeableDeleteRowProps) {
  const [translateX] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: isOpen && enabled ? -SWIPE_SHIFT : 0,
      useNativeDriver: Platform.OS !== 'web',
      bounciness: 5,
      speed: 16,
    }).start();
  }, [isOpen, enabled, translateX]);

  const panResponder = useMemo(() => {
    const baseOffset = isOpen ? -SWIPE_SHIFT : 0;
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        if (!enabled) return false;
        const isHorizontal =
          Math.abs(gesture.dx) > 6 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.15;
        if (!isHorizontal) return false;
        // Allow swiping left when closed, or swiping right when open
        return gesture.dx < -6 || (isOpen && gesture.dx > 6);
      },
      onPanResponderMove: (_, gesture) => {
        if (!enabled) return;
        let next = baseOffset + gesture.dx;
        // Clamp with gentle elastic resistance past the open/closed thresholds
        if (next > 8) next = 8;
        if (next < -(SWIPE_SHIFT + 22)) {
          next = -(SWIPE_SHIFT + 22) + (next + SWIPE_SHIFT + 22) * 0.25;
        }
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        if (!enabled) return;
        const finalPos = baseOffset + gesture.dx;
        const shouldOpen = finalPos < -SWIPE_SHIFT * 0.45 || gesture.vx < -0.25;
        const shouldClose = gesture.vx > 0.25 || !shouldOpen;

        if (!shouldClose) {
          onOpen();
          Animated.spring(translateX, {
            toValue: -SWIPE_SHIFT,
            useNativeDriver: Platform.OS !== 'web',
            bounciness: 5,
            speed: 16,
          }).start();
        } else {
          onClose();
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: Platform.OS !== 'web',
            bounciness: 5,
            speed: 16,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: baseOffset,
          useNativeDriver: Platform.OS !== 'web',
          bounciness: 5,
          speed: 16,
        }).start();
      },
    });
  }, [translateX, enabled, isOpen, onOpen, onClose]);

  // Smoothly reveal the coral-red delete tile as the row slides left
  const deleteTranslateX = translateX.interpolate({
    inputRange: [-SWIPE_SHIFT, 0],
    outputRange: [0, DELETE_BTN_WIDTH + 24],
    extrapolate: 'clamp',
  });

  const deleteOpacity = translateX.interpolate({
    inputRange: [-SWIPE_SHIFT, -10, 0],
    outputRange: [1, 0.35, 0],
    extrapolate: 'clamp',
  });

  // Smoothly fade out the trailing chevron as the delete tile slides in
  const accessoryOpacity = translateX.interpolate({
    inputRange: [-SWIPE_SHIFT * 0.65, 0],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.clipContainer,
        Platform.OS === 'web' && ({ userSelect: 'none', touchAction: 'pan-y' } as object),
      ]}
      {...(enabled ? panResponder.panHandlers : {})}
    >
      {/* Sliding Foreground Row */}
      <Animated.View
        style={[
          styles.foreground,
          { transform: [{ translateX }] },
        ]}
      >
        <View style={styles.contentFlex}>{children}</View>
        {rightAccessory && (
          <Animated.View
            style={[styles.accessorySlot, { opacity: accessoryOpacity }]}
            pointerEvents={isOpen ? 'none' : 'auto'}
          >
            {rightAccessory}
          </Animated.View>
        )}
      </Animated.View>

      {/* Coral-Red Slide-In Delete Action Button matching Figma Stage 8 */}
      {enabled && (
        <Animated.View
          style={[
            styles.deleteActionWrap,
            {
              opacity: deleteOpacity,
              transform: [{ translateX: deleteTranslateX }],
            },
          ]}
          pointerEvents={isOpen ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDeletePress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={deleteAccessibilityLabel}
          >
            <Ionicons name="trash-outline" size={23} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  clipContainer: {
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  foreground: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  contentFlex: {
    flex: 1,
  },
  accessorySlot: {
    marginLeft: 8,
  },
  deleteActionWrap: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  deleteBtn: {
    width: DELETE_BTN_WIDTH,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
