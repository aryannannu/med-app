import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../components/common/AppText';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Micro-animation refs
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.92)).current;
  const logoTranslateY = useRef(new Animated.Value(12)).current;

  const swooshScaleX = useRef(new Animated.Value(0)).current;
  const swooshOpacity = useRef(new Animated.Value(0)).current;

  const taglineFade = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(10)).current;

  const ambientGlowPulse = useRef(new Animated.Value(0.2)).current;
  const shimmerTranslateX = useRef(new Animated.Value(-180)).current;

  const screenFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Stage 1: Ambient Glow Breathing Pulse (Loop)
    Animated.loop(
      Animated.sequence([
        Animated.timing(ambientGlowPulse, {
          toValue: 0.5,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ambientGlowPulse, {
          toValue: 0.2,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Stage 2: Staggered Entrance Reveal
    // 1. Logo "Healit" wordmark reveals (0.15s - 0.65s)
    Animated.parallel([
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 150,
        easing: Easing.out(Easing.poly(3)),
        useNativeDriver: true,
      }),
      Animated.timing(logoScaleAnim, {
        toValue: 1,
        duration: 500,
        delay: 150,
        easing: Easing.out(Easing.poly(3)),
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 150,
        easing: Easing.out(Easing.poly(3)),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Swoosh Curve draws in smoothly (0.50s - 0.90s)
    Animated.parallel([
      Animated.timing(swooshScaleX, {
        toValue: 1,
        duration: 400,
        delay: 500,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(swooshOpacity, {
        toValue: 1,
        duration: 350,
        delay: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Metallic Light Shimmer sweeps across Healit logo (0.85s - 1.45s)
    Animated.timing(shimmerTranslateX, {
      toValue: 200,
      duration: 600,
      delay: 850,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // 4. Tagline "WE DELIVER CARE" floats up softly (0.75s - 1.15s)
    Animated.parallel([
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 400,
        delay: 750,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(taglineTranslateY, {
        toValue: 0,
        duration: 400,
        delay: 750,
        easing: Easing.out(Easing.poly(3)),
        useNativeDriver: true,
      }),
    ]).start();

    // Stage 3: Smooth Crossfade Exit (2.1s - 2.55s)
    const timer = setTimeout(() => {
      Animated.timing(screenFadeAnim, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2100);

    return () => clearTimeout(timer);
  }, [
    logoFadeAnim,
    logoScaleAnim,
    logoTranslateY,
    swooshScaleX,
    swooshOpacity,
    taglineFade,
    taglineTranslateY,
    ambientGlowPulse,
    shimmerTranslateX,
    screenFadeAnim,
    onFinish,
  ]);

  return (
    <Animated.View style={[styles.container, { opacity: screenFadeAnim }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Primary Brand Purple Canvas (#532ED4) */}
      <View style={styles.splashCanvas}>
        {/* Ambient Subtle Background Radial Brand Glow */}
        <Animated.View
          style={[
            styles.ambientGlowCircle,
            {
              opacity: ambientGlowPulse,
              transform: [
                {
                  scale: ambientGlowPulse.interpolate({
                    inputRange: [0.2, 0.5],
                    outputRange: [0.95, 1.15],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Centered Logo Composition Container */}
        <View style={styles.logoVectorContainer}>
          {/* Wordmark "Healit" with Entrance Animation & Light Shimmer Overlay */}
          <Animated.View
            style={[
              styles.wordmarkWrapper,
              {
                opacity: logoFadeAnim,
                transform: [
                  { scale: logoScaleAnim },
                  { translateY: logoTranslateY },
                ],
              },
            ]}
          >
            <View style={styles.wordmarkRow}>
              <AppText style={styles.healitMainText}>
                Healit
              </AppText>
            </View>

            {/* Metallic Sheen / Light Sweep Line */}
            <Animated.View
              style={[
                styles.shimmerOverlay,
                {
                  transform: [{ translateX: shimmerTranslateX }, { rotate: '25deg' }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          </Animated.View>

          {/* Underline Swoosh Curve with Smooth Draw-In Scale Anim */}
          <Animated.View
            style={[
              styles.swooshCurveRow,
              {
                opacity: swooshOpacity,
                transform: [{ scaleX: swooshScaleX }],
              },
            ]}
          >
            <View style={styles.swooshArcLine} />
          </Animated.View>

          {/* Tagline "WE DELIVER CARE" with Soft Upward Float */}
          <Animated.View
            style={{
              opacity: taglineFade,
              transform: [{ translateY: taglineTranslateY }],
            }}
          >
            <AppText style={styles.taglineVectorText}>
              WE DELIVER CARE
            </AppText>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    backgroundColor: '#532ED4',
  },
  splashCanvas: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#532ED4',
    paddingHorizontal: 20,
  },
  ambientGlowCircle: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(124, 77, 255, 0.38)',
  },
  logoVectorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  wordmarkWrapper: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healitMainText: {
    color: '#FFFFFF',
    fontSize: 56,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 66,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: -10,
    bottom: -10,
    width: 60,
  },
  shimmerGradient: {
    width: '100%',
    height: '100%',
  },
  swooshCurveRow: {
    width: 136,
    height: 16,
    alignSelf: 'flex-end',
    marginRight: 10,
    marginTop: -6,
  },
  swooshArcLine: {
    width: 136,
    height: 26,
    borderRadius: 50,
    borderBottomWidth: 4.5,
    borderBottomColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  taglineVectorText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 13,
    fontFamily: 'LexendDeca_600SemiBold',
    fontWeight: '600',
    letterSpacing: 4.5,
    marginTop: 16,
    textAlign: 'center',
  },
});
