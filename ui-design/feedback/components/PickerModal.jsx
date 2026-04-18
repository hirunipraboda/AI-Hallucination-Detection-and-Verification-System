import { View, Text, TouchableOpacity, Modal } from "react-native";
import { styles } from "../styles/feedback.styles";

export function PickerModal({
  visible,
  options,
  selected,
  onSelect,
  onClose,
  title,
  allowAll = false,
}) {
  const handleSelect = (val) => {
    onSelect(val);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>{title}</Text>

          {allowAll && (
            <TouchableOpacity
              style={[styles.modalOption, selected === "" && styles.modalOptionActive]}
              onPress={() => handleSelect("")}
            >
              <Text style={[styles.modalOptionText, selected === "" && { color: "#00d4d4" }]}>
                All
              </Text>
            </TouchableOpacity>
          )}

          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.modalOption, selected === opt && styles.modalOptionActive]}
              onPress={() => handleSelect(opt)}
            >
              <Text style={[styles.modalOptionText, selected === opt && { color: "#00d4d4" }]}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
