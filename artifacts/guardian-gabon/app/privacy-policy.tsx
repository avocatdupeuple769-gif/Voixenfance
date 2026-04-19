import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Article {
  ref: string;
  title: string;
  content: string;
}

const PENAL_ARTICLES: Article[] = [
  {
    ref: "Art. 261 CP",
    title: "Viol sur mineur de moins de 15 ans",
    content:
      "Tout acte de pénétration sexuelle commis sur la personne d'un mineur de quinze ans est un crime puni de dix à vingt ans de réclusion criminelle. La peine est portée à vingt à trente ans lorsque l'auteur est un ascendant, tuteur ou toute personne ayant autorité sur la victime.",
  },
  {
    ref: "Art. 262 CP",
    title: "Agression sexuelle sur mineur",
    content:
      "Toute atteinte sexuelle autre que le viol commise sur la personne d'un mineur de quinze ans est punie d'un emprisonnement de cinq à dix ans et d'une amende. La peine est aggravée si l'auteur a un lien de parenté, d'autorité ou de tutelle avec la victime.",
  },
  {
    ref: "Art. 264 CP",
    title: "Corruption de mineur",
    content:
      "Quiconque commet des actes contraires aux bonnes mœurs ou à la décence sur la personne d'un mineur, ou provoque un mineur à des actes de débauche, est puni d'un emprisonnement de deux à cinq ans et d'une amende.",
  },
  {
    ref: "Art. 225-1 CP",
    title: "Protection de l'enfant contre la violence",
    content:
      "Les violences volontaires exercées sur un mineur de moins de 15 ans sont punies de peines aggravées. Lorsqu'elles sont commises par un ascendant ou toute personne ayant autorité sur le mineur, les peines sont doublées.",
  },
  {
    ref: "Art. 367 CP",
    title: "Obligation de signalement",
    content:
      "Toute personne ayant connaissance d'un crime ou délit commis sur un mineur est tenue d'en informer les autorités compétentes. Le défaut de signalement d'un abus sur mineur est constitutif d'une infraction punissable.",
  },
  {
    ref: "Loi n°09/2004",
    title: "Protection pénale de l'enfant au Gabon",
    content:
      "La loi portant orientation de la politique nationale de promotion et de protection de l'enfant au Gabon garantit à tout enfant le droit à la protection contre toute forme de violence, d'abus sexuel, d'exploitation et de maltraitance.",
  },
];

const CONFIDENTIALITY_PRINCIPLES = [
  {
    icon: "user-x" as const,
    title: "Anonymat garanti",
    text: "Votre identité n'est jamais divulguée publiquement. Seul l'administrateur autorisé de la plateforme peut consulter vos informations personnelles, dans le strict cadre du traitement de votre signalement.",
  },
  {
    icon: "lock" as const,
    title: "Données sécurisées",
    text: "Toutes les données transmises via cette application sont chiffrées et stockées sur un serveur sécurisé. Elles ne sont en aucun cas partagées avec des tiers sans votre consentement explicite.",
  },
  {
    icon: "eye-off" as const,
    title: "Confidentialité des preuves",
    text: "Les photos, vidéos et tout document joint à votre signalement sont accessibles uniquement à l'administrateur. Ils sont utilisés exclusivement dans le cadre du traitement de l'affaire.",
  },
  {
    icon: "shield" as const,
    title: "Protection légale du signalant",
    text: "Conformément à l'article 367 du Code Pénal Gabonais, le signalement d'un abus sur mineur est un acte civique protégé. Aucune sanction ne peut être prise contre un signalant de bonne foi.",
  },
  {
    icon: "trash-2" as const,
    title: "Droit à l'effacement",
    text: "Vos données peuvent être supprimées par l'administrateur à votre demande, notamment après traitement du dossier. La durée de conservation est limitée au strict nécessaire pour le traitement de l'affaire.",
  },
  {
    icon: "server" as const,
    title: "Hébergement",
    text: "L'application VoixEnfance est hébergée sur des serveurs sécurisés. Le traitement des données est effectué dans le respect des standards internationaux de protection des données personnelles.",
  },
];

export default function PrivacyPolicyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

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
        <LinearGradient
          colors={["#0d2146", "#1a3a6b"]}
          style={styles.header}
        >
          <View style={styles.headerIconWrap}>
            <Feather name="shield" size={28} color="#c9a227" />
          </View>
          <Text style={styles.headerTitle}>Politique de Confidentialité</Text>
          <Text style={styles.headerSubtitle}>
            VoixEnfance — Protection de l'enfance au Gabon
          </Text>
          <View style={styles.headerBadge}>
            <Feather name="book-open" size={11} color="#c9a227" />
            <Text style={styles.headerBadgeText}>Conforme au Code Pénal Gabonais</Text>
          </View>
        </LinearGradient>

        {/* Intro */}
        <View style={[styles.introCard, { backgroundColor: "#fffbeb", borderColor: "#fde68a" }]}>
          <Feather name="info" size={15} color="#d97706" />
          <Text style={[styles.introText, { color: "#92400e" }]}>
            La plateforme VoixEnfance s'engage à protéger l'identité et la vie privée de chaque personne effectuant un signalement. Cette politique décrit la manière dont vos données sont collectées, utilisées et protégées.
          </Text>
        </View>

        {/* Principes de confidentialité */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Nos engagements de confidentialité
        </Text>

        {CONFIDENTIALITY_PRINCIPLES.map((p, i) => (
          <View key={i} style={[styles.principleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.principleIcon, { backgroundColor: "#eff6ff" }]}>
              <Feather name={p.icon} size={18} color="#1a3a6b" />
            </View>
            <View style={styles.principleContent}>
              <Text style={[styles.principleTitle, { color: colors.foreground }]}>{p.title}</Text>
              <Text style={[styles.principleText, { color: colors.mutedForeground }]}>{p.text}</Text>
            </View>
          </View>
        ))}

        {/* Articles du code pénal */}
        <View style={[styles.penalHeader, { backgroundColor: "#0d2146" }]}>
          <Feather name="book-open" size={18} color="#c9a227" />
          <Text style={styles.penalHeaderTitle}>Code Pénal Gabonais</Text>
          <Text style={styles.penalHeaderSub}>Articles protégeant les mineurs contre les abus</Text>
        </View>

        {PENAL_ARTICLES.map((article, i) => (
          <View key={i} style={[styles.articleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.articleRefRow}>
              <View style={[styles.articleRefBadge, { backgroundColor: "#0d2146" }]}>
                <Text style={styles.articleRef}>{article.ref}</Text>
              </View>
            </View>
            <Text style={[styles.articleTitle, { color: colors.foreground }]}>{article.title}</Text>
            <Text style={[styles.articleContent, { color: colors.mutedForeground }]}>{article.content}</Text>
          </View>
        ))}

        {/* Données collectées */}
        <View style={[styles.dataCard, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
          <View style={styles.dataHeader}>
            <Feather name="database" size={16} color="#15803d" />
            <Text style={[styles.dataTitle, { color: "#14532d" }]}>Données collectées lors d'un signalement</Text>
          </View>
          {[
            "Votre nom et votre âge (visibles uniquement par l'administrateur)",
            "L'âge et le type d'abus subi par la victime",
            "La description détaillée des faits",
            "La localisation approximative (facultatif)",
            "Les preuves jointes : photos ou vidéos (facultatif)",
          ].map((item, i) => (
            <View key={i} style={styles.dataRow}>
              <Feather name="check-circle" size={13} color="#16a34a" />
              <Text style={[styles.dataText, { color: "#166534" }]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Contact DPO */}
        <View style={[styles.footerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="mail" size={15} color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Pour toute question relative à la confidentialité de vos données ou pour demander leur suppression, contactez l'administrateur de la plateforme via l'écran "Ressources & Aide".
          </Text>
        </View>

        {/* Date */}
        <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
          Politique mise à jour le 19 avril 2026 — VoixEnfance Gabon
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },

  header: {
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
  },
  headerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(201,162,39,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(201,162,39,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(201,162,39,0.15)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 4,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#c9a227",
  },

  introCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  introText: { fontSize: 13, lineHeight: 19, flex: 1 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 2,
  },

  principleCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  principleIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  principleContent: { flex: 1, gap: 4 },
  principleTitle: { fontSize: 14, fontWeight: "700" },
  principleText: { fontSize: 13, lineHeight: 18 },

  penalHeader: {
    borderRadius: 14,
    padding: 16,
    gap: 6,
    alignItems: "center",
    marginTop: 4,
  },
  penalHeaderTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
  },
  penalHeaderSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },

  articleCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  articleRefRow: { flexDirection: "row" },
  articleRefBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  articleRef: {
    fontSize: 11,
    fontWeight: "800",
    color: "#c9a227",
    letterSpacing: 0.4,
  },
  articleTitle: { fontSize: 14, fontWeight: "700" },
  articleContent: { fontSize: 13, lineHeight: 19 },

  dataCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  dataHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  dataTitle: { fontSize: 14, fontWeight: "700", flex: 1 },
  dataRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  dataText: { fontSize: 13, lineHeight: 18, flex: 1 },

  footerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  footerText: { fontSize: 12, lineHeight: 17, flex: 1 },

  dateText: {
    fontSize: 11,
    textAlign: "center",
    paddingBottom: 8,
  },
});
