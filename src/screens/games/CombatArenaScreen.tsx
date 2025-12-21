import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  Easing,
} from 'react-native';
import { useAuth } from '../../services/auth';
import { supabase } from '../../services/supabase';
import { buttonPress, successHaptic, errorHaptic, mediumHaptic } from '../../utils/haptics';

const { width, height } = Dimensions.get('window');

interface Fighter {
  name: string;
  emoji: string;
  maxHP: number;
  currentHP: number;
  maxEnergy: number;
  currentEnergy: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
  level: number;
}

interface Move {
  id: string;
  name: string;
  emoji: string;
  type: 'attack' | 'defense' | 'special' | 'ultimate';
  damage: number;
  energyCost: number;
  effect?: string;
  cooldown: number;
}

const PLAYER_MOVES: Move[] = [
  { id: 'punch', name: 'Power Punch', emoji: '👊', type: 'attack', damage: 15, energyCost: 0, cooldown: 0 },
  { id: 'kick', name: 'Spin Kick', emoji: '🦵', type: 'attack', damage: 20, energyCost: 10, cooldown: 0 },
  { id: 'block', name: 'Iron Guard', emoji: '🛡️', type: 'defense', damage: 0, energyCost: 5, effect: 'block', cooldown: 0 },
  { id: 'combo', name: 'Fury Combo', emoji: '💥', type: 'special', damage: 35, energyCost: 25, cooldown: 2 },
  { id: 'heal', name: 'Second Wind', emoji: '💚', type: 'special', damage: -25, energyCost: 30, effect: 'heal', cooldown: 3 },
  { id: 'ultimate', name: 'BEAST MODE', emoji: '🔥', type: 'ultimate', damage: 60, energyCost: 50, cooldown: 5 },
];

const OPPONENTS = [
  { name: 'Rookie Rick', emoji: '😤', baseHP: 80, attack: 8, defense: 5, speed: 5, level: 1 },
  { name: 'Gym Bro Gary', emoji: '💪', baseHP: 100, attack: 12, defense: 8, speed: 7, level: 3 },
  { name: 'Iron Mike', emoji: '🦾', baseHP: 120, attack: 15, defense: 12, speed: 8, level: 5 },
  { name: 'The Beast', emoji: '👹', baseHP: 150, attack: 18, defense: 15, speed: 10, level: 7 },
  { name: 'Champion Chad', emoji: '🏆', baseHP: 200, attack: 22, defense: 18, speed: 12, level: 10 },
];

const CombatArenaScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const opponentId = route?.params?.opponentId || 0;
  
  // Player stats - tied to REAL workout types
  const [playerStats, setPlayerStats] = useState({
    // Cardio stats (Running, Cycling, HIIT) → Agility & Speed
    cardioSessions: 0,
    totalCardioMinutes: 0,
    runningDistance: 0, // km
    
    // Leg workouts → Kick damage & Jump height
    legWorkouts: 0,
    squatMax: 0,
    legPressMax: 0,
    
    // Upper body Push (Chest, Shoulders, Triceps) → Punch damage
    pushWorkouts: 0,
    benchMax: 0,
    shoulderPressMax: 0,
    
    // Upper body Pull (Back, Biceps) → Grapple & Block strength
    pullWorkouts: 0,
    deadliftMax: 0,
    rowMax: 0,
    
    // Core workouts → Defense & Balance
    coreWorkouts: 0,
    plankTime: 0, // seconds
    
    // General
    gymVisits: 0,
    workoutsCompleted: 0,
    totalWeight: 0,
    streak: 0,
    
    // HIIT/Intensity → Energy regen
    hiitSessions: 0,
  });
  
  // Combat bonuses calculated from workouts
  const [combatBonuses, setCombatBonuses] = useState({
    punchDamage: 0,
    kickDamage: 0,
    blockStrength: 0,
    speed: 0,
    energyRegen: 0,
    critChance: 0,
    maxHP: 0,
    maxEnergy: 0,
  });
  
  // Fighters
  const [player, setPlayer] = useState<Fighter | null>(null);
  const [opponent, setOpponent] = useState<Fighter | null>(null);
  
  // Battle state
  const [battleStarted, setBattleStarted] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isBlocking, setIsBlocking] = useState(false);
  const [cooldowns, setCooldowns] = useState<{ [key: string]: number }>({});
  const [battleOver, setBattleOver] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [hitEffect, setHitEffect] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<string>('');
  
  // Animations
  const playerShake = useRef(new Animated.Value(0)).current;
  const opponentShake = useRef(new Animated.Value(0)).current;
  const playerAttackAnim = useRef(new Animated.Value(0)).current;
  const opponentAttackAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  
  // New visual animations
  const playerY = useRef(new Animated.Value(0)).current;
  const opponentY = useRef(new Animated.Value(0)).current;
  const playerScale = useRef(new Animated.Value(1)).current;
  const opponentScale = useRef(new Animated.Value(1)).current;
  const playerRotate = useRef(new Animated.Value(0)).current;
  const opponentRotate = useRef(new Animated.Value(0)).current;
  const hitEffectScale = useRef(new Animated.Value(0)).current;
  const hitEffectOpacity = useRef(new Animated.Value(0)).current;
  const arenaFlash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPlayerStats();
  }, []);

  useEffect(() => {
    if (playerStats.gymVisits > 0 || playerStats.workoutsCompleted > 0) {
      calculateCombatBonuses();
    }
  }, [playerStats]);

  useEffect(() => {
    if (combatBonuses.maxHP > 0 || playerStats.gymVisits > 0) {
      initializeFighters();
    }
  }, [combatBonuses]);

  // Calculate combat bonuses from real workout data
  const calculateCombatBonuses = () => {
    const bonuses = {
      // 🏃 Running/Cardio → Speed & Agility (dodge chance)
      // Every 5km run = +1 speed, Every 10 cardio sessions = +2 speed
      speed: Math.floor(playerStats.runningDistance / 5) + Math.floor(playerStats.cardioSessions / 10) * 2,
      
      // 🦵 Leg Day → Kick damage boost
      // Every leg workout = +2 kick damage, Squat PR / 20 = bonus damage
      kickDamage: (playerStats.legWorkouts * 2) + Math.floor(playerStats.squatMax / 20),
      
      // 💪 Push Day (Chest/Shoulders) → Punch damage
      // Every push workout = +2 punch damage, Bench PR / 20 = bonus damage
      punchDamage: (playerStats.pushWorkouts * 2) + Math.floor(playerStats.benchMax / 20),
      
      // 🏋️ Pull Day (Back/Biceps) → Block strength & grapple
      // Every pull workout = +1.5 block, Deadlift PR / 30 = bonus
      blockStrength: Math.floor(playerStats.pullWorkouts * 1.5) + Math.floor(playerStats.deadliftMax / 30),
      
      // 🧘 Core → Defense (damage reduction)
      // Every core workout = +1 defense, Plank time / 30 = bonus
      defense: (playerStats.coreWorkouts * 1) + Math.floor(playerStats.plankTime / 30),
      
      // ⚡ HIIT → Energy regeneration
      // Every HIIT session = +2 energy regen per turn
      energyRegen: Math.floor(playerStats.hiitSessions * 2) + Math.floor(playerStats.cardioMinutes / 60),
      
      // 🔥 Streak → Critical hit chance
      // Every day streak = +1% crit chance (max 25%)
      critChance: Math.min(25, playerStats.streak * 1),
      
      // ❤️ Overall fitness → Max HP
      // Gym visits * 5 + total workouts * 3
      maxHP: (playerStats.gymVisits * 5) + (playerStats.workoutsCompleted * 3),
      
      // ⚡ Cardio → Max Energy
      // Cardio sessions * 3 + running distance
      maxEnergy: (playerStats.cardioSessions * 3) + Math.floor(playerStats.runningDistance),
    };
    
    setCombatBonuses(bonuses);
  };

  // Get a workout tip based on weakest stat
  const getWorkoutTip = (): { tip: string; workout: string; emoji: string } => {
    const stats = [
      { name: 'kickDamage', value: combatBonuses.kickDamage, tip: 'Hit leg day to boost your kicks!', workout: 'Squats & Leg Press', emoji: '🦵' },
      { name: 'punchDamage', value: combatBonuses.punchDamage, tip: 'Train chest & shoulders for stronger punches!', workout: 'Bench Press & Shoulder Press', emoji: '👊' },
      { name: 'speed', value: combatBonuses.speed, tip: 'Run more to increase your agility!', workout: 'Cardio & Running', emoji: '🏃' },
      { name: 'blockStrength', value: combatBonuses.blockStrength, tip: 'Train your back for better blocks!', workout: 'Deadlifts & Rows', emoji: '🛡️' },
      { name: 'energyRegen', value: combatBonuses.energyRegen, tip: 'Do HIIT for faster energy recovery!', workout: 'HIIT Training', emoji: '⚡' },
    ];
    
    // Find lowest stat
    const weakest = stats.reduce((min, stat) => stat.value < min.value ? stat : min, stats[0]);
    return { tip: weakest.tip, workout: weakest.workout, emoji: weakest.emoji };
  };

  const loadPlayerStats = async () => {
    if (!user?.id) {
      // Default stats for testing - simulating a user who works out
      setPlayerStats({
        cardioSessions: 8,
        totalCardioMinutes: 240,
        runningDistance: 25, // 25km total
        legWorkouts: 6,
        squatMax: 100, // 100kg squat
        legPressMax: 180,
        pushWorkouts: 8,
        benchMax: 80, // 80kg bench
        shoulderPressMax: 50,
        pullWorkouts: 7,
        deadliftMax: 120, // 120kg deadlift
        rowMax: 70,
        coreWorkouts: 10,
        plankTime: 120, // 2 minutes
        gymVisits: 15,
        workoutsCompleted: 30,
        totalWeight: 50000,
        streak: 7,
        hiitSessions: 5,
      });
      return;
    }

    try {
      // Get gym check-ins count
      const { count: checkins } = await supabase
        .from('gym_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get workouts by category
      const { data: workoutData } = await supabase
        .from('workouts')
        .select('workout_type, duration, exercises')
        .eq('user_id', user.id);

      // Count workouts by type
      let cardioCount = 0, legCount = 0, pushCount = 0, pullCount = 0, coreCount = 0, hiitCount = 0;
      let totalCardioMins = 0;
      
      workoutData?.forEach(workout => {
        const type = (workout.workout_type || '').toLowerCase();
        const exercises = (workout.exercises || []).map((e: any) => (e.name || '').toLowerCase());
        
        // Categorize workouts
        if (type.includes('cardio') || type.includes('run') || type.includes('cycling')) {
          cardioCount++;
          totalCardioMins += workout.duration || 30;
        }
        if (type.includes('leg') || exercises.some((e: string) => e.includes('squat') || e.includes('leg') || e.includes('lunge'))) {
          legCount++;
        }
        if (type.includes('push') || type.includes('chest') || type.includes('shoulder') || 
            exercises.some((e: string) => e.includes('bench') || e.includes('press') || e.includes('push'))) {
          pushCount++;
        }
        if (type.includes('pull') || type.includes('back') || 
            exercises.some((e: string) => e.includes('row') || e.includes('pull') || e.includes('deadlift'))) {
          pullCount++;
        }
        if (type.includes('core') || type.includes('ab') || 
            exercises.some((e: string) => e.includes('plank') || e.includes('crunch') || e.includes('core'))) {
          coreCount++;
        }
        if (type.includes('hiit') || type.includes('interval') || type.includes('crossfit')) {
          hiitCount++;
        }
      });

      // Get PRs for specific exercises
      const { data: prs } = await supabase
        .from('personal_records')
        .select('exercise, weight')
        .eq('user_id', user.id);

      let benchMax = 0, squatMax = 0, deadliftMax = 0;
      prs?.forEach(pr => {
        const exercise = (pr.exercise || '').toLowerCase();
        if (exercise.includes('bench')) benchMax = Math.max(benchMax, pr.weight || 0);
        if (exercise.includes('squat')) squatMax = Math.max(squatMax, pr.weight || 0);
        if (exercise.includes('deadlift')) deadliftMax = Math.max(deadliftMax, pr.weight || 0);
      });

      const totalWeight = prs?.reduce((sum, pr) => sum + (pr.weight || 0), 0) || 0;

      // Get current streak
      const { data: streakData } = await supabase
        .from('user_stats')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      // Estimate running distance from cardio sessions (avg 3km per session)
      const runningDist = cardioCount * 3;

      setPlayerStats({
        cardioSessions: cardioCount || 8,
        totalCardioMinutes: totalCardioMins || 240,
        runningDistance: runningDist || 25,
        legWorkouts: legCount || 6,
        squatMax: squatMax || 100,
        legPressMax: squatMax * 1.5 || 150,
        pushWorkouts: pushCount || 8,
        benchMax: benchMax || 80,
        shoulderPressMax: benchMax * 0.6 || 50,
        pullWorkouts: pullCount || 7,
        deadliftMax: deadliftMax || 120,
        rowMax: deadliftMax * 0.6 || 70,
        coreWorkouts: coreCount || 10,
        plankTime: coreCount * 15 || 120,
        gymVisits: checkins || 15,
        workoutsCompleted: workoutData?.length || 30,
        totalWeight: totalWeight || 50000,
        streak: streakData?.current_streak || 7,
        hiitSessions: hiitCount || 5,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setPlayerStats({
        cardioSessions: 8,
        totalCardioMinutes: 240,
        runningDistance: 25,
        legWorkouts: 6,
        squatMax: 100,
        legPressMax: 150,
        pushWorkouts: 8,
        benchMax: 80,
        shoulderPressMax: 50,
        pullWorkouts: 7,
        deadliftMax: 120,
        rowMax: 70,
        coreWorkouts: 10,
        plankTime: 120,
        gymVisits: 15,
        workoutsCompleted: 30,
        totalWeight: 50000,
        streak: 7,
        hiitSessions: 5,
      });
    }
  };

  const initializeFighters = () => {
    // Calculate player level based on overall activity
    const playerLevel = Math.floor((playerStats.gymVisits + playerStats.workoutsCompleted) / 10) + 1;
    
    // Stats are now driven by REAL workout types!
    const baseHP = 100;
    const baseEnergy = 100;
    const baseAttack = 10;
    const baseDefense = 8;
    const baseSpeed = 10;
    const baseCrit = 5;

    const playerFighter: Fighter = {
      name: 'You',
      emoji: '🥊',
      // HP = Base + Gym consistency bonus + Core strength
      maxHP: baseHP + combatBonuses.maxHP + (playerStats.coreWorkouts * 2),
      currentHP: baseHP + combatBonuses.maxHP + (playerStats.coreWorkouts * 2),
      // Energy = Base + Cardio bonus
      maxEnergy: baseEnergy + combatBonuses.maxEnergy,
      currentEnergy: baseEnergy + combatBonuses.maxEnergy,
      // Attack = Base + Push workouts (for punches)
      attack: baseAttack + combatBonuses.punchDamage,
      // Defense = Base + Core + Pull workouts (for blocking)
      defense: baseDefense + combatBonuses.blockStrength + Math.floor(playerStats.coreWorkouts / 2),
      // Speed = Base + Cardio/Running
      speed: baseSpeed + combatBonuses.speed,
      // Crit = Base + Streak bonus
      critChance: baseCrit + combatBonuses.critChance,
      level: playerLevel,
    };

    const oppData = OPPONENTS[Math.min(opponentId, OPPONENTS.length - 1)];
    const opponentFighter: Fighter = {
      name: oppData.name,
      emoji: oppData.emoji,
      maxHP: oppData.baseHP,
      currentHP: oppData.baseHP,
      maxEnergy: 80,
      currentEnergy: 80,
      attack: oppData.attack,
      defense: oppData.defense,
      speed: oppData.speed,
      critChance: 10,
      level: oppData.level,
    };

    setPlayer(playerFighter);
    setOpponent(opponentFighter);
  };

  const shakeAnimation = (animRef: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animRef, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(animRef, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(animRef, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(animRef, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Enhanced visual attack animation
  const performAttackAnimation = (isPlayer: boolean, moveType: string) => {
    const posAnim = isPlayer ? playerAttackAnim : opponentAttackAnim;
    const yAnim = isPlayer ? playerY : opponentY;
    const scaleAnim = isPlayer ? playerScale : opponentScale;
    const rotateAnim = isPlayer ? playerRotate : opponentRotate;
    const targetShake = isPlayer ? opponentShake : playerShake;
    const targetScale = isPlayer ? opponentScale : playerScale;
    
    // Different animations based on move type
    if (moveType === 'punch' || moveType === 'combo') {
      // Dash forward punch
      Animated.sequence([
        // Wind up
        Animated.parallel([
          Animated.timing(posAnim, { toValue: isPlayer ? -20 : 20, duration: 100, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        ]),
        // Dash and strike
        Animated.parallel([
          Animated.timing(posAnim, { toValue: isPlayer ? 80 : -80, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: isPlayer ? 0.1 : -0.1, duration: 150, useNativeDriver: true }),
        ]),
        // Impact
        Animated.parallel([
          Animated.timing(targetShake, { toValue: 15, duration: 50, useNativeDriver: true }),
          Animated.timing(targetScale, { toValue: 0.9, duration: 50, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(targetShake, { toValue: -15, duration: 50, useNativeDriver: true }),
          Animated.timing(targetScale, { toValue: 1.05, duration: 50, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(targetShake, { toValue: 0, duration: 50, useNativeDriver: true }),
          Animated.timing(targetScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]),
        // Return
        Animated.parallel([
          Animated.timing(posAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]).start();
    } else if (moveType === 'kick') {
      // Jump kick
      Animated.sequence([
        // Jump up
        Animated.parallel([
          Animated.timing(yAnim, { toValue: -50, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: isPlayer ? 0.3 : -0.3, duration: 150, useNativeDriver: true }),
        ]),
        // Kick forward
        Animated.parallel([
          Animated.timing(posAnim, { toValue: isPlayer ? 70 : -70, duration: 100, useNativeDriver: true }),
          Animated.timing(yAnim, { toValue: -20, duration: 100, useNativeDriver: true }),
        ]),
        // Impact
        Animated.parallel([
          Animated.timing(targetShake, { toValue: 20, duration: 30, useNativeDriver: true }),
          Animated.timing(targetScale, { toValue: 0.85, duration: 30, useNativeDriver: true }),
        ]),
        Animated.timing(targetShake, { toValue: -20, duration: 30, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(targetShake, { toValue: 0, duration: 50, useNativeDriver: true }),
          Animated.timing(targetScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]),
        // Land
        Animated.parallel([
          Animated.timing(posAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(yAnim, { toValue: 0, duration: 150, easing: Easing.bounce, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]).start();
    } else if (moveType === 'ultimate') {
      // Epic ultimate attack
      Animated.sequence([
        // Power up
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1.3, duration: 300, useNativeDriver: true }),
          Animated.timing(yAnim, { toValue: -30, duration: 300, useNativeDriver: true }),
        ]),
        // Screen flash
        Animated.timing(arenaFlash, { toValue: 1, duration: 100, useNativeDriver: true }),
        // Mega dash
        Animated.parallel([
          Animated.timing(posAnim, { toValue: isPlayer ? 100 : -100, duration: 100, useNativeDriver: true }),
          Animated.timing(arenaFlash, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
        // Multiple hits
        Animated.timing(targetShake, { toValue: 25, duration: 30, useNativeDriver: true }),
        Animated.timing(targetScale, { toValue: 0.8, duration: 30, useNativeDriver: true }),
        Animated.timing(targetShake, { toValue: -25, duration: 30, useNativeDriver: true }),
        Animated.timing(targetShake, { toValue: 25, duration: 30, useNativeDriver: true }),
        Animated.timing(targetShake, { toValue: -25, duration: 30, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(targetShake, { toValue: 0, duration: 50, useNativeDriver: true }),
          Animated.timing(targetScale, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]),
        // Return
        Animated.parallel([
          Animated.timing(posAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(yAnim, { toValue: 0, duration: 300, easing: Easing.bounce, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      // Default attack
      Animated.sequence([
        Animated.timing(posAnim, { toValue: isPlayer ? 50 : -50, duration: 150, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(targetShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        ]),
        Animated.timing(targetShake, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(targetShake, { toValue: 0, duration: 50, useNativeDriver: true }),
        Animated.timing(posAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  };

  // Block animation
  const performBlockAnimation = (isPlayer: boolean) => {
    const scaleAnim = isPlayer ? playerScale : opponentScale;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  // Hit effect animation
  const showHitEffect = (effect: string, x: number) => {
    setHitEffect(effect);
    hitEffectScale.setValue(0);
    hitEffectOpacity.setValue(1);
    
    Animated.parallel([
      Animated.timing(hitEffectScale, { toValue: 1.5, duration: 300, useNativeDriver: true }),
      Animated.timing(hitEffectOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setHitEffect(null));
  };

  const attackAnimation = (isPlayer: boolean) => {
    const animRef = isPlayer ? playerAttackAnim : opponentAttackAnim;
    Animated.sequence([
      Animated.timing(animRef, { toValue: isPlayer ? 50 : -50, duration: 150, useNativeDriver: true }),
      Animated.timing(animRef, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const flashScreen = () => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  // Calculate damage with REAL workout bonuses!
  const calculateDamage = (attacker: Fighter, defender: Fighter, move: Move, isBlocked: boolean): number => {
    let baseDamage = move.damage;
    
    // Apply workout-specific bonuses!
    if (move.id === 'punch' || move.id === 'combo') {
      // Punch damage boosted by PUSH workouts (chest, shoulders, triceps)
      baseDamage += combatBonuses.punchDamage;
    } else if (move.id === 'kick') {
      // Kick damage boosted by LEG DAY!
      baseDamage += combatBonuses.kickDamage;
    } else if (move.id === 'ultimate') {
      // Ultimate uses both punch and kick bonuses
      baseDamage += Math.floor((combatBonuses.punchDamage + combatBonuses.kickDamage) / 2);
    }
    
    // Add base attack (from overall push workouts)
    baseDamage += attacker.attack * (move.type === 'ultimate' ? 1.5 : 1);
    
    // Defense reduction (boosted by pull & core workouts)
    const defenseReduction = defender.defense * (isBlocked ? 2 : 1);
    
    // Critical hit chance (boosted by workout streak!)
    const isCrit = Math.random() * 100 < attacker.critChance;
    const critMultiplier = isCrit ? 1.5 : 1;
    
    // Variance for realism
    const variance = 0.9 + Math.random() * 0.2;
    
    let finalDamage = Math.max(1, (baseDamage - defenseReduction) * critMultiplier * variance);
    if (isBlocked) finalDamage *= 0.5;
    
    return Math.round(finalDamage);
  };

  // Calculate block effectiveness from pull workouts
  const calculateBlockEffectiveness = (): number => {
    // Base 50% damage reduction + bonus from pull workouts
    return 0.5 - (combatBonuses.blockStrength / 200); // Max ~65% reduction
  };

  const addBattleLog = (message: string) => {
    setBattleLog(prev => [message, ...prev.slice(0, 4)]);
  };

  const executeMove = (move: Move) => {
    if (!player || !opponent || battleOver) return;
    if (cooldowns[move.id] > 0) return;
    if (player.currentEnergy < move.energyCost) {
      addBattleLog("⚡ Not enough energy!");
      return;
    }

    buttonPress();
    setIsPlayerTurn(false);

    // Consume energy
    setPlayer(prev => prev ? { ...prev, currentEnergy: prev.currentEnergy - move.energyCost } : null);

    // Set cooldown
    if (move.cooldown > 0) {
      setCooldowns(prev => ({ ...prev, [move.id]: move.cooldown }));
    }

    if (move.effect === 'block') {
      setIsBlocking(true);
      performBlockAnimation(true);
      addBattleLog(`🛡️ You raise your guard!`);
      setComboCount(0);
      setTimeout(() => opponentTurn(), 1000);
      return;
    }

    if (move.effect === 'heal') {
      const healAmount = Math.abs(move.damage);
      setPlayer(prev => prev ? { 
        ...prev, 
        currentHP: Math.min(prev.maxHP, prev.currentHP + healAmount) 
      } : null);
      successHaptic();
      showHitEffect('💚', width * 0.25);
      addBattleLog(`💚 You recover ${healAmount} HP!`);
      setComboCount(0);
      setTimeout(() => opponentTurn(), 1000);
      return;
    }

    // Attack move - use visual animation
    setLastMove(move.id);
    performAttackAnimation(true, move.id);
    const damage = calculateDamage(player, opponent, move, false);
    const newCombo = comboCount + 1;
    setComboCount(newCombo);

    // Delay damage application to sync with animation
    const animDelay = move.id === 'ultimate' ? 500 : move.id === 'kick' ? 350 : 250;
    
    setTimeout(() => {
      mediumHaptic();
      flashScreen();
      
      // Show hit effect
      const hitEmoji = move.id === 'ultimate' ? '💥' : move.id === 'combo' ? '💢' : '💫';
      showHitEffect(hitEmoji, width * 0.7);
      
      const newHP = Math.max(0, opponent.currentHP - damage);
      setOpponent(prev => prev ? { ...prev, currentHP: newHP } : null);
      
      const comboBonus = newCombo > 1 ? ` (${newCombo}x COMBO!)` : '';
      addBattleLog(`${move.emoji} ${move.name} hits for ${damage} damage!${comboBonus}`);

      if (newHP <= 0) {
        endBattle(true);
      } else {
        setTimeout(() => opponentTurn(), 800);
      }
    }, animDelay);
  };

  const opponentTurn = () => {
    if (!player || !opponent || battleOver) return;

    // Reduce cooldowns
    setCooldowns(prev => {
      const newCooldowns: { [key: string]: number } = {};
      Object.keys(prev).forEach(key => {
        if (prev[key] > 0) newCooldowns[key] = prev[key] - 1;
      });
      return newCooldowns;
    });

    // AI chooses move
    const availableMoves = [
      { name: 'Jab', emoji: '👊', damage: 12, type: 'punch', id: 'punch' },
      { name: 'Hook', emoji: '🥊', damage: 18, type: 'punch', id: 'punch' },
      { name: 'Uppercut', emoji: '💫', damage: 25, type: 'special', id: 'kick' },
    ];

    // Smarter AI - uses stronger moves when low HP
    const hpPercent = opponent.currentHP / opponent.maxHP;
    let moveIndex = 0;
    if (hpPercent < 0.3) {
      moveIndex = 2; // Use strongest when desperate
    } else if (hpPercent < 0.6) {
      moveIndex = Math.random() > 0.5 ? 1 : 2;
    } else {
      moveIndex = Math.floor(Math.random() * 2);
    }

    const aiMove = availableMoves[moveIndex];
    
    setTimeout(() => {
      // Use visual attack animation for opponent
      performAttackAnimation(false, aiMove.id);
      
      // Delay damage to sync with animation
      setTimeout(() => {
        const wasBlocking = isBlocking;
        setIsBlocking(false);
        
        // Reset block animation
        if (wasBlocking) {
          playerScale.setValue(1);
        }
        
        const baseDamage = aiMove.damage + opponent.attack;
        let finalDamage = Math.max(1, baseDamage - player.defense);
        
        if (wasBlocking) {
          finalDamage = Math.round(finalDamage * 0.3);
          showHitEffect('🛡️', width * 0.25);
          addBattleLog(`🛡️ You blocked! ${aiMove.emoji} ${aiMove.name} only deals ${finalDamage}!`);
        } else {
          showHitEffect('💥', width * 0.25);
          addBattleLog(`${opponent.emoji} ${aiMove.name} hits you for ${finalDamage}!`);
        }

        errorHaptic();
        
        const newHP = Math.max(0, player.currentHP - finalDamage);
        setPlayer(prev => prev ? { ...prev, currentHP: newHP } : null);

        // Regenerate some energy
        setPlayer(prev => prev ? { 
          ...prev, 
          // HIIT sessions boost energy regeneration!
          currentEnergy: Math.min(prev.maxEnergy, prev.currentEnergy + 15 + combatBonuses.energyRegen) 
        } : null);

        if (newHP <= 0) {
          endBattle(false);
        } else {
          setIsPlayerTurn(true);
          setComboCount(0); // Reset combo after opponent turn
        }
      }, 300);
    }, 500);
  };

  const endBattle = (won: boolean) => {
    setBattleOver(true);
    setPlayerWon(won);
    
    if (won) {
      successHaptic();
    } else {
      errorHaptic();
    }

    setTimeout(() => setShowResult(true), 1000);
  };

  const renderHealthBar = (current: number, max: number, color: string, isEnergy = false) => (
    <View style={styles.healthBarContainer}>
      <View style={styles.healthBarBg}>
        <View 
          style={[
            styles.healthBarFill, 
            { 
              width: `${(current / max) * 100}%`,
              backgroundColor: color,
            }
          ]} 
        />
      </View>
      <Text style={styles.healthText}>
        {isEnergy ? '⚡' : '❤️'} {current}/{max}
      </Text>
    </View>
  );

  // Render the arena fighters with full visual animations
  const renderArenaFighter = (fighter: Fighter, isPlayer: boolean) => {
    const posAnim = isPlayer ? playerAttackAnim : opponentAttackAnim;
    const yAnim = isPlayer ? playerY : opponentY;
    const scaleAnim = isPlayer ? playerScale : opponentScale;
    const rotateAnim = isPlayer ? playerRotate : opponentRotate;
    const shakeAnim = isPlayer ? playerShake : opponentShake;
    
    const rotateInterpolate = rotateAnim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: ['-30deg', '0deg', '30deg'],
    });
    
    return (
      <Animated.View 
        style={[
          styles.arenaFighter,
          isPlayer ? styles.playerSide : styles.opponentSide,
          { 
            transform: [
              { translateX: Animated.add(posAnim, shakeAnim) },
              { translateY: yAnim },
              { scale: scaleAnim },
              { rotate: rotateInterpolate },
            ] 
          }
        ]}
      >
        {/* Fighter shadow */}
        <View style={styles.fighterShadow} />
        
        {/* Fighter body */}
        <View style={[styles.fighterBody, isPlayer ? styles.playerBody : styles.enemyBody]}>
          <Text style={styles.arenaEmoji}>{fighter.emoji}</Text>
        </View>
        
        {/* HP bar above fighter */}
        <View style={styles.arenaHpBar}>
          <View style={styles.arenaHpBg}>
            <View 
              style={[
                styles.arenaHpFill, 
                { 
                  width: `${(fighter.currentHP / fighter.maxHP) * 100}%`,
                  backgroundColor: fighter.currentHP / fighter.maxHP > 0.3 ? '#FF4757' : '#ff0000',
                }
              ]} 
            />
          </View>
          <Text style={styles.arenaHpText}>{fighter.currentHP}</Text>
        </View>
        
        {/* Name label */}
        <Text style={[styles.arenaName, isPlayer ? styles.playerName : styles.enemyName]}>
          {fighter.name}
        </Text>
      </Animated.View>
    );
  };

  const renderFighter = (fighter: Fighter, isPlayer: boolean) => {
    const shakeAnim = isPlayer ? playerShake : opponentShake;
    const attackAnim = isPlayer ? playerAttackAnim : opponentAttackAnim;
    
    return (
      <Animated.View 
        style={[
          styles.fighterCard,
          isPlayer ? styles.playerCard : styles.opponentCard,
          { 
            transform: [
              { translateX: shakeAnim },
              { translateX: attackAnim },
            ] 
          }
        ]}
      >
        <View style={styles.fighterHeader}>
          <Text style={styles.fighterName}>{fighter.name}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{fighter.level}</Text>
          </View>
        </View>
        
        <Text style={styles.fighterEmoji}>{fighter.emoji}</Text>
        
        {renderHealthBar(fighter.currentHP, fighter.maxHP, '#FF4757')}
        {isPlayer && renderHealthBar(fighter.currentEnergy, fighter.maxEnergy, '#3498db', true)}
        
        <View style={styles.statsRow}>
          <Text style={styles.statText}>⚔️ {fighter.attack}</Text>
          <Text style={styles.statText}>🛡️ {fighter.defense}</Text>
          <Text style={styles.statText}>💨 {fighter.speed}</Text>
        </View>
      </Animated.View>
    );
  };

  const renderMoveButton = (move: Move) => {
    if (!player) return null;
    
    const isOnCooldown = cooldowns[move.id] > 0;
    const notEnoughEnergy = player.currentEnergy < move.energyCost;
    const isDisabled = !isPlayerTurn || isOnCooldown || notEnoughEnergy || battleOver;
    
    return (
      <TouchableOpacity
        key={move.id}
        style={[
          styles.moveButton,
          move.type === 'defense' && styles.defenseButton,
          move.type === 'special' && styles.specialButton,
          move.type === 'ultimate' && styles.ultimateButton,
          isDisabled && styles.disabledButton,
          isBlocking && move.type === 'defense' && styles.activeDefense,
        ]}
        onPress={() => executeMove(move)}
        disabled={isDisabled}
      >
        <Text style={styles.moveEmoji}>{move.emoji}</Text>
        <Text style={styles.moveName}>{move.name}</Text>
        {move.energyCost > 0 && (
          <Text style={styles.moveCost}>⚡{move.energyCost}</Text>
        )}
        {isOnCooldown && (
          <View style={styles.cooldownOverlay}>
            <Text style={styles.cooldownText}>{cooldowns[move.id]}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!player || !opponent) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>⚔️</Text>
          <Text style={styles.loadingText}>Preparing Arena...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Flash overlay */}
      <Animated.View 
        style={[
          styles.flashOverlay,
          { opacity: flashAnim }
        ]} 
        pointerEvents="none"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚔️ COMBAT ARENA</Text>
        <View style={styles.comboContainer}>
          {comboCount > 1 && (
            <Text style={styles.comboText}>{comboCount}x</Text>
          )}
        </View>
      </View>

      {/* Pre-battle screen */}
      {!battleStarted ? (
        <View style={styles.preBattleContainer}>
          <Text style={styles.vsTitle}>⚔️ VS ⚔️</Text>
          
          <View style={styles.matchupContainer}>
            {renderFighter(player, true)}
            <Text style={styles.vsText}>VS</Text>
            {renderFighter(opponent, false)}
          </View>

          <View style={styles.statsBoostInfo}>
            <Text style={styles.boostTitle}>💪 Your Training Bonuses</Text>
            <Text style={styles.boostSubtitle}>Your real workouts power your fighter!</Text>
            
            <View style={styles.bonusRow}>
              <Text style={styles.boostEmoji}>🦵</Text>
              <View style={styles.bonusInfo}>
                <Text style={styles.boostLabel}>Leg Days ({playerStats.legWorkouts})</Text>
                <Text style={styles.boostValue}>+{combatBonuses.kickDamage} Kick Damage</Text>
              </View>
            </View>
            
            <View style={styles.bonusRow}>
              <Text style={styles.boostEmoji}>👊</Text>
              <View style={styles.bonusInfo}>
                <Text style={styles.boostLabel}>Push Days ({playerStats.pushWorkouts})</Text>
                <Text style={styles.boostValue}>+{combatBonuses.punchDamage} Punch Damage</Text>
              </View>
            </View>
            
            <View style={styles.bonusRow}>
              <Text style={styles.boostEmoji}>🏃</Text>
              <View style={styles.bonusInfo}>
                <Text style={styles.boostLabel}>Cardio ({playerStats.cardioSessions})</Text>
                <Text style={styles.boostValue}>+{combatBonuses.speed} Speed</Text>
              </View>
            </View>
            
            <View style={styles.bonusRow}>
              <Text style={styles.boostEmoji}>🛡️</Text>
              <View style={styles.bonusInfo}>
                <Text style={styles.boostLabel}>Pull Days ({playerStats.pullWorkouts})</Text>
                <Text style={styles.boostValue}>+{combatBonuses.blockStrength} Block Power</Text>
              </View>
            </View>
            
            <View style={styles.bonusRow}>
              <Text style={styles.boostEmoji}>⚡</Text>
              <View style={styles.bonusInfo}>
                <Text style={styles.boostLabel}>HIIT Sessions ({playerStats.hiitSessions})</Text>
                <Text style={styles.boostValue}>+{combatBonuses.energyRegen} Energy Regen</Text>
              </View>
            </View>
            
            <View style={styles.bonusRow}>
              <Text style={styles.boostEmoji}>🔥</Text>
              <View style={styles.bonusInfo}>
                <Text style={styles.boostLabel}>Streak ({playerStats.streak} days)</Text>
                <Text style={styles.boostValue}>+{combatBonuses.critChance}% Crit Chance</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.fightButton}
            onPress={() => {
              buttonPress();
              setBattleStarted(true);
              addBattleLog("⚔️ FIGHT!");
            }}
          >
            <Text style={styles.fightButtonText}>⚔️ BEGIN BATTLE!</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Visual Battle Arena */}
          <View style={styles.visualArena}>
            {/* Arena Background */}
            <View style={styles.arenaBackground}>
              <View style={styles.arenaFloor} />
              <Animated.View 
                style={[
                  styles.arenaFlashOverlay, 
                  { opacity: arenaFlash }
                ]} 
              />
            </View>
            
            {/* Fighters in Arena */}
            <View style={styles.fightersRow}>
              {renderArenaFighter(player, true)}
              
              {/* Hit Effect */}
              {hitEffect && (
                <Animated.View 
                  style={[
                    styles.hitEffectContainer,
                    {
                      transform: [{ scale: hitEffectScale }],
                      opacity: hitEffectOpacity,
                    }
                  ]}
                >
                  <Text style={styles.hitEffectText}>{hitEffect}</Text>
                </Animated.View>
              )}
              
              {renderArenaFighter(opponent, false)}
            </View>
            
            {/* VS Badge */}
            <View style={styles.vsBadge}>
              <Text style={styles.vsBadgeText}>VS</Text>
            </View>
          </View>
          
          {/* Stats Panel */}
          <View style={styles.statsPanel}>
            {/* Player Stats */}
            <View style={styles.statsPanelSide}>
              <Text style={styles.statsPanelName}>{player.name}</Text>
              <View style={styles.statsPanelBar}>
                <Text style={styles.statsPanelLabel}>HP</Text>
                <View style={styles.statsPanelBarBg}>
                  <View style={[styles.statsPanelBarFill, { width: `${(player.currentHP / player.maxHP) * 100}%`, backgroundColor: '#FF4757' }]} />
                </View>
                <Text style={styles.statsPanelValue}>{player.currentHP}</Text>
              </View>
              <View style={styles.statsPanelBar}>
                <Text style={styles.statsPanelLabel}>⚡</Text>
                <View style={styles.statsPanelBarBg}>
                  <View style={[styles.statsPanelBarFill, { width: `${(player.currentEnergy / player.maxEnergy) * 100}%`, backgroundColor: '#3498db' }]} />
                </View>
                <Text style={styles.statsPanelValue}>{player.currentEnergy}</Text>
              </View>
            </View>
            
            {/* Battle Log Mini */}
            <View style={styles.battleLogMini}>
              {battleLog.slice(0, 2).map((log, index) => (
                <Text 
                  key={index} 
                  style={[styles.battleLogMiniText, index === 0 && styles.latestLogMini]}
                  numberOfLines={1}
                >
                  {log}
                </Text>
              ))}
            </View>
            
            {/* Opponent Stats */}
            <View style={[styles.statsPanelSide, styles.statsPanelRight]}>
              <Text style={styles.statsPanelName}>{opponent.name}</Text>
              <View style={styles.statsPanelBar}>
                <Text style={styles.statsPanelValue}>{opponent.currentHP}</Text>
                <View style={styles.statsPanelBarBg}>
                  <View style={[styles.statsPanelBarFill, styles.statsPanelBarFillRight, { width: `${(opponent.currentHP / opponent.maxHP) * 100}%`, backgroundColor: '#FF4757' }]} />
                </View>
                <Text style={styles.statsPanelLabel}>HP</Text>
              </View>
            </View>
          </View>

          {/* Turn Indicator */}
          <View style={styles.turnIndicator}>
            <Text style={styles.turnText}>
              {battleOver 
                ? (playerWon ? '🎉 VICTORY!' : '💀 DEFEAT') 
                : (isPlayerTurn ? '👆 YOUR TURN' : '⏳ OPPONENT ATTACKING...')}
            </Text>
          </View>

          {/* Move Buttons */}
          <View style={styles.movesContainer}>
            <View style={styles.movesRow}>
              {PLAYER_MOVES.slice(0, 3).map(renderMoveButton)}
            </View>
            <View style={styles.movesRow}>
              {PLAYER_MOVES.slice(3, 6).map(renderMoveButton)}
            </View>
          </View>
        </>
      )}

      {/* Result Modal */}
      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.resultModal, playerWon ? styles.victoryModal : styles.defeatModal]}>
            <Text style={styles.resultEmoji}>{playerWon ? '🏆' : '💀'}</Text>
            <Text style={styles.resultTitle}>{playerWon ? 'VICTORY!' : 'DEFEAT'}</Text>
            <Text style={styles.resultSubtitle}>
              {playerWon 
                ? `You defeated ${opponent.name}!` 
                : `${opponent.name} wins this round.`}
            </Text>
            
            <View style={styles.rewardsBox}>
              {playerWon ? (
                <>
                  <Text style={styles.rewardText}>⭐ +{50 + (opponent.level * 20)} XP</Text>
                  <Text style={styles.rewardText}>🪙 +{20 + (opponent.level * 10)} Gold</Text>
                  <Text style={styles.rewardText}>🏆 +{10 + opponent.level} Trophies</Text>
                </>
              ) : (
                <>
                  <Text style={styles.rewardText}>⭐ +10 XP (participation)</Text>
                  <View style={styles.workoutTipBox}>
                    <Text style={styles.workoutTipTitle}>{getWorkoutTip().emoji} Workout Tip</Text>
                    <Text style={styles.workoutTipText}>{getWorkoutTip().tip}</Text>
                    <Text style={styles.workoutTipWorkout}>Try: {getWorkoutTip().workout}</Text>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity 
              style={styles.continueBtn}
              onPress={() => {
                buttonPress();
                navigation.goBack();
              }}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>

            {!playerWon && (
              <TouchableOpacity 
                style={styles.rematchBtn}
                onPress={() => {
                  buttonPress();
                  setShowResult(false);
                  setBattleStarted(false);
                  setBattleOver(false);
                  setComboCount(0);
                  setCooldowns({});
                  setBattleLog([]);
                  initializeFighters();
                }}
              >
                <Text style={styles.rematchBtnText}>🔄 Rematch</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#1a1a2e',
  },
  backBtn: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  comboContainer: {
    width: 50,
    alignItems: 'flex-end',
  },
  comboText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 20,
    color: '#888',
  },
  preBattleContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  vsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginVertical: 20,
  },
  matchupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  statsBoostInfo: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  boostTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 4,
    textAlign: 'center',
  },
  boostSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
    textAlign: 'center',
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 8,
    marginVertical: 3,
  },
  boostEmoji: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
  },
  bonusInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 8,
  },
  boostLabel: {
    fontSize: 13,
    color: '#aaa',
  },
  boostValue: {
    fontSize: 13,
    color: '#00FF88',
    fontWeight: 'bold',
  },
  boostText: {
    fontSize: 14,
    color: '#aaa',
    marginVertical: 2,
  },
  fightButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  fightButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  arenaContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  fighterCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
  },
  playerCard: {
    borderColor: '#00FF88',
  },
  opponentCard: {
    borderColor: '#FF6B6B',
  },
  fighterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fighterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  fighterEmoji: {
    fontSize: 50,
    textAlign: 'center',
    marginVertical: 8,
  },
  healthBarContainer: {
    marginVertical: 4,
  },
  healthBarBg: {
    height: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  healthText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statText: {
    fontSize: 14,
    color: '#888',
  },
  battleLogContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 10,
    maxHeight: 100,
  },
  battleLogText: {
    fontSize: 12,
    color: '#888',
    marginVertical: 1,
  },
  latestLog: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  turnIndicator: {
    backgroundColor: '#1a1a2e',
    padding: 12,
    alignItems: 'center',
  },
  turnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  movesContainer: {
    backgroundColor: '#1a1a2e',
    padding: 12,
    paddingBottom: 30,
  },
  movesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 6,
  },
  moveButton: {
    width: (width - 60) / 3,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3d3d5c',
  },
  defenseButton: {
    borderColor: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
  },
  specialButton: {
    borderColor: '#9b59b6',
    backgroundColor: 'rgba(155, 89, 182, 0.2)',
  },
  ultimateButton: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  disabledButton: {
    opacity: 0.4,
  },
  activeDefense: {
    backgroundColor: '#3498db',
    borderColor: '#fff',
  },
  moveEmoji: {
    fontSize: 24,
  },
  moveName: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  moveCost: {
    fontSize: 10,
    color: '#3498db',
    marginTop: 2,
  },
  cooldownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cooldownText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 30,
    width: width * 0.85,
    alignItems: 'center',
    borderWidth: 3,
  },
  victoryModal: {
    borderColor: '#00FF88',
  },
  defeatModal: {
    borderColor: '#FF6B6B',
  },
  resultEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 20,
    textAlign: 'center',
  },
  rewardsBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  rewardText: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    marginVertical: 4,
  },
  workoutTipBox: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#00FF88',
  },
  workoutTipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 4,
  },
  workoutTipText: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 4,
  },
  workoutTipWorkout: {
    fontSize: 12,
    color: '#aaa',
    fontStyle: 'italic',
  },
  continueBtn: {
    backgroundColor: '#00D4AA',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
  },
  continueBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  rematchBtn: {
    marginTop: 12,
    paddingVertical: 12,
  },
  rematchBtnText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  // Visual Arena Styles
  visualArena: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    position: 'relative',
  },
  arenaBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  arenaFloor: {
    height: '40%',
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderTopWidth: 3,
    borderColor: '#333',
  },
  arenaFlashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFD700',
  },
  fightersRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  arenaFighter: {
    alignItems: 'center',
    width: width * 0.35,
  },
  playerSide: {
    alignSelf: 'flex-end',
    marginBottom: 40,
  },
  opponentSide: {
    alignSelf: 'flex-end',
    marginBottom: 40,
  },
  fighterShadow: {
    position: 'absolute',
    bottom: -10,
    width: 80,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
  },
  fighterBody: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  playerBody: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderColor: '#00FF88',
  },
  enemyBody: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderColor: '#FF6B6B',
  },
  arenaEmoji: {
    fontSize: 50,
  },
  arenaHpBar: {
    marginTop: 10,
    alignItems: 'center',
  },
  arenaHpBg: {
    width: 80,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  arenaHpFill: {
    height: '100%',
    borderRadius: 4,
  },
  arenaHpText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  arenaName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  playerName: {
    color: '#00FF88',
  },
  enemyName: {
    color: '#FF6B6B',
  },
  vsBadge: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -25,
    width: 50,
    height: 50,
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  vsBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  hitEffectContainer: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hitEffectText: {
    fontSize: 60,
  },
  statsPanel: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: '#333',
  },
  statsPanelSide: {
    flex: 1,
  },
  statsPanelRight: {
    alignItems: 'flex-end',
  },
  statsPanelName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statsPanelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  statsPanelLabel: {
    fontSize: 10,
    color: '#888',
    width: 20,
  },
  statsPanelBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  statsPanelBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsPanelBarFillRight: {
    alignSelf: 'flex-end',
  },
  statsPanelValue: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    width: 25,
    textAlign: 'right',
  },
  battleLogMini: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  battleLogMiniText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  latestLogMini: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CombatArenaScreen;
