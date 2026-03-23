import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles";

export default function AlertModal({ visible, title, message, onClose }) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.smallModalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.cardBody}>{message}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.primaryButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}