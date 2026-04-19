import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Report } from "@/context/AppContext";

interface Props {
  report: Report;
  onPress: () => void;
  isAdmin?: boolean;
  onQuickStatus?: (status: Report["status"]) => void;
}

const STATUS_CONFIG = {
  pending: { label: "En attente", color: "#d97706", bg: "#fffbeb", icon: "clock" as const },
  reviewed: { label: "En cours", color: "#2563eb", bg: "#eff6ff", icon: "eye" as const },
  closed: { label: "Traité", color: "#16a34a", bg: "#f0fdf4", icon: "check-circle" as const },
};

const ABUSE_TYPE_LABEL = {
  sexual: "Abus sexuel",
  violence: "Violence",
  both: "Abus sexuel & Violence",
};

const QUICK_STATUSES: { key: Report["status"]; label: string }[] = [
  { key: "pending", label: "En attente" },
  { key: "reviewed", label: "En cours" },
  { key: "closed", label: "Traité" },
];

export function ReportCard({ report, onPress, isAdmin = false, onQuickStatus }: Props) {
  const colors = useColors();
  const status = STATUS_CONFIG[report.status];
  const date = new Date(report.submittedAt);
  const dateStr = date.toLocaleDateString("fr-GA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Zone principale cliquable */}
      <TouchableOpacity
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
        activeOpacity={0.8}
      >
        <View style={styles.topRow}>
          <View
            style={[
              styles.typeTag,
              {
                backgroundColor:
                  report.abuseType === "sexual"
                    ? "#fef2f2"
                    : report.abuseType === "violence"
                    ? "#fff7ed"
                    : "#f5f3ff",
              },
            ]}
          >
            <Text
              style={[
                styles.typeText,
                {
                  color:
                    report.abuseType === "sexual"
                      ? "#dc2626"
                      : report.abuseType === "violence"
                      ? "#d97706"
                      : "#7c3aed",
                },
              ]}
            >
              {ABUSE_TYPE_LABEL[report.abuseType]}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Feather name={status.icon} size={11} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.foreground }]} numberOfLines={2}>
          {report.description}
        </Text>

        {isAdmin && (
          <View style={[styles.adminInfo, { borderTopColor: colors.border }]}>
            <View style={styles.infoItem}>
              <Feather name="user" size={12} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                {report.reporterName}, {report.reporterAge} ans
              </Text>
            </View>
            {report.trackingCode ? (
              <View style={styles.infoItem}>
                <Feather name="hash" size={12} color="#15803d" />
                <Text style={[styles.infoText, { color: "#15803d", fontWeight: "700" }]}>
                  {report.trackingCode}
                </Text>
              </View>
            ) : null}
            {report.location ? (
              <View style={styles.infoItem}>
                <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                <Text style={[styles.infoText, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {report.location}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.bottomRow}>
          <View style={styles.infoItem}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={[styles.dateText, { color: colors.mutedForeground }]}>{dateStr}</Text>
          </View>
          {report.mediaUri ? (
            <View style={styles.infoItem}>
              <Feather
                name={report.mediaType === "video" ? "video" : "image"}
                size={12}
                color={colors.mutedForeground}
              />
              <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
                {report.mediaType === "video" ? "Vidéo jointe" : "Photo jointe"}
              </Text>
            </View>
          ) : null}
          <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
        </View>
      </TouchableOpacity>

      {/* ══════ BOUTONS STATUT RAPIDE (admin uniquement) ══════ */}
      {isAdmin && onQuickStatus && (
        <View style={[styles.quickStatusRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.quickStatusLabel, { color: colors.mutedForeground }]}>
            Changer le statut :
          </Text>
          <View style={styles.quickStatusBtns}>
            {QUICK_STATUSES.map((s) => {
              const cfg = STATUS_CONFIG[s.key];
              const isActive = report.status === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.quickBtn,
                    {
                      backgroundColor: isActive ? cfg.color : colors.background,
                      borderColor: isActive ? cfg.color : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onQuickStatus(s.key);
                  }}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={cfg.icon}
                    size={11}
                    color={isActive ? "#fff" : cfg.color}
                  />
                  <Text
                    style={[
                      styles.quickBtnText,
                      { color: isActive ? "#fff" : cfg.color },
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 14,
    paddingBottom: 0,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flex: 1,
  },
  typeText: { fontSize: 11, fontWeight: "700" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  description: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  adminInfo: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 4,
    paddingHorizontal: 14,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  infoText: { fontSize: 12 },
  dateText: { fontSize: 12, flex: 1 },

  /* Boutons statut rapide */
  quickStatusRow: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  quickStatusLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  quickStatusBtns: {
    flexDirection: "row",
    gap: 6,
  },
  quickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
