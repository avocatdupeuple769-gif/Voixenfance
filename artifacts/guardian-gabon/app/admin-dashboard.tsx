import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReportCard } from "@/components/ReportCard";
import { useApp, type Report, API_BASE } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type FilterStatus = "all" | "pending" | "reviewed" | "closed";

export default function AdminDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reports, adminLogout, isAdmin, updateReportStatus, deleteReport, refreshReports } = useApp();
  const isWeb = Platform.OS === "web";
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    handleRefresh();
    const interval = setInterval(() => { handleRefreshSilent(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshSilent = async () => {
    const { newCount } = await refreshReports();
    if (newCount > 0) {
      for (let i = 0; i < newCount; i++) {
        await new Promise((r) => setTimeout(r, i * 400));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const { newCount } = await refreshReports();
    setRefreshing(false);
    if (newCount > 0) {
      for (let i = 0; i < newCount; i++) {
        await new Promise((r) => setTimeout(r, i * 400));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  };

  if (!isAdmin) {
    router.replace("/admin-login");
    return null;
  }

  const filteredReports = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const reviewedCount = reports.filter((r) => r.status === "reviewed").length;
  const closedCount = reports.filter((r) => r.status === "closed").length;

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: () => { adminLogout(); router.replace("/home"); },
      },
    ]);
  };

  const handleDelete = (report: Report) => {
    Alert.alert(
      "Supprimer ce signalement",
      `Voulez-vous supprimer définitivement ce signalement ? Cette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            if (selectedReport?.id === report.id) setSelectedReport(null);
            await deleteReport(report.id);
          },
        },
      ]
    );
  };

  if (selectedReport) {
    return (
      <AdminReportDetail
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onUpdateStatus={(status, adminNote) => {
          updateReportStatus(selectedReport.id, status, adminNote);
          setSelectedReport({ ...selectedReport, status, ...(adminNote ? { adminNote } : {}) });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        onDelete={() => handleDelete(selectedReport)}
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
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleRefresh} disabled={refreshing}>
              <Feather name="refresh-cw" size={20} color={refreshing ? "rgba(255,255,255,0.4)" : "#ffffff"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
              <Feather name="log-out" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
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
            <Text style={[styles.filterText, { color: filter === f.key ? colors.primaryForeground : colors.foreground }]}>
              {f.label}
            </Text>
            {f.count > 0 && (
              <View style={[styles.badge, { backgroundColor: filter === f.key ? "rgba(255,255,255,0.3)" : colors.muted }]}>
                <Text style={[styles.badgeText, { color: filter === f.key ? "#fff" : colors.mutedForeground }]}>
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
        contentContainerStyle={[styles.list, { paddingBottom: (isWeb ? 34 : insets.bottom) + 20 }]}
        renderItem={({ item }) => (
          <ReportCard
            report={item}
            onPress={() => setSelectedReport(item)}
            isAdmin
            onQuickStatus={(status) => {
              updateReportStatus(item.id, status);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
            onDelete={() => handleDelete(item)}
          />
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
  onDelete,
  colors,
  insets,
  isWeb,
}: {
  report: Report;
  onClose: () => void;
  onUpdateStatus: (s: Report["status"], adminNote?: string) => void;
  onDelete: () => void;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  insets: { top: number; bottom: number };
  isWeb: boolean;
}) {
  const date = new Date(report.submittedAt).toLocaleString("fr-GA");
  const ABUSE_LABELS = { sexual: "Abus sexuel", violence: "Violence", both: "Abus sexuel & Violence" };
  const [adminNote, setAdminNote] = useState(report.adminNote || "");
  const [imgError, setImgError] = useState(false);

  const mediaUrl = report.mediaUri?.startsWith("/media/")
    ? `${API_BASE}${report.mediaUri}`
    : report.mediaUri;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.detailHeader, { backgroundColor: colors.primary, paddingTop: isWeb ? 67 : insets.top + 8 }]}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Détail du signalement</Text>
        <TouchableOpacity onPress={onDelete} style={[styles.backBtn, { backgroundColor: "rgba(239,68,68,0.3)" }]}>
          <Feather name="trash-2" size={18} color="#fca5a5" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.detailContent, { paddingBottom: (isWeb ? 34 : insets.bottom) + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.detailCard, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
          <View style={styles.codeRow}>
            <Feather name="hash" size={15} color="#15803d" />
            <Text style={[styles.detailSection, { color: "#15803d", marginBottom: 0 }]}>Code de suivi</Text>
          </View>
          <View style={[styles.codeBox, { backgroundColor: "#dcfce7" }]}>
            <Text style={[styles.codeText, { color: "#166534" }]}>{report.trackingCode || "N/A"}</Text>
          </View>
        </View>

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

        {/* ═══ MEDIA ═══ */}
        {report.mediaUri ? (
          <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.detailSection, { color: colors.primary }]}>Preuve jointe</Text>
            {report.mediaType === "photo" && mediaUrl && !imgError ? (
              <Image
                source={{ uri: mediaUrl }}
                style={styles.mediaImage}
                contentFit="contain"
                onError={() => setImgError(true)}
              />
            ) : report.mediaType === "photo" && imgError ? (
              <View style={[styles.mediaPlaceholder, { backgroundColor: colors.secondary }]}>
                <Feather name="image" size={28} color={colors.mutedForeground} />
                <Text style={[styles.mediaPlaceholderText, { color: colors.mutedForeground }]}>
                  Photo non disponible
                </Text>
              </View>
            ) : report.mediaType === "video" && mediaUrl ? (
              <TouchableOpacity
                style={[styles.videoBtn, { backgroundColor: "#0d2146", borderColor: "#1a3a6b" }]}
                onPress={() => Linking.openURL(mediaUrl)}
                activeOpacity={0.8}
              >
                <View style={styles.videoBtnIcon}>
                  <Feather name="play-circle" size={30} color="#c9a227" />
                </View>
                <View>
                  <Text style={styles.videoBtnTitle}>Lire la vidéo</Text>
                  <Text style={styles.videoBtnSub}>Appuyer pour ouvrir dans le lecteur</Text>
                </View>
                <Feather name="external-link" size={16} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            ) : (
              <View style={[styles.mediaPlaceholder, { backgroundColor: colors.secondary }]}>
                <Feather name={report.mediaType === "video" ? "video" : "image"} size={24} color={colors.primary} />
                <Text style={[styles.mediaPlaceholderText, { color: colors.primary }]}>
                  {report.mediaType === "video" ? "Vidéo jointe (ancienne soumission)" : "Photo jointe (ancienne soumission)"}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.detailSection, { color: colors.primary }]}>Note administrative</Text>
          <TextInput
            style={[styles.noteInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            value={adminNote}
            onChangeText={setAdminNote}
            placeholder="Ajouter une note interne..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

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
                    { backgroundColor: isSelected ? colors.primary : colors.card, borderColor: isSelected ? colors.primary : colors.border },
                  ]}
                  onPress={() => onUpdateStatus(s, adminNote.trim() || undefined)}
                >
                  <Text style={[styles.statusBtnText, { color: isSelected ? "#fff" : colors.foreground }]}>
                    {labels[s]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bouton supprimer */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          activeOpacity={0.8}
        >
          <Feather name="trash-2" size={16} color="#fff" />
          <Text style={styles.deleteBtnText}>Supprimer ce signalement</Text>
        </TouchableOpacity>
      </ScrollView>
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
  header: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#ffffff" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, borderRadius: 10, padding: 10, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "800", color: "#ffffff" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2, textAlign: "center" },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterText: { fontSize: 12, fontWeight: "600" },
  badge: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 10, fontWeight: "700" },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },

  /* Detail */
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
  detailTitle: { fontSize: 17, fontWeight: "700", color: "#ffffff" },
  detailContent: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  detailCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  detailSection: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  detailIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  detailLabel: { fontSize: 11, fontWeight: "500", marginBottom: 1 },
  detailValue: { fontSize: 14, fontWeight: "600" },
  detailDesc: { fontSize: 14, lineHeight: 22 },

  /* Media */
  mediaImage: { width: "100%", height: 240, borderRadius: 10 },
  mediaPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 10,
  },
  mediaPlaceholderText: { fontSize: 13, fontWeight: "600", flex: 1 },
  videoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  videoBtnIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(201,162,39,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoBtnTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  videoBtnSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },

  /* Note */
  noteInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    lineHeight: 20,
  },

  /* Status */
  statusRow: { flexDirection: "row", gap: 8 },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
  },
  statusBtnText: { fontSize: 12, fontWeight: "700" },

  /* Delete */
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  deleteBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  codeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  codeBox: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" },
  codeText: { fontSize: 18, fontWeight: "800", letterSpacing: 2 },
});
