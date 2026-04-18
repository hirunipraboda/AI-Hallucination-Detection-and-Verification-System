import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles/feedback.styles";

const VOTES = [
  { key: "helpful", emoji: "👍", label: "Helpful" },
  { key: "incorrect", emoji: "👎", label: "Inaccurate" },
];

export function VoteButtons({ selected, onChange }) {
  return (
    <View style={styles.voteRow}>
      {VOTES.map(({ key, emoji, label }) => {
        const isActive = selected === key;
        const isHelpful = key === "helpful";

        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            activeOpacity={0.75}
            style={[
              styles.voteBtn,
              isActive && (isHelpful ? styles.voteBtnHelpfulActive : styles.voteBtnIncorrectActive),
            ]}
          >
            <View
              style={[
                styles.voteIconCircle,
                isHelpful
                  ? (isActive ? styles.voteIconCircleHelpfulActive : styles.voteIconCircleHelpful)
                  : (isActive ? styles.voteIconCircleIncorrectActive : styles.voteIconCircleIncorrect),
              ]}
            >
              <Text style={styles.voteEmoji}>{emoji}</Text>
            </View>

            <Text style={[styles.voteBtnLabel, isActive && styles.voteBtnLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
