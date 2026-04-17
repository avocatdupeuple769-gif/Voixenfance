import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReportCard } from "@/components/ReportCard";
import { useApp, type Report } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type FilterStatus = "all" | "pending" | "reviewed" | "closed";

export default function AdminDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reports, adminLogout, isAdmin, updateReportStatus } = useApp();
  const isWeb = Platform.OS === "web";
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  if (!isAdmin) {
    router.replace("/admin-login");
    return null;
  }

  const filteredReports =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const reviewedCount = reports.filter((r) => r.status === "reviewed").length;
  const closedCount = reports.filter((r) => r.status === "closed").length;

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: () => {
          adminLogout();
          router.replace("/home");
        },
      },
    ]);
  };

  if (selectedReport) {
    return (
      <AdminReportDetail
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onUpdateStatus={(status) => {
          updateReportStatus(selectedReport.id, status);
          setSelectedReport({ ...selectedReport, status });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        colors={colors}
        insets={insets}
        isWeb={isWeb}
      />
    );
  }

  const FILTERS: { key: FilterStatus; label: string; count: number }[] = [
    { key: "all", label: "Tous", count: reports.length },
    { key: "pending", label: "En attente", count: pendingCount },
    { key: "reviewed", label: "En cours", count: reviewedCount },
    { key: "closed", label: "Traités", count: closedCount },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: isWeb ? 67 : insets.top + 8 }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Tableau de bord</Text>
            <Text style={styles.headerSubtitle}>{reports.length} signalement(s) total</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Text style={styles.statNum}>{pendingCount}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Text style={styles.statNum}>{reviewedCount}</Text>
            <Text style={styles.statLabel}>En cours</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Text style={styles.statNum}>{closedCount}</Text>
            <Text style={styles.statLabel}>Traités</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterBtn,
              {
                backgroundColor: filter === f.key ? colors.primary : colors.card,
                borderColor: filter === f.key ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f.key ? colors.primaryForeground : colors.foreground },
              ]}
            >
              {f.label}
            </Text>
            {f.count > 0 && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: filter === f.key ? "rgba(255,255,255,0.3)" : colors.muted },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: filter === f.key ? "#fff" : colors.mutedForeground },
                  ]}
                >
                  {f.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: (isWeb ? 34 : insets.bottom) + 20 },
        ]}
        renderItem={({ item }) => (
          <ReportCard report={item} onPress={() => setSelectedReport(item)} isAdmin />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Aucun signalement{filter !== "all" ? ` dans cette catégorie` : ""}
            </Text>
          </View>
        }
        scrollEnabled={filteredReports.length > 0}
      />
    </View>
  );
}

function AdminReportDetail({
  report,
  onClose,
  onUpdateStatus,
  colors,
  insets,
  isWeb,
}: {
  report: Report;
  onClose: () => void;
  onUpdateStatus: (s: Report["status"]) => void;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  insets: { top: number; bottom: number };
  isWeb: boolean;
}) {
  const date = new Date(report.submittedAt).toLocaleString("fr-GA");
  const ABUSE_LABELS = { sexual: "Abus sexuel", violence: "Violence", both: "Abus sexuel & Violence" };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.detailHeader, { backgroundColor: colors.primary, paddingTop: isWeb ? 67 : insets.top + 8 }]}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Détail du signalement</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={[report]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.detailContent, { paddingBottom: (isWeb ? 34 : insets.bottom) + 20 }]}
        renderItem={() => (
          <>
            <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.detailSection, { color: colors.primary }]}>Informations confidentielles</Text>
              <DetailRow icon="user" label="Signalé par" value={`${report.reporterName}, ${report.reporterAge} ans`} colors={colors} />
              <DetailRow icon="calendar" label="Date de soumission" value={date} colors={colors} />
              {report.location ? <DetailRow icon="map-pin" label="Lieu" value={report.location} colors={colors} /> : null}
              <DetailRow icon="alert-triangle" label="Type d'abus" value={ABUSE_LABELS[report.abuseType]} colors={colors} />
              <DetailRow icon="user-x" label="Âge de la victime" value={`${report.victimAge} ans`} colors={colors} />
            </View>

            <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.detailSection, { color: colors.primary }]}>Description</Text>
              <Text style={[styles.detailDesc, { color: colors.foreground }]}>{report.description}</Text>
            </View>

            {report.mediaUri ? (
              <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.detailSection, { color: colors.primary }]}>Preuve jointe</Text>
                <View style={[styles.mediaInfo, { backgroundColor: colors.secondary }]}>
                  <Feather name={report.mediaType === "video" ? "video" : "image"} size={20} color={colors.primary} />
                  <Text style={[styles.mediaInfoText, { color: colors.primary }]}>
                    {report.mediaType === "video" ? "Vidéo jointe au dossier" : "Photo jointe au dossier"}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.detailSection, { color: colors.primary }]}>Statut du dossier</Text>
              <View style={styles.statusRow}>
                {(["pending", "reviewed", "closed"] as Report["status"][]).map((s) => {
                  const labels = { pending: "En attente", reviewed: "En cours", closed: "Traité" };
                  const isSelected = report.status === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.statusBtn,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => onUpdateStatus(s)}
                    >
                      <Text style={[styles.statusBtnText, { color: isSelected ? "#fff" : colors.foreground }]}>
                        {labels[s]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}
      />
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIconWrap, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={14} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  statNum: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
    textAlign: "center",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
  },
  detailContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  detailCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  detailSection: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  detailIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailDesc: {
    fontSize: 14,
    lineHeight: 22,
  },
  mediaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
  },
  mediaInfoText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
