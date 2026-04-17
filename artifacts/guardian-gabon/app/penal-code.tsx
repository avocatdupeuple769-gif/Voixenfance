import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const PENAL_ARTICLES = [
  {
    id: "1",
    article: "Article 261",
    title: "Viol sur mineur",
    content:
      "Le viol est puni de 5 à 10 ans d'emprisonnement. Lorsque le viol est commis sur un mineur de 15 ans, la peine est portée à 10 à 20 ans de réclusion criminelle. Lorsque le viol est commis par un ascendant ou par toute autre personne ayant autorité sur la victime mineure, la peine est la réclusion criminelle à vie.",
    severity: "critical",
  },
  {
    id: "2",
    article: "Article 262",
    title: "Attentat à la pudeur sur mineur",
    content:
      "Tout attentat à la pudeur commis ou tenté sans violence sur la personne d'un enfant de l'un ou l'autre sexe, âgé de moins de 15 ans, est puni d'un emprisonnement de 5 à 10 ans et d'une amende. Si l'auteur est un ascendant de la victime ou une personne ayant autorité sur elle, il sera prononcé la réclusion criminelle de 10 à 20 ans.",
    severity: "critical",
  },
  {
    id: "3",
    article: "Article 263",
    title: "Agressions sexuelles sur mineur",
    content:
      "Toute agression sexuelle autre que le viol, imposée à une personne par violence, contrainte, menace ou surprise, est punie de 1 à 5 ans d'emprisonnement. Lorsque l'agression est commise sur un mineur de moins de 15 ans, la peine est portée à 5 à 10 ans de réclusion criminelle.",
    severity: "high",
  },
  {
    id: "4",
    article: "Article 264",
    title: "Pédopornographie",
    content:
      "La fabrication, la diffusion, l'importation, l'exportation, ou la détention de tout support représentant des mineurs dans une pose ou un acte sexuellement explicite est punie de 5 à 10 ans d'emprisonnement et d'une amende. La diffusion par voie électronique est une circonstance aggravante.",
    severity: "critical",
  },
  {
    id: "5",
    article: "Article 218 bis",
    title: "Mariage forcé de mineur",
    content:
      "Est puni de 2 à 5 ans d'emprisonnement quiconque contraint un mineur au mariage. L'âge légal du mariage est fixé à 15 ans pour les filles et 18 ans pour les garçons, sous réserve d'une dispense accordée par le juge pour des motifs graves.",
    severity: "high",
  },
  {
    id: "6",
    article: "Article 229",
    title: "Violence sur mineur — coups et blessures",
    content:
      "Les coups portés ou les blessures faites volontairement à un enfant de moins de 15 ans par un parent, tuteur ou toute personne ayant autorité sur lui sont punis de 2 à 5 ans d'emprisonnement. En cas d'incapacité de travail supérieure à 8 jours, la peine est portée à 5 à 10 ans.",
    severity: "high",
  },
  {
    id: "7",
    article: "Article 230",
    title: "Privation d'aliments ou de soins",
    content:
      "Quiconque se rend coupable de privations ou mauvais traitements habituels envers un mineur de 15 ans placé sous sa garde ou sous son autorité, est puni d'un emprisonnement de 2 à 5 ans et d'une amende. Si ces actes ont causé la mort, la peine est portée à la réclusion criminelle.",
    severity: "high",
  },
  {
    id: "8",
    article: "Article 231",
    title: "Abandon de famille",
    content:
      "Est puni d'un emprisonnement de 1 à 3 ans et d'une amende, quiconque abandonne volontairement pendant plus de deux mois un enfant de moins de 15 ans en s'abstenant de pourvoir à son entretien, à sa santé, à sa surveillance et à son éducation.",
    severity: "medium",
  },
  {
    id: "9",
    article: "Article 350",
    title: "Traite des mineurs",
    content:
      "La traite de mineurs est punie de la réclusion criminelle de 10 à 20 ans. Constitue la traite de mineurs le recrutement, le transport, le transfert, l'hébergement, ou l'accueil d'un enfant à des fins d'exploitation sexuelle, de travail forcé, ou de tout autre forme d'exploitation.",
    severity: "critical",
  },
  {
    id: "10",
    article: "Article 351",
    title: "Exploitation économique des enfants",
    content:
      "Est puni de 2 à 5 ans d'emprisonnement quiconque contraint un mineur de 15 ans à exercer une activité économique susceptible de nuire à sa santé, son développement ou sa scolarisation. En cas de récidive, la peine est doublée.",
    severity: "medium",
  },
  {
    id: "11",
    article: "Article 160",
    title: "Non-dénonciation de crimes sur mineur",
    content:
      "Toute personne qui a connaissance d'un crime ou d'un délit commis sur un mineur et qui ne le dénonce pas aux autorités compétentes est punissable d'un emprisonnement de 1 à 3 ans et d'une amende. L'obligation de signalement s'impose à tous les professionnels de santé, enseignants et travailleurs sociaux.",
    severity: "medium",
  },
  {
    id: "12",
    article: "Article 269",
    title: "Harcèlement sexuel sur mineur",
    content:
      "Le fait d'imposer à une personne mineure des propos ou comportements à connotation sexuelle, portant atteinte à sa dignité, est puni de 1 à 3 ans d'emprisonnement. Si l'auteur est un enseignant, employeur ou toute personne abusant de son autorité, la peine est portée à 3 à 5 ans.",
    severity: "high",
  },
];

const SEVERITY_CONFIG = {
  critical: { label: "Très grave", color: "#dc2626", bg: "#fef2f2" },
  high: { label: "Grave", color: "#d97706", bg: "#fff7ed" },
  medium: { label: "Modéré", color: "#2563eb", bg: "#eff6ff" },
};

export default function PenalCodeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [expanded, setExpanded] = useState<string | null>(null);

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
        <View style={[styles.headerCard, { backgroundColor: colors.primary }]}>
          <Feather name="book-open" size={24} color="#ffffff" />
          <Text style={styles.headerTitle}>Code Pénal Gabonais</Text>
          <Text style={styles.headerSubtitle}>
            Articles relatifs à la protection des mineurs contre les abus sexuels et la violence
          </Text>
        </View>

        <View style={[styles.legendRow]}>
          {Object.entries(SEVERITY_CONFIG).map(([key, val]) => (
            <View key={key} style={[styles.legendItem, { backgroundColor: val.bg }]}>
              <View style={[styles.legendDot, { backgroundColor: val.color }]} />
              <Text style={[styles.legendText, { color: val.color }]}>{val.label}</Text>
            </View>
          ))}
        </View>

        {PENAL_ARTICLES.map((article) => {
          const severity = SEVERITY_CONFIG[article.severity as keyof typeof SEVERITY_CONFIG];
          const isOpen = expanded === article.id;
          return (
            <TouchableOpacity
              key={article.id}
              style={[
                styles.articleCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setExpanded(isOpen ? null : article.id)}
              activeOpacity={0.8}
            >
              <View style={styles.articleHeader}>
                <View style={styles.articleLeft}>
                  <View style={[styles.severityBadge, { backgroundColor: severity.bg }]}>
                    <Text style={[styles.severityText, { color: severity.color }]}>
                      {severity.label}
                    </Text>
                  </View>
                  <Text style={[styles.articleNum, { color: colors.primary }]}>
                    {article.article}
                  </Text>
                </View>
                <Feather
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.mutedForeground}
                />
              </View>
              <Text style={[styles.articleTitle, { color: colors.foreground }]}>
                {article.title}
              </Text>
              {isOpen && (
                <Text style={[styles.articleContent, { color: colors.mutedForeground }]}>
                  {article.content}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={[styles.disclaimer, { backgroundColor: "#f8fafc", borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
            Ces articles sont présentés à titre informatif. Pour toute situation d'urgence, contactez immédiatement la Police ou la Gendarmerie. Consultez un avocat pour obtenir des conseils juridiques personnalisés.
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
  headerCard: {
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
  legendRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  articleCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  articleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  articleLeft: {
    gap: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  severityText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  articleNum: {
    fontSize: 13,
    fontWeight: "700",
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  articleContent: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
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
