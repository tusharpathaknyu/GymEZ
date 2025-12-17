import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { prAchievementHaptic, workoutCompleteHaptic, successHaptic } from '../utils/haptics';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  color: string;
  emoji?: string;
}

/**
 * Confetti celebration effect
 */
export const ConfettiCelebration: React.FC<{
  visible: boolean;
  onComplete?: () => void;
  type?: 'confetti' | 'stars' | 'emojis';
  emojis?: string[];
}> = ({ visible, onComplete, type = 'confetti', emojis = ['🎉', '💪', '🔥', '⭐', '🏆'] }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (visible) {
      successHaptic();
      createParticles();
      
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [visible]);

  const createParticles = () => {
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    const newParticles: Particle[] = [];

    for (let i = 0; i < 50; i++) {
      const particle: Particle = {
        id: i,
        x: new Animated.Value(width / 2),
        y: new Animated.Value(height / 2),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0),
        rotation: new Animated.Value(0),
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: type === 'emojis' ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
      };

      newParticles.push(particle);

      // Animate each particle
      const targetX = Math.random() * width;
      const targetY = Math.random() * height;
      const duration = 1500 + Math.random() * 1000;
      const delay = Math.random() * 300;

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: targetX,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: targetY + 200,
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.spring(particle.scale, {
              toValue: 1,
              useNativeDriver: true,
              damping: 8,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: 500,
              delay: duration - 700,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(particle.rotation, {
            toValue: Math.random() * 4 - 2,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 500,
            delay: duration - 500,
            useNativeDriver: true,
          }),
        ]).start();
      }, delay);
    }

    setParticles(newParticles);
  };

  if (!visible || particles.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            type === 'emojis' ? styles.emojiParticle : styles.confettiParticle,
            {
              backgroundColor: type !== 'emojis' ? particle.color : 'transparent',
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [-2, 2],
                    outputRange: ['-360deg', '360deg'],
                  }),
                },
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          {particle.emoji && (
            <Text style={styles.emojiText}>{particle.emoji}</Text>
          )}
        </Animated.View>
      ))}
    </View>
  );
};

/**
 * PR Achievement celebration modal
 */
export const PRAchievement: React.FC<{
  visible: boolean;
  onClose: () => void;
  exercise: string;
  newRecord: string;
  previousRecord?: string;
  improvement?: string;
}> = ({ visible, onClose, exercise, newRecord, previousRecord, improvement }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      prAchievementHaptic();
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 10,
          stiffness: 150,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 0.02,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -0.02,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.5,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const rotation = rotateAnim.interpolate({
    inputRange: [-0.02, 0.02],
    outputRange: ['-2deg', '2deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <ConfettiCelebration visible={visible} type="emojis" emojis={['🏆', '💪', '🎉', '⭐', '🔥']} />
        
        <Animated.View
          style={[
            styles.prCard,
            {
              transform: [{ scale: scaleAnim }, { rotate: rotation }],
            },
          ]}
        >
          <Animated.View style={[styles.prGlow, { opacity: glowAnim }]} />
          
          <Text style={styles.prIcon}>🏆</Text>
          <Text style={styles.prTitle}>NEW PERSONAL RECORD!</Text>
          <Text style={styles.prExercise}>{exercise}</Text>
          
          <View style={styles.prRecordContainer}>
            <Text style={styles.prRecord}>{newRecord}</Text>
          </View>
          
          {previousRecord && (
            <View style={styles.prComparison}>
              <Text style={styles.prPrevious}>Previous: {previousRecord}</Text>
              {improvement && (
                <Text style={styles.prImprovement}>+{improvement} 🚀</Text>
              )}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

/**
 * Workout complete celebration
 */
export const WorkoutComplete: React.FC<{
  visible: boolean;
  onClose: () => void;
  duration: string;
  exercises: number;
  volume: string;
  calories?: number;
}> = ({ visible, onClose, duration, exercises, volume, calories }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (visible) {
      workoutCompleteHaptic();
      
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 12,
          stiffness: 150,
        }),
        Animated.stagger(150, statsAnim.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            damping: 10,
          })
        )),
      ]).start();

      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
      statsAnim.forEach(a => a.setValue(0));
    }
  }, [visible]);

  const stats = [
    { icon: '⏱️', label: 'Duration', value: duration },
    { icon: '💪', label: 'Exercises', value: exercises.toString() },
    { icon: '🏋️', label: 'Volume', value: volume },
    ...(calories ? [{ icon: '🔥', label: 'Calories', value: calories.toString() }] : []),
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <ConfettiCelebration visible={visible} type="confetti" />
        
        <Animated.View
          style={[
            styles.completeCard,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.completeIcon}>🎉</Text>
          <Text style={styles.completeTitle}>Workout Complete!</Text>
          <Text style={styles.completeSubtitle}>Great job crushing it today!</Text>

          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.statItem,
                  {
                    transform: [{ scale: statsAnim[index] || new Animated.Value(1) }],
                    opacity: statsAnim[index] || 1,
                  },
                ]}
              >
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
  confettiParticle: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  emojiParticle: {
    width: 30,
    height: 30,
  },
  emojiText: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width - 64,
    overflow: 'hidden',
  },
  prGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    backgroundColor: '#fef3c7',
    borderRadius: 100,
  },
  prIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  prTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#d97706',
    letterSpacing: 1,
    marginBottom: 8,
  },
  prExercise: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  prRecordContainer: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  prRecord: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  prComparison: {
    alignItems: 'center',
  },
  prPrevious: {
    fontSize: 14,
    color: '#6b7280',
  },
  prImprovement: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 4,
  },
  completeCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width - 64,
  },
  completeIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  statItem: {
    width: 80,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default {
  ConfettiCelebration,
  PRAchievement,
  WorkoutComplete,
};
