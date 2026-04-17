import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function AdminLoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { adminLogin, isAdmin } = useApp();
  const isWeb = Platform.OS === "web";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (isAdmin) {
    router.replace("/admin-dashboard");
    return null;
  }

  const handleLogin = () => {
    if (!password.trim()) {
      Alert.alert("Erreur", "Veuillez entrer le mot de passe administrateur.");
      return;
    }
    const success = adminLogin(password);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/admin-dashboard");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Accès refusé", "Mot de passe incorrect. Cet espace est réservé aux autorités habilitées.");
      setPassword("");
    }
  };

  const bottomPad = isWeb ? 34 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.content, { paddingBottom: bottomPad + 40 }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
          <Feather name="lock" size={36} color={colors.primaryForeground} />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Espace Administrateur</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Accès réservé aux autorités et personnels habilités. Toutes les connexions sont enregistrées.
        </Text>

        <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.foreground }]}>Mot de passe</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <Feather name="key" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Mot de passe administrateur"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onSubmitEditing={handleLogin}
              returnKeyType="go"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Feather name="log-in" size={18} color="#fff" />
            <Text style={styles.loginText}>Se connecter</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.warningBox, { backgroundColor: "#fefce8", borderColor: "#fef08a" }]}>
          <Feather name="alert-triangle" size={14} color="#a16207" />
          <Text style={[styles.warningText, { color: "#a16207" }]}>
            Toute tentative d'accès non autorisé est un délit punissable par la loi.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 20,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  form: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  loginText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
    fontWeight: "500",
  },
});
