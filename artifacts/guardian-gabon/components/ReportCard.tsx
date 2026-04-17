import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Report } from "@/context/AppContext";

interface Props {
  report: Report;
  onPress: () => void;
  isAdmin?: boolean;
}

const STATUS_CONFIG = {
  pending: { label: "En attente", color: "#d97706" },
  reviewed: { label: "En cours", color: "#2563eb" },
  closed: { label: "Traité", color: "#16a34a" },
};

const ABUSE_TYPE_LABEL = {
  sexual: "Abus sexuel",
  violence: "Violence",
  both: "Abus sexuel & Violence",
};

export function ReportCard({ report, onPress, isAdmin = false }: Props) {
  const colors = useColors();
  const status = STATUS_CONFIG[report.status];
  const date = new Date(report.submittedAt);
  const dateStr = date.toLocaleDateString("fr-GA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
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
        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
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
            <Feather name={report.mediaType === "video" ? "video" : "image"} size={12} color={colors.mutedForeground} />
            <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
              {report.mediaType === "video" ? "Vidéo jointe" : "Photo jointe"}
            </Text>
          </View>
        ) : null}
        <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flex: 1,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  adminInfo: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 4,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
    flex: 1,
  },
});
