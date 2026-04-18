import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

const ConfidenceRing = ({ confidence = 0, label }) => {
  const { theme } = useTheme();

  // 1. Convert score to safe number (0-100)
  let cleanScore = 0;
  if (typeof confidence === 'string') {
    cleanScore = parseFloat(confidence.replace('%', '')) || 0;
  } else {
    cleanScore = Number(confidence) || 0;
  }

  // Handle decimal scores (e.g., 0.85 -> 85)
  const safeConfidence = (cleanScore > 0 && cleanScore <= 1) ? cleanScore * 100 : Math.max(0, Math.min(cleanScore, 100));

  const size = 74;
  const strokeWidth = 6;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = safeConfidence / 100;
  const strokeDashoffset = circumference * (1 - progress);

  // Suggested dynamic colors based on theme
  let progressColor = theme.danger; // Coral/Red (Low)
  if (safeConfidence >= 75) progressColor = theme.primary; // Cyan/Blue (High)
  else if (safeConfidence >= 40) progressColor = theme.warning; // Amber/Yellow (Mid)

  const trackColor = theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const displayLabel = label || (safeConfidence >= 75 ? 'HIGH' : safeConfidence >= 40 ? 'MID' : 'LOW');

  return (
    <View style={styles.wrapper}>
      <View style={styles.ringBox}>
        <Svg width={size} height={size}>
          {/* Background Track Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Arc Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>

        <View style={styles.textOverlay}>
          <Text style={[styles.percentText, { color: progressColor }]}>
            {Math.round(safeConfidence)}%
          </Text>
        </View>
      </View>

      <Text style={[styles.labelText, { color: progressColor }]}>
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 86,
  },
  ringBox: {
    width: 74,
    height: 74,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  textOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  percentText: {
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  labelText: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});

export default ConfidenceRing;

