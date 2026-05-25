import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { GlassView } from "expo-glass-effect";
import { supabase } from "@/lib/supabase";

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
  categories?: { name: string; icon: string } | null;
};

export default function Home() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("");

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (data) setUserName(data.full_name);
    }
  };

  const fetchTransactions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("transactions")
      .select("*, categories(name, icon)")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.warn("Fetch error:", error.message);
    } else {
      setTransactions((data as Transaction[]) || []);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchUserProfile(), fetchTransactions()]);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUserProfile(), fetchTransactions()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to realtime changes on transactions table
    const channel = supabase
      .channel("transactions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          // Re-fetch whenever any change happens
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === "income";
    return (
      <View style={styles.transactionRow}>
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionIcon}>
            {item.categories?.icon || (isIncome ? "💵" : "📦")}
          </Text>
          <View>
            <Text style={styles.transactionCategory}>
              {item.categories?.name || (isIncome ? "รายรับ" : "รายจ่าย")}
            </Text>
            {item.description ? (
              <Text style={styles.transactionDesc} numberOfLines={1}>
                {item.description}
              </Text>
            ) : null}
          </View>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: isIncome ? "#34d399" : "#f87171" },
          ]}
        >
          {isIncome ? "+" : "-"}฿{formatAmount(item.amount)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0f0c29", "#302b63", "#24243e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>สวัสดี 👋</Text>
            <Text style={styles.userName}>{userName || "ผู้ใช้งาน"}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>

        {/* Balance card */}
        <GlassView
          style={styles.balanceCard}
          glassEffectStyle="regular"
          tintColor="rgba(255,255,255,0.06)"
        >
          <Text style={styles.balanceLabel}>ยอดคงเหลือ</Text>
          <Text
            style={[
              styles.balanceAmount,
              { color: balance >= 0 ? "#34d399" : "#f87171" },
            ]}
          >
            ฿{formatAmount(balance)}
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryDot, { backgroundColor: "#34d399" }]} />
              <View>
                <Text style={styles.summaryLabel}>รายรับ</Text>
                <Text style={[styles.summaryValue, { color: "#34d399" }]}>
                  ฿{formatAmount(totalIncome)}
                </Text>
              </View>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <View style={[styles.summaryDot, { backgroundColor: "#f87171" }]} />
              <View>
                <Text style={styles.summaryLabel}>รายจ่าย</Text>
                <Text style={[styles.summaryValue, { color: "#f87171" }]}>
                  ฿{formatAmount(totalExpense)}
                </Text>
              </View>
            </View>
          </View>
        </GlassView>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/income")}
          >
            <LinearGradient
              colors={["#059669", "#10b981"]}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionText}>เพิ่มรายรับ</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/expense")}
          >
            <LinearGradient
              colors={["#dc2626", "#ef4444"]}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIcon}>💸</Text>
              <Text style={styles.actionText}>เพิ่มรายจ่าย</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>รายการล่าสุด</Text>
        </View>

        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#a78bfa"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>
                {loading ? "กำลังโหลด..." : "ยังไม่มีรายการ"}
              </Text>
              <Text style={styles.emptySubtext}>
                {loading ? "" : "เพิ่มรายรับหรือรายจ่ายเพื่อเริ่มต้น"}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Krub_400Regular",
  },
  userName: {
    fontSize: 22,
    color: "#ffffff",
    fontFamily: "Krub_700Bold",
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  logoutText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Krub_400Regular",
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
    overflow: "hidden",
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Krub_400Regular",
    textAlign: "center",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontFamily: "Krub_700Bold",
    textAlign: "center",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Krub_400Regular",
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: "Krub_700Bold",
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 16,
    gap: 4,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 14,
    color: "#ffffff",
    fontFamily: "Krub_700Bold",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Krub_700Bold",
  },
  listContent: {
    paddingBottom: 30,
    gap: 8,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
  },
  transactionCategory: {
    fontSize: 14,
    color: "#ffffff",
    fontFamily: "Krub_700Bold",
  },
  transactionDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    fontFamily: "Krub_400Regular",
    maxWidth: 160,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: "Krub_700Bold",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Krub_700Bold",
  },
  emptySubtext: {
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
    fontFamily: "Krub_400Regular",
    marginTop: 4,
  },
});