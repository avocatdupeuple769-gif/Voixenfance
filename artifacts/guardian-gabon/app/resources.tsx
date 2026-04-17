import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Resource {
  id: string;
  category: string;
  name: string;
  description: string;
  phone?: string;
  type: "ngo" | "gov" | "health" | "legal" | "intl";
}

const RESOURCES: Resource[] = [
  {
    id: "1",
    category: "Autorités nationales",
    name: "Ministère de la Famille et des Affaires Sociales",
    description: "Assistance sociale aux enfants victimes d'abus et violence.",
    phone: "011 76 12 00",
    type: "gov",
  },
  {
    id: "2",
    category: "Autorités nationales",
    name: "Direction Générale de la Protection de l'Enfance",
    description: "Organe officiel de protection et prise en charge des mineurs en danger.",
    phone: "011 76 15 33",
    type: "gov",
  },
  {
    id: "3",
    category: "Urgences médicales",
    name: "Centre Hospitalier Universitaire de Libreville (CHUL)",
    description: "Prise en charge médicale urgente des victimes d'agression et de violence.",
    phone: "011 70 05 05",
    type: "health",
  },
  {
    id: "4",
    category: "Urgences médicales",
    name: "Hôpital d'Instruction des Armées Omar Bongo Ondimba",
    description: "Service des urgences disponible 24h/24 pour les cas de violence.",
    phone: "011 72 24 86",
    type: "health",
  },
  {
    id: "5",
    category: "ONG & Associations",
    name: "SOS Villages d'Enfants Gabon",
    description:
      "Organisation qui accueille, protège et accompagne les enfants en situation de vulnérabilité.",
    phone: "011 73 22 18",
    type: "ngo",
  },
  {
    id: "6",
    category: "ONG & Associations",
    name: "Croix-Rouge Gabonaise",
    description:
      "Services d'urgence humanitaire, accompagnement psychosocial et aide aux victimes.",
    phone: "011 76 20 95",
    type: "ngo",
  },
  {
    id: "7",
    category: "ONG & Associations",
    name: "Association Femmes Avenir",
    description: "Protection des femmes et des enfants victimes de violences et d'abus.",
    phone: "077 12 34 56",
    type: "ngo",
  },
  {
    id: "8",
    category: "Organisations internationales",
    name: "UNICEF Gabon",
    description: "Protection des droits de l'enfant, soutien et plaidoyer pour les victimes.",
    phone: "011 76 21 17",
    type: "intl",
  },
  {
    id: "9",
    category: "Organisations internationales",
    name: "Plan International Gabon",
    description: "ONG internationale dédiée à la protection de l'enfance et l'égalité des genres.",
    phone: "011 44 09 09",
    type: "intl",
  },
  {
    id: "10",
    category: "Soutien psychologique",
    name: "Centre de Santé Mentale de Libreville",
    description:
      "Suivi psychologique pour les enfants et familles victimes de traumatismes.",
    phone: "011 72 41 90",
    type: "health",
  },
  {
    id: "11",
    category: "Soutien psychologique",
    name: "Service Social du CHUL",
    description:
      "Assistants sociaux spécialisés dans la prise en charge des victimes de violence et d'abus.",
    phone: "011 70 05 00",
    type: "health",
  },
  {
    id: "12",
    category: "Aide juridique",
    name: "Barreau du Gabon — Aide Juridictionnelle",
    description:
      "Accès à un avocat gratuit pour les victimes sans ressources. Assistance judiciaire garantie.",
    phone: "011 72 19 04",
    type: "legal",
  },
];

const TYPE_CONFIG = {
  gov: { color: "#1a3a6b", bg: "#eff6ff", icon: "flag" as const, label: "Gouvernement" },
  ngo: { color: "#15803d", bg: "#f0fdf4", icon: "heart" as const, label: "ONG" },
  health: { color: "#dc2626", bg: "#fef2f2", icon: "activity" as const, label: "Santé" },
  legal: { color: "#7c3aed", bg: "#f5f3ff", icon: "briefcase" as const, label: "Juridique" },
  intl: { color: "#d97706", bg: "#fffbeb", icon: "globe" as const, label: "International" },
};

const CATEGORIES = [
  "Autorités nationales",
  "Urgences médicales",
  "ONG & Associations",
  "Organisations internationales",
  "Soutien psychologique",
  "Aide juridique",
];

export default function ResourcesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCall = (resource: Resource) => {
    if (!resource.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === "web") {
      Alert.alert("Appel", `Composez le ${resource.phone} pour contacter ${resource.name}`);
      return;
    }
    Alert.alert(
      resource.name,
      `Appeler le ${resource.phone} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: `Appeler`,
          onPress: () => Linking.openURL(`tel:${resource.phone?.replace(/\s/g, "")}`),
        },
      ]
    );
  };

  const filtered = activeCategory
    ? RESOURCES.filter((r) => r.category === activeCategory)
    : RESOURCES;

  const grouped = CATEGORIES.reduce<Record<string, Resource[]>>((acc, cat) => {
    const items = filtered.filter((r) => r.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (isWeb ? 34 : insets.bottom) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Feather name="life-buoy" size={24} color="#ffffff" />
          <Text style={styles.headerTitle}>Ressources & Soutien</Text>
          <Text style={styles.headerSubtitle}>
            Organisations, associations et services d'aide aux victimes au Gabon
          </Text>
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[
              styles.filterPill,
              {
                backgroundColor: !activeCategory ? colors.primary : colors.card,
                borderColor: !activeCategory ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveCategory(null)}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: !activeCategory ? "#fff" : colors.foreground },
              ]}
            >
              Tous
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterPill,
                {
                  backgroundColor: activeCategory === cat ? colors.primary : colors.card,
                  borderColor: activeCategory === cat ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveCategory(activeCategory === cat ? null : cat);
              }}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: activeCategory === cat ? "#fff" : colors.foreground },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grouped resources */}
        {Object.entries(grouped).map(([category, items]) => (
          <View key={category}>
            <Text style={[styles.categoryTitle, { color: colors.foreground }]}>{category}</Text>
            {items.map((resource) => {
              const typeConfig = TYPE_CONFIG[resource.type];
              return (
                <View
                  key={resource.id}
                  style={[
                    styles.card,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.cardTop}>
                    <View style={[styles.typeTag, { backgroundColor: typeConfig.bg }]}>
                      <Feather name={typeConfig.icon} size={11} color={typeConfig.color} />
                      <Text style={[styles.typeText, { color: typeConfig.color }]}>
                        {typeConfig.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.cardName, { color: colors.foreground }]}>
                    {resource.name}
                  </Text>
                  <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
                    {resource.description}
                  </Text>
                  {resource.phone && (
                    <TouchableOpacity
                      style={[styles.callRow, { backgroundColor: typeConfig.bg, borderColor: typeConfig.color + "33" }]}
                      onPress={() => handleCall(resource)}
                      activeOpacity={0.75}
                    >
                      <Feather name="phone" size={14} color={typeConfig.color} />
                      <Text style={[styles.callNumber, { color: typeConfig.color }]}>
                        {resource.phone}
                      </Text>
                      <Text style={[styles.callLabel, { color: typeConfig.color }]}>
                        Appeler
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        <View style={[styles.disclaimer, { backgroundColor: "#f8fafc", borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
            Ces contacts sont fournis à titre informatif. En cas d'urgence immédiate, appelez la Police (1730) ou le SAMU (1300).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  header: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 18,
  },
  filterRow: {
    paddingHorizontal: 0,
    gap: 6,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    marginBottom: 8,
  },
  cardTop: {
    flexDirection: "row",
  },
  typeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  typeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  callRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
  },
  callNumber: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  callLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  disclaimer: {
    flexDirection: "row",
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
});
