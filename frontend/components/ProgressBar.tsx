import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0.0 to 1.0
  height?: number;
  fillColor?: string;
  fillUnderColor?: string;
  backgroundColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 14,
  fillColor = '#10B981',      // Emerald Green
  fillUnderColor = '#059669', // Darker Green highlight
  backgroundColor = '#E2E8F0', // Slate-200
}) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const percentWidth = `${Math.round(clampedProgress * 100)}%`;

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor,
          borderRadius: height / 2,
        },
      ]}
    >
      {clampedProgress > 0 && (
        <View
          style={[
            styles.fill,
            {
              width: percentWidth as any,
              backgroundColor: fillColor,
              borderRadius: height / 2,
            },
          ]}
        >
          {/* Subtle glossy 3D highlight on top edge */}
          <View
            style={[
              styles.highlight,
              {
                height: Math.max(3, height * 0.35),
                borderRadius: height / 4,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  fill: {
    height: '100%',
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    top: 2,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
});
