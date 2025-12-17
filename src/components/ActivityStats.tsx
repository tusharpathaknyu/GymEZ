import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ActivityStatsProps {
  workoutsThisWeek: number;
  totalPrs: number;
  gymRank: number;
}

const ActivityStats = ({
  workoutsThisWeek,
  totalPrs,
  gymRank,
}: ActivityStatsProps) => {
  const stats = [
    {
      label: 'Workouts',
      value: workoutsThisWeek,
      icon: '💪',
      color: '#10b981',
    },
    { label: 'Total PRs', value: totalPrs, icon: '🏆', color: '#f59e0b' },
    { label: 'Gym Rank', value: `#${gymRank}`, icon: '📊', color: '#3b82f6' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Activity 📈</Text>
      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={[styles.statValue, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default ActivityStats;
