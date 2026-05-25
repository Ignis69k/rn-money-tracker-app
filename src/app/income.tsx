import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { GlassView } from "expo-glass-effect";
import { supabase } from "@/lib/supabase";

type Category = {
  id: number;
  name: string;
  icon: string;
};

export default function Income() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("type", "income")
      .order("id");
    if (data) setCategories(data);
  };

  const handleSubmit = async () => {
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("ข้อผิดพลาด", "กรุณาเข้าสู่ระบบใหม่");
        router.replace("/login");
        return;
      }

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "income",
        amount: parseFloat(amount),
        description: description.trim() || null,
        category_id: selectedCategory,
        date: new Date().toISOString().split("T")[0],
      });

      if (error) {
        Alert.alert("ผิดพลาด", error.message);
        return;
      }

      Alert.alert("สำเร็จ!", "บันทึกรายรับเรียบร้อย", [
        { text: "ตกลง", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0f0c29", "#1a3a2a", "#0f2922"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>← กลับ</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#059669", "#10b981"]}
              style={styles.iconCircle}
            >
              <Text style={styles.iconText}>💰</Text>
            </LinearGradient>
          </View>

          <Text style={styles.heading}>เพิ่มรายรับ</Text>
          <Text style={styles.subheading}>บันทึกรายรับของคุณ</Text>

          <GlassView
            style={styles.glassCard}
            glassEffectStyle="regular"
            tintColor="rgba(255,255,255,0.06)"
          >
            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>จำนวนเงิน (บาท)</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>฿</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>หมวดหมู่</Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat.id && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.categoryName,
                        selectedCategory === cat.id && styles.categoryNameActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>หมายเหตุ (ไม่บังคับ)</Text>
              <View style={[styles.inputWrapper, { height: 80, alignItems: "flex-start" }]}>
                <TextInput
                  style={[styles.input, { paddingTop: 12, textAlignVertical: "top" }]}
                  placeholder="รายละเอียดเพิ่มเติม..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={loading}
              style={styles.buttonOuter}
            >
              <LinearGradient
                colors={loading ? ["#4b6b5a", "#4b6b5a"] : ["#059669", "#10b981"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>บันทึกรายรับ</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </GlassView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  headerRow: {
    marginBottom: 12,
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  backText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Krub_400Regular",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 28,
  },
  heading: {
    fontSize: 24,
    color: "#ffffff",
    fontFamily: "Krub_700Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: "rgba(52, 211, 153, 0.7)",
    fontFamily: "Krub_400Regular",
    textAlign: "center",
    marginBottom: 24,
  },
  glassCard: {
    width: "100%",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 22,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Krub_400Regular",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    fontSize: 20,
    color: "#34d399",
    marginRight: 10,
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#ffffff",
    fontFamily: "Krub_400Regular",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  categoryChipActive: {
    backgroundColor: "rgba(52, 211, 153, 0.2)",
    borderColor: "#34d399",
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Krub_400Regular",
  },
  categoryNameActive: {
    color: "#34d399",
    fontFamily: "Krub_700Bold",
  },
  buttonOuter: {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  buttonText: {
    fontSize: 18,
    color: "#ffffff",
    fontFamily: "Krub_700Bold",
    letterSpacing: 0.5,
  },
});