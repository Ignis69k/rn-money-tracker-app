import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { GlassView } from "expo-glass-effect";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

function FloatingOrb({
  size,
  color,
  initialX,
  initialY,
  delay,
}: {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  delay: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -30]) },
      { translateX: interpolate(progress.value, [0, 1], [0, 15]) },
      { scale: interpolate(progress.value, [0, 0.5, 1], [1, 1.1, 1]) },
    ],
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.4, 0.7, 0.4]),
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: initialX,
          top: initialY,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function welcome() {
  const router = useRouter();
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(40);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) });
    slideUp.value = withTiming(0, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  const handlePress = () => {
    router.push("/login");
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#0f0c29", "#302b63", "#24243e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs for depth */}
      <FloatingOrb size={180} color="rgba(99, 102, 241, 0.25)" initialX={-40} initialY={height * 0.1} delay={0} />
      <FloatingOrb size={140} color="rgba(139, 92, 246, 0.2)" initialX={width * 0.6} initialY={height * 0.25} delay={600} />
      <FloatingOrb size={200} color="rgba(59, 130, 246, 0.15)" initialX={width * 0.2} initialY={height * 0.6} delay={1200} />
      <FloatingOrb size={100} color="rgba(168, 85, 247, 0.2)" initialX={width * 0.7} initialY={height * 0.7} delay={400} />

      {/* Main content */}
      <Animated.View style={[styles.contentWrapper, contentStyle]}>
        {/* Glass card */}
        <GlassView style={styles.glassCard} glassEffectStyle="regular" tintColor="rgba(255,255,255,0.08)">
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <Image
              source={require("@/assets/images/wclogo.png")}
              style={styles.logo}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>บันทึกรายรับรายจ่าย</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>รายรับ-รายจ่ายในแต่ละวัน</Text>

          {/* Decorative divider */}
          <View style={styles.divider}>
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.3)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dividerGradient}
            />
          </View>

          {/* Description */}
          <Text style={styles.description}>
            จัดการการเงินของคุณอย่างง่ายดาย{"\n"}ติดตามทุกรายการ ทุกวัน
          </Text>
        </GlassView>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.buttonOuter}
          activeOpacity={0.85}
          onPress={handlePress}
        >
          <LinearGradient
            colors={["#6366f1", "#8b5cf6", "#a855f7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>เริ่มใช้งาน</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footerText}>พัฒนโดย นายปฐมพงษ์ จันทร์สมบูรณ์</Text>
        <Text style={styles.footerText}>6852D10018</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  glassCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: "center",
    // Fallback for non-iOS platforms where GlassView renders as a regular View
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    overflow: "hidden",
  },
  logoContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(139, 92, 246, 0.25)",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    color: "#ffffff",
    fontFamily: "Krub_700Bold",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(196, 181, 253, 0.9)",
    fontFamily: "Krub_400Regular",
    textAlign: "center",
    marginBottom: 20,
  },
  divider: {
    width: "80%",
    height: 1,
    marginBottom: 20,
  },
  dividerGradient: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: "Krub_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  buttonOuter: {
    width: "100%",
    maxWidth: 360,
    marginTop: 28,
    borderRadius: 18,
    overflow: "hidden",
    // Subtle shadow
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonGradient: {
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  buttonText: {
    fontSize: 20,
    color: "#ffffff",
    fontFamily: "Krub_700Bold",
    letterSpacing: 1,
  },
  footerText: {
    marginTop: 24,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.35)",
    fontFamily: "Krub_400Regular",
    letterSpacing: 2,
  },
});