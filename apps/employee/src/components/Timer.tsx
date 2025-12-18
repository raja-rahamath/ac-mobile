import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

interface TimerProps {
  isRunning: boolean;
  startTime?: string | null;
  totalSeconds?: number;
  onPause?: () => void;
  onResume?: () => void;
  onClockIn?: () => void;
  onClockOut?: () => void;
  isClockedIn: boolean;
  isPaused?: boolean;
  isDark?: boolean;
}

export function Timer({
  isRunning,
  startTime,
  totalSeconds = 0,
  onPause,
  onResume,
  onClockIn,
  onClockOut,
  isClockedIn,
  isPaused = false,
  isDark = false,
}: TimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate elapsed time from start time
  const calculateElapsed = useCallback(() => {
    if (!startTime) return totalSeconds;
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - start) / 1000) + totalSeconds;
    return elapsed;
  }, [startTime, totalSeconds]);

  useEffect(() => {
    if (isRunning && !isPaused && startTime) {
      // Initial calculation
      setElapsedSeconds(calculateElapsed());

      // Update every second
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(calculateElapsed());
      }, 1000);
    } else if (isPaused || !isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, startTime, calculateElapsed]);

  // Reset when totalSeconds changes (e.g., after clock out)
  useEffect(() => {
    if (!isRunning && !isPaused) {
      setElapsedSeconds(totalSeconds);
    }
  }, [totalSeconds, isRunning, isPaused]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const dynamicStyles = {
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.card]}>
      <View style={styles.timerHeader}>
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isClockedIn
                  ? isPaused
                    ? colors.warning
                    : colors.success
                  : colors.textMuted,
              },
            ]}
          />
          <Text style={[styles.statusText, dynamicStyles.textMuted]}>
            {isClockedIn ? (isPaused ? 'Paused' : 'Working') : 'Not Started'}
          </Text>
        </View>
        <Ionicons name="time" size={24} color={colors.primary} />
      </View>

      <Text style={[styles.timerDisplay, dynamicStyles.text]}>{formatTime(elapsedSeconds)}</Text>

      <View style={styles.timerActions}>
        {!isClockedIn ? (
          <TouchableOpacity style={[styles.actionButton, styles.clockInButton]} onPress={onClockIn}>
            <Ionicons name="play" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Clock In</Text>
          </TouchableOpacity>
        ) : (
          <>
            {isPaused ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.resumeButton]}
                onPress={onResume}
              >
                <Ionicons name="play" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Resume</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.actionButton, styles.pauseButton]} onPress={onPause}>
                <Ionicons name="pause" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Pause</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.clockOutButton]}
              onPress={onClockOut}
            >
              <Ionicons name="stop" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Clock Out</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: fontSize.sm,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.lg,
  },
  timerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  clockInButton: {
    backgroundColor: colors.success,
  },
  pauseButton: {
    backgroundColor: colors.warning,
  },
  resumeButton: {
    backgroundColor: colors.success,
  },
  clockOutButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
