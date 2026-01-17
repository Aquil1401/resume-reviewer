import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ScoreCircle({ score, size = 120, strokeWidth = 10, label }: ScoreCircleProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const getScoreColor = () => {
    if (score >= 80) return theme.scoreExcellent;
    if (score >= 60) return theme.scoreGood;
    if (score >= 40) return theme.scoreAverage;
    return theme.scorePoor;
  };

  const getScoreMessage = () => {
    if (score >= 80) return "Excellent!";
    if (score >= 60) return "Good progress";
    if (score >= 40) return "Needs work";
    return "Keep improving";
  };

  return (
    <View style={styles.container}>
      <View style={[styles.circleContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getScoreColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.scoreTextContainer}>
          <ThemedText type="hero" style={[styles.scoreText, { color: getScoreColor() }]}>
            {score}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            ATS Score
          </ThemedText>
        </View>
      </View>
      {label ? (
        <ThemedText type="body" style={[styles.message, { color: getScoreColor() }]}>
          {label}
        </ThemedText>
      ) : (
        <ThemedText type="body" style={[styles.message, { color: getScoreColor() }]}>
          {getScoreMessage()}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circleContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  scoreTextContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontWeight: '700',
  },
  message: {
    marginTop: Spacing.md,
    fontWeight: '600',
  },
});
