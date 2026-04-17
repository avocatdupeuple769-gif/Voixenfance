import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

const EMERGENCY_CONTACTS = [
  {
    id: "police",
    name: "Police Nationale",
    number: "1730",
    subtitle: "Commissariat",
    icon: "shield" as const,
  },
  {
    id: "gendarmerie",
    name: "Gendarmerie",
    number: "1730",
    subtitle: "Brigade",
    icon: "alert-octagon" as const,
  },
  {
    id: "samu",
    name: "SAMU",
    number: "1300",
    subtitle: "Urgences médicales",
    icon: "activity" as const,
  },
];

export function EmergencyBanner() {
  const colors = useColors();

  const handleCall = (contact: (typeof EMERGENCY_CONTACTS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (Platform.OS === "web") {
      Alert.alert("Appel d'urgence", `Composez le ${contact.number} pour ${contact.name}`);
      return;
    }
    Alert.alert(
      "Appel d'urgence",
      `Appeler le ${contact.name} au ${contact.number} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: `Appeler ${contact.number}`,
          style: "destructive",
          onPress: () => Linking.openURL(`tel:${contact.number}`),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.emergency }]}>
      <View style={styles.header}>
        <Feather name="phone-call" size={14} color={colors.emergencyForeground} />
        <Text style={[styles.headerText, { color: colors.emergencyForeground }]}>
          URGENCES — APPELEZ MAINTENANT
        </Text>
      </View>
      <View style={styles.buttonsRow}>
        {EMERGENCY_CONTACTS.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={[styles.callButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
            onPress={() => handleCall(contact)}
            activeOpacity={0.7}
          >
            <Feather name={contact.icon} size={18} color={colors.emergencyForeground} />
            <Text style={[styles.callNumber, { color: colors.emergencyForeground }]}>
              {contact.number}
            </Text>
            <Text style={[styles.callName, { color: "rgba(255,255,255,0.85)" }]}>
              {contact.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  callButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 3,
  },
  callNumber: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
  callName: {
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },
});
