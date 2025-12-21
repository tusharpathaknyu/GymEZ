import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { useAuth } from '../../services/auth';
import { supabase } from '../../services/supabase';
import { buttonPress, successHaptic, errorHaptic, mediumHaptic } from '../../utils/haptics';

const { width, height } = Dimensions.get('window');

interface StoryScene {
  id: number;
  type: 'dialogue' | 'choice' | 'challenge' | 'reward' | 'battle';
  character?: string;
  text: string;
  choices?: { text: string; nextScene: number; xpBonus?: number }[];
  challenge?: {
    type: 'workout' | 'quiz' | 'timer';
    description: string;
    target: number;
    reward: number;
  };
  reward?: {
    xp: number;
    gold: number;
    item?: string;
  };
  battle?: {
    enemy: string;
    enemyEmoji: string;
    enemyHealth: number;
    requiredReps: number;
    exercise: string;
  };
  nextScene?: number;
}

interface Chapter {
  id: number;
  title: string;
  description: string;
  scenes: StoryScene[];
  unlockLevel: number;
  xpReward: number;
  completionBonus: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: 'The Awakening',
    description: 'Begin your fitness journey',
    unlockLevel: 1,
    xpReward: 200,
    completionBonus: '💪 Beginner\'s Strength (+5 STR)',
    scenes: [
      {
        id: 1,
        type: 'dialogue',
        character: '🧙‍♂️ Master Kai',
        text: 'Welcome, young warrior. I sense great potential within you. The path to becoming a Fitness Champion begins here.',
        nextScene: 2,
      },
      {
        id: 2,
        type: 'dialogue',
        character: '🧙‍♂️ Master Kai',
        text: 'But first, you must prove your dedication. Are you ready to begin your training?',
        nextScene: 3,
      },
      {
        id: 3,
        type: 'choice',
        text: 'What do you say to Master Kai?',
        choices: [
          { text: '"I was born ready!" 💪', nextScene: 4, xpBonus: 20 },
          { text: '"I\'m nervous but willing to try."', nextScene: 4, xpBonus: 10 },
          { text: '"What\'s in it for me?"', nextScene: 5, xpBonus: 0 },
        ],
      },
      {
        id: 4,
        type: 'dialogue',
        character: '🧙‍♂️ Master Kai',
        text: 'Excellent spirit! That determination will serve you well. Let us begin with your first challenge.',
        nextScene: 6,
      },
      {
        id: 5,
        type: 'dialogue',
        character: '🧙‍♂️ Master Kai',
        text: 'Hmm, a practical mind. You will gain strength, discipline, and glory. Now, let us begin.',
        nextScene: 6,
      },
      {
        id: 6,
        type: 'challenge',
        text: '🎯 FIRST CHALLENGE',
        challenge: {
          type: 'workout',
          description: 'Complete 10 Push-ups to prove your commitment!',
          target: 10,
          reward: 50,
        },
        nextScene: 7,
      },
      {
        id: 7,
        type: 'reward',
        text: 'You have completed the first challenge!',
        reward: {
          xp: 100,
          gold: 25,
          item: '🎖️ Warrior\'s Medal',
        },
        nextScene: 8,
      },
      {
        id: 8,
        type: 'dialogue',
        character: '🧙‍♂️ Master Kai',
        text: 'Well done! You have taken your first step. Return tomorrow and we shall continue your training. Chapter Complete!',
      },
    ],
  },
  {
    id: 2,
    title: 'First Steps',
    description: 'Learn the basics of training',
    unlockLevel: 3,
    xpReward: 350,
    completionBonus: '❤️ Endurance Training (+5 END)',
    scenes: [
      {
        id: 1,
        type: 'dialogue',
        character: '🧙‍♂️ Master Kai',
        text: 'You return! Good. Today we learn about the three pillars of fitness: Strength, Endurance, and Agility.',
        nextScene: 2,
      },
      {
        id: 2,
        type: 'choice',
        text: 'Which pillar would you like to focus on first?',
        choices: [
          { text: '💪 Strength - Raw Power', nextScene: 3, xpBonus: 15 },
          { text: '❤️ Endurance - Lasting Energy', nextScene: 4, xpBonus: 15 },
          { text: '⚡ Agility - Quick Reflexes', nextScene: 5, xpBonus: 15 },
        ],
      },
      {
        id: 3,
        type: 'battle',
        text: 'A training dummy appears!',
        battle: {
          enemy: 'Training Dummy',
          enemyEmoji: '🎯',
          enemyHealth: 100,
          requiredReps: 15,
          exercise: 'Push-ups',
        },
        nextScene: 6,
      },
      {
        id: 4,
        type: 'challenge',
        text: '🏃 ENDURANCE TEST',
        challenge: {
          type: 'timer',
          description: 'Hold a plank position for 30 seconds!',
          target: 30,
          reward: 75,
        },
        nextScene: 6,
      },
      {
        id: 5,
        type: 'challenge',
        text: '⚡ AGILITY DRILL',
        challenge: {
          type: 'workout',
          description: 'Complete 20 Jumping Jacks as fast as you can!',
          target: 20,
          reward: 75,
        },
        nextScene: 6,
      },
      {
        id: 6,
        type: 'dialogue',
        character: '🧙‍♂️ Master Kai',
        text: 'Impressive! Your body is adapting quickly. But remember, true strength comes from consistency.',
        nextScene: 7,
      },
      {
        id: 7,
        type: 'reward',
        text: 'Chapter 2 Complete!',
        reward: {
          xp: 200,
          gold: 50,
          item: '⚔️ Training Sword',
        },
      },
    ],
  },
  {
    id: 3,
    title: 'The Iron Temple',
    description: 'Discover the legendary gym',
    unlockLevel: 5,
    xpReward: 500,
    completionBonus: '🛡️ Iron Temple Armor',
    scenes: [
      {
        id: 1,
        type: 'dialogue',
        character: '🧙‍♂️ Master Kai',
        text: 'The time has come. You are ready to enter the legendary Iron Temple - a place where champions are forged.',
        nextScene: 2,
      },
      {
        id: 2,
        type: 'dialogue',
        character: '🏛️ Ancient Voice',
        text: 'WHO DARES ENTER THE IRON TEMPLE? Only those of strong body and mind may pass these gates!',
        nextScene: 3,
      },
      {
        id: 3,
        type: 'choice',
        text: 'How do you respond to the ancient guardian?',
        choices: [
          { text: '"I am a warrior seeking strength!"', nextScene: 4, xpBonus: 25 },
          { text: '"Master Kai sent me."', nextScene: 4, xpBonus: 15 },
          { text: '*Flex muscles intimidatingly*', nextScene: 5, xpBonus: 30 },
        ],
      },
      {
        id: 4,
        type: 'dialogue',
        character: '🏛️ Ancient Voice',
        text: 'Very well. But first, you must prove yourself worthy through the Trial of Iron!',
        nextScene: 6,
      },
      {
        id: 5,
        type: 'dialogue',
        character: '🏛️ Ancient Voice',
        text: '*The doors rumble with ancient laughter* A bold one! I like that. Prove your strength!',
        nextScene: 6,
      },
      {
        id: 6,
        type: 'battle',
        text: '⚔️ TRIAL OF IRON',
        battle: {
          enemy: 'Iron Guardian',
          enemyEmoji: '🗿',
          enemyHealth: 200,
          requiredReps: 25,
          exercise: 'Squats',
        },
        nextScene: 7,
      },
      {
        id: 7,
        type: 'dialogue',
        character: '🏛️ Ancient Voice',
        text: 'IMPRESSIVE! You have passed the trial. The Iron Temple welcomes you, warrior!',
        nextScene: 8,
      },
      {
        id: 8,
        type: 'reward',
        text: '🏆 THE IRON TEMPLE IS NOW UNLOCKED!',
        reward: {
          xp: 300,
          gold: 100,
          item: '🛡️ Iron Temple Armor',
        },
      },
    ],
  },
];

const StoryModeScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const chapterId = route?.params?.chapterId || 1;
  const chapter = CHAPTERS.find(c => c.id === chapterId) || CHAPTERS[0];
  
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [totalGold, setTotalGold] = useState(0);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [battleHP, setBattleHP] = useState(100);
  const [playerReps, setPlayerReps] = useState(0);
  const [challengeTimer, setChallengeTimer] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [chapterComplete, setChapterComplete] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const timerRef = useRef<any>(null);

  // Safety check for currentScene
  const currentScene = currentSceneIndex < chapter.scenes.length 
    ? chapter.scenes[currentSceneIndex] 
    : null;

  useEffect(() => {
    // Animate scene entrance only if we have a valid scene
    if (currentScene && !chapterComplete) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    }
  }, [currentSceneIndex, chapterComplete]);

  const goToNextScene = (nextSceneId?: number, xpBonus?: number) => {
    if (xpBonus) {
      setTotalXP(prev => prev + xpBonus);
      successHaptic();
    }
    
    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    
    if (nextSceneId) {
      const nextIndex = chapter.scenes.findIndex(s => s.id === nextSceneId);
      if (nextIndex !== -1) {
        setCurrentSceneIndex(nextIndex);
        return;
      }
    }
    
    if (currentScene && currentScene.nextScene) {
      const nextIndex = chapter.scenes.findIndex(s => s.id === currentScene.nextScene);
      if (nextIndex !== -1) {
        setCurrentSceneIndex(nextIndex);
        return;
      }
    }
    
    // No next scene - Chapter complete!
    setChapterComplete(true);
    completeChapter();
  };

  const completeChapter = async () => {
    const finalXP = totalXP + chapter.xpReward;
    
    // Save progress to database
    if (user?.id) {
      try {
        await supabase.from('game_progress').upsert({
          user_id: user.id,
          chapter_completed: chapterId,
          total_xp: finalXP,
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }

    Alert.alert(
      '🎉 Chapter Complete!',
      `You earned:\n+${finalXP} XP\n+${totalGold} Gold\n${collectedItems.join('\n')}`,
      [{ text: 'Continue', onPress: () => navigation.goBack() }]
    );
  };

  const startChallenge = () => {
    setShowChallenge(true);
    setChallengeComplete(false);
    
    if (currentScene?.challenge?.type === 'timer') {
      setChallengeTimer(currentScene?.challenge?.target || 30);
      timerRef.current = setInterval(() => {
        setChallengeTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setChallengeComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const completeChallenge = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowChallenge(false);
    const reward = currentScene?.challenge?.reward || 0;
    setTotalXP(prev => prev + reward);
    successHaptic();
    goToNextScene();
  };

  const startBattle = () => {
    setShowBattle(true);
    setBattleHP(currentScene?.battle?.enemyHealth || 100);
    setPlayerReps(0);
  };

  const doAttack = () => {
    mediumHaptic();
    const damage = 10 + Math.floor(Math.random() * 10);
    setBattleHP(prev => Math.max(0, prev - damage));
    setPlayerReps(prev => prev + 1);
    
    if (battleHP - damage <= 0) {
      setTimeout(() => {
        setShowBattle(false);
        successHaptic();
        setTotalXP(prev => prev + 100);
        goToNextScene();
      }, 500);
    }
  };

  const renderDialogue = () => (
    <Animated.View style={[styles.dialogueContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      {currentScene?.character && (
        <View style={styles.characterBubble}>
          <Text style={styles.characterName}>{currentScene?.character}</Text>
        </View>
      )}
      <View style={styles.textBox}>
        <Text style={styles.dialogueText}>{currentScene?.text || ''}</Text>
      </View>
      <TouchableOpacity style={styles.continueBtn} onPress={() => goToNextScene()}>
        <Text style={styles.continueBtnText}>Continue ▶</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderChoice = () => (
    <Animated.View style={[styles.choiceContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.choiceTitle}>{currentScene?.text || ''}</Text>
      <View style={styles.choicesWrapper}>
        {currentScene?.choices?.map((choice, index) => (
          <TouchableOpacity
            key={index}
            style={styles.choiceButton}
            onPress={() => {
              buttonPress();
              goToNextScene(choice.nextScene, choice.xpBonus);
            }}
          >
            <Text style={styles.choiceText}>{choice.text}</Text>
            {choice.xpBonus && choice.xpBonus > 0 && (
              <Text style={styles.choiceBonus}>+{choice.xpBonus} XP</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderChallengeStart = () => (
    <Animated.View style={[styles.challengeContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.challengeTitle}>{currentScene?.text || ''}</Text>
      <View style={styles.challengeBox}>
        <Text style={styles.challengeEmoji}>🎯</Text>
        <Text style={styles.challengeDesc}>{currentScene?.challenge?.description || ''}</Text>
        <Text style={styles.challengeReward}>Reward: +{currentScene?.challenge?.reward || 0} XP</Text>
      </View>
      <TouchableOpacity style={styles.startChallengeBtn} onPress={startChallenge}>
        <Text style={styles.startChallengeBtnText}>Start Challenge!</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderBattleStart = () => (
    <Animated.View style={[styles.battleStartContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.battleTitle}>{currentScene?.text || ''}</Text>
      <View style={styles.enemyPreview}>
        <Text style={styles.enemyEmoji}>{currentScene?.battle?.enemyEmoji || '👹'}</Text>
        <Text style={styles.enemyName}>{currentScene?.battle?.enemy || 'Enemy'}</Text>
        <Text style={styles.enemyHP}>HP: {currentScene?.battle?.enemyHealth || 100}</Text>
      </View>
      <Text style={styles.battleInstructions}>
        Do {currentScene?.battle?.requiredReps || 0} {currentScene?.battle?.exercise || 'reps'} to defeat the enemy!
      </Text>
      <TouchableOpacity style={styles.battleStartBtn} onPress={startBattle}>
        <Text style={styles.battleStartBtnText}>⚔️ Begin Battle!</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderReward = () => (
    <Animated.View style={[styles.rewardContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.rewardTitle}>🎁 REWARDS!</Text>
      <Text style={styles.rewardSubtitle}>{currentScene?.text || ''}</Text>
      <View style={styles.rewardBox}>
        {currentScene?.reward?.xp && (
          <View style={styles.rewardItem}>
            <Text style={styles.rewardEmoji}>⭐</Text>
            <Text style={styles.rewardValue}>+{currentScene?.reward?.xp} XP</Text>
          </View>
        )}
        {currentScene?.reward?.gold && (
          <View style={styles.rewardItem}>
            <Text style={styles.rewardEmoji}>🪙</Text>
            <Text style={styles.rewardValue}>+{currentScene?.reward?.gold} Gold</Text>
          </View>
        )}
        {currentScene?.reward?.item && (
          <View style={styles.rewardItem}>
            <Text style={styles.rewardEmoji}>🎁</Text>
            <Text style={styles.rewardValue}>{currentScene?.reward?.item}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity 
        style={styles.collectBtn} 
        onPress={() => {
          successHaptic();
          if (currentScene?.reward) {
            setTotalXP(prev => prev + (currentScene?.reward?.xp || 0));
            setTotalGold(prev => prev + (currentScene?.reward?.gold || 0));
            if (currentScene?.reward?.item) {
              setCollectedItems(prev => [...prev, currentScene?.reward?.item || '']);
            }
          }
          goToNextScene();
        }}
      >
        <Text style={styles.collectBtnText}>Collect Rewards!</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderChapterComplete = () => (
    <Animated.View style={[styles.rewardContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.rewardTitle}>🎉 CHAPTER COMPLETE!</Text>
      <Text style={styles.rewardSubtitle}>{chapter.title}</Text>
      <View style={styles.rewardBox}>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardEmoji}>⭐</Text>
          <Text style={styles.rewardValue}>+{totalXP + chapter.xpReward} Total XP</Text>
        </View>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardEmoji}>🪙</Text>
          <Text style={styles.rewardValue}>+{totalGold} Gold</Text>
        </View>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardEmoji}>🏆</Text>
          <Text style={styles.rewardValue}>{chapter.completionBonus}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.collectBtn} 
        onPress={() => {
          successHaptic();
          navigation.goBack();
        }}
      >
        <Text style={styles.collectBtnText}>Return to Quest Hub</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.chapterLabel}>CHAPTER {chapter.id}</Text>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
        </View>
        <View style={styles.xpDisplay}>
          <Text style={styles.xpValue}>+{totalXP}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${chapterComplete ? 100 : ((currentSceneIndex + 1) / chapter.scenes.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {chapterComplete ? 'Complete!' : `${currentSceneIndex + 1} / ${chapter.scenes.length}`}
        </Text>
      </View>

      {/* Scene Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {chapterComplete ? (
          renderChapterComplete()
        ) : currentScene ? (
          <>
            {currentScene.type === 'dialogue' && renderDialogue()}
            {currentScene.type === 'choice' && renderChoice()}
            {currentScene.type === 'challenge' && !showChallenge && renderChallengeStart()}
            {currentScene.type === 'battle' && !showBattle && renderBattleStart()}
            {currentScene.type === 'reward' && renderReward()}
          </>
        ) : (
          <View style={styles.dialogueContainer}>
            <Text style={styles.dialogueText}>Loading...</Text>
          </View>
        )}
      </ScrollView>

      {/* Challenge Modal */}
      <Modal visible={showChallenge} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.challengeModal}>
            <Text style={styles.challengeModalTitle}>
              {currentScene?.challenge?.type === 'timer' ? '⏱️ HOLD IT!' : '💪 GET IT DONE!'}
            </Text>
            <Text style={styles.challengeModalDesc}>{currentScene?.challenge?.description || ''}</Text>
            
            {currentScene?.challenge?.type === 'timer' ? (
              <View style={styles.timerCircle}>
                <Text style={styles.timerText}>{challengeTimer}</Text>
                <Text style={styles.timerLabel}>seconds</Text>
              </View>
            ) : (
              <View style={styles.counterContainer}>
                <Text style={styles.counterValue}>{playerReps}</Text>
                <Text style={styles.counterTarget}>/ {currentScene?.challenge?.target || 0}</Text>
                <TouchableOpacity 
                  style={styles.repButton}
                  onPress={() => {
                    mediumHaptic();
                    setPlayerReps(prev => {
                      const newVal = prev + 1;
                      if (newVal >= (currentScene?.challenge?.target || 0)) {
                        setChallengeComplete(true);
                      }
                      return newVal;
                    });
                  }}
                >
                  <Text style={styles.repButtonText}>TAP FOR EACH REP</Text>
                </TouchableOpacity>
              </View>
            )}

            {challengeComplete && (
              <TouchableOpacity style={styles.completeBtn} onPress={completeChallenge}>
                <Text style={styles.completeBtnText}>✓ Complete!</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Battle Modal */}
      <Modal visible={showBattle} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.battleModal}>
            <Text style={styles.battleModalTitle}>⚔️ BATTLE!</Text>
            
            <View style={styles.enemySection}>
              <Text style={styles.battleEnemyEmoji}>{currentScene?.battle?.enemyEmoji || '👹'}</Text>
              <Text style={styles.battleEnemyName}>{currentScene?.battle?.enemy || 'Enemy'}</Text>
              <View style={styles.hpBarContainer}>
                <View style={[styles.hpBar, { width: `${(battleHP / (currentScene?.battle?.enemyHealth || 100)) * 100}%` }]} />
              </View>
              <Text style={styles.hpText}>{battleHP} / {currentScene?.battle?.enemyHealth || 100}</Text>
            </View>

            <Text style={styles.battleExercise}>
              {currentScene?.battle?.exercise || 'Exercise'}: {playerReps} reps
            </Text>

            <TouchableOpacity 
              style={styles.attackButton}
              onPress={doAttack}
              disabled={battleHP <= 0}
            >
              <Text style={styles.attackButtonText}>⚔️ ATTACK!</Text>
              <Text style={styles.attackSubtext}>Tap for each rep!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#16213e',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#fff',
  },
  headerCenter: {
    alignItems: 'center',
  },
  chapterLabel: {
    fontSize: 12,
    color: '#e94560',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  chapterTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  xpDisplay: {
    backgroundColor: '#e9456033',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  xpValue: {
    fontSize: 16,
    color: '#e94560',
    fontWeight: 'bold',
  },
  xpLabel: {
    fontSize: 10,
    color: '#e94560',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#16213e',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#0f3460',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#8892b0',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  // Dialogue styles
  dialogueContainer: {
    alignItems: 'center',
  },
  characterBubble: {
    backgroundColor: '#e94560',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  characterName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  textBox: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  dialogueText: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 28,
    textAlign: 'center',
  },
  continueBtn: {
    marginTop: 24,
    backgroundColor: '#e94560',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  continueBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Choice styles
  choiceContainer: {
    alignItems: 'center',
  },
  choiceTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  choicesWrapper: {
    width: '100%',
    gap: 12,
  },
  choiceButton: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#0f3460',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  choiceBonus: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: 'bold',
  },
  // Challenge styles
  challengeContainer: {
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 24,
    color: '#e94560',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  challengeBox: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e94560',
    width: '100%',
  },
  challengeEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  challengeDesc: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  challengeReward: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold',
  },
  startChallengeBtn: {
    marginTop: 24,
    backgroundColor: '#10b981',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 25,
  },
  startChallengeBtnText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Battle start styles
  battleStartContainer: {
    alignItems: 'center',
  },
  battleTitle: {
    fontSize: 24,
    color: '#e94560',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  enemyPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  enemyEmoji: {
    fontSize: 80,
    marginBottom: 8,
  },
  enemyName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  enemyHP: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 4,
  },
  battleInstructions: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
    marginBottom: 24,
  },
  battleStartBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 25,
  },
  battleStartBtnText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Reward styles
  rewardContainer: {
    alignItems: 'center',
  },
  rewardTitle: {
    fontSize: 32,
    color: '#fbbf24',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rewardSubtitle: {
    fontSize: 16,
    color: '#8892b0',
    marginBottom: 24,
  },
  rewardBox: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    gap: 16,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardEmoji: {
    fontSize: 32,
  },
  rewardValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  collectBtn: {
    marginTop: 24,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 25,
  },
  collectBtnText: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  challengeModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e94560',
  },
  challengeModalTitle: {
    fontSize: 24,
    color: '#e94560',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  challengeModalDesc: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  timerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#16213e',
    borderWidth: 6,
    borderColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  timerLabel: {
    fontSize: 14,
    color: '#8892b0',
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  counterValue: {
    fontSize: 64,
    color: '#10b981',
    fontWeight: 'bold',
  },
  counterTarget: {
    fontSize: 24,
    color: '#8892b0',
  },
  repButton: {
    marginTop: 20,
    backgroundColor: '#10b981',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 25,
  },
  repButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  completeBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
  },
  completeBtnText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Battle modal styles
  battleModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  battleModalTitle: {
    fontSize: 28,
    color: '#ef4444',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  enemySection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  battleEnemyEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  battleEnemyName: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  hpBarContainer: {
    width: 200,
    height: 16,
    backgroundColor: '#0f3460',
    borderRadius: 8,
    overflow: 'hidden',
  },
  hpBar: {
    height: '100%',
    backgroundColor: '#ef4444',
  },
  hpText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  battleExercise: {
    fontSize: 18,
    color: '#10b981',
    marginBottom: 20,
  },
  attackButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  attackButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  attackSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
});

export default StoryModeScreen;
