import { StyleSheet, View, Image, Dimensions } from "react-native";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { scheduleOnRN } from 'react-native-worklets';

const { width, height } = Dimensions.get("window");
function PulseRing({ delay, size }: { delay: number; size: number }) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.4, { duration: 1800, easing: Easing.out(Easing.ease) })
      )
    );
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(0.6, { duration: 600, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.in(Easing.ease) })
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: "rgba(139, 92, 246, 0.5)",
        },
        style,
      ]}
    />
  );
}

export default function SplashScreen() {
  const router = useRouter();

  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(-10);

  const glowScale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);

  const subtitleOpacity = useSharedValue(0);

  const dotsOpacity = useSharedValue(0);

  const screenOpacity = useSharedValue(1);

  const navigateToWelcome = () => {
    router.replace("/welcome");
  };

  useEffect(() => {
    logoScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.back(1.5)),
    });
    logoOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    logoRotate.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    glowScale.value = withDelay(
      300,
      withSequence(
        withTiming(1.3, { duration: 800, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
      )
    );
    glowOpacity.value = withDelay(
      300,
      withSequence(
        withTiming(0.8, { duration: 500, easing: Easing.out(Easing.ease) }),
        withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.ease) })
      )
    );

    titleOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) })
    );
    titleTranslateY.value = withDelay(
      600,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) })
    );

    subtitleOpacity.value = withDelay(
      900,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) })
    );

    dotsOpacity.value = withDelay(
      1100,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );

    screenOpacity.value = withDelay(
      2500,
      withTiming(0, { duration: 500, easing: Easing.in(Easing.ease) }, () => {
        scheduleOnRN(navigateToWelcome);
      })
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
    opacity: logoOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const dotsStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <LinearGradient
        colors={["#0f0c29", "#302b63", "#24243e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.particleContainer}>
        <View style={[styles.particle, { left: "15%", top: "20%" }]} />
        <View style={[styles.particle, { left: "75%", top: "15%" }]} />
        <View style={[styles.particle, { left: "60%", top: "70%" }]} />
        <View style={[styles.particle, { left: "25%", top: "80%" }]} />
        <View style={[styles.particle, { left: "85%", top: "45%" }]} />
        <View style={[styles.particleLg, { left: "10%", top: "55%" }]} />
        <View style={[styles.particleLg, { left: "70%", top: "30%" }]} />
      </View>

      <View style={styles.centerContent}>
        <PulseRing delay={200} size={160} />
        <PulseRing delay={500} size={200} />
        <PulseRing delay={800} size={240} />

        <Animated.View style={[styles.logoGlow, glowStyle]} />

        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <Image
            source={require("@/assets/images/wclogo.png")}
            style={styles.logo}
          />
        </Animated.View>
      </View>

      <View style={styles.textContainer}>
        <Animated.Text style={[styles.title, titleStyle]}>
          บันทึกรายรับรายจ่าย
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Money Tracker
        </Animated.Text>

        <Animated.View style={[styles.dotsContainer, dotsStyle]}>
          <LoadingDot delay={0} />
          <LoadingDot delay={200} />
          <LoadingDot delay={400} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 }),
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 }),
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 })
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  particleContainer: {
    ...StyleSheet.absoluteFill,
  },
  particle: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(139, 92, 246, 0.3)",
  },
  particleLg: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(99, 102, 241, 0.2)",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -60,
  },
  logoGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(139, 92, 246, 0.35)",
  },
  logoWrapper: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  textContainer: {
    alignItems: "center",
    paddingBottom: 80,
  },
  title: {
    fontSize: 26,
    color: "#ffffff",
    fontFamily: "Krub_700Bold",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(196, 181, 253, 0.6)",
    fontFamily: "Krub_400Regular",
    textAlign: "center",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 28,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(139, 92, 246, 0.8)",
  },
});