import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface MentionSystemProps {
  content: string;
}

const MentionSystem: React.FC<MentionSystemProps> = ({ content }) => {
  // Parse mentions from content (format: @username)
  const parseMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }

      // Add mention
      parts.push({
        type: 'mention',
        content: match[1],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return parts;
  };

  const parts = parseMentions(content);

  return (
    <Text style={styles.content}>
      {parts.map((part, index) =>
        part.type === 'mention' ? (
          <Text key={index} style={styles.mention}>
            @{part.content}
          </Text>
        ) : (
          <Text key={index}>{part.content}</Text>
        ),
      )}
    </Text>
  );
};

const styles = StyleSheet.create({
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  mention: {
    color: '#10b981',
    fontWeight: '600',
  },
});

export default MentionSystem;
