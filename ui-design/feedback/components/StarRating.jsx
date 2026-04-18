import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles/feedback.styles";

export function StarRating({ value, onChange }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.7}>
          <Text style={{ fontSize: 34, color: n <= value ? "#00d4d4" : "#243044" }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
