import { View, Text } from "react-native";
import { CATEGORY_COLORS, STATUS_META } from "../services/feedback.constants";
import { styles } from "../styles/feedback.styles";

export function CategoryBadge({ cat }) {
  const color = CATEGORY_COLORS[cat] || "#6b7280";

  return (
    <View style={[styles.badge, { backgroundColor: color + "22", borderColor: color + "55" }]}>
      <Text style={[styles.badgeText, { color }]}>{String(cat).toUpperCase()}</Text>
    </View>
  );
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: "#6b7280" };

  return (
    <View style={[styles.badge, { backgroundColor: meta.color + "22", borderColor: meta.color + "55" }]}>
      <Text style={[styles.badgeText, { color: meta.color }]}>
        {String(meta.label).toUpperCase()}
      </Text>
    </View>
  );
}
