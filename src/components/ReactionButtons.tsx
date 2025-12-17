import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

interface ReactionButtonsProps {
  postId: string;
  initialLikes: number;
  onLike: () => void;
}

type ReactionType = 'like' | 'fire' | 'clap' | 'strong' | 'trophy';

const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  postId: _postId,
  initialLikes,
  onLike,
}) => {
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(
    null,
  );
  const [showReactions, setShowReactions] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);

  const reactions = [
    { type: 'like' as ReactionType, icon: '❤️', label: 'Like' },
    { type: 'fire' as ReactionType, icon: '🔥', label: 'Fire' },
    { type: 'clap' as ReactionType, icon: '👏', label: 'Clap' },
    { type: 'strong' as ReactionType, icon: '💪', label: 'Strong' },
    { type: 'trophy' as ReactionType, icon: '🏆', label: 'Trophy' },
  ];

  const handleReaction = (reaction: ReactionType) => {
    if (selectedReaction === reaction) {
      setSelectedReaction(null);
      setLikeCount(prev => Math.max(0, prev - 1));
    } else {
      if (!selectedReaction) {
        setLikeCount(prev => prev + 1);
      }
      setSelectedReaction(reaction);
      onLike();
    }
    setShowReactions(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.reactionButton}
        onPress={() => setShowReactions(true)}
      >
        <Text style={styles.reactionIcon}>
          {selectedReaction
            ? reactions.find(r => r.type === selectedReaction)?.icon
            : '🤍'}
        </Text>
        <Text style={styles.reactionCount}>{likeCount}</Text>
      </TouchableOpacity>

      <Modal
        visible={showReactions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReactions(false)}
        >
          <View style={styles.reactionsContainer}>
            {reactions.map(reaction => (
              <TouchableOpacity
                key={reaction.type}
                style={[
                  styles.reactionOption,
                  selectedReaction === reaction.type &&
                    styles.reactionOptionActive,
                ]}
                onPress={() => handleReaction(reaction.type)}
              >
                <Text style={styles.reactionOptionIcon}>{reaction.icon}</Text>
                <Text style={styles.reactionOptionLabel}>{reaction.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactionIcon: {
    fontSize: 20,
  },
  reactionCount: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 4,
  },
  reactionOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    minWidth: 60,
  },
  reactionOptionActive: {
    backgroundColor: '#f3f4f6',
  },
  reactionOptionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  reactionOptionLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
});

export default ReactionButtons;
