import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Dimensions,
  Linking,
  KeyboardAvoidingView,
  Platform,
  TextStyle,
  AppState,
} from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";
import React from "react";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useFonts, PlayfairDisplay_600SemiBold, PlayfairDisplay_600SemiBold_Italic } from "@expo-google-fonts/playfair-display";
import * as SplashScreen from "expo-splash-screen";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import NetInfo from "@react-native-community/netinfo";


SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: {
        getItem: (key: string) => SecureStore.getItemAsync(key),
        setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
        removeItem: (key: string) => SecureStore.deleteItemAsync(key),
      },
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

const COLORS = {
  bg: "#F7F4EE",
  warm: "#F0E8D0",
  terracotta: "#3A7A9A",
  sage: "#7AB8C8",
  blush: "#E8D5A8",
  text: "#1A2E38",
  muted: "#6A9AAA",
  card: "#FFFFFF",
  border: "#C8DFE8",
  dark: "#1A2E38",
};

const FEAR_FOOD_UNLOCK_COUNT = 8;

const DAILY_QUOTES = [
  "Every meal you complete is evidence of your strength.",
  "Recovery is not linear. Showing up anyway is the whole point.",
  "You are allowed to take up space at the table.",
  "The wave always passes. You have ridden every single one.",
  "Your body is not the problem. It never was.",
  "One meal at a time. That is all anyone is ever doing.",
  "You are building something real, even when it doesn't feel like it.",
  "Anxiety is not a warning that something is wrong. It is proof you're doing something brave.",
  "The hardest part is sitting down. You've already done it before.",
  "You don't have to feel ready. You just have to begin.",
  "Every kind thought you write is a small act of revolution.",
  "Recovery asks a lot of you. You are giving it everything.",
  "You are more than what you eat. You always have been.",
  "The discomfort is not permanent. You are.",
];
const EMOTIONS = ["Anxiety", "Guilt", "Shame", "Fear", "Disgust", "Sadness"];

const affirmations = [
  "Your body is working hard to take care of you.",
  "Discomfort is temporary. You have survived every hard moment before this.",
  "Nourishing yourself is an act of courage.",
  "The anxiety will peak and then it will pass — it always does.",
  "You are not your thoughts. You are the one observing them.",
];

const breathSteps = [
  { label: "Inhale", duration: 4, color: COLORS.sage },
  { label: "Hold", duration: 2, color: COLORS.warm },
  { label: "Exhale", duration: 4, color: COLORS.blush },
];

const defaultMotivations = [
  "To feel free around food",
  "To have energy to live my life",
  "To be present for the people I love",
];

const FEAR_FOOD_CATEGORIES = [
  { label: "Bread & grains", emoji: "🍞" },
  { label: "Desserts & sweets", emoji: "🍰" },
  { label: "Dairy", emoji: "🧀" },
  { label: "Eating out", emoji: "🍽️" },
  { label: "Fast food", emoji: "🍔" },
  { label: "Foods with unknown ingredients", emoji: "❓" },
  { label: "Eating in front of others", emoji: "👥" },
  { label: "Eating past fullness", emoji: "🌿" },
  { label: "Snacks between meals", emoji: "🥨" },
  { label: "High fat foods", emoji: "🥑" },
  { label: "Carbohydrates", emoji: "🍝" },
  { label: "Eating unplanned", emoji: "⚡" },
];

const COPING_SKILLS = [
  {
    id: "grounding", title: "5-4-3-2-1 Grounding", subtitle: "Anchor yourself in the present moment",
    emoji: "🌿", duration: "3 min", color: COLORS.sage,
    steps: [
      { prompt: "Name 5 things you can SEE right now.", detail: "Look around slowly. Notice colors, shapes, light." },
      { prompt: "Name 4 things you can TOUCH.", detail: "Feel textures — the chair, your clothes, the table." },
      { prompt: "Name 3 things you can HEAR.", detail: "Listen carefully. Even small sounds count." },
      { prompt: "Name 2 things you can SMELL.", detail: "Take a slow breath. What does the air smell like?" },
      { prompt: "Name 1 thing you can TASTE.", detail: "Notice what's in your mouth right now." },
      { prompt: "You are here. You are safe.", detail: "Your body is in this moment. The anxiety is not the truth." },
    ],
  },
  {
    id: "urgesurfing", title: "Urge Surfing", subtitle: "Ride the wave without acting on it",
    emoji: "🌊", duration: "5 min", color: COLORS.blush,
    steps: [
      { prompt: "Notice the urge without judgment.", detail: "You don't have to act on it. Just notice it's there." },
      { prompt: "Where do you feel it in your body?", detail: "Is it in your chest, stomach, hands, throat? Get specific." },
      { prompt: "Rate its intensity from 1-10.", detail: "Give it a number. Watch the number — it will change." },
      { prompt: "The urge is peaking. Stay with it.", detail: "Urges peak between 20-30 minutes then always fall. You are surfing it." },
      { prompt: "Breathe slowly. The wave is cresting.", detail: "In for 4, hold for 4, out for 6. You are bigger than this urge." },
      { prompt: "Rate the urge again. Did it change?", detail: "It always does. This is your proof that urges pass." },
    ],
  },
  {
    id: "compassion", title: "Self Compassion Pause", subtitle: "Speak to yourself like someone you love",
    emoji: "💚", duration: "4 min", color: COLORS.warm,
    steps: [
      { prompt: "What are you feeling right now?", detail: "Name it without judgment. Just acknowledge it's there." },
      { prompt: "This is a moment of suffering.", detail: "Suffering is part of being human. You are not alone in this." },
      { prompt: "What would you say to a friend feeling this?", detail: "Think of someone you love. What would you say to them?" },
      { prompt: "Now say that to yourself.", detail: "Place your hand on your heart if it feels right. Speak kindly." },
      { prompt: "You deserve the same compassion you give others.", detail: "Your struggle is real. Your worth is not up for debate." },
      { prompt: "Take one kind breath.", detail: "Inhale: 'I am doing my best.' Exhale: 'That is enough.'" },
    ],
  },
  {
    id: "bodyscan", title: "Body Scan", subtitle: "Release tension you didn't know you were holding",
    emoji: "🫀", duration: "5 min", color: COLORS.terracotta,
    steps: [
      { prompt: "Start at the top of your head.", detail: "Notice any tightness, tingling, or tension. Just observe." },
      { prompt: "Move to your face and jaw.", detail: "Let your jaw drop slightly. Unclench your teeth." },
      { prompt: "Shoulders and neck.", detail: "Roll your shoulders back. This is where we hold so much." },
      { prompt: "Chest and stomach.", detail: "Take a breath into your belly. Notice what you feel here." },
      { prompt: "Hands and arms.", detail: "Open your hands wide, then let them soften." },
      { prompt: "Legs and feet.", detail: "Press your feet into the floor. Feel the ground holding you." },
      { prompt: "Your whole body, right now.", detail: "You are here. Your body is carrying you through this." },
    ],
  },
  {
    id: "defusion", title: "Thought Defusion", subtitle: "Create distance from eating disorder thoughts",
    emoji: "🧠", duration: "4 min", color: "#9B8EC4",
    steps: [
      { prompt: "What is the eating disorder telling you right now?", detail: "Write it out or say it in your head. Don't argue with it yet." },
      { prompt: "Now say: 'I notice I'm having the thought that...'", detail: "Add those words before the thought. Notice how it changes." },
      { prompt: "Picture the thought as a leaf on a stream.", detail: "Watch it float by. You don't have to pick it up." },
      { prompt: "Or picture it on a billboard you're driving past.", detail: "You see it. You pass it. It gets smaller behind you." },
      { prompt: "You are not your thoughts.", detail: "Thoughts are just words and images. They are not facts. They are not you." },
      { prompt: "What do you want to do next — not the ED?", detail: "What does the healthy part of you want right now?" },
    ],
  },
];

const { width } = Dimensions.get("window");

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
function Confetti() {
  const particles = useRef(
    Array.from({ length: 50 }, () => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(-20),
      opacity: new Animated.Value(1),
      rotate: new Animated.Value(0),
      color: [COLORS.terracotta, COLORS.blush, COLORS.sage, COLORS.warm, "#F7F4EE", "#E8D5A8"][Math.floor(Math.random() * 6)],
      size: Math.random() * 10 + 5,
      delay: Math.random() * 3000,
      duration: Math.random() * 2500 + 2000,
      isCircle: Math.random() > 0.4,
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      const animate = () => {
        p.y.setValue(-20);
        p.x.setValue(Math.random() * width);
        p.opacity.setValue(1);
        p.rotate.setValue(0);
        Animated.parallel([
          Animated.timing(p.y, { toValue: 900, duration: p.duration, useNativeDriver: true, delay: p.delay }),
          Animated.timing(p.opacity, { toValue: 0, duration: p.duration, useNativeDriver: true, delay: p.delay }),
          Animated.timing(p.rotate, { toValue: 720, duration: p.duration, useNativeDriver: true, delay: p.delay }),
        ]).start(() => animate());
      };
      animate();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: p.isCircle ? p.size / 2 : 2,
            backgroundColor: p.color,
            transform: [
              { translateX: p.x },
              { translateY: p.y },
              { rotate: p.rotate.interpolate({ inputRange: [0, 720], outputRange: ["0deg", "720deg"] }) },
            ],
            opacity: p.opacity,
          }}
        />
      ))}
    </View>
  );
}


// ─── ICON SYSTEM ─────────────────────────────────────────────────────────────
type IconProps = { size?: number; color?: string; filled?: boolean };

function IconHome({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <Path d="M10.707 2.293a1 1 0 011.586 0l8 8A1 1 0 0120 12h-1v8a1 1 0 01-1 1h-4v-5H10v5H6a1 1 0 01-1-1v-8H4a1 1 0 01-.707-1.707l8-8z" fill={color} />
      ) : (
        <>
          <Path d="M3 12L12 3l9 9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </Svg>
  );
}

function IconPen({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <Path d="M15.232 5.232l3.536 3.536L7 21H3v-4L15.232 5.232zm4.95-1.414a2 2 0 010 2.828l-1.415 1.414-3.535-3.535 1.414-1.414a2 2 0 012.828 0l.707.707z" fill={color} />
      ) : (
        <>
          <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </Svg>
  );
}

function IconWave({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12 C4 8 6 16 8 12 C10 8 12 16 14 12 C16 8 18 16 20 12 C21 10 22 11 22 12" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {filled && <Path d="M2 12 C4 8 6 16 8 12 C10 8 12 16 14 12 C16 8 18 16 20 12 L20 20 L2 20 Z" fill={color} opacity={0.25} />}
    </Svg>
  );
}

function IconChart({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <>
          <Path d="M3 3v18h18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <Path d="M7 16l4-4 4 4 4-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="7" cy="16" r="1.5" fill={color} />
          <Circle cx="11" cy="12" r="1.5" fill={color} />
          <Circle cx="15" cy="16" r="1.5" fill={color} />
          <Circle cx="19" cy="10" r="1.5" fill={color} />
        </>
      ) : (
        <>
          <Path d="M3 3v18h18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <Path d="M7 16l4-4 4 4 4-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </Svg>
  );
}

function IconHeart({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        fill={filled ? color : "none"} />
    </Svg>
  );
}

function IconBook({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <>
          <Path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z" fill={color} opacity={0.9} />
          <Path d="M4 19.5A2.5 2.5 0 016.5 22H20v-5H6.5A2.5 2.5 0 004 19.5z" fill={color} />
        </>
      ) : (
        <>
          <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </Svg>
  );
}

function IconBell({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={filled ? color : "none"} fillOpacity={filled ? 0.9 : 0} />
      <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconInfo({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" fill={filled ? color : "none"} fillOpacity={filled ? 0.15 : 0} />
      <Path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function IconStar({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        fill={filled ? color : "none"} />
    </Svg>
  );
}

function IconUtensils({ size = 22, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 2v7c0 1.1.9 2 2 2h1v11a1 1 0 002 0V11h1a2 2 0 002-2V2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 2v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M18 2a4 4 0 014 4v1a4 4 0 01-3 3.87V22a1 1 0 01-2 0V10.87A4 4 0 0114 7V6a4 4 0 014-4z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconFood({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8h1a4 4 0 010 8h-1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={filled ? color : "none"} fillOpacity={filled ? 0.15 : 0} />
      <Path d="M6 1v3M10 1v3M14 1v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function IconUsers({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" fill={filled ? color : "none"} fillOpacity={filled ? 0.15 : 0} />
      <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconSettings({ size = 22, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function IconMedic({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconCheckCircle({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" fill={filled ? color : "none"} fillOpacity={filled ? 0.15 : 0} />
      <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconCalendar({ size = 22, color = "#fff", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" stroke={color} strokeWidth="1.8" fill={filled ? color : "none"} fillOpacity={filled ? 0.12 : 0} />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function FearFoodIcon({ icon, size = 16, color = COLORS.text }: { icon: string; size?: number; color?: string }) {
  switch(icon) {
    case "grain": return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" stroke={color} strokeWidth="1.8" fill={color} fillOpacity={0.15} /><Path d="M12 6v6M9 9h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></Svg>;
    case "sweet": return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2a5 5 0 00-5 5c0 6 5 15 5 15s5-9 5-15a5 5 0 00-5-5z" stroke={color} strokeWidth="1.8" fill={color} fillOpacity={0.15} /><Circle cx="12" cy="7" r="2" fill={color} /></Svg>;
    case "dairy": return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M8 2h8l2 6v12a1 1 0 01-1 1H7a1 1 0 01-1-1V8l2-6z" stroke={color} strokeWidth="1.8" fill={color} fillOpacity={0.12} /><Path d="M6 8h12" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></Svg>;
    case "out": return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 11l9-9 9 9v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z" stroke={color} strokeWidth="1.8" fill={color} fillOpacity={0.12} /><Path d="M9 22V12h6v10" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></Svg>;
    case "fast": return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity={0.12} /></Svg>;
    case "unknown": return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" fill={color} fillOpacity={0.12} /><Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></Svg>;
    case "others": return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" /><Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" fill={color} fillOpacity={0.12} /><Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></Svg>;
    case "fullness": return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" fill={color} fillOpacity={0.12} /><Path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></Svg>;
    case "snacks": return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity={0.12} /><Path d="M6 1v3M10 1v3M14 1v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></Svg>;
    case "fat": return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 22s8-4 8-10a8 8 0 00-16 0c0 6 8 10 8 10z" stroke={color} strokeWidth="1.8" fill={color} fillOpacity={0.12} /><Path d="M12 8v4M10 10h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></Svg>;
    case "carbs": return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 6h18M3 12h18M3 18h18" stroke={color} strokeWidth="1.8" strokeLinecap="round" /><Path d="M8 3l-5 3 5 3M16 3l5 3-5 3M8 15l-5 3 5 3M16 15l5 3-5 3" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></Svg>;
    case "unplanned": return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity={0.12} /></Svg>;
    default: return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" fill={color} fillOpacity={0.12} /></Svg>;
  }
}

// ─── HORIZON CELEBRATION ──────────────────────────────────────────────────────

// ─── WAVE TIMER ───────────────────────────────────────────────────────────────
function CopingIcon({ type, size = 24, color = COLORS.text, filled = false }: { type: string; size?: number; color?: string; filled?: boolean }) {
  switch(type) {
    case "wave": return <IconWave size={size} color={color} filled={filled} />;
    case "chart": return <IconWave size={size} color={color} filled={filled} />;
    case "heart": return <IconHeart size={size} color={color} filled={filled} />;
    case "medic": return <IconMedic size={size} color={color} filled={filled} />;
    case "info": return <IconInfo size={size} color={color} filled={filled} />;
    default: return <IconWave size={size} color={color} filled={filled} />;
  }
}

function WaveTimer({ onComplete, startTime }: { onComplete: () => void; startTime: number }) {
  const totalTime = 20 * 60;
  const getTimeLeft = () => Math.max(0, totalTime - Math.floor((Date.now() - startTime) / 1000));

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const [phase, setPhase] = useState("rising");
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeLeft();
      setTimeLeft(remaining);
      const progress = 1 - remaining / totalTime;
      setPhase(progress < 0.4 ? "rising" : progress < 0.6 ? "peak" : "falling");
      if (remaining <= 0) { clearInterval(interval); onComplete(); }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    const progress = 1 - timeLeft / totalTime;
    Animated.timing(waveAnim, { toValue: progress, duration: 800, useNativeDriver: false }).start();
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / totalTime;
  const phaseColors: any = { rising: COLORS.blush, peak: COLORS.terracotta, falling: COLORS.sage };
  const phaseMessages: any = {
    rising: "Discomfort may be building. You don't have to make it stop — just stay.",
    peak: "This is often the hardest moment. You are doing it right now.",
    falling: "The intensity may be easing. Keep breathing. Keep sitting with it.",
  };

  return (
    <View style={{ alignItems: "center", padding: 24 }}>
      <Text style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Sitting with it</Text>
      <View style={{ width: width - 80, height: 140, backgroundColor: COLORS.border, borderRadius: 20, overflow: "hidden", marginBottom: 20 }}>
        <Animated.View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: waveAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["5%", "85%", "15%"] }),
          backgroundColor: phaseColors[phase], opacity: 0.8,
        }} />
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 32, fontWeight: "bold", color: "#fff" }}>{minutes}:{seconds.toString().padStart(2, "0")}</Text>
          <Text style={{ fontSize: 12, color: "#fff", opacity: 0.9 }}>minutes remaining</Text>
        </View>
      </View>
      <Text style={{ fontSize: 14, color: COLORS.text, textAlign: "center", lineHeight: 22, fontStyle: "italic", marginBottom: 16 }}>{phaseMessages[phase]}</Text>
      <View style={{ flexDirection: "row", gap: 4, marginBottom: 8 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={{ width: 12, height: 8, borderRadius: 4, backgroundColor: i / 20 < progress ? phaseColors[phase] : COLORS.border }} />
        ))}
      </View>
      <Text style={{ fontSize: 11, color: COLORS.muted }}>{Math.round(progress * 100)}% through the wave</Text>
    </View>
  );
}

// ─── EMOTION SLIDER ───────────────────────────────────────────────────────────
// ─── LEGAL CONTENT COMPONENTS ─────────────────────────────────────────────────
function LegalHeading({ text }: { text: string }) {
  return <Text style={{ fontSize: 13, fontWeight: "bold", color: COLORS.text, marginTop: 20, marginBottom: 6, textTransform: "uppercase" as "uppercase", letterSpacing: 0.5 }}>{text}</Text>;
}
function LegalBody({ text }: { text: string }) {
  return <Text style={{ fontSize: 13, color: COLORS.text, lineHeight: 21, marginBottom: 8 }}>{text}</Text>;
}

function DisclaimerContent() {
  return (
    <View>
      <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 22, color: COLORS.text, marginBottom: 4 }}>Medical Disclaimer</Text>
      <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 20 }}>Last updated: March 2026</Text>
      <LegalBody text="proof. is a wellness support tool designed to complement — not replace — professional eating disorder treatment. It is not a medical device, clinical service, crisis line, or therapy app." />
      <LegalHeading text="Not Medical Advice" />
      <LegalBody text="Nothing in proof. constitutes medical advice, diagnosis, or treatment. All content is for informational and supportive purposes only. Always seek the guidance of a qualified healthcare provider with any questions about your health or treatment." />
      <LegalHeading text="Not a Crisis Service" />
      <LegalBody text="proof. is not a crisis service. If you are in immediate danger or experiencing a mental health emergency, please call 911 or go to your nearest emergency room. For crisis support, call or text 988 (Suicide & Crisis Lifeline) or text HOME to 741741 (Crisis Text Line)." />
      <LegalHeading text="No Professional Relationship" />
      <LegalBody text="Use of proof. does not create a therapist-patient, dietitian-patient, or any other professional relationship between you and Celine Uhrich, proof., or any affiliated individuals." />
      <LegalHeading text="Individual Results" />
      <LegalBody text="Recovery is not linear. proof. may support your journey but cannot guarantee outcomes. Results vary by individual. Use of the app does not guarantee recovery or improvement in any eating disorder or mental health condition." />
      <LegalHeading text="Contact" />
      <LegalBody text="Questions? Email celine@proofrecoveryapp.com" />
      <Text style={{ fontSize: 10, color: COLORS.muted, marginTop: 16, lineHeight: 16 }}>proof.™ is a trademark of Proof Health Technologies LLC.</Text>
    </View>
  );
}

function PrivacyContent() {
  return (
    <View>
      <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 22, color: COLORS.text, marginBottom: 4 }}>Privacy Policy</Text>
      <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 20 }}>Last updated: March 2026</Text>
      <LegalBody text="proof. takes your privacy seriously. This policy explains what we collect, how we use it, and your rights." />
      <LegalHeading text="What We Collect" />
      <LegalBody text={"• Email address (for account creation)\n• Meal logs, thoughts, sensations, urges, and reappraisals you enter\n• Emotion check-in scores\n• Fear food entries and challenge attempts\n• App preferences (notification settings, favorite coping skills)"} />
      <LegalHeading text="What We Do NOT Collect" />
      <LegalBody text={"• We never collect calorie counts, weights, or body measurements\n• We never collect precise location data\n• We never collect health data from Apple Health\n• We never sell your data to advertisers or third parties"} />
      <LegalHeading text="How We Use Your Data" />
      <LegalBody text="Your data is used only to provide and improve the proof. experience. Meal logs and check-ins are stored in your personal account and are only accessible by you." />
      <LegalHeading text="Data Storage" />
      <LegalBody text="Data is stored securely using Supabase, encrypted at rest and in transit. proof. does not currently hold a HIPAA Business Associate Agreement — please do not use proof. as your primary medical record." />
      <LegalHeading text="Data Sharing" />
      <LegalBody text="We do not sell, rent, or share your personal data with third parties or advertisers. We may share anonymized, aggregated data for research in a way that cannot identify you." />
      <LegalHeading text="Your Rights" />
      <LegalBody text="You may request deletion of your account and all data at any time by emailing celine@proofrecoveryapp.com. We will process requests within 30 days." />
      <LegalHeading text="Children" />
      <LegalBody text="proof. is not intended for users under 13. Contact celine@proofrecoveryapp.com if you believe a child under 13 has created an account." />
      <LegalHeading text="Contact" />
      <LegalBody text="Questions? Email celine@proofrecoveryapp.com" />
      <Text style={{ fontSize: 10, color: COLORS.muted, marginTop: 16, lineHeight: 16 }}>proof.™ is a trademark of Proof Health Technologies LLC.</Text>
    </View>
  );
}

function TermsContent() {
  return (
    <View>
      <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 22, color: COLORS.text, marginBottom: 4 }}>Terms & Conditions</Text>
      <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 20 }}>Last updated: March 2026</Text>
      <LegalBody text="By using proof., you agree to these Terms & Conditions. Please read them carefully." />
      <LegalHeading text="About proof." />
      <LegalBody text="proof.™ is a wellness support application for eating disorder recovery, operated by Celine Uhrich (Proof Health Technologies LLC). proof. is not a medical service, therapy platform, or crisis line." />
      <LegalHeading text="Eligibility" />
      <LegalBody text="You must be at least 13 years old to use proof.. If you are under 18, please use proof. with the knowledge of a parent or guardian." />
      <LegalHeading text="Medical Disclaimer" />
      <LegalBody text="proof. is a wellness tool only. It does not provide medical advice, diagnosis, or treatment, and is not a substitute for professional eating disorder treatment or medical care." />
      <LegalHeading text="User Responsibilities" />
      <LegalBody text="You agree not to misuse the app, attempt to access other users' data, or use proof. in any way that could harm yourself or others." />
      <LegalHeading text="Your Content" />
      <LegalBody text="You own the content you create in proof.. By using the app, you grant proof. a limited license to store and display your content solely for the purpose of providing the service." />
      <LegalHeading text="Limitation of Liability" />
      <LegalBody text="To the fullest extent permitted by law, proof. and its founder shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app. proof. is provided 'as is' without warranties of any kind." />
      <LegalHeading text="Changes to Terms" />
      <LegalBody text="We may update these terms from time to time. Continued use of proof. after changes constitutes acceptance of the updated terms." />
      <LegalHeading text="Governing Law" />
      <LegalBody text="These terms are governed by the laws of the Commonwealth of Massachusetts, United States." />
      <LegalHeading text="Contact" />
      <LegalBody text="Questions? Email celine@proofrecoveryapp.com" />
      <Text style={{ fontSize: 10, color: COLORS.muted, marginTop: 16, lineHeight: 16 }}>proof.™ is a trademark of Proof Health Technologies LLC.</Text>
    </View>
  );
}

function DistressWaveChart({ checkins, compact = false }: { checkins: any[]; compact?: boolean }) {
  const [containerW, setContainerW] = React.useState(0);

  const allLabels = ["Right after", "20 min", "60 min"];
  const allTypes = ["initial", "20min", "60min"];

  // Compute scores only for check-in types that actually exist
  const allScores = allTypes.map(type => {
    const p = checkins.find((c: any) => c.checkin_type === type);
    if (!p) return null;
    const vals = [p.anxiety, p.guilt, p.shame, p.fear, p.disgust, p.sadness, p.physical_discomfort].filter((v: any) => v != null && v >= 0);
    if (!vals.length) return null;
    return Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 10) / 10;
  });

  // Only keep points where data exists — no empty columns
  const activePoints = allScores
    .map((score, i) => score !== null ? { score, label: allLabels[i], index: i } : null)
    .filter(Boolean) as { score: number; label: string; index: number }[];

  if (activePoints.length < 2) return null;

  const chartScreenW = containerW > 0 ? containerW : (width - 80);
  const H = compact ? 100 : 130;
  const PAD = { top: 20, bottom: 30, left: 30, right: 16 };
  const chartW = chartScreenW - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Dynamic score range — zoom into actual range with some padding
  const minScore = Math.max(0, Math.min(...activePoints.map(p => p.score)) - 1.5);
  const maxScore = Math.min(10, Math.max(...activePoints.map(p => p.score)) + 1.5);
  const scoreRange = maxScore - minScore || 1;

  const getX = (i: number) => PAD.left + (i / (activePoints.length - 1)) * chartW;
  const getY = (score: number) => PAD.top + chartH - ((score - minScore) / scoreRange) * chartH;

  const pts = activePoints.map((p, i) => ({ x: getX(i), y: getY(p.score), score: p.score, label: p.label }));

  // Smooth bezier path
  let pathD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cpx = (pts[i].x + pts[i + 1].x) / 2;
    pathD += ` C ${cpx} ${pts[i].y} ${cpx} ${pts[i + 1].y} ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  const areaD = pathD + ` L ${pts[pts.length - 1].x} ${PAD.top + chartH} L ${pts[0].x} ${PAD.top + chartH} Z`;

  // Determine trend for insight message
  const first = activePoints[0].score;
  const last = activePoints[activePoints.length - 1].score;
  const diff = last - first;
  const trend = diff < -0.5 ? "down" : diff > 0.5 ? "up" : "steady";

  // Line color reflects trend
  const lineColor = trend === "down" ? COLORS.sage : trend === "up" ? "#C47060" : COLORS.terracotta;
  const areaColor = trend === "down" ? "rgba(122,184,200,0.12)" : trend === "up" ? "rgba(196,112,96,0.1)" : "rgba(122,184,200,0.12)";

  // Insight message — clinically informed for all outcomes
  const insightMap: any = {
    down: {
      bg: "#F0F7F1", color: "#3D6B45",
      text: `Your distress came down from ${first} to ${last}. The wave passed — this is your proof.`,
    },
    up: {
      bg: "#FFF8F0", color: "#8B5A3C",
      text: `Your distress is still elevated at ${last}. This happens — distress doesn't always follow a neat arc. That you stayed with it anyway is what matters.`,
    },
    steady: {
      bg: COLORS.warm, color: COLORS.text,
      text: `Your distress held steady around ${last}. Staying present through that without acting on urges is real work.`,
    },
  };
  const insight = insightMap[trend];

  // Only show grid lines within visible range
  const gridSteps = [Math.ceil(minScore), Math.round((minScore + maxScore) / 2), Math.floor(maxScore)].filter((v, i, a) => a.indexOf(v) === i && v >= 0 && v <= 10);

  return (
    <View
      onLayout={e => setContainerW(e.nativeEvent.layout.width - 32)}
      style={{ backgroundColor: compact ? "transparent" : COLORS.card, borderRadius: compact ? 0 : 16, borderWidth: compact ? 0 : 1, borderColor: COLORS.border, padding: compact ? 0 : 16, marginTop: compact ? 4 : 12 }}>
      <Text style={{ fontSize: 12, color: COLORS.muted, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Distress wave</Text>
      <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12, lineHeight: 17 }}>Average distress across all emotions over time.</Text>
      {containerW > 0 && (
      <Svg width={chartScreenW} height={H}>
        {/* Grid lines */}
        {gridSteps.map(g => {
          const gy = getY(g);
          return (
            <React.Fragment key={g}>
              <Path d={`M ${PAD.left} ${gy} L ${PAD.left + chartW} ${gy}`} stroke={COLORS.border} strokeWidth={0.5} strokeDasharray="3,3" />
              <SvgText x={PAD.left - 4} y={gy + 4} fontSize={8} fill={COLORS.muted} textAnchor="end">{g}</SvgText>
            </React.Fragment>
          );
        })}
        {/* Area fill */}
        <Path d={areaD} fill={areaColor} />
        {/* Curve */}
        <Path d={pathD} stroke={lineColor} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Data points + score labels */}
        {pts.map((pt, i) => (
          <React.Fragment key={i}>
            <Circle cx={pt.x} cy={pt.y} r={6} fill={lineColor} />
            <Circle cx={pt.x} cy={pt.y} r={3.5} fill={COLORS.card} />
            <SvgText x={pt.x} y={pt.y - 11} fontSize={10} fill={COLORS.text} textAnchor="middle" fontWeight="bold">{pt.score}</SvgText>
            <SvgText x={pt.x} y={H - 4} fontSize={9} fill={COLORS.muted} textAnchor="middle">{pt.label}</SvgText>
          </React.Fragment>
        ))}
      </Svg>
      )}
      {!compact && (
      <View style={{ marginTop: 10, padding: 12, backgroundColor: insight.bg, borderRadius: 10 }}>
        <Text style={{ fontSize: 12, color: insight.color, lineHeight: 19, fontStyle: "italic" }}>{trend === "down" ? "💚 " : trend === "up" ? "🌊 " : "🌿 "}{insight.text}</Text>
      </View>
      )}
    </View>
  );
}

function EmotionSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ fontSize: 13, color: COLORS.text, fontWeight: "600" }}>{label}</Text>
        <Text style={{ fontSize: 13, color: value === 0 ? COLORS.muted : COLORS.terracotta, fontWeight: "bold" }}>{value}/10</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 3 }}>
        {/* 0 button */}
        <TouchableOpacity onPress={() => onChange(0)}
          style={{ width: 28, height: 32, borderRadius: 6, backgroundColor: value === 0 ? COLORS.sage : COLORS.border, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 9, color: value === 0 ? "#fff" : COLORS.muted, fontWeight: "bold" }}>0</Text>
        </TouchableOpacity>
        {Array.from({ length: 10 }).map((_, i) => (
          <TouchableOpacity key={i} onPress={() => onChange(i + 1)}
            style={{ flex: 1, height: 32, borderRadius: 6, backgroundColor: i + 1 <= value ? COLORS.terracotta : COLORS.border }} />
        ))}
      </View>
    </View>
  );
}

// ─── ANIMATED SPLASH ─────────────────────────────────────────────────────────
function AnimatedSplash({ fontsLoaded }: { fontsLoaded: boolean }) {
  const waveY = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(30)).current;
  const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
  const WAVE_H = SCREEN_HEIGHT * 0.45;

  useEffect(() => {
    // Logo fades in — delayed slightly to ensure fonts are loaded
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(logoY, {
        toValue: 0,
        duration: 900,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Wave starts fully below screen (translateY = WAVE_H) then rises to 0
    waveY.setValue(WAVE_H);
    Animated.timing(waveY, {
      toValue: 0,
      duration: 5500,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5EDDA", alignItems: "center", justifyContent: "center" }}>
      {/* Logo sits in upper portion */}
      <Animated.View style={{ opacity: logoOpacity, transform: [{ translateY: logoY }], alignItems: "center", position: "absolute", top: SCREEN_HEIGHT * 0.18 }}>
        <Text style={{ fontFamily: fontsLoaded ? "PlayfairDisplay_600SemiBold" : "serif", fontSize: 64, color: "#1A2E38", letterSpacing: -2, lineHeight: 72 }}>
          proof<Text style={{ fontFamily: fontsLoaded ? "PlayfairDisplay_600SemiBold" : "serif", color: "#3A7A9A" }}>.</Text>
        </Text>
        <Text style={{ fontFamily: fontsLoaded ? "PlayfairDisplay_600SemiBold_Italic" : "serif", fontSize: 13, color: "#6A9AAA", marginTop: 8, letterSpacing: 0.5 }}>
          recovery, one meal at a time.
        </Text>
      </Animated.View>

      {/* Wave rises from off-screen bottom */}
      <Animated.View style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: WAVE_H,
        transform: [{ translateY: waveY }],
      }}>
        <Svg width={SCREEN_WIDTH} height={WAVE_H} viewBox={`0 0 ${SCREEN_WIDTH} ${WAVE_H}`} preserveAspectRatio="none" style={{ position: "absolute", top: 0, left: 0 }}>
          {/* Layer 1 — lightest, highest crest */}
          <Path
            d={`M0,80 C${SCREEN_WIDTH*0.14},40 ${SCREEN_WIDTH*0.3},110 ${SCREEN_WIDTH*0.48},68 C${SCREEN_WIDTH*0.64},26 ${SCREEN_WIDTH*0.8},95 ${SCREEN_WIDTH},58 L${SCREEN_WIDTH},${WAVE_H} L0,${WAVE_H} Z`}
            fill="rgba(200,223,232,0.55)"
          />
          {/* Layer 2 */}
          <Path
            d={`M0,130 C${SCREEN_WIDTH*0.16},95 ${SCREEN_WIDTH*0.34},158 ${SCREEN_WIDTH*0.52},118 C${SCREEN_WIDTH*0.68},80 ${SCREEN_WIDTH*0.84},145 ${SCREEN_WIDTH},108 L${SCREEN_WIDTH},${WAVE_H} L0,${WAVE_H} Z`}
            fill="rgba(122,184,200,0.5)"
          />
          {/* Layer 3 */}
          <Path
            d={`M0,185 C${SCREEN_WIDTH*0.18},155 ${SCREEN_WIDTH*0.38},205 ${SCREEN_WIDTH*0.56},172 C${SCREEN_WIDTH*0.74},139 ${SCREEN_WIDTH*0.88},188 ${SCREEN_WIDTH},162 L${SCREEN_WIDTH},${WAVE_H} L0,${WAVE_H} Z`}
            fill="rgba(58,122,154,0.6)"
          />
          {/* Layer 4 — solid deep ocean, fills everything below */}
          <Path
            d={`M0,235 C${SCREEN_WIDTH*0.2},210 ${SCREEN_WIDTH*0.42},248 ${SCREEN_WIDTH*0.6},222 C${SCREEN_WIDTH*0.78},196 ${SCREEN_WIDTH*0.9},232 ${SCREEN_WIDTH},212 L${SCREEN_WIDTH},${WAVE_H} L0,${WAVE_H} Z`}
            fill="#1A2E38"
          />
          {/* Solid fill guarantees no gap */}
          <Path d={`M0,280 L${SCREEN_WIDTH},280 L${SCREEN_WIDTH},${WAVE_H} L0,${WAVE_H} Z`} fill="#1A2E38" />
        </Svg>
      </Animated.View>
    </View>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

// ─── SHELL COLLECTION ────────────────────────────────────────────────────────

// ─── MEAL REMINDER SLOTS COMPONENT ──────────────────────────────────────────
const MEAL_SLOT_DEFAULTS: Record<string, any> = {
  breakfastEnabled: false, breakfastHour: 8,  breakfastMinute: 0,
  lunchEnabled: false,     lunchHour: 12,     lunchMinute: 0,
  dinnerEnabled: false,    dinnerHour: 18,    dinnerMinute: 0,
  snack1Enabled: false,    snack1Hour: 10,    snack1Minute: 0,
  snack2Enabled: false,    snack2Hour: 15,    snack2Minute: 0,
};

const MEAL_SLOT_DEFS = [
  { key: "breakfast", label: "Breakfast",       enabledKey: "breakfastEnabled", hourKey: "breakfastHour", minuteKey: "breakfastMinute", color: "#E8A87C", bg: "rgba(232,168,124,0.12)" },
  { key: "lunch",     label: "Lunch",           enabledKey: "lunchEnabled",     hourKey: "lunchHour",     minuteKey: "lunchMinute",     color: "#7AB8C8", bg: "rgba(122,184,200,0.12)" },
  { key: "dinner",    label: "Dinner",          enabledKey: "dinnerEnabled",    hourKey: "dinnerHour",    minuteKey: "dinnerMinute",    color: "#3A7A9A", bg: "rgba(58,122,154,0.1)" },
  { key: "snack1",    label: "Morning snack",   enabledKey: "snack1Enabled",    hourKey: "snack1Hour",    minuteKey: "snack1Minute",    color: "#9B8EC4", bg: "rgba(155,142,196,0.1)" },
  { key: "snack2",    label: "Afternoon snack", enabledKey: "snack2Enabled",    hourKey: "snack2Hour",    minuteKey: "snack2Minute",    color: "#9B8EC4", bg: "rgba(155,142,196,0.1)" },
];

function MealReminderSlots({ notifSettings, saveMealReminderSettings }: { notifSettings: Record<string, any>; saveMealReminderSettings: (s: any) => Promise<void> }) {
  const formatTime = (hour: number, minute: number) => {
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, "0");
    return `${h}:${m} ${hour < 12 ? "AM" : "PM"}`;
  };

  return (
    <View style={{ gap: 10, marginBottom: 8 }}>
      {MEAL_SLOT_DEFS.map(({ key, label, enabledKey, hourKey, minuteKey, color, bg }) => {
        const enabled = (notifSettings[enabledKey] ?? MEAL_SLOT_DEFAULTS[enabledKey] ?? false) as boolean;
        const hour = (notifSettings[hourKey] ?? MEAL_SLOT_DEFAULTS[hourKey] ?? 0) as number;
        const minute = (notifSettings[minuteKey] ?? MEAL_SLOT_DEFAULTS[minuteKey] ?? 0) as number;
        return (
          <View key={key} style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#C8DFE8", borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: "#1A2E38", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: bg, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <IconUtensils size={17} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A2E38" }}>{label}</Text>
                {enabled && <Text style={{ fontSize: 11, color: "#6A9AAA", marginTop: 1 }}>Daily at {formatTime(hour, minute)}</Text>}
              </View>
              <TouchableOpacity
                onPress={() => saveMealReminderSettings({ ...notifSettings, [enabledKey]: !enabled })}
                style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: enabled ? color : "#C8DFE8", justifyContent: "center", paddingHorizontal: 3 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", alignSelf: enabled ? "flex-end" : "flex-start", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 }} />
              </TouchableOpacity>
            </View>
            {enabled && (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 14 }}>
                <TouchableOpacity
                  onPress={() => {
                    const cur = hour * 60 + minute;
                    const next = (cur - 30 + 24 * 60) % (24 * 60);
                    saveMealReminderSettings({ ...notifSettings, [hourKey]: Math.floor(next / 60), [minuteKey]: next % 60 });
                  }}
                  style={{ padding: 12 }}>
                  <Text style={{ fontSize: 24, color: "#6A9AAA" }}>‹</Text>
                </TouchableOpacity>
                <View style={{ backgroundColor: "#F7F4EE", borderRadius: 14, paddingHorizontal: 28, paddingVertical: 10, minWidth: 130, alignItems: "center", borderWidth: 1, borderColor: "#C8DFE8" }}>
                  <Text style={{ fontSize: 28, fontWeight: "bold", color: "#1A2E38" }}>{formatTime(hour, minute)}</Text>
                  <Text style={{ fontSize: 10, color: "#6A9AAA", marginTop: 2 }}>30 min steps</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const cur = hour * 60 + minute;
                    const next = (cur + 30 + 24 * 60) % (24 * 60);
                    saveMealReminderSettings({ ...notifSettings, [hourKey]: Math.floor(next / 60), [minuteKey]: next % 60 });
                  }}
                  style={{ padding: 12 }}>
                  <Text style={{ fontSize: 24, color: "#6A9AAA" }}>›</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_600SemiBold_Italic,
  });

  const [session, setSession] = useState<any>(null);
  const [authScreen, setAuthScreen] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
  const [screen, setScreen] = useState("home");
  const [logData, setLogData] = useState({ meal: "", thoughts: "", sensations: "", urges: "" });

  const [postMealStep, setPostMealStep] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [breathProgress, setBreathProgress] = useState(0);
  const [affirmIdx, setAffirmIdx] = useState(0);
  const [reappraisal, setReappraisal] = useState("");
  const [pastMeals, setPastMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [savingMotivations, setSavingMotivations] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showReachOut, setShowReachOut] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);
  const [aboutOpen, setAboutOpen] = useState<any>({ wave: false, approach: false, promise: false, clinicians: false, disclaimer: false, privacy: false, terms: false });
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [legalScreen, setLegalScreen] = useState<"terms" | "privacy" | "disclaimer" | null>(null);
  const [notifSettings, setNotifSettings] = useState({ checkin20: true, checkin60: true, weekly: true, dailyCheckin: true, mealReminders: false, breakfastEnabled: false, breakfastHour: 8, breakfastMinute: 0, lunchEnabled: false, lunchHour: 12, lunchMinute: 0, dinnerEnabled: false, dinnerHour: 18, dinnerMinute: 0, snack1Enabled: false, snack1Hour: 10, snack1Minute: 0, snack2Enabled: false, snack2Hour: 15, snack2Minute: 0 });
  const [introSlide, setIntroSlide] = useState(0);
  const [onboardingStep, setOnboardingStep] = useState<"name" | "whys" | "fearfoods" | "mealreminders">("name");
  const [preferredName, setPreferredName] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const welcomeAnim = useRef(new Animated.Value(0)).current;
  const [milestone, setMilestone] = useState<{ emoji: string; title: string; body: string } | null>(null);
  const milestoneCheckedRef = useRef(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const tabBarAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const [showMomentCheckin, setShowMomentCheckin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mealPhotoUri, setMealPhotoUri] = useState<string | null>(null);
  const [mealPhotoUploading, setMealPhotoUploading] = useState(false);
  const [momentStep, setMomentStep] = useState<"body" | "feeling" | "thought">("body");
  const [momentBody, setMomentBody] = useState(5);
  const [momentFeeling, setMomentFeeling] = useState("");
  const [momentThought, setMomentThought] = useState("");
  const [savingMoment, setSavingMoment] = useState(false);
  const [scheduledFearFoods, setScheduledFearFoods] = useState<any[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [favoriteCopingSkills, setFavoriteCopingSkills] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [clinicianMode, setClinicianMode] = useState(false);
  const [photosEnabled, setPhotosEnabled] = useState(false);
  const [showClinicianModal, setShowClinicianModal] = useState(false);
  const [clinicianCode, setClinicianCode] = useState("");
  const [clinicianCodeError, setClinicianCodeError] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [syncPending, setSyncPending] = useState(false);

  const [checkinResponse, setCheckinResponse] = useState("");
  const [checkinSelected, setCheckinSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  const [dailyQuoteIdx, setDailyQuoteIdx] = useState(0);
  const [schedulePickerDate, setSchedulePickerDate] = useState({ month: new Date().getMonth() + 1, day: new Date().getDate(), year: new Date().getFullYear() });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<any>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [currentMealId, setCurrentMealId] = useState<string | null>(null);
  const [checkinNotifAt, setCheckinNotifAt] = useState<Date | null>(null);
  const [checkinMealName, setCheckinMealName] = useState<string>("");
  const [showCheckin, setShowCheckin] = useState(false);
  const [showWaveChart, setShowWaveChart] = useState(false);
  const [checkinType, setCheckinType] = useState("initial");
  const [showWaveTimer, setShowWaveTimer] = useState(false);
  const [waveTimerStart, setWaveTimerStart] = useState<number>(Date.now());
  const [emotions, setEmotions] = useState<any>({ Anxiety: 0, Guilt: 0, Shame: 0, Fear: 0, Disgust: 0, Sadness: 0, Physical: 0 });

  // Fear food state
  const [fearFoods, setFearFoods] = useState<any[]>([]);
  const [fearFoodAttempts, setFearFoodAttempts] = useState<any[]>([]);
  const [fearFoodMode, setFearFoodMode] = useState<"choose" | "categories" | "manual">("choose");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [manualFearFood, setManualFearFood] = useState("");
  const [savingFearFoods, setSavingFearFoods] = useState(false);
  const [activeChallengeFood, setActiveChallengeFood] = useState<any>(null);
  const [challengeStep, setChallengeStep] = useState<"safety" | "coping_offer" | "wave" | "checkin_after" | "celebrate">("safety");
  const [challengeData, setChallengeData] = useState({ thoughts: "", sensations: "", urges: "", thoughtsAfter: "", sensationsAfter: "" });
  const [celebrationReflection, setCelebrationReflection] = useState("");

  // ── Social Eating ──
  const [socialStep, setSocialStep] = useState<"situation"|"bodycheckin"|"menu"|"menuquestions"|"affirmation"|"during"|"after"|"reframe"|"done">("situation");
  const [socialSituation, setSocialSituation] = useState("");
  const [socialBodyEnergy, setSocialBodyEnergy] = useState(5);
  const [socialBodyHunger, setSocialBodyHunger] = useState(5);
  const [socialBodyComfort, setSocialBodyComfort] = useState(5);
  const [socialWantsFeel, setSocialWantsFeel] = useState("");
  const [socialWorry, setSocialWorry] = useState("");
  const [socialRestaurant, setSocialRestaurant] = useState("");
  const [socialMenuLooked, setSocialMenuLooked] = useState(false);
  const [socialMenuLooks, setSocialMenuLooks] = useState("");
  const [socialMenuScary, setSocialMenuScary] = useState("");
  const [socialFlexible, setSocialFlexible] = useState<string | null>(null);
  const [socialOverallRating, setSocialOverallRating] = useState(5);
  const [socialHardestMoment, setSocialHardestMoment] = useState("");
  const [socialHiddenStrength, setSocialHiddenStrength] = useState("");
  const [socialReframePick, setSocialReframePick] = useState("");
  const [socialReframeResponse, setSocialReframeResponse] = useState("");
  const [socialCustomThought, setSocialCustomThought] = useState("");
  const [socialCustomReframe, setSocialCustomReframe] = useState("");

  // Coping skill state
  const [activeCopingSkill, setActiveCopingSkill] = useState<any>(null);
  const [copingStep, setCopingStep] = useState(0);
  const [copingNote, setCopingNote] = useState("");
  const [copingReturnTo, setCopingReturnTo] = useState<string | null>(null);

  const progressRef = useRef<any>(null);
  const fearFoodUnlocked = pastMeals.length >= FEAR_FOOD_UNLOCK_COUNT;

  useEffect(() => { if (fontsLoaded) SplashScreen.hideAsync(); }, [fontsLoaded]);

  useEffect(() => {
    registerForNotifications();
    supabase.auth.getSession().then(({ data: { session } }: any) => { setSession(session); setCheckingSession(false); });
    setTimeout(() => setSplashDone(true), 6500);
    // Handle cold-launch from notification tap (app was fully closed)
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response?.notification?.request?.content?.data) {
        const data = response.notification.request.content.data as any;
        // Store as closure — setters are stable refs in React, safe to capture
        pendingNotifAction.current = () => {
          if (data?.mealId) {
            setScreen("home"); setCurrentMealId(data.mealId);
            setCheckinType(data.checkinType || "20min"); setCheckinNotifAt(new Date());
            if (data.mealName) setCheckinMealName(data.mealName);
            setShowWaveTimer(false);
            setEmotions({ Anxiety: 0, Guilt: 0, Shame: 0, Fear: 0, Disgust: 0, Sadness: 0, Physical: 0 });
            setShowCheckin(true);
          } else if (data?.type === "fearfood_today") {
            setScreen("fearfoods");
          } else if (data?.type === "monthly_summary" || data?.type === "weekly" || data?.type === "monthly_reflection") {
            setWeekOffset(0); setScreen("weeklysummary");
          } else if (data?.type === "wave_complete") {
            AsyncStorage.removeItem("proof_wave_timer_start");
            setShowWaveTimer(false); setCheckinType("20min");
            if (data.mealId) setCurrentMealId(data.mealId);
            setCheckinNotifAt(new Date()); setScreen("home");
            setEmotions({ Anxiety: 0, Guilt: 0, Shame: 0, Fear: 0, Disgust: 0, Sadness: 0, Physical: 0 });
            setShowCheckin(true);
          } else if (data?.type === "moment_checkin") {
            setScreen("home"); setMomentStep("body"); setMomentBody(5);
            setMomentFeeling(""); setMomentThought(""); setShowMomentCheckin(true);
          } else if (data?.type?.startsWith("meal_reminder_")) {
            setScreen("log");
          } else if (data?.type === "exposure_checkin") {
            setScreen("home"); if (data.mealId) setCurrentMealId(data.mealId);
            setCheckinType(data.checkinType || "20min"); setCheckinNotifAt(new Date());
            setEmotions({ Anxiety: 0, Guilt: 0, Shame: 0, Fear: 0, Disgust: 0, Sadness: 0, Physical: 0 });
            setShowCheckin(true);
          } else if (data?.type === "milestone") {
            setScreen("home");
          }
        };
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: any, session: any) => setSession(session));

    // Network monitoring
    const unsubNet = NetInfo.addEventListener((state: any) => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
      if (online) syncOfflineQueue();
    });

    // Handle notification taps
    // Uses pendingNotifAction to survive the splash + session init sequence
    const handleNotifData = (data: any) => {
      if (data?.mealId) {
        setScreen("home");
        setCurrentMealId(data.mealId);
        setCheckinType(data.checkinType || "20min");
        setCheckinNotifAt(new Date());
        if (data.mealName) setCheckinMealName(data.mealName);
        setShowWaveTimer(false);
        setEmotions({ Anxiety: 0, Guilt: 0, Shame: 0, Fear: 0, Disgust: 0, Sadness: 0, Physical: 0 });
        setShowCheckin(true);
      } else if (data?.type === "fearfood_reminder") {
        setScreen("fearfoods"); // day-before reminder — go to challenge foods screen
      } else if (data?.type === "fearfood_today") {
        setScreen("fearfoods");
      } else if (data?.type === "monthly_summary" || data?.type === "weekly" || data?.type === "monthly_reflection") {
        setWeekOffset(0);
        setScreen("weeklysummary");
      } else if (data?.type === "wave_complete") {
        AsyncStorage.removeItem("proof_wave_timer_start");
        setShowWaveTimer(false);
        setCheckinType("20min");
        if (data.mealId) setCurrentMealId(data.mealId);
        setCheckinNotifAt(new Date());
        setScreen("home");
        setEmotions({ Anxiety: 0, Guilt: 0, Shame: 0, Fear: 0, Disgust: 0, Sadness: 0, Physical: 0 });
        setShowCheckin(true);
      } else if (data?.type === "moment_checkin") {
        setScreen("home");
        setMomentStep("body"); setMomentBody(5); setMomentFeeling(""); setMomentThought("");
        setShowMomentCheckin(true);
      } else if (data?.type?.startsWith("meal_reminder_")) {
        setScreen("log");
      } else if (data?.type === "exposure_checkin") {
        setScreen("home");
        if (data.mealId) setCurrentMealId(data.mealId);
        setCheckinType(data.checkinType || "20min");
        setCheckinNotifAt(new Date());
        setEmotions({ Anxiety: 0, Guilt: 0, Shame: 0, Fear: 0, Disgust: 0, Sadness: 0, Physical: 0 });
        setShowCheckin(true);
      } else if (data?.type === "milestone") {
        setScreen("home");
      }
    };

    const notifListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      // If app not fully ready yet, store action and replay after init
      if (!splashDone) {
        pendingNotifAction.current = () => handleNotifData(data);
      } else {
        handleNotifData(data);
      }
    });

    // Handle notification arriving while app is foregrounded
    const foregroundListener = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data as any;
      if (data?.mealId || data?.type === "meal_checkin") {
        setScreen("home"); // surface home first so modal renders above it
        setCurrentMealId(data.mealId);
        setCheckinType(data.checkinType || "20min");
        setCheckinNotifAt(new Date());
        if (data.mealName) setCheckinMealName(data.mealName);
        setShowWaveTimer(false);
        setEmotions({ Anxiety: 0, Guilt: 0, Shame: 0, Fear: 0, Disgust: 0, Sadness: 0, Physical: 0 });
        setShowCheckin(true);
      } else if (data?.type === "fearfood_reminder") {
        setScreen("fearfoods"); // day-before reminder — go to challenge foods screen
      } else if (data?.type === "fearfood_today") {
        setScreen("fearfoods");
      } else if (data?.type === "monthly_summary") {
        setWeekOffset(0);
        setScreen("weeklysummary");
      } else if (data?.type === "weekly") {
        setWeekOffset(0);
        setScreen("weeklysummary");
      } else if (data?.type === "wave_complete") {
        AsyncStorage.removeItem("proof_wave_timer_start");
        setShowWaveTimer(false);
        setCheckinType("20min");
        if (data.mealId) setCurrentMealId(data.mealId);
        setCheckinNotifAt(new Date());
        setScreen("home");
        setEmotions({ Anxiety: 0, Guilt: 0, Shame: 0, Fear: 0, Disgust: 0, Sadness: 0, Physical: 0 });
        setShowCheckin(true);
      } else if (data?.type === "moment_checkin") {
        setScreen("home");
        setMomentStep("body"); setMomentBody(5); setMomentFeeling(""); setMomentThought("");
        setShowMomentCheckin(true);
      } else if (data?.type?.startsWith("meal_reminder_")) {
        setScreen("log");
      } else if (data?.type === "milestone") {
        setScreen("home");
      }
    });

    // Session timeout — sign out if app backgrounded for more than 15 minutes
    const appStateSub = AppState.addEventListener("change", async (nextState) => {
      if (appStateRef.current === "active" && nextState === "background") {
        backgroundedAt.current = Date.now();
      } else if (nextState === "active" && backgroundedAt.current !== null) {
        const elapsed = Date.now() - backgroundedAt.current;
        if (elapsed > SESSION_TIMEOUT) {
          backgroundedAt.current = null;
          await supabase.auth.signOut();
        }
        backgroundedAt.current = null;
      }
      appStateRef.current = nextState;
    });

    return () => {
      subscription.unsubscribe();
      notifListener.remove();
      foregroundListener.remove();
      unsubNet();
      appStateSub.remove();
    };
  }, []);

  useEffect(() => { checkIntro(); }, []);
  useEffect(() => { if (session) { fetchMeals(); checkOnboarding(); } }, [session]);

  // After app fully initializes, fire any pending notification action
  useEffect(() => {
    if (splashDone && session && onboardingDone === true && pendingNotifAction.current) {
      const action = pendingNotifAction.current;
      pendingNotifAction.current = null;
      action();
    }
  }, [splashDone, session, onboardingDone]);

  const registerForNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;
    // Cancel any existing weekly notifications before scheduling to avoid duplicates
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of allScheduled) {
      if (n.content.data?.type === "weekly") {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
    // Only schedule if weekly notifications are enabled
    const stored = await AsyncStorage.getItem("proof_notif_settings");
    const settings = stored ? JSON.parse(stored) : { weekly: true };
    if (settings.weekly !== false) {
      await Notifications.scheduleNotificationAsync({
        content: { title: "Your weekly reflection is ready 💚", body: "See how far you've come this week.", data: { type: "weekly" } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour: 9, minute: 0 },
      });
    }
  };

  const saveNotifSettings = async (settings: any) => {
    setNotifSettings(settings);
    await AsyncStorage.setItem("proof_notif_settings", JSON.stringify(settings));
  };

  // Called only when weekly or dailyCheckin toggles change — separate from meal reminders
  const applyRecurringNotifSettings = async (settings: any) => {
    try {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      // Weekly reflection
      for (const n of allScheduled) {
        if (n.content.data?.type === "weekly") {
          await Notifications.cancelScheduledNotificationAsync(n.identifier);
        }
      }
      if (settings.weekly !== false) {
        await Notifications.scheduleNotificationAsync({
          content: { title: "Your weekly reflection is ready 💚", body: "See how far you've come this week.", data: { type: "weekly" } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour: 9, minute: 0 },
        });
      }
      // Daily moment check-in
      const allScheduled2 = await Notifications.getAllScheduledNotificationsAsync();
      for (const n of allScheduled2) {
        if (n.content.data?.type === "moment_checkin") {
          await Notifications.cancelScheduledNotificationAsync(n.identifier);
        }
      }
      if (settings.dailyCheckin !== false) {
        await Notifications.scheduleNotificationAsync({
          content: { title: "Check in with yourself 🫀", body: "How's your body feeling right now? A moment check-in takes 30 seconds.", data: { type: "moment_checkin" } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 12, minute: 0 },
        });
      }
    } catch (e) {
      // Notification scheduling errors are non-fatal — settings are still saved
    }
  };

  const scheduleMealReminderNotif = async (slot: "breakfast" | "lunch" | "dinner" | "snack1" | "snack2", hour: number, minute: number): Promise<void> => {
    const titles: Record<string, string> = {
      breakfast: "Time to log breakfast",
      lunch: "Log your lunch when you're ready",
      dinner: "Dinner time — proof. is here",
      snack1: "Snack time",
      snack2: "Afternoon snack",
    };
    const bodies: Record<string, string> = {
      breakfast: "Every meal you log is evidence. Even this one.",
      lunch: "A moment to check in. How are you feeling going into this meal?",
      dinner: "You showed up today. Log it and build your proof.",
      snack1: "Snacks count too. Log it and keep building your evidence.",
      snack2: "A gentle nudge. Snacks are part of recovery too.",
    };
    const all = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of all) {
      if (n.content.data?.type === ("meal_reminder_" + slot)) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
    await Notifications.scheduleNotificationAsync({
      content: { title: titles[slot], body: bodies[slot], data: { type: "meal_reminder_" + slot } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
  };

  const cancelMealReminderNotif = async (slot: "breakfast" | "lunch" | "dinner" | "snack1" | "snack2") => {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of all) {
      if (n.content.data?.type === ("meal_reminder_" + slot)) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  };

  const saveMealReminderSettings = async (settings: any) => {
    await saveNotifSettings(settings);
    try {
      const slots: Array<"breakfast" | "lunch" | "dinner" | "snack1" | "snack2"> = ["breakfast", "lunch", "dinner", "snack1", "snack2"];
      for (const slot of slots) {
        const enabled = (settings as any)[slot + "Enabled"] as boolean;
        const hour = (settings as any)[slot + "Hour"] as number;
        const minute = (settings as any)[slot + "Minute"] as number;
        if (settings.mealReminders && enabled) {
          await scheduleMealReminderNotif(slot, hour, minute);
        } else {
          await cancelMealReminderNotif(slot);
        }
      }
    } catch (e) {
      // Scheduling errors are non-fatal — settings are saved, notifications will apply on next launch
    }
  };

  const toggleFavoriteCoping = async (skillId: string) => {
    const updated = favoriteCopingSkills.includes(skillId)
      ? favoriteCopingSkills.filter(id => id !== skillId)
      : [...favoriteCopingSkills, skillId];
    setFavoriteCopingSkills(updated);
    await AsyncStorage.setItem("proof_fav_coping", JSON.stringify(updated));
  };

  const scheduleFearFoodNotifications = async (food: string, dateStr: string, foodId: string) => {
    // Parse as local time by splitting the string — avoids UTC midnight offset bug
    const [yr, mo, dy] = dateStr.split("-").map(Number);
    const date = new Date(yr, mo - 1, dy, 9, 0, 0, 0);      // 9am local, day-of
    const dayBefore = new Date(yr, mo - 1, dy - 1, 9, 0, 0, 0); // 9am local, day before
    const now = Date.now();

    // Cancel any previously scheduled notifications for this food to avoid duplicates
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of allScheduled) {
      if (n.content.data?.food === food && (n.content.data?.type === "fearfood_reminder" || n.content.data?.type === "fearfood_today")) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }

    if (dayBefore.getTime() > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Tomorrow is your day 💚",
          body: `You scheduled ${food} for tomorrow. You've got this.`,
          data: { type: "fearfood_reminder", food },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dayBefore },
      });
    }
    if (date.getTime() > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Today is the day 🌊",
          body: `You planned to try ${food} today. When you're ready, proof. is here.`,
          data: { type: "fearfood_today", food },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    }
    const updated = [...scheduledFearFoods.filter(s => s.foodId !== foodId), { foodId, food, date: dateStr }];
    setScheduledFearFoods(updated);
    await AsyncStorage.setItem("proof_scheduled_fearfoods", JSON.stringify(updated));
  };

  const scheduleExposureCheckinNotifications = async (mealId: string, foodName?: string) => {
    const label = foodName ? `"${foodName}"` : "your challenge food";
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Exposure check-in 💚",
        body: `It's been 20 minutes since you tried ${label} at ${timeStr}. How are you feeling?`,
        data: { mealId, checkinType: "20min", type: "exposure_checkin" },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 20 * 60 },
    });
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "One more check-in 🌿",
        body: `An hour since ${label} at ${timeStr}. The wave is passing — check in now.`,
        data: { mealId, checkinType: "60min", type: "exposure_checkin" },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 60 * 60 },
    });
  };

  const scheduleCheckinNotifications = async (mealId: string, mealName?: string, loggedAt?: Date) => {
    const timeStr = loggedAt ? loggedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "";
    const mealLabel = mealName ? `"${mealName}"` : "your meal";
    // Cancel any existing meal check-in notifications before scheduling new ones
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of allScheduled) {
      if (n.content.data?.mealId || n.content.data?.checkinType) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
    if (notifSettings.checkin20) {
      await Notifications.scheduleNotificationAsync({
        content: { title: "How are you feeling? 💚", body: `It's been 20 minutes since you logged ${mealLabel}${timeStr ? ` at ${timeStr}` : ""}. Check in when you're ready.`, data: { mealId, checkinType: "20min", mealName: mealName || "", type: "meal_checkin" } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 20 * 60 },
      });
    }
    if (notifSettings.checkin60) {
      await Notifications.scheduleNotificationAsync({
        content: { title: "One more check-in 🌿", body: `An hour since ${mealLabel}${timeStr ? ` at ${timeStr}` : ""}. How are you feeling now?`, data: { mealId, checkinType: "60min", mealName: mealName || "", type: "meal_checkin" } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 60 * 60 },
      });
    }
  };

  const checkIntro = async () => {
    const seen = await AsyncStorage.getItem("proof_intro_seen");
    setHasSeenIntro(seen === "true");
  };


  const completeIntro = async () => {
    await AsyncStorage.setItem("proof_intro_seen", "true");
    setHasSeenIntro(true);
  };

  const acceptDisclaimer = async () => {
    await SecureStore.setItemAsync("proof_disclaimer_accepted", "true");
    setDisclaimerAccepted(true);
  };

  const triggeredThisSession = useRef<Set<string>>(new Set());
  const appStateRef = useRef(AppState.currentState);
  const backgroundedAt = useRef<number | null>(null);
  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  // Stores notification action to replay after app finishes initializing
  const pendingNotifAction = useRef<(() => void) | null>(null);

  const triggerMilestone = async (key: string, emoji: string, title: string, body: string) => {
    if (triggeredThisSession.current.has(key)) return;
    const already = await AsyncStorage.getItem(`proof_milestone_${key}`);
    if (already) return;
    triggeredThisSession.current.add(key);
    await AsyncStorage.setItem(`proof_milestone_${key}`, "true");
    setMilestone({ emoji, title, body });
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { type: "milestone", key } },
      trigger: null,
    });
  };

  const checkMilestones = async (meals: any[], checkins: any[]) => {
    const realMeals = meals.filter(m => !m.meal?.startsWith("Moment check-in"));
    const socialMeals = meals.filter(m => m.meal?.startsWith("Social meal"));
    const exposures = meals.filter(m => m.meal?.startsWith("Exposure:"));
    const moments = meals.filter(m => m.meal?.startsWith("Moment check-in"));
    const routines = realMeals.filter(m => m.reappraisal);

    // First meal
    if (realMeals.length >= 1)
      await triggerMilestone("first_meal", "🌊", "Your first meal logged", "You started your evidence. That took courage — and it counts.");

    // Meal counts
    if (realMeals.length >= 10)
      await triggerMilestone("meals_10", "💚", "10 meals logged", "10 times you showed up. 10 pieces of evidence that you can do hard things.");
    if (realMeals.length >= 25)
      await triggerMilestone("meals_25", "🌿", "25 meals logged", "25 meals. Each one is proof your nervous system was wrong about danger.");
    if (realMeals.length >= 50)
      await triggerMilestone("meals_50", "🌊", "50 meals logged", "50 meals. This is what recovery looks like — one at a time, again and again.");

    // First routine
    if (routines.length >= 1)
      await triggerMilestone("first_routine", "🫀", "First post-meal routine completed", "You stayed with it all the way through. That's the whole point — and you did it.");

    // First social meal
    if (socialMeals.length >= 1)
      await triggerMilestone("first_social", "🫂", "First social meal logged", "Eating with others is one of the hardest parts. You showed up anyway.");

    // First fear food
    if (exposures.length >= 1)
      await triggerMilestone("first_exposure", "💛", "First challenge food completed", "You faced a fear food. That is ERP in action — and your nervous system noticed.");

    // First moment check-in
    if (moments.length >= 1)
      await triggerMilestone("first_moment", "🌸", "First moment check-in", "You paused and checked in with yourself. That kind of awareness is rare.");

    // First wave timer
    const waveUsed = await AsyncStorage.getItem("proof_wave_used");
    if (waveUsed)
      await triggerMilestone("first_wave", "🌊", "You rode the wave", "20 minutes. You sat with the discomfort instead of running from it. That's the work.");

    // 7 day streak — calculate from data directly since state may not be updated yet
    const today = new Date(); today.setHours(0,0,0,0);
    const mealDays = new Set(meals.map((m: any) => new Date(m.created_at).toDateString()));
    let currentStreak = 0; let d = new Date(today);
    while (mealDays.has(d.toDateString())) { currentStreak++; d.setDate(d.getDate() - 1); }
    if (currentStreak >= 7)
      await triggerMilestone("streak_7", "🔥", "7 days in a row", "A whole week of showing up. That's not nothing. That's everything.");

    // 30 days in proof.
    const firstMeal = realMeals.length > 0 ? new Date(realMeals[realMeals.length - 1].created_at) : null;
    if (firstMeal) {
      const daysSince = (Date.now() - firstMeal.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince >= 30)
        await triggerMilestone("days_30", "💙", "30 days with proof.", "One month. Recovery doesn't announce itself — but you've been doing it.");
      if (daysSince >= 90)
        await triggerMilestone("days_90", "🌟", "3 months with proof.", "Three months. The evidence you've built here is real. You are different than you were.");
    }
  };

  const checkMonthlyReflection = async (meals: any[], checkins: any[]) => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}-reflection`;
    const already = await AsyncStorage.getItem(`proof_monthly_reflection_${monthKey}`);
    if (already) return;

    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentMeals = meals.filter(m => new Date(m.created_at) >= monthAgo && !m.meal?.startsWith("Moment check-in"));
    if (recentMeals.length === 0) return; // don't send if never opened

    await AsyncStorage.setItem(`proof_monthly_reflection_${monthKey}`, "true");

    // Get emotion avg this month vs last month
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const thisMonthCheckins = checkins.filter(c => new Date(c.created_at) >= monthAgo);
    const lastMonthCheckins = checkins.filter(c => {
      const d = new Date(c.created_at);
      return d >= twoMonthsAgo && d < monthAgo;
    });
    const avg = (arr: any[]) => arr.length ? arr.reduce((s, c) => s + (c.anxiety + c.guilt + c.fear + c.shame) / 4, 0) / arr.length : null;
    const thisAvg = avg(thisMonthCheckins);
    const lastAvg = avg(lastMonthCheckins);

    let title = "Your month in review 💚";
    let body = "";

    if (recentMeals.length < 5) {
      body = `Life got in the way this month — that's okay. You still showed up ${recentMeals.length} time${recentMeals.length !== 1 ? "s" : ""}. You came back. That's what matters.`;
    } else if (thisAvg === null || lastAvg === null) {
      body = `You logged ${recentMeals.length} meals this month. Every single one is evidence. You're still here.`;
    } else if (thisAvg < lastAvg - 0.5) {
      body = `${recentMeals.length} meals this month — and your distress is lower than last month. The wave is falling. This is real progress.`;
    } else if (thisAvg > lastAvg + 0.5) {
      body = `This was a harder month. You still showed up ${recentMeals.length} times. That took courage. You're still here, and that's everything.`;
    } else {
      body = `You showed up ${recentMeals.length} times this month. Recovery isn't always visible movement — sometimes it's staying. That counts.`;
    }

    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { type: "monthly_reflection" } },
      trigger: null,
    });
  };

  const startWaveTimer = async (mealId?: string) => {
    const start = Date.now();
    setWaveTimerStart(start);
    setShowWaveTimer(true);
    await AsyncStorage.setItem("proof_wave_timer_start", String(start));
    await AsyncStorage.setItem("proof_wave_used", "true");
    // Schedule a "wave complete" notification at 20 minutes
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "The wave has fallen 🌊",
        body: "20 minutes. You rode it. That's your proof.",
        data: { type: "wave_complete", mealId: mealId || "" },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 20 * 60 },
    });
  };

  const stopWaveTimer = async () => {
    setShowWaveTimer(false);
    await AsyncStorage.removeItem("proof_wave_timer_start");
    // Cancel any pending wave complete notifications
    const all = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of all) {
      if (n.content.data?.type === "wave_complete") {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  };

  const checkOnboarding = async () => {
    const { data } = await supabase.from("motivations").select("*").eq("user_id", session?.user?.id).limit(1);
    if (data && data.length > 0) {
      setOnboardingDone(true); fetchMotivations(); fetchFearFoods(); fetchFearFoodAttempts();
      // No tour for returning users — only new users
      const storedNotifs = await AsyncStorage.getItem("proof_notif_settings");
      if (storedNotifs) {
        // Merge with defaults so new fields (snack slots etc.) always have values
        const defaultSettings = { checkin20: true, checkin60: true, weekly: true, dailyCheckin: true, mealReminders: false, breakfastEnabled: false, breakfastHour: 8, breakfastMinute: 0, lunchEnabled: false, lunchHour: 12, lunchMinute: 0, dinnerEnabled: false, dinnerHour: 18, dinnerMinute: 0, snack1Enabled: false, snack1Hour: 10, snack1Minute: 0, snack2Enabled: false, snack2Hour: 15, snack2Minute: 0 };
        setNotifSettings({ ...defaultSettings, ...JSON.parse(storedNotifs) });
      }
      const storedScheduled = await AsyncStorage.getItem("proof_scheduled_fearfoods");
      if (storedScheduled) setScheduledFearFoods(JSON.parse(storedScheduled));
      const storedFavs = await AsyncStorage.getItem("proof_fav_coping");
      if (storedFavs) setFavoriteCopingSkills(JSON.parse(storedFavs));
      const storedName = await SecureStore.getItemAsync("proof_preferred_name");
      if (storedName) setPreferredName(storedName);
      const storedDisclaimer = await SecureStore.getItemAsync("proof_disclaimer_accepted");
      if (storedDisclaimer === "true") setDisclaimerAccepted(true);
      const storedPhotos = await AsyncStorage.getItem("proof_photos_enabled");
      if (storedPhotos === "true") setPhotosEnabled(true);

      // Restore wave timer if it was running
      const storedWaveStart = await AsyncStorage.getItem("proof_wave_timer_start");
      if (storedWaveStart) {
        const start = parseInt(storedWaveStart);
        const elapsed = (Date.now() - start) / 1000;
        if (elapsed < 20 * 60) {
          setWaveTimerStart(start);
          setShowWaveTimer(true);
        } else {
          await AsyncStorage.removeItem("proof_wave_timer_start");
        }
      }

      // Schedule monthly summary notification if not already scheduled for this month
      const nowDate = new Date();
      const monthKey = `${nowDate.getFullYear()}-${nowDate.getMonth()}`;
      const lastMonthNotif = await AsyncStorage.getItem("proof_monthly_notif_scheduled");
      if (lastMonthNotif !== monthKey) {
        // Cancel any existing monthly notifications first
        const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const n of allScheduled) {
          if (n.content.data?.type === "monthly_summary") {
            await Notifications.cancelScheduledNotificationAsync(n.identifier);
          }
        }
        const lastDay = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0, 18, 0, 0);
        if (lastDay.getTime() > nowDate.getTime()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Your month in review 💚",
              body: "You showed up this month. See how far you've come — your 30-day trend is ready.",
              data: { type: "monthly_summary" },
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: lastDay },
          });
          await AsyncStorage.setItem("proof_monthly_notif_scheduled", monthKey);
        }
      }
      const lastOpen = await AsyncStorage.getItem("proof_last_open");
      const now = Date.now();
      const SIX_HOURS = 6 * 60 * 60 * 1000;
      if (!lastOpen || (now - parseInt(lastOpen)) > SIX_HOURS) {
        setShowWelcome(true);
        welcomeAnim.setValue(0);
        Animated.sequence([
          Animated.timing(welcomeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.delay(2200),
          Animated.timing(welcomeAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ]).start(() => setShowWelcome(false));
      }
      await AsyncStorage.setItem("proof_last_open", now.toString());
    }
    else { setOnboardingDone(false); setMotivations(defaultMotivations); setOnboardingStep("name"); }
  };

  const fetchMotivations = async () => {
    const { data } = await supabase.from("motivations").select("*").eq("user_id", session?.user?.id);
    if (data) setMotivations(data.map((m: any) => m.motivation));
  };

  const fetchFearFoods = async () => {
    const { data } = await supabase.from("fear_foods").select("*").eq("user_id", session?.user?.id).order("created_at", { ascending: true });
    if (data) setFearFoods(data);
  };

  const fetchFearFoodAttempts = async () => {
    const { data } = await supabase.from("fear_food_attempts").select("*").eq("user_id", session?.user?.id);
    if (data) setFearFoodAttempts(data);
  };

  const saveMotivations = async (goNext = false) => {
    setSavingMotivations(true);
    const toSave = motivations.filter(m => m.trim().length > 0);
    if (toSave.length === 0) { Alert.alert("Add at least one reason"); setSavingMotivations(false); return; }
    await supabase.from("motivations").delete().eq("user_id", session?.user?.id);
    await supabase.from("motivations").insert(toSave.map(m => ({ motivation: m, user_id: session?.user?.id })));
    setSavingMotivations(false);
    if (goNext) setOnboardingStep("fearfoods");
  };

  const saveFearFoodsOnboarding = async (foods: string[]) => {
    setSavingFearFoods(true);
    if (foods.length > 0) await supabase.from("fear_foods").insert(foods.map((f: string) => ({ food: f, user_id: session?.user?.id })));
    setSavingFearFoods(false);
    fetchFearFoods(); fetchFearFoodAttempts();
    setOnboardingStep("mealreminders");
  };

  const fetchMeals = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("meals").select("*").eq("user_id", session?.user?.id).order("created_at", { ascending: false }).limit(50);
    if (!error && data) {
      setPastMeals(data);
      // Calculate streak
      const today = new Date(); today.setHours(0,0,0,0);
      const mealDays = new Set(data.map((m: any) => new Date(m.created_at).toDateString()));
      let s = 0; let d = new Date(today);
      while (mealDays.has(d.toDateString())) { s++; d.setDate(d.getDate() - 1); }
      setStreak(s);
    }
    const { data: ci } = await supabase.from("checkins").select("*").eq("user_id", session?.user?.id).order("created_at", { ascending: false });
    if (ci) setCheckins(ci);
    setLoading(false);
    // Check milestones and monthly reflection — only once per app session
    if (data && ci && !milestoneCheckedRef.current) {
      milestoneCheckedRef.current = true;
      await checkMilestones(data, ci);
      await checkMonthlyReflection(data, ci);
    }
    // Set daily quote based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyQuoteIdx(dayOfYear % DAILY_QUOTES.length);
  };

  const syncOfflineQueue = async () => {
    const raw = await SecureStore.getItemAsync("proof_offline_queue");
    if (!raw) return;
    const queue: any[] = JSON.parse(raw);
    if (!queue.length) return;
    setSyncPending(true);
    const remaining: any[] = [];
    for (const item of queue) {
      try {
        if (item.type === "meal") {
          await supabase.from("meals").insert([item.data]);
        } else if (item.type === "checkin") {
          await supabase.from("checkins").insert([item.data]);
        }
      } catch {
        remaining.push(item);
      }
    }
    await SecureStore.setItemAsync("proof_offline_queue", JSON.stringify(remaining));
    setSyncPending(false);
    if (remaining.length === 0) fetchMeals();
  };

  const takeMealPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") { Alert.alert("Camera permission needed", "Please allow camera access in your settings."); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.6, allowsEditing: false });
    if (!result.canceled && result.assets[0]) setMealPhotoUri(result.assets[0].uri);
  };

  const uploadMealPhoto = async (mealId: string, uri: string, timing: "before" | "after") => {
    try {
      setMealPhotoUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const ext = uri.split(".").pop() || "jpg";
      const path = `meal-photos/${session?.user?.id}/${mealId}/${timing}.${ext}`;
      const { error } = await supabase.storage.from("meal-photos").upload(path, blob, { contentType: `image/${ext}` });
      // upload error handled silently
    } catch {
      // photo upload failed silently — non-critical
    } finally {
      setMealPhotoUploading(false);
    }
  };

  const saveMeal = async () => {
    // Require at least the meal name field
    if (!logData.meal.trim()) {
      Alert.alert("One thing first", "Please add at least what you ate before saving.");
      return null;
    }
    // Guard against double-save — if already saving, return early
    if (saving) return null;
    setSaving(true);
    const mealData = { meal: logData.meal, thoughts: logData.thoughts, sensations: logData.sensations, urges: logData.urges, reappraisal, user_id: session?.user?.id, created_at: new Date().toISOString() };
    if (!isOnline) {
      const localId = `local_${Date.now()}`;
      const localMeal = { ...mealData, id: localId };
      const raw = await SecureStore.getItemAsync("proof_offline_queue");
      const queue = raw ? JSON.parse(raw) : [];
      queue.push({ type: "meal", data: mealData, localId });
      await SecureStore.setItemAsync("proof_offline_queue", JSON.stringify(queue));
      setPastMeals((prev: any[]) => [localMeal, ...prev]);
      setCurrentMealId(localId);
      setSaving(false);
      return localId;
    }
    const { data, error } = await supabase.from("meals").insert([mealData]).select();
    if (error) { Alert.alert("Error", error.message); setSaving(false); return null; }
    if (data?.[0]) {
      setCurrentMealId(data[0].id);
      // Upload before-meal photo if taken
      if (mealPhotoUri) {
        await uploadMealPhoto(data[0].id, mealPhotoUri, "before");
        setMealPhotoUri(null);
      }
      await fetchMeals();
      setSaving(false);
      return data[0].id;
    }
    setSaving(false);
    return null;
  };

  const saveMomentCheckin = async () => {
    if (!session?.user?.id) return;
    setSavingMoment(true);
    try {
      // Save as a meal entry with a special prefix so it appears in the journal
      const mealName = `Moment check-in`;
      const thoughts = momentFeeling ? `Feeling: ${momentFeeling}` : "";
      const sensations = `Body tension: ${momentBody}/10`;
      const reappraisal = momentThought || null;
      const { data } = await supabase
        .from("meals")
        .insert([{ meal: mealName, thoughts, sensations, urges: "", reappraisal, user_id: session?.user?.id, created_at: new Date().toISOString() }])
        .select();
      if (data?.[0]) {
        // Save an initial check-in with body tension mapped to distress scores
        const score = momentBody;
        await supabase.from("checkins").insert([{
          user_id: session?.user?.id,
          meal_id: data[0].id,
          anxiety: score, guilt: 0, shame: 0, fear: 0, disgust: 0, sadness: 0, physical_discomfort: score,
          checkin_type: "initial",
          created_at: new Date().toISOString(),
        }]);
        await fetchMeals();
      }
      setShowMomentCheckin(false);
      setMomentStep("body");
      setMomentBody(5);
      setMomentFeeling("");
      setMomentThought("");
    } finally {
      setSavingMoment(false);
    }
  };

  const saveCheckin = async () => {
    if (!currentMealId) return;
    const checkinData = { user_id: session?.user?.id, meal_id: currentMealId, anxiety: emotions.Anxiety, guilt: emotions.Guilt, shame: emotions.Shame, fear: emotions.Fear, disgust: emotions.Disgust, sadness: emotions.Sadness, physical_discomfort: emotions.Physical, checkin_type: checkinType, created_at: new Date().toISOString() };
    if (!isOnline) {
      const raw = await SecureStore.getItemAsync("proof_offline_queue");
      const queue = raw ? JSON.parse(raw) : [];
      queue.push({ type: "checkin", data: checkinData });
      await SecureStore.setItemAsync("proof_offline_queue", JSON.stringify(queue));
    } else {
      await supabase.from("checkins").insert([checkinData]);
    }
    // After completing the 20min check-in, schedule the 60min follow-up
    // Cancel any existing 60min notif for this meal first (deduplicate)
    if (checkinType === "20min" && notifSettings.checkin60 && currentMealId) {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const n of allScheduled) {
        if (n.content.data?.mealId === currentMealId && n.content.data?.checkinType === "60min") {
          await Notifications.cancelScheduledNotificationAsync(n.identifier);
        }
      }
      const mealLabel = checkinMealName ? `"${checkinMealName}"` : "your meal";
      await Notifications.scheduleNotificationAsync({
        content: { title: "One more check-in 🌿", body: `An hour since ${mealLabel}. How are you feeling now?`, data: { mealId: currentMealId, checkinType: "60min", mealName: checkinMealName, type: "meal_checkin" } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 60 * 60 },
      });
    }
    setShowCheckin(false);
    setEmotions({ Anxiety: 0, Guilt: 0, Shame: 0, Fear: 0, Disgust: 0, Sadness: 0, Physical: 0 });
    if (checkinType === "60min") {
      await fetchMeals();
      setShowWaveChart(true);
    }
  };

  const saveChallengeAttempt = async () => {
    if (!activeChallengeFood) return;
    await supabase.from("fear_food_attempts").insert([{ user_id: session?.user?.id, fear_food_id: activeChallengeFood.id, created_at: new Date().toISOString() }]);

  };

  const saveSocialMeal = async () => {
    const mealName = socialRestaurant
      ? `Social meal at ${socialRestaurant}`
      : "Social meal";
    const thoughts = [socialWorry, socialMenuScary].filter(Boolean).join(" / ") || "Showed up for a social meal.";
    const sensations = "";
    const urges = "";
    const reappraisal = socialHiddenStrength || socialCustomReframe || "I showed up. That is enough.";
    const { data, error } = await supabase
      .from("meals")
      .insert([{ meal: mealName, thoughts, sensations, urges, reappraisal, user_id: session?.user?.id }])
      .select();
    if (data?.[0]) {
      setCurrentMealId(data[0].id);
      await fetchMeals();
      await scheduleCheckinNotifications(data[0].id, mealName, new Date());
    }
  };

  const handleReset = async () => {
    if (!username) { Alert.alert("Please enter your username"); return; }
    setAuthLoading(true);
    const fakeEmail = `${username.trim().toLowerCase()}@proofrecoveryapp.com`;
    const { error } = await supabase.auth.resetPasswordForEmail(fakeEmail);
    setAuthLoading(false);
    if (error) Alert.alert("Error", error.message);
    else setResetSent(true);
  };

  const handleLogin = async () => {
    if (!username || !password) { Alert.alert("Please enter your username and password"); return; }
    setAuthLoading(true);
    const fakeEmail = `${username.trim().toLowerCase()}@proofrecoveryapp.com`;
    const { error } = await supabase.auth.signInWithPassword({ email: fakeEmail, password });
    setAuthLoading(false);
    if (error) Alert.alert("Login Error", "Username or password incorrect.");
  };

  const handleSignUp = async () => {
    if (!username || !password) { Alert.alert("Please enter a username and password"); return; }
    if (username.trim().length < 3) { Alert.alert("Username too short", "Please choose a username with at least 3 characters."); return; }
    if (password.length < 6) { Alert.alert("Password too short", "Password must be at least 6 characters."); return; }
    setAuthLoading(true);
    const fakeEmail = `${username.trim().toLowerCase()}@proofrecoveryapp.com`;
    const { error } = await supabase.auth.signUp({ email: fakeEmail, password });
    setAuthLoading(false);
    if (error) {
      if (error.message.includes("already registered")) Alert.alert("Username taken", "That username is already in use. Please choose another.");
      else Alert.alert("Error", error.message);
    } else Alert.alert("Account created!", "You can now log in.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPastMeals([]); setMotivations([]); setFearFoods([]); setOnboardingDone(null); setScreen("home");
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) return;
    setDeletingAccount(true);
    try {
      const uid = session?.user?.id;
      await supabase.from("checkins").delete().eq("user_id", uid);
      await supabase.from("fear_food_attempts").delete().eq("user_id", uid);
      await supabase.from("fear_foods").delete().eq("user_id", uid);
      await supabase.from("meals").delete().eq("user_id", uid);
      await supabase.from("motivations").delete().eq("user_id", uid);
      // AsyncStorage — non-sensitive keys
      await AsyncStorage.removeItem("proof_intro_seen");
      await AsyncStorage.removeItem("proof_last_open");
      await AsyncStorage.removeItem("proof_notif_settings");
      await AsyncStorage.removeItem("proof_scheduled_fearfoods");
      await AsyncStorage.removeItem("proof_fav_coping");
      await AsyncStorage.removeItem("proof_wave_timer_start");
      await AsyncStorage.removeItem("proof_monthly_notif_scheduled");
      await AsyncStorage.removeItem("proof_photos_enabled");
      await AsyncStorage.removeItem("proof_wave_used");
      // Clear all milestone flags
      const allKeys = await AsyncStorage.getAllKeys();
      const milestoneKeys = allKeys.filter(k => k.startsWith("proof_milestone_") || k.startsWith("proof_monthly_reflection_"));
      if (milestoneKeys.length > 0) await AsyncStorage.multiRemove(milestoneKeys);
      // SecureStore — sensitive keys
      await SecureStore.deleteItemAsync("proof_preferred_name");
      await SecureStore.deleteItemAsync("proof_offline_queue");
      await SecureStore.deleteItemAsync("proof_disclaimer_accepted");
      await supabase.auth.signOut();
      setShowDeleteModal(false);
      setPastMeals([]); setMotivations([]); setFearFoods([]); setOnboardingDone(null); setScreen("home");
    } catch (e) {
      Alert.alert("Something went wrong", "Please try again or email celine@proofrecoveryapp.com to request deletion.");
    } finally {
      setDeletingAccount(false);
    }
  };

  useEffect(() => {
    if (screen !== "postmeal" || postMealStep !== 0) return;
    if (breathCount >= 3) { setTimeout(() => setPostMealStep(1), 800); return; }
    const step = breathSteps[breathPhase];
    let elapsed = 0;
    progressRef.current = setInterval(() => {
      elapsed += 50;
      setBreathProgress(elapsed / (step.duration * 1000));
      if (elapsed >= step.duration * 1000) {
        clearInterval(progressRef.current);
        const next = (breathPhase + 1) % breathSteps.length;
        setBreathPhase(next);
        if (next === 0) setBreathCount(c => c + 1);
        setBreathProgress(0);
      }
    }, 50);
    return () => clearInterval(progressRef.current);
  }, [screen, postMealStep, breathPhase, breathCount]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const currentBreathStep = breathSteps[breathPhase];
  const thisWeekMeals = pastMeals.filter(m => new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && !m.meal?.startsWith("Moment check-in"));
  const bestThought = thisWeekMeals.find(m => m.reappraisal)?.reappraisal;

  // ─── MODALS ───────────────────────────────────────────────────────────
  const checkinModal = (() => {
    const elapsedMins = checkinNotifAt ? Math.round((Date.now() - checkinNotifAt.getTime()) / 60000) : null;
    const elapsedLabel = elapsedMins === null ? null
      : elapsedMins < 2 ? null
      : elapsedMins < 60 ? `${elapsedMins} min ago`
      : `${Math.floor(elapsedMins / 60)} hr ${elapsedMins % 60 > 0 ? `${elapsedMins % 60} min` : ""} ago`.trim();
    const typeLabel = checkinType === "20min" ? "20-minute" : checkinType === "60min" ? "60-minute" : "post-meal";
    return (
      <Modal visible={showCheckin} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(44,24,16,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: COLORS.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90%" }}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={[s.h2, { textAlign: "center" }]}>How are you feeling?</Text>
              <View style={{ alignItems: "center", marginBottom: 16, gap: 4 }}>
                <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: "center" }}>
                  {typeLabel} check-in{checkinMealName ? ` · ${checkinMealName}` : ""}
                </Text>
                {elapsedLabel && (
                  <View style={s.tagWave}>
                    <Text style={s.tagWaveText}>checked in {elapsedLabel}</Text>
                  </View>
                )}
              </View>
              <Text style={[s.cardBody, { textAlign: "center", marginBottom: 4 }]}>Rate each emotion from 0 to 10.</Text>
              {EMOTIONS.map(e => <EmotionSlider key={e} label={e} value={emotions[e]} onChange={v => setEmotions((p: any) => ({ ...p, [e]: v }))} />)}
              <EmotionSlider label="Physical Discomfort" value={emotions.Physical} onChange={v => setEmotions((p: any) => ({ ...p, Physical: v }))} />
              <TouchableOpacity style={s.btn} onPress={saveCheckin}><Text style={s.btnText}>Save check-in →</Text></TouchableOpacity>
              <TouchableOpacity style={{ padding: 16, alignItems: "center" }} onPress={() => setShowCheckin(false)}><Text style={{ color: COLORS.muted }}>Skip for now</Text></TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  })();

  const waveChartModal = (() => {
    const mealCheckins = checkins.filter((c: any) => c.meal_id === currentMealId);
    return (
      <Modal visible={showWaveChart} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(26,46,56,0.7)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: COLORS.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "85%" }}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 22, color: COLORS.text, textAlign: "center", marginBottom: 8 }}>Your wave</Text>
              <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", marginBottom: 4, lineHeight: 20 }}>Distress rises and — for most people, most of the time — it falls. This chart is your evidence.</Text>
              <DistressWaveChart checkins={mealCheckins} />
              <View style={{ height: 20 }} />
              <TouchableOpacity style={s.btn} onPress={() => setShowWaveChart(false)}>
                <Text style={s.btnText}>Close 💚</Text>
              </TouchableOpacity>
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  })();

  const crisisModal = (
    <Modal visible={showCrisis} animationType="fade" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(20,38,48,0.97)", justifyContent: "center", padding: 24 }}>
        <ScrollView contentContainerStyle={{ paddingVertical: 40 }}>

          {/* ── TIER 1: Whys + past meal ── */}
          <Text style={{ fontSize: 28, fontFamily: "PlayfairDisplay_600SemiBold", color: "#F7F4EE", textAlign: "center", marginBottom: 8 }}>You can do this.</Text>
          <Text style={{ fontSize: 15, color: "#C8DFE8", textAlign: "center", fontStyle: "italic", marginBottom: 32, lineHeight: 24 }}>Take one breath. Just one more step.</Text>

          <Text style={{ fontSize: 11, color: "#7AB8C8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16, textAlign: "center" }}>Remember why you're here</Text>
          {motivations.map((m, i) => (
            <View key={i} style={{ backgroundColor: "rgba(122,184,200,0.12)", borderRadius: 14, padding: 16, marginBottom: 8 }}>
              <Text style={{ fontSize: 15, color: "#F7F4EE", lineHeight: 24, fontStyle: "italic" }}>💚 "{m}"</Text>
            </View>
          ))}
          {pastMeals.length > 0 && (
            <View style={{ marginTop: 0, marginBottom: 8 }}>
              <Text style={{ fontSize: 11, color: "#7AB8C8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12, textAlign: "center" }}>You survived this before</Text>
              <View style={{ backgroundColor: "rgba(122,184,200,0.12)", borderRadius: 14, padding: 16 }}>
                <Text style={{ fontSize: 13, color: "#C8DFE8", marginBottom: 6 }}>{pastMeals[0].meal}</Text>
                <Text style={{ fontSize: 14, color: "#F7F4EE", fontStyle: "italic", lineHeight: 22 }}>"{pastMeals[0].reappraisal || "I showed up for myself."}"</Text>
              </View>
            </View>
          )}

          <View style={{ height: 28 }} />

          {/* ── TIER 2: Still struggling → breathing ── */}
          <TouchableOpacity
            onPress={() => { setShowEmergency(!showEmergency); setShowReachOut(false); }}
            style={{ borderWidth: 1, borderColor: "rgba(122,184,200,0.25)", borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 12 }}
          >
            <Text style={{ color: "#C8DFE8", fontSize: 14, fontStyle: "italic" }}>
              {showEmergency ? "close ↑" : "still struggling? ↓"}
            </Text>
          </TouchableOpacity>

          {showEmergency && (
            <View style={{ backgroundColor: "rgba(122,184,200,0.07)", borderRadius: 16, padding: 20, marginBottom: 12 }}>
              <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 18, color: "#F7F4EE", textAlign: "center", marginBottom: 12 }}>Take 3 breaths with me.</Text>
              <Text style={{ fontSize: 14, color: "#C8DFE8", textAlign: "center", lineHeight: 24, marginBottom: 6 }}>
                🌬 <Text style={{ fontWeight: "bold" }}>Breathe in</Text> slowly for 4 counts.
              </Text>
              <Text style={{ fontSize: 14, color: "#C8DFE8", textAlign: "center", lineHeight: 24, marginBottom: 6 }}>
                🤍 <Text style={{ fontWeight: "bold" }}>Hold</Text> gently for 4 counts.
              </Text>
              <Text style={{ fontSize: 14, color: "#C8DFE8", textAlign: "center", lineHeight: 24, marginBottom: 20 }}>
                🌊 <Text style={{ fontWeight: "bold" }}>Breathe out</Text> slowly for 6 counts.
              </Text>
              <Text style={{ fontSize: 13, color: "#7AB8C8", textAlign: "center", fontStyle: "italic", lineHeight: 20, marginBottom: 20 }}>
                Repeat three times. You don't have to feel better. You just have to breathe.
              </Text>

              {/* ── TIER 3: Reach out for support ── */}
              <TouchableOpacity
                onPress={() => setShowReachOut(!showReachOut)}
                style={{ borderWidth: 1, borderColor: "rgba(122,184,200,0.3)", borderRadius: 12, padding: 13, alignItems: "center" }}
              >
                <Text style={{ color: "#C8DFE8", fontSize: 13, fontStyle: "italic" }}>
                  {showReachOut ? "close ↑" : "reach out for support ↓"}
                </Text>
              </TouchableOpacity>

              {showReachOut && (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ fontSize: 12, color: "#7AB8C8", textAlign: "center", lineHeight: 18, marginBottom: 16, fontStyle: "italic" }}>
                    You have tried everything. A real human is here for you right now.
                  </Text>

                  {/* ANAD */}
                  <TouchableOpacity
                    onPress={() => Linking.openURL("tel:8883757767")}
                    style={{ backgroundColor: "rgba(122,184,200,0.15)", borderRadius: 12, padding: 16, marginBottom: 10 }}
                  >
                    <Text style={{ fontSize: 10, color: "#7AB8C8", fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>ANAD Eating Disorder Helpline</Text>
                    <Text style={{ fontSize: 18, color: "#F7F4EE", fontWeight: "bold", marginBottom: 2 }}>888-375-7767</Text>
                    <Text style={{ fontSize: 11, color: "#C8DFE8", fontStyle: "italic" }}>Call · free & confidential</Text>
                  </TouchableOpacity>

                  {/* Crisis Text Line */}
                  <TouchableOpacity
                    onPress={() => Linking.openURL("sms:741741&body=HOME")}
                    style={{ backgroundColor: "rgba(122,184,200,0.15)", borderRadius: 12, padding: 16, marginBottom: 10 }}
                  >
                    <Text style={{ fontSize: 10, color: "#7AB8C8", fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Crisis Text Line</Text>
                    <Text style={{ fontSize: 18, color: "#F7F4EE", fontWeight: "bold", marginBottom: 2 }}>Text HOME to 741741</Text>
                    <Text style={{ fontSize: 11, color: "#C8DFE8", fontStyle: "italic" }}>Text · free & confidential</Text>
                  </TouchableOpacity>

                  {/* 988 */}
                  <TouchableOpacity
                    onPress={() => Linking.openURL("tel:988")}
                    style={{ backgroundColor: "rgba(122,184,200,0.15)", borderRadius: 12, padding: 16 }}
                  >
                    <Text style={{ fontSize: 10, color: "#7AB8C8", fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>988 Suicide & Crisis Lifeline</Text>
                    <Text style={{ fontSize: 18, color: "#F7F4EE", fontWeight: "bold", marginBottom: 2 }}>Call or text 988</Text>
                    <Text style={{ fontSize: 11, color: "#C8DFE8", fontStyle: "italic" }}>Available 24/7 · free & confidential</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 16 }} />
          <TouchableOpacity style={{ backgroundColor: COLORS.sage, padding: 16, borderRadius: 12, alignItems: "center" }} onPress={() => { setShowCrisis(false); setShowEmergency(false); setShowReachOut(false); }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>I kept going 💚</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 16, alignItems: "center", marginTop: 8 }} onPress={() => { setShowCrisis(false); setShowEmergency(false); setShowReachOut(false); }}>
            <Text style={{ color: "#C8DFE8", fontSize: 14 }}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  // ─── SPLASH ─────────────────────────────────────────────────────────
  if (!fontsLoaded || checkingSession || !splashDone) {
    return <AnimatedSplash fontsLoaded={fontsLoaded} />;
  }

  // ─── GLOBAL MODALS (render on every screen) ──────────────────────────
  // These must be declared here so they are always in the tree regardless
  // of which screen is active. Modals float above everything in RN.
  const milestoneModal = milestone ? (
    <Modal visible={true} animationType="fade" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(26,46,56,0.85)", justifyContent: "center", alignItems: "center", padding: 32 }}>
        <View style={{ backgroundColor: COLORS.bg, borderRadius: 28, padding: 32, alignItems: "center", width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>{milestone.emoji}</Text>
          <Text style={{ fontSize: 10, color: COLORS.terracotta, fontWeight: "bold", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Something worth noticing</Text>
          <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 22, color: COLORS.text, textAlign: "center", marginBottom: 14, lineHeight: 30 }}>{milestone.title}</Text>
          <Text style={{ fontSize: 15, color: COLORS.muted, textAlign: "center", lineHeight: 24, marginBottom: 28 }}>{milestone.body}</Text>
          {/* Subtle wave */}
          <Svg width="100%" height="24" viewBox="0 0 300 24" style={{ marginBottom: 24 }}>
            <Path d="M0,14 C50,4 100,22 150,12 C200,2 250,18 300,10" fill="none" stroke={COLORS.sage} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
          <TouchableOpacity style={s.btn} onPress={() => setMilestone(null)}>
            <Text style={s.btnText}>Keep going 💚</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ) : null;

  const globalModals = (
    <>
      {checkinModal}
      {waveChartModal}
      {milestoneModal}
    </>
  );

  // ─── INTRO SLIDES ────────────────────────────────────────────────────
  if (hasSeenIntro === false) {
    const SLIDES = [
      // ── Slide 1: Welcome ──────────────────────────────────────────────
      {
        id: "welcome",
        bg: COLORS.dark,
        textColor: "#F7F4EE",
        mutedColor: "rgba(200,223,232,0.6)",
        accent: COLORS.sage,
        pillBg: "rgba(122,184,200,0.15)",
        pillText: COLORS.sage,
        pill: "WELCOME",
        title: "proof.",
        titleItalic: false,
        body: "Every meal you\u2019ve ever completed is evidence that you can do it again.\n\nThis app helps you remember that.",
        features: null,
        emoji: null,
      },
      // ── Slide 2: What\u2019s inside (SVG icon list) ──────────────────────
      {
        id: "features",
        bg: COLORS.bg,
        textColor: COLORS.text,
        mutedColor: COLORS.muted,
        accent: COLORS.terracotta,
        pillBg: COLORS.warm,
        pillText: COLORS.terracotta,
        pill: "WHAT\u2019S INSIDE",
        title: "Everything\nyou need.",
        titleItalic: false,
        body: null,
        features: [
          {
            icon: (c: string) => <IconPen size={18} color={c} />,
            color: COLORS.terracotta,
            bg: "rgba(58,122,154,0.1)",
            title: "Log meals",
            body: "Log what you ate, how you felt, and start a post-meal routine.",
          },
          {
            icon: (c: string) => <IconWave size={18} color={c} />,
            color: COLORS.sage,
            bg: "rgba(122,184,200,0.12)",
            title: "Ride the wave",
            body: "Watch your distress rise and fall. Your own proof that it passes.",
          },
          {
            icon: (c: string) => <IconUsers size={18} color={c} />,
            color: "#E8A87C",
            bg: "rgba(232,168,124,0.12)",
            title: "Social eating",
            body: "Support before, during, and after meals with others.",
          },
          {
            icon: (c: string) => <IconHeart size={18} color={c} />,
            color: "#9B8EC4",
            bg: "rgba(155,142,196,0.12)",
            title: "Cope between sessions",
            body: "Grounding, urge surfing, self-compassion, and more.",
          },
          {
            icon: (c: string) => <IconBook size={18} color={c} />,
            color: COLORS.terracotta,
            bg: "rgba(58,122,154,0.1)",
            title: "Evidence journal",
            body: "Every meal you log builds proof that you can do hard things.",
          },
          {
            icon: (c: string) => <IconMedic size={18} color={c} />,
            color: COLORS.muted,
            bg: "rgba(106,154,170,0.1)",
            title: "Crisis support",
            body: "Your whys, past meals, and real helplines — when you need them most.",
          },
        ],
        emoji: null,
      },
      // ── Slide 3: Built for you ─────────────────────────────────────────
      {
        id: "built",
        bg: COLORS.dark,
        textColor: "#F7F4EE",
        mutedColor: "rgba(200,223,232,0.6)",
        accent: COLORS.sage,
        pillBg: "rgba(122,184,200,0.15)",
        pillText: COLORS.sage,
        pill: "OUR PROMISE",
        title: "Built with\nyou in mind.",
        titleItalic: true,
        body: null,
        emoji: null,
        features: [
          { icon: (c: string) => <IconHeart size={18} color={c} filled />, color: COLORS.sage, bg: "rgba(122,184,200,0.1)", title: "Free forever", body: "No subscriptions, no paywalls. Recovery shouldn\u2019t cost anything." },
          { icon: (c: string) => <IconInfo size={18} color={c} />,  color: COLORS.sage, bg: "rgba(122,184,200,0.1)", title: "No calorie tracking", body: "We never ask about numbers. Not once." },
          { icon: (c: string) => <IconCheckCircle size={18} color={c} />, color: COLORS.sage, bg: "rgba(122,184,200,0.1)", title: "Private by design", body: "No ads. Your data is never sold. Only you see your journal." },
          { icon: (c: string) => <IconWave size={18} color={c} />,  color: COLORS.sage, bg: "rgba(122,184,200,0.1)", title: "Built by someone in recovery", body: "Not a boardroom. Just support, one meal at a time." },
        ],
      },
    ];

        const slide = SLIDES[introSlide];
        const isLast = introSlide === SLIDES.length - 1;
        const isDark = slide.bg === COLORS.dark;

        return (
          <SafeAreaView style={[s.safe, { backgroundColor: slide.bg }]}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

              {/* Top row — pill + skip */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <View style={{ backgroundColor: slide.pillBg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Text style={{ fontSize: 10, color: slide.pillText, fontWeight: "bold", letterSpacing: 1.5 }}>{slide.pill}</Text>
                </View>
                <TouchableOpacity onPress={completeIntro} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 13, color: slide.mutedColor }}>skip</Text>
                </TouchableOpacity>
              </View>

              {/* Title */}
              {slide.id === "welcome" ? (
                <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 68, color: "#F7F4EE", lineHeight: 72, letterSpacing: -3, marginBottom: 20 }}>
                  proof<Text style={{ color: COLORS.sage }}>.</Text>
                </Text>
              ) : (
                <Text style={{ fontFamily: slide.titleItalic ? "PlayfairDisplay_600SemiBold_Italic" : "PlayfairDisplay_600SemiBold", fontSize: 42, color: slide.textColor, lineHeight: 50, letterSpacing: -1, marginBottom: 20 }}>
                  {slide.title}
                </Text>
              )}

              {/* Body text */}
              {slide.body && (
                <Text style={{ fontSize: 16, color: slide.mutedColor, lineHeight: 27, marginBottom: 28 }}>
                  {slide.body}
                </Text>
              )}

              {/* SVG feature list */}
              {slide.features && (
                <View style={{ gap: 10, marginBottom: 12 }}>
                  {(slide.features as any[]).map((feature: any, i: number) => (
                    <View key={i} style={{
                      flexDirection: "row", alignItems: "center", gap: 14,
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : COLORS.card,
                      borderWidth: 1,
                      borderColor: isDark ? "rgba(122,184,200,0.12)" : COLORS.border,
                      borderRadius: 16, padding: 14,
                    }}>
                      <View style={{
                        width: 38, height: 38, borderRadius: 11,
                        backgroundColor: isDark ? "rgba(122,184,200,0.1)" : feature.bg,
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {feature.icon(isDark ? COLORS.sage : feature.color)}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: slide.textColor, marginBottom: 2 }}>{feature.title}</Text>
                        <Text style={{ fontSize: 12, color: slide.mutedColor, lineHeight: 18 }}>{feature.body}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Dots + CTA */}
              <View style={{ marginTop: 24 }}>
                <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 18 }}>
                  {SLIDES.map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => setIntroSlide(i)}>
                      <View style={{ width: i === introSlide ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: i === introSlide ? slide.accent : (isDark ? "rgba(255,255,255,0.18)" : COLORS.border) }} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: slide.accent, padding: 17, borderRadius: 14, alignItems: "center" }}
                  onPress={isLast ? completeIntro : () => setIntroSlide(introSlide + 1)}
                >
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "bold" }}>{isLast ? "Get started →" : "Next →"}</Text>
                </TouchableOpacity>
                {isLast && (
                  <TouchableOpacity style={{ padding: 14, alignItems: "center" }} onPress={() => { completeIntro(); setTimeout(() => setScreen("about"), 100); }}>
                    <Text style={{ fontSize: 12, color: slide.mutedColor, fontStyle: "italic" }}>Read about our clinical approach →</Text>
                  </TouchableOpacity>
                )}
              </View>

            </ScrollView>
          </SafeAreaView>
        );
      }
  if (!session) return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: "center", marginVertical: 40 }}>
          <Text style={[s.logo, { fontSize: 36 }]}>proof.</Text>
          <Text style={s.tagline}>recovery, one meal at a time.</Text>
        </View>

        {showReset ? (
          <View style={s.card}>
            {resetSent ? (
              <View style={{ alignItems: "center", paddingVertical: 16 }}>
                <Text style={{ fontSize: 32, marginBottom: 16 }}>💌</Text>
                <Text style={[s.h2, { textAlign: "center", marginBottom: 8 }]}>Check your inbox</Text>
                <Text style={[s.cardBody, { textAlign: "center", marginBottom: 24 }]}>If that username exists, we sent a password reset link.</Text>
                <TouchableOpacity onPress={() => { setShowReset(false); setResetSent(false); setResetEmail(""); }}>
                  <Text style={{ color: COLORS.terracotta, fontSize: 14, fontWeight: "bold" }}>Back to log in</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={[s.h2, { marginBottom: 8 }]}>Reset your password</Text>
                <Text style={[s.cardBody, { marginBottom: 20 }]}>Enter your username and we'll send a reset link to the email associated with your account.</Text>
                <Text style={s.label}>Username</Text>
                <TextInput style={[s.input, { marginBottom: 20 }]} placeholder="your username" placeholderTextColor={COLORS.muted} value={resetEmail} onChangeText={setResetEmail} autoCapitalize="none" autoCorrect={false}  maxLength={200} />
                <TouchableOpacity style={s.btn} onPress={handleReset}>
                  {authLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send reset link →</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 14, alignItems: "center" }} onPress={() => { setShowReset(false); setResetEmail(""); }}>
                  <Text style={{ color: COLORS.muted, fontSize: 13 }}>Back to log in</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <View style={s.card}>
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              {["login", "signup"].map(tab => (
                <TouchableOpacity key={tab} style={{ flex: 1, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: authScreen === tab ? COLORS.terracotta : COLORS.border }} onPress={() => setAuthScreen(tab)}>
                  <Text style={{ textAlign: "center", fontWeight: "bold", color: authScreen === tab ? COLORS.terracotta : COLORS.muted }}>{tab === "login" ? "Log In" : "Sign Up"}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.label}>Username</Text>
            <TextInput style={[s.input, { marginBottom: 12 }]} placeholder="choose a username" placeholderTextColor={COLORS.muted} value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} keyboardType="default"  maxLength={200} />
            <Text style={s.label}>Password</Text>
            <TextInput style={[s.input, { marginBottom: 8 }]} placeholder="••••••••" placeholderTextColor={COLORS.muted} value={password} onChangeText={setPassword} secureTextEntry  maxLength={200} />
            {authScreen === "login" && (
              <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 16 }} onPress={() => { setShowReset(true); setResetEmail(username); }}>
                <Text style={{ fontSize: 12, color: COLORS.muted }}>Forgot password?</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.btn} onPress={authScreen === "login" ? handleLogin : handleSignUp}>
              {authLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{authScreen === "login" ? "Log In →" : "Create Account →"}</Text>}
            </TouchableOpacity>
          </View>
        )}

        <Text style={{ fontSize: 12, color: COLORS.muted, textAlign: "center", lineHeight: 18 }}>No email needed. Your journal is private — only you can see your entries.</Text>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // ─── MEDICAL DISCLAIMER (shown once, before onboarding) ─────────────
  if (onboardingDone === false && !disclaimerAccepted) return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={[s.container, { paddingTop: 48 }]}>
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 36, color: COLORS.text, letterSpacing: -1 }}>
            proof<Text style={{ color: COLORS.terracotta }}>.</Text>
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 6, fontStyle: "italic" }}>before we begin</Text>
        </View>

        <View style={{ backgroundColor: COLORS.dark, borderRadius: 20, padding: 24, marginBottom: 20 }}>
          <Text style={{ fontSize: 11, color: COLORS.sage, fontWeight: "bold", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Medical Disclaimer</Text>
          <Text style={{ fontSize: 14, color: "#F7F4EE", lineHeight: 22, marginBottom: 12 }}>
            proof. is a wellness support tool — not a medical device, clinical service, or substitute for professional treatment.
          </Text>
          <Text style={{ fontSize: 14, color: "rgba(200,223,232,0.85)", lineHeight: 22, marginBottom: 12 }}>
            proof. is not intended to diagnose, treat, cure, or prevent any eating disorder or mental health condition. It does not provide medical advice, therapy, or counseling.
          </Text>
          <Text style={{ fontSize: 14, color: "rgba(200,223,232,0.85)", lineHeight: 22 }}>
            If you are experiencing a medical emergency, please call 911. For mental health crisis support, call or text 988.
          </Text>
        </View>

        <View style={[s.card, { marginBottom: 16 }]}>
          <Text style={{ fontSize: 13, fontWeight: "bold", color: COLORS.text, marginBottom: 8 }}>proof. does not replace:</Text>
          {["A therapist, dietitian, or medical provider", "An eating disorder treatment program", "Crisis or emergency services", "Any prescribed treatment plan"].map((item, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
              <Text style={{ color: COLORS.muted, fontSize: 14 }}>—</Text>
              <Text style={{ fontSize: 13, color: COLORS.text, flex: 1, lineHeight: 20 }}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={[s.card, { marginBottom: 24 }]}>
          <Text style={{ fontSize: 13, color: COLORS.muted, lineHeight: 20 }}>
            By continuing, you acknowledge that you have read and understood this disclaimer, and agree to our{" "}
            <Text style={{ color: COLORS.terracotta, textDecorationLine: "underline" }} onPress={() => setLegalScreen("terms")}>Terms & Conditions</Text>
            {" "}and{" "}
            <Text style={{ color: COLORS.terracotta, textDecorationLine: "underline" }} onPress={() => setLegalScreen("privacy")}>Privacy Policy</Text>.
          </Text>
        </View>

        <TouchableOpacity style={s.btn} onPress={acceptDisclaimer}>
          <Text style={s.btnText}>I understand — let's begin 💚</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Legal document modal */}
      <Modal visible={legalScreen !== null} animationType="slide">
        <SafeAreaView style={s.safe}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => setLegalScreen(null)}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
            <Text style={s.logo}>{legalScreen === "terms" ? "Terms" : legalScreen === "privacy" ? "Privacy" : "Disclaimer"}</Text>
            <View style={{ width: 50 }} />
          </View>
          <ScrollView contentContainerStyle={s.container}>
            {legalScreen === "terms" && <TermsContent />}
            {legalScreen === "privacy" && <PrivacyContent />}
            {legalScreen === "disclaimer" && <DisclaimerContent />}
            <View style={{ height: 60 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );

  // ─── ONBOARDING: WHYS ────────────────────────────────────────────────
  if (onboardingDone === false && onboardingStep === "name") return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: "center", marginVertical: 48 }}>
          <Text style={[s.logo, { fontSize: 32 }]}>proof.</Text>
          <View style={{ height: 32 }} />
          <Text style={[s.h2, { textAlign: "center", marginBottom: 8 }]}>What would you like us to call you?</Text>
          <Text style={[s.cardBody, { textAlign: "center", marginBottom: 32 }]}>We'll use this to welcome you back each time.</Text>
          <TextInput
            style={[s.input, { width: "100%", fontSize: 22, textAlign: "center", fontFamily: "PlayfairDisplay_600SemiBold", color: COLORS.text, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 16, backgroundColor: COLORS.card }]}
            placeholder="your name"
            placeholderTextColor={COLORS.muted}
            value={preferredName}
            onChangeText={setPreferredName}
            autoFocus
            autoCapitalize="words" maxLength={200} />
        </View>
        <TouchableOpacity
          style={[s.btn, { opacity: preferredName.trim().length === 0 ? 0.4 : 1 }]}
          disabled={preferredName.trim().length === 0}
          onPress={async () => {
            await SecureStore.setItemAsync("proof_preferred_name", preferredName.trim());
            setOnboardingStep("whys");
          }}>
          <Text style={s.btnText}>Continue →</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (onboardingDone === false && onboardingStep === "whys") return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: "center", marginVertical: 32 }}>
          <Text style={[s.logo, { fontSize: 32 }]}>proof.</Text>
          <View style={{ height: 16 }} />
          <Text style={[s.h2, { textAlign: "center" }]}>What's your why?</Text>
          <Text style={[s.cardBody, { textAlign: "center" }]}>These are the reasons you're choosing recovery. We'll show them to you when things get hard.</Text>
        </View>
        {motivations.map((m, i) => (
          <View key={i} style={[s.card, { flexDirection: "row", alignItems: "flex-start", gap: 12 }]}>
            <Text style={{ fontSize: 18, color: COLORS.sage, marginTop: 2 }}>💚</Text>
            <TextInput style={{ flex: 1, fontSize: 14, color: COLORS.text }} value={m} multiline onChangeText={t => { const u = [...motivations]; u[i] = t; setMotivations(u); }} placeholder="e.g. to feel free around food" placeholderTextColor={COLORS.muted} />
            <TouchableOpacity onPress={() => setMotivations(motivations.filter((_, j) => j !== i))}><Text style={{ color: COLORS.blush, fontSize: 18 }}>×</Text></TouchableOpacity>
          </View>
        ))}
        {motivations.length < 5 && <TouchableOpacity style={s.btnOutline} onPress={() => setMotivations([...motivations, ""])}><Text style={s.btnOutlineText}>+ Add another reason</Text></TouchableOpacity>}
        <View style={{ height: 16 }} />
        <TouchableOpacity style={s.btn} onPress={() => saveMotivations(true)}>
          {savingMotivations ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Continue →</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // ─── ONBOARDING: FEAR FOODS ──────────────────────────────────────────
  if (onboardingDone === false && onboardingStep === "fearfoods") return (
    <SafeAreaView style={s.safe}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: "center", marginVertical: 24 }}>
          <Text style={[s.logo, { fontSize: 28 }]}>proof.</Text>
          <View style={{ height: 16 }} />
          <Text style={[s.h2, { textAlign: "center" }]}>Foods you're working toward</Text>
          <Text style={[s.cardBody, { textAlign: "center" }]}>Are there foods you've been wanting to feel more comfortable with? We'll gently support you when you're ready to try them.</Text>
          <View style={[s.card, { backgroundColor: "#F0F7F1", borderColor: "#B5D4BA", width: "100%" }]}>
            <Text style={{ fontSize: 13, color: "#3D6B45", lineHeight: 20, textAlign: "center" }}>This feature unlocks after you've built your foundation. No pressure — you can always add more later. 💚</Text>
          </View>
        </View>

        {fearFoodMode === "choose" && (
          <View style={{ gap: 12 }}>
            <TouchableOpacity style={[s.card, { borderLeftWidth: 4, borderLeftColor: COLORS.sage }]} onPress={() => setFearFoodMode("categories")}>
              <Text style={{ fontSize: 15, fontWeight: "bold", color: COLORS.text, marginBottom: 4 }}>💡 Prompt me with ideas</Text>
              <Text style={{ fontSize: 13, color: COLORS.muted }}>Tap categories that feel familiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.card, { borderLeftWidth: 4, borderLeftColor: COLORS.terracotta }]} onPress={() => setFearFoodMode("manual")}>
              <Text style={{ fontSize: 15, fontWeight: "bold", color: COLORS.text, marginBottom: 4 }}>✏️ I know what they are</Text>
              <Text style={{ fontSize: 13, color: COLORS.muted }}>Write them in your own words</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.card, { borderLeftWidth: 4, borderLeftColor: COLORS.border }]} onPress={() => saveFearFoodsOnboarding([])}>
              <Text style={{ fontSize: 15, fontWeight: "bold", color: COLORS.text, marginBottom: 4 }}>🌿 I'm not ready yet</Text>
              <Text style={{ fontSize: 13, color: COLORS.muted }}>Skip for now — find this later in the app</Text>
            </TouchableOpacity>
          </View>
        )}

        {fearFoodMode === "categories" && (
          <View>
            <Text style={[s.label, { marginBottom: 12 }]}>Tap anything that resonates</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
              {FEAR_FOOD_CATEGORIES.map(cat => {
                const sel = selectedCategories.includes(cat.label);
                return (
                  <TouchableOpacity key={cat.label} style={{ backgroundColor: sel ? COLORS.terracotta : COLORS.card, borderWidth: 1, borderColor: sel ? COLORS.terracotta : COLORS.border, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}
                    onPress={() => setSelectedCategories(p => sel ? p.filter(c => c !== cat.label) : [...p, cat.label])}>
                    <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
                    <Text style={{ fontSize: 13, color: sel ? "#fff" : COLORS.text }}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={s.btn} onPress={() => saveFearFoodsOnboarding(selectedCategories)}>
              {savingFearFoods ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save & start my journey →</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 16, alignItems: "center" }} onPress={() => setFearFoodMode("choose")}><Text style={{ color: COLORS.muted }}>← Back</Text></TouchableOpacity>
          </View>
        )}

        {fearFoodMode === "manual" && (
          <View>
            <Text style={[s.label, { marginBottom: 8 }]}>Write in your own words</Text>
            <Text style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16, lineHeight: 20 }}>These can be specific foods, situations, or feelings around eating.</Text>
            <TextInput style={[s.textarea, { marginBottom: 16 }]} multiline placeholder="e.g. pasta, eating at restaurants, having dessert..." placeholderTextColor={COLORS.muted} value={manualFearFood} onChangeText={setManualFearFood}  maxLength={500} />
            <TouchableOpacity style={s.btn} onPress={() => saveFearFoodsOnboarding(manualFearFood.split(",").map(f => f.trim()).filter(f => f.length > 0))}>
              {savingFearFoods ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save & start my journey →</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 16, alignItems: "center" }} onPress={() => setFearFoodMode("choose")}><Text style={{ color: COLORS.muted }}>← Back</Text></TouchableOpacity>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // ─── CELEBRATION ─────────────────────────────────────────────────────

  // ─── ONBOARDING: MEAL REMINDERS ──────────────────────────────────────
  if (onboardingDone === false && onboardingStep === "mealreminders") {
    const slots = [
      { key: "breakfast", label: "Breakfast",       enabledKey: "breakfastEnabled", hourKey: "breakfastHour", minuteKey: "breakfastMinute" },
      { key: "lunch",     label: "Lunch",           enabledKey: "lunchEnabled",     hourKey: "lunchHour",     minuteKey: "lunchMinute" },
      { key: "dinner",    label: "Dinner",          enabledKey: "dinnerEnabled",    hourKey: "dinnerHour",    minuteKey: "dinnerMinute" },
      { key: "snack1",    label: "Morning snack",   enabledKey: "snack1Enabled",    hourKey: "snack1Hour",    minuteKey: "snack1Minute" },
      { key: "snack2",    label: "Afternoon snack", enabledKey: "snack2Enabled",    hourKey: "snack2Hour",    minuteKey: "snack2Minute" },
    ] as const;
    const formatTime = (hour: number, minute: number) => {
      const h = hour % 12 || 12;
      const m = minute.toString().padStart(2, "0");
      return `${h}:${m} ${hour < 12 ? "AM" : "PM"}`;
    };
    const nudgeTime = (hourKey: string, minuteKey: string, delta: number) => {
      const cur = (notifSettings as any)[hourKey] * 60 + (notifSettings as any)[minuteKey];
      const next = (cur + delta + 24 * 60) % (24 * 60);
      setNotifSettings((p: any) => ({ ...p, [hourKey]: Math.floor(next / 60), [minuteKey]: next % 60 }));
    };
    return (
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: "center", marginVertical: 24 }}>
            <Text style={[s.logo, { fontSize: 28 }]}>proof.</Text>
            <View style={{ height: 16 }} />
            <Text style={[s.h2, { textAlign: "center" }]}>Meal reminders</Text>
            <Text style={[s.cardBody, { textAlign: "center", marginBottom: 8 }]}>Would you like a gentle nudge before meals to help you log? You can change these any time in Settings.</Text>
          </View>
          <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "bold", color: COLORS.text, marginBottom: 2 }}>Enable meal reminders</Text>
              <Text style={{ fontSize: 12, color: COLORS.muted }}>A daily nudge before each meal you choose</Text>
            </View>
            <TouchableOpacity
              onPress={() => setNotifSettings((p: any) => ({ ...p, mealReminders: !p.mealReminders }))}
              style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: notifSettings.mealReminders ? COLORS.terracotta : COLORS.border, justifyContent: "center", paddingHorizontal: 3 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", alignSelf: notifSettings.mealReminders ? "flex-end" : "flex-start", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 }} />
            </TouchableOpacity>
          </View>
          {notifSettings.mealReminders && <MealReminderSlots
            notifSettings={notifSettings}
            saveMealReminderSettings={saveMealReminderSettings}
          />}

                    <View style={[s.card, { backgroundColor: COLORS.warm, borderColor: COLORS.blush, marginTop: 4 }]}>
            <Text style={{ fontSize: 13, color: COLORS.text, lineHeight: 20, fontStyle: "italic" }}>💚 These are gentle nudges, not rules. You can turn them off any time in Settings.</Text>
          </View>
          <TouchableOpacity style={[s.btn, { marginTop: 20 }]} onPress={async () => { await saveMealReminderSettings(notifSettings); setOnboardingDone(true); }}>
            <Text style={s.btnText}>Start using proof. →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 16, alignItems: "center" }} onPress={() => setOnboardingDone(true)}>
            <Text style={{ color: COLORS.muted }}>Skip for now</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─── COPING SKILL ────────────────────────────────────────────────────
  if (activeCopingSkill) {
    const skill = activeCopingSkill;
    const step = skill.steps[copingStep];
    const isLast = copingStep === skill.steps.length - 1;
    const handleBack = () => {
      setActiveCopingSkill(null); setCopingStep(0); setCopingNote("");
      if (copingReturnTo) { setScreen(copingReturnTo); setCopingReturnTo(null); }
    };
    return (
      <SafeAreaView style={s.safe}>
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <TouchableOpacity onPress={handleBack}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
            <Text style={s.logo}>{skill.emoji} {skill.title}</Text>
            <View style={{ width: 50 }} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginVertical: 16 }}>
            {skill.steps.map((_: any, i: number) => <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: copingStep === i ? skill.color : COLORS.border }} />)}
          </View>
          <View style={[s.card, { borderLeftWidth: 4, borderLeftColor: skill.color }]}>
            <Text style={{ fontSize: 18, color: COLORS.text, fontWeight: "bold", lineHeight: 28, marginBottom: 12 }}>{step.prompt}</Text>
            <Text style={{ fontSize: 14, color: COLORS.muted, lineHeight: 22, fontStyle: "italic" }}>{step.detail}</Text>
          </View>
          <View style={s.card}>
            <Text style={s.label}>Your response (optional)</Text>
            <TextInput style={s.textarea} multiline placeholder="Write what comes up for you..." placeholderTextColor={COLORS.muted} value={copingNote} onChangeText={setCopingNote}  maxLength={500} />
          </View>
          <TouchableOpacity style={[s.btn, { backgroundColor: skill.color }]} onPress={() => { if (isLast) handleBack(); else { setCopingStep(c => c + 1); setCopingNote(""); } }}>
            <Text style={s.btnText}>{isLast ? "Complete 💚" : "Next →"}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─── CHALLENGE FLOW ───────────────────────────────────────────────────
  if (activeChallengeFood && screen === "fearfoods") return (
    <SafeAreaView style={s.safe}>
      {challengeStep === "celebrate" && <Confetti />}
      {crisisModal}
      {globalModals}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <TouchableOpacity onPress={() => { setActiveChallengeFood(null); setChallengeStep("safety"); setScreen("fearfoods"); }}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
          <Text style={s.logo}>proof.</Text>
          <TouchableOpacity onPress={() => setShowCrisis(true)} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><IconHeart size={14} color={COLORS.muted} /><Text style={{ fontSize: 13, color: COLORS.muted }}>Help</Text></TouchableOpacity>
        </View>

        {challengeStep === "safety" && (
          <View style={{ paddingTop: 16 }}>
            <Text style={s.h2}>Before you begin.</Text>
            <View style={[s.card, { backgroundColor: "#F0F7F1", borderColor: "#B5D4BA" }]}>
              <Text style={{ fontSize: 14, color: "#3D6B45", lineHeight: 24 }}>This is a tool to support your recovery — not a requirement. Only proceed if it feels right today. You can always come back another time. 💚</Text>
            </View>
            <View style={s.card}>
              <Text style={s.label}>🧠 What thoughts are coming up?</Text>
              <TextInput style={s.textarea} multiline placeholder="What is your mind saying right now?" placeholderTextColor={COLORS.muted} value={challengeData.thoughts} onChangeText={t => setChallengeData(d => ({ ...d, thoughts: t }))} />
            </View>
            <View style={s.card}>
              <Text style={s.label}>🫀 Physical sensations</Text>
              <TextInput style={s.textarea} multiline placeholder="What do you notice in your body?" placeholderTextColor={COLORS.muted} value={challengeData.sensations} onChangeText={t => setChallengeData(d => ({ ...d, sensations: t }))} />
            </View>
            <View style={s.card}>
              <Text style={s.label}>⚡ Urges or behaviors</Text>
              <TextInput style={s.textarea} multiline placeholder="Any urges you're noticing? No judgment." placeholderTextColor={COLORS.muted} value={challengeData.urges} onChangeText={t => setChallengeData(d => ({ ...d, urges: t }))} />
            </View>
            <TouchableOpacity style={s.btn} onPress={() => setChallengeStep("coping_offer")}><Text style={s.btnText}>Continue →</Text></TouchableOpacity>
            <TouchableOpacity style={{ padding: 16, alignItems: "center" }} onPress={() => { setActiveChallengeFood(null); setScreen("fearfoods"); }}><Text style={{ color: COLORS.muted }}>Not today — that's okay 🌿</Text></TouchableOpacity>
          </View>
        )}

        {challengeStep === "coping_offer" && (
          <View style={{ paddingTop: 24, alignItems: "center" }}>
            <Text style={{ fontSize: 52, marginBottom: 16 }}>🌿</Text>
            <Text style={[s.h2, { textAlign: "center" }]}>Would you like a coping skill first?</Text>
            <Text style={[s.cardBody, { textAlign: "center" }]}>Sometimes grounding yourself first makes all the difference. Completely optional.</Text>
            <TouchableOpacity style={[s.btn, { width: "100%", backgroundColor: COLORS.sage }]} onPress={() => { setCopingReturnTo("challenge_coping_return"); setActiveCopingSkill(COPING_SKILLS.find(c => c.id === "compassion")); setCopingStep(0); }}>
              <Text style={s.btnText}>💚 Self Compassion Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, { width: "100%", backgroundColor: COLORS.terracotta }]} onPress={() => { setCopingReturnTo("challenge_coping_return"); setActiveCopingSkill(COPING_SKILLS.find(c => c.id === "grounding")); setCopingStep(0); }}>
              <Text style={s.btnText}>🌿 5-4-3-2-1 Grounding</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btnOutline, { width: "100%" }]} onPress={() => setChallengeStep("wave")}><Text style={s.btnOutlineText}>I'm ready — let's go</Text></TouchableOpacity>
          </View>
        )}

        {challengeStep === "wave" && (
          <View>
            <Text style={[s.h2, { textAlign: "center", marginTop: 16 }]}>Sit with the wave.</Text>
            <Text style={[s.cardBody, { textAlign: "center" }]}>Discomfort rises and then it falls. You don't have to escape it — just ride it.</Text>
            <WaveTimer startTime={Date.now()} onComplete={() => setChallengeStep("checkin_after")} />
            <TouchableOpacity style={s.btnOutline} onPress={() => setChallengeStep("checkin_after")}><Text style={s.btnOutlineText}>Skip timer</Text></TouchableOpacity>
          </View>
        )}

        {challengeStep === "checkin_after" && (
          <View>
            <Text style={s.h2}>How are you feeling now?</Text>
            <Text style={s.cardBody}>Check in with yourself. No right or wrong answer.</Text>
            <View style={s.card}>
              <Text style={s.label}>🧠 Thoughts now</Text>
              <TextInput style={s.textarea} multiline placeholder="What is your mind saying now?" placeholderTextColor={COLORS.muted} value={challengeData.thoughtsAfter} onChangeText={t => setChallengeData(d => ({ ...d, thoughtsAfter: t }))} />
            </View>
            <View style={s.card}>
              <Text style={s.label}>🫀 Body sensations now</Text>
              <TextInput style={s.textarea} multiline placeholder="What do you feel in your body now?" placeholderTextColor={COLORS.muted} value={challengeData.sensationsAfter} onChangeText={t => setChallengeData(d => ({ ...d, sensationsAfter: t }))} />
            </View>
            <TouchableOpacity style={s.btn} onPress={() => setChallengeStep("celebrate")}>
              <Text style={s.btnText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        )}

        {challengeStep === "celebrate" && (
          <View>
            {/* Hero section */}
            <View style={{ alignItems: "center", paddingVertical: 40, paddingHorizontal: 24 }}>
              <Text style={{ fontSize: 64, marginBottom: 20 }}>🌿</Text>
              <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold_Italic", fontSize: 42, color: COLORS.text, textAlign: "center", lineHeight: 50, marginBottom: 16 }}>
                You did it.
              </Text>
              <Text style={{ fontSize: 17, color: COLORS.muted, textAlign: "center", lineHeight: 28 }}>
                You faced{" "}
                <Text style={{ fontWeight: "bold", color: COLORS.text }}>{activeChallengeFood?.food}</Text>.{"\n"}
                That took real courage.
              </Text>
            </View>

            {/* What this proves card */}
            <View style={{ marginHorizontal: 20, marginBottom: 16, borderRadius: 18, backgroundColor: COLORS.dark, padding: 24 }}>
              <Text style={{ fontSize: 10, color: COLORS.sage, fontWeight: "bold", textTransform: "uppercase" as "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
                What this proves
              </Text>
              <Text style={{ fontSize: 16, color: "#F7F4EE", lineHeight: 26, fontStyle: "italic" }}>
                You sat with the discomfort and came out the other side. Every time you do this, you make it a little smaller.
              </Text>
              <Text style={{ fontSize: 16, color: COLORS.sage, lineHeight: 26, fontStyle: "italic", marginTop: 12 }}>
                This is what recovery looks like.
              </Text>
            </View>

            {/* Reflection card */}
            <View style={{ marginHorizontal: 20, marginBottom: 8, borderRadius: 18, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 24 }}>
              <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 16, color: COLORS.text, marginBottom: 6 }}>
                Your reflection
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.muted, lineHeight: 20, marginBottom: 14 }}>
                What do you want to remember about this moment?
              </Text>
              <TextInput
                style={[s.textarea, { minHeight: 100 }]}
                multiline
                placeholder="e.g. I was scared and I did it anyway."
                placeholderTextColor={COLORS.muted}
                value={celebrationReflection}
                onChangeText={setCelebrationReflection} maxLength={500} />
            </View>

            {/* Actions */}
            <View style={{ marginHorizontal: 20, marginTop: 8, gap: 12, paddingBottom: 48 }}>
              <TouchableOpacity style={s.btn} onPress={async () => {
                await saveChallengeAttempt();
                // Log the exposure as a meal so check-ins have a mealId to attach to
                const { data: mealData } = await supabase.from("meals").insert([{
                  user_id: session?.user?.id,
                  meal: `Exposure: ${activeChallengeFood?.food}`,
                  thoughts: challengeData.thoughts,
                  sensations: challengeData.sensations,
                  urges: challengeData.urges,
                  reappraisal: challengeData.thoughtsAfter || celebrationReflection || null,
                  created_at: new Date().toISOString(),
                }]).select();
                if (mealData?.[0]?.id) {
                  setCurrentMealId(mealData[0].id);
                  await scheduleExposureCheckinNotifications(mealData[0].id, activeChallengeFood?.food);
                }
                await fetchMeals();
                setActiveChallengeFood(null);
                setChallengeStep("safety");
                setChallengeData({ thoughts: "", sensations: "", urges: "", thoughtsAfter: "", sensationsAfter: "" });
                setCelebrationReflection("");
                setScreen("fearfoods");
              }}>
                <Text style={s.btnText}>Save & finish 💚</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 14, alignItems: "center" }} onPress={() => {
                setActiveChallengeFood(null);
                setChallengeStep("safety");
                setChallengeData({ thoughts: "", sensations: "", urges: "", thoughtsAfter: "", sensationsAfter: "" });
                setCelebrationReflection("");
                setScreen("fearfoods");
              }}>
                <Text style={{ fontSize: 13, color: COLORS.muted }}>Skip reflection</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // ─── WAVE TIMER SCREEN ────────────────────────────────────────────────
  if (showWaveTimer) return (
    <SafeAreaView style={s.safe}>
      {globalModals}
      <ScrollView contentContainerStyle={s.container}>
        <View style={{ alignItems: "center", marginTop: 16, marginBottom: 8 }}><Text style={s.logo}>proof.</Text></View>
        <Text style={[s.h2, { textAlign: "center", marginTop: 16 }]}>Sitting with the wave.</Text>
        <Text style={[s.cardBody, { textAlign: "center" }]}>Emotions rise and fall like waves. You don't have to escape this feeling — just ride it.</Text>
        <WaveTimer startTime={waveTimerStart} onComplete={async () => { await stopWaveTimer(); setCheckinType("20min"); setShowCheckin(true); }} />
        <View style={[s.card, { backgroundColor: "#F0F7F1", borderColor: "#B5D4BA" }]}>
          <Text style={{ fontSize: 13, color: "#3D6B45", lineHeight: 20, textAlign: "center", fontStyle: "italic" }}>"The only way out is through. Every wave passes."</Text>
        </View>
        <TouchableOpacity style={s.btnOutline} onPress={async () => { await stopWaveTimer(); setCheckinType("20min"); setShowCheckin(true); }}><Text style={s.btnOutlineText}>Skip timer & check in now</Text></TouchableOpacity>
        <TouchableOpacity style={{ padding: 16, alignItems: "center" }} onPress={async () => { await stopWaveTimer(); }}><Text style={{ color: COLORS.muted }}>Return home</Text></TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );

  // ─── SHARED TAB BAR ──────────────────────────────────────────────────
  const TAB_SCREENS = ["home", "log", "cope", "me"] as const;

  const hideTabBar = () => {
    if (tabBarVisible) {
      setTabBarVisible(false);
      Animated.timing(tabBarAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  };
  const showTabBar = () => {
    if (!tabBarVisible) {
      setTabBarVisible(true);
      Animated.timing(tabBarAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  };
  const onScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 8) hideTabBar();
    else if (y < lastScrollY.current - 8) showTabBar();
    lastScrollY.current = y;
  };

  const TAB_HEIGHT = Platform.OS === "ios" ? 80 : 60;
  const tabBar = (
    <Animated.View style={{
      transform: [{ translateY: tabBarAnim.interpolate({ inputRange: [0, 1], outputRange: [0, TAB_HEIGHT] }) }],
      flexDirection: "row",
      backgroundColor: COLORS.dark,
      paddingBottom: Platform.OS === "ios" ? 28 : 12,
      paddingTop: 10,
    }}>
      {[
        { key: "home",     label: "Home",     icon: (active: boolean) => <IconHome     size={20} color="#fff" filled={active} /> },
        { key: "log",      label: "Log",      icon: (active: boolean) => <IconPen      size={20} color="#fff" filled={active} /> },
        { key: "cope",     label: "Cope",     icon: (active: boolean) => <IconWave     size={20} color="#fff" filled={active} /> },
        { key: "progress", label: "Progress", icon: (active: boolean) => <IconChart    size={20} color="#fff" filled={active} /> },
      ].map(tab => {
        const active = screen === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={{ flex: 1, alignItems: "center", gap: 4 }}
            onPress={() => { showTabBar(); setScreen(tab.key); }}
            android_ripple={{ color: "rgba(122,184,200,0.2)", borderless: true }}
          >
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: active ? COLORS.terracotta : "rgba(255,255,255,0.08)",
              alignItems: "center", justifyContent: "center",
            }}>
              {tab.icon(active)}
            </View>
            <Text style={{
              fontSize: 9,
              color: active ? COLORS.sage : "rgba(255,255,255,0.45)",
              fontWeight: active ? "bold" : "normal",
              letterSpacing: 0.5,
            }}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );

  // ─── HOME ─────────────────────────────────────────────────────────────
  if (screen === "home") return (
    <SafeAreaView style={[s.safe, { backgroundColor: COLORS.dark }]}>
      {crisisModal}
      {globalModals}

      {showWelcome && (
        <Animated.View pointerEvents="none" style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
          backgroundColor: COLORS.dark,
          alignItems: "center", justifyContent: "center",
          opacity: welcomeAnim,
        }}>
          <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold_Italic", fontSize: 13, color: COLORS.sage, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>welcome back</Text>
          {preferredName.length > 0 && (
            <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 42, color: COLORS.warm, marginBottom: 16 }}>{preferredName}.</Text>
          )}
          <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold_Italic", fontSize: 17, color: "rgba(240,232,215,0.55)", textAlign: "center" }}>
            {["thank you for showing up.", "we're glad you're here.", "today counts.", "you came back."][Math.floor(Date.now() / 86400000) % 4]}
          </Text>
        </Animated.View>
      )}
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        {!isOnline && (
          <View style={{ backgroundColor: "#C47060", paddingVertical: 8, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 12, color: "#fff", flex: 1 }}>📵 You're offline — meals will save to your device and sync when you reconnect.</Text>
          </View>
        )}
        {syncPending && (
          <View style={{ backgroundColor: COLORS.sage, paddingVertical: 6, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={{ fontSize: 12, color: "#fff" }}>Syncing your saved meals...</Text>
          </View>
        )}
        <ScrollView
          contentContainerStyle={s.container}
          style={{ flex: 1 }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
        <View style={s.header}>
          <View>
            <Text style={s.logo}>proof.</Text>
            {preferredName.length > 0
              ? <Text style={s.tagline}>hi, {preferredName} 🌊</Text>
              : <Text style={s.tagline}>recovery, one meal at a time.</Text>}
          </View>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(122,184,200,0.1)", alignItems: "center", justifyContent: "center" }}>
            <IconSettings size={20} color={COLORS.muted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 8 }} />

        {/* Wave header — pure SVG, no text */}
        <View style={{ backgroundColor: COLORS.dark, borderRadius: 24, overflow: "hidden", marginBottom: 14, height: 88, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 }}>
          <Svg width="100%" height="88" viewBox="0 0 400 88" preserveAspectRatio="none">
            <Path d="M0,0 L400,0 L400,88 L0,88 Z" fill={COLORS.dark} />
            <Path d="M0,55 C50,30 100,70 150,50 C200,30 250,65 300,45 C340,30 370,52 400,42 L400,88 L0,88 Z" fill="rgba(58,122,154,0.35)" />
            <Path d="M0,65 C60,44 120,72 180,56 C240,40 300,68 360,52 L400,48 L400,88 L0,88 Z" fill="rgba(122,184,200,0.18)" />
            <Path d="M0,75 C80,60 160,80 240,68 C300,58 350,74 400,64 L400,88 L0,88 Z" fill="rgba(122,184,200,0.1)" />
            <Path d="M0,55 C50,30 100,70 150,50 C200,30 250,65 300,45 C340,30 370,52 400,42" fill="none" stroke="rgba(122,184,200,0.55)" strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M0,65 C60,44 120,72 180,56 C240,40 300,68 360,52 L400,48" fill="none" stroke="rgba(122,184,200,0.3)" strokeWidth="1" strokeLinecap="round" />
          </Svg>
        </View>

        {pastMeals.length === 0 ? (
          <View style={[s.card, { alignItems: "center", paddingVertical: 32, borderColor: COLORS.sage, borderWidth: 1.5 }]}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🌊</Text>
            <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 20, color: COLORS.text, textAlign: "center", marginBottom: 8 }}>Your journey starts here.</Text>
            <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", lineHeight: 22, marginBottom: 24 }}>Log your first meal and begin building your evidence — proof that you can do hard things.</Text>
            <TouchableOpacity style={s.btn} onPress={() => setScreen("log")}><Text style={s.btnText}>Log your first meal →</Text></TouchableOpacity>
          </View>
        ) : (
          <>
            {streak > 1 && (
              <View style={[s.card, { backgroundColor: COLORS.dark, flexDirection: "row", alignItems: "center", gap: 16 }]}>
                <Text style={{ fontSize: 32 }}>🌿</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: COLORS.sage, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Showing up</Text>
                  <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 20, color: "#F7F4EE" }}>{streak} days in a row</Text>
                  <Text style={{ fontSize: 12, color: "rgba(200,223,232,0.6)", marginTop: 2, fontStyle: "italic" }}>Each one mattered.</Text>
                </View>
              </View>
            )}

            {/* Log meal card */}
            <View style={s.card}>
              <View style={s.pill}><Text style={s.pillText}>WHEN YOU'RE READY</Text></View>
              <Text style={s.cardTitle}>How are you doing right now?</Text>
              <Text style={s.cardBody}>Log a meal, check in with your body, and let proof. help you sit with whatever comes up.</Text>
              <TouchableOpacity style={s.btn} onPress={() => setScreen("log")}><Text style={s.btnText}>Log a meal →</Text></TouchableOpacity>
            </View>

            {/* Moment check-in — sand colored */}
            <TouchableOpacity
              onPress={() => { setShowMomentCheckin(true); setMomentStep("body"); setMomentBody(5); setMomentFeeling(""); setMomentThought(""); }}
              style={{ backgroundColor: "#E8D5A8", borderRadius: 20, padding: 20, marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 14, shadowColor: "#1A2E38", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: "#6A4F1A", fontWeight: "bold", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Just checking in</Text>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#3A2A10", marginBottom: 3 }}>How's your body right now?</Text>
                <Text style={{ fontSize: 12, color: "#8A6A30", lineHeight: 18 }}>A quick 3-step pause. No meal needed.</Text>
              </View>
              <Text style={{ fontSize: 26 }}>🫀</Text>
            </TouchableOpacity>

            {/* Evidence card */}
            <TouchableOpacity onPress={() => setScreen("history")} style={{ backgroundColor: COLORS.dark, borderRadius: 20, overflow: "hidden", marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 }}>
              <Svg width="100%" height="40" viewBox="0 0 400 40" style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
                <Path d="M0,22 C70,6 140,34 210,18 C280,4 340,28 400,16 L400,0 L0,0 Z" fill="rgba(122,184,200,0.18)" />
                <Path d="M0,22 C70,6 140,34 210,18 C280,4 340,28 400,16" fill="none" stroke="rgba(122,184,200,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              </Svg>
              <View style={{ padding: 22, paddingTop: 40 }}>
                <Text style={{ fontSize: 10, color: COLORS.sage, fontWeight: "bold", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>proof.</Text>
                <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 20, color: "#F7F4EE", lineHeight: 30, marginBottom: 6 }}>
                  You are doing the hard thing.
                </Text>
                <Text style={{ fontSize: 13, color: "rgba(200,223,232,0.65)", lineHeight: 20, marginBottom: 14 }}>
                  Every time you show up — to a meal, to this app, to your own recovery — you are building evidence that you can.
                </Text>
                <Text style={{ fontSize: 12, color: "rgba(122,184,200,0.6)", fontStyle: "italic" }}>See your progress →</Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
      {tabBar}
      </View>

      {/* Moment check-in modal */}
      <Modal visible={showMomentCheckin} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "rgba(26,46,56,0.6)", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
          <View style={{ backgroundColor: "#F5EDD6", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, maxHeight: "85%" }}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

              {/* Step dots */}
              <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 }}>
                {(["body", "feeling", "thought"] as const).map((step) => (
                  <View key={step} style={{ width: momentStep === step ? 20 : 8, height: 8, borderRadius: 4, backgroundColor: momentStep === step ? "#6A4F1A" : "#C4A870" }} />
                ))}
              </View>

              {momentStep === "body" && (
                <>
                  <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 22, color: "#3A2A10", marginBottom: 6 }}>Body check</Text>
                  <Text style={{ fontSize: 14, color: "#8A6A30", lineHeight: 22, marginBottom: 24 }}>On a scale of 1–10, how much tension are you carrying in your body right now?</Text>
                  <View style={{ alignItems: "center", marginBottom: 24 }}>
                    <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 48, color: "#3A2A10", lineHeight: 56 }}>{momentBody}</Text>
                    <Text style={{ fontSize: 12, color: "#8A6A30", marginTop: 4 }}>out of 10</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <TouchableOpacity key={n} onPress={() => setMomentBody(n)}
                        style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: momentBody === n ? "#6A4F1A" : "#E8D5A8", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: momentBody === n ? "#6A4F1A" : "#C4A870" }}>
                        <Text style={{ fontSize: 15, fontWeight: "600", color: momentBody === n ? "#F5EDD6" : "#6A4F1A" }}>{n}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={[s.btn, { backgroundColor: "#6A4F1A" }]} onPress={() => setMomentStep("feeling")}>
                    <Text style={s.btnText}>Next →</Text>
                  </TouchableOpacity>
                </>
              )}

              {momentStep === "feeling" && (
                <>
                  <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 22, color: "#3A2A10", marginBottom: 6 }}>What's present?</Text>
                  <Text style={{ fontSize: 14, color: "#8A6A30", lineHeight: 22, marginBottom: 20 }}>Pick what feels closest. You can choose more than one.</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
                    {["Anxious", "Calm", "Numb", "Sad", "Tired", "Overwhelmed", "Okay", "Uncomfortable", "Grateful", "Scared", "Irritable", "Present"].map(f => {
                      const sel = momentFeeling.split(",").map(x => x.trim()).includes(f);
                      return (
                        <TouchableOpacity key={f} onPress={() => {
                          const parts = momentFeeling ? momentFeeling.split(",").map(x => x.trim()).filter(Boolean) : [];
                          const next = sel ? parts.filter(x => x !== f) : [...parts, f];
                          setMomentFeeling(next.join(", "));
                        }} style={{ backgroundColor: sel ? "#6A4F1A" : "#E8D5A8", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: sel ? "#6A4F1A" : "#C4A870" }}>
                          <Text style={{ fontSize: 13, color: sel ? "#F5EDD6" : "#6A4F1A", fontWeight: sel ? "600" : "normal" }}>{f}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <TouchableOpacity style={[s.btn, { backgroundColor: "#6A4F1A" }]} onPress={() => setMomentStep("thought")}>
                    <Text style={s.btnText}>Next →</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ padding: 14, alignItems: "center" }} onPress={() => setMomentStep("body")}>
                    <Text style={{ fontSize: 13, color: "#8A6A30" }}>← Back</Text>
                  </TouchableOpacity>
                </>
              )}

              {momentStep === "thought" && (
                <>
                  <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 22, color: "#3A2A10", marginBottom: 6 }}>One kind thought</Text>
                  <Text style={{ fontSize: 14, color: "#8A6A30", lineHeight: 22, marginBottom: 20 }}>Optional — what's one gentle thing you can say to yourself right now?</Text>
                  <TextInput
                    style={[s.textarea, { backgroundColor: "#EFE3C0", borderColor: "#C4A870", marginBottom: 20, color: "#3A2A10" }]}
                    multiline
                    placeholder="e.g. I'm doing the best I can..."
                    placeholderTextColor="#C4A870"
                    value={momentThought}
                    onChangeText={setMomentThought}
                    autoFocus={false} maxLength={500} />
                  <TouchableOpacity style={[s.btn, { backgroundColor: "#6A4F1A" }]} onPress={saveMomentCheckin} disabled={savingMoment}>
                    {savingMoment ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save this moment 💚</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={{ padding: 14, alignItems: "center" }} onPress={() => setMomentStep("feeling")}>
                    <Text style={{ fontSize: 13, color: "#8A6A30" }}>← Back</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={{ padding: 14, alignItems: "center" }} onPress={() => setShowMomentCheckin(false)}>
                <Text style={{ fontSize: 13, color: "#C4A870" }}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Settings modal */}
      <Modal visible={showSettings} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(26,46,56,0.6)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: COLORS.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 22, color: COLORS.text }}>Settings</Text>
              <TouchableOpacity
                onPress={() => setShowSettings(false)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(200,223,232,0.15)", alignItems: "center", justifyContent: "center" }}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke={COLORS.muted} strokeWidth="2" strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            </View>
            {[
              { icon: <IconHeart size={20} color={COLORS.terracotta} filled />, label: "My Why", sub: "Your reasons for recovery", action: () => { setShowSettings(false); setScreen("whys"); } },
              { icon: <IconBook size={20} color={COLORS.terracotta} filled />, label: "Evidence Journal", sub: "Every meal you've logged", action: () => { setShowSettings(false); setScreen("history"); } },
              { icon: <IconBell size={20} color={COLORS.terracotta} filled />, label: "Notifications", sub: "Manage reminders", action: () => { setShowSettings(false); setScreen("notifsettings"); } },
              { icon: <IconInfo size={20} color={COLORS.terracotta} filled />, label: "About proof.", sub: "Mission, approach & legal", action: () => { setShowSettings(false); setScreen("about"); } },
            ].map((item, i) => (
              <TouchableOpacity key={i} onPress={item.action} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
                <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: "rgba(58,122,154,0.1)", alignItems: "center", justifyContent: "center" }}>
                  {item.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: COLORS.text }}>{item.label}</Text>
                  <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 1 }}>{item.sub}</Text>
                </View>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18l6-6-6-6" stroke={COLORS.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            ))}
            {clinicianMode && (
              <TouchableOpacity onPress={() => { setShowSettings(false); setScreen("therapist"); }} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
                <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: "rgba(58,122,154,0.1)", alignItems: "center", justifyContent: "center" }}>
                  <IconMedic size={20} color={COLORS.terracotta} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: COLORS.terracotta }}>Therapist Summary</Text>
                  <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 1 }}>Share progress with your care team</Text>
                </View>
                <Text style={{ color: COLORS.terracotta, fontSize: 16 }}>→</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, marginTop: 4 }}
              onPress={() => { setShowSettings(false); handleLogout(); }}>
              <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={COLORS.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={{ fontSize: 14, color: COLORS.muted }}>Sign out</Text>
            </TouchableOpacity>
            <View style={{ height: 12 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );


  // ─── SOCIAL EATING ────────────────────────────────────────────────────
  const SOCIAL_REFRAMES: Record<string, string> = {
    "I ate more than everyone else at the table": "There is no correct amount to eat at a table. Your body asked for what it needed. That is not a mistake.",
    "Everyone noticed what I ordered": "People are far more focused on their own plates and conversations than on yours. And even if someone did notice — your food is none of their business.",
    "I was eating too slowly / too fast": "There is no right pace. Your body eats the way it eats. You were there. You showed up. That is what matters.",
    "I should have ordered something different": "You made a choice with the information and capacity you had in that moment. That is all any of us ever do.",
    "I ruined the meal by being anxious": "You didn't ruin anything. You were anxious and you stayed anyway. That is extraordinary courage.",
    "My body reacted and I couldn't control it": "Your body was doing its best to protect you. It doesn't always know the difference between danger and a dinner table. That isn't failure.",
    "I couldn't enjoy it the way everyone else seemed to": "You don't know what anyone else was feeling inside. And enjoying food is a skill recovery is giving back to you — slowly, not all at once.",
  };

  const WANT_FEEL_AFFIRMATIONS: Record<string, string> = {
    "warm": "Something warm sounds exactly right. Let your body lead — it knows what it needs today.",
    "cold": "Something cool and refreshing — trust that instinct. Your body is speaking clearly.",
    "familiar": "Familiar is a perfectly valid choice. Comfort is not weakness. It is wisdom.",
    "adventurous": "You're open to something new — that's recovery in action. Curiosity is courage.",
    "": "Whatever you choose today, your body is worth nourishing. You don't need to earn it.",
  };

  const getSocialAffirmation = () => {
    const known = WANT_FEEL_AFFIRMATIONS[socialWantsFeel];
    const base = known || (socialWantsFeel.length > 0
      ? `${socialWantsFeel} sounds right. Trust that. Your body knows what it needs.`
      : WANT_FEEL_AFFIRMATIONS[""]);
    if (socialMenuScary) return base + " Something felt scary on that menu — and you looked anyway. That takes real courage.";
    if (socialFlexible) return base + " You've already given yourself permission to change your mind at the table. That flexibility is recovery.";
    return base;
  };

  if (screen === "social") {
    const resetSocial = () => {
      setSocialStep("situation"); setSocialSituation(""); setSocialBodyEnergy(5);
      setSocialBodyHunger(5); setSocialBodyComfort(5); setSocialWantsFeel("");
      setSocialWorry(""); setSocialRestaurant(""); setSocialMenuLooked(false);
      setSocialMenuLooks(""); setSocialMenuScary(""); setSocialFlexible(null);
      setSocialOverallRating(5); setSocialHardestMoment(""); setSocialHiddenStrength("");
      setSocialReframePick(""); setSocialReframeResponse(""); setSocialCustomThought(""); setSocialCustomReframe("");
    };

    return (
      <SafeAreaView style={s.safe}>
        {crisisModal}
        {globalModals}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="always" scrollEventThrottle={16}>
          <View style={s.header}>
            <Pressable onPress={() => setScreen("home")}><Text style={s.navBtn}>← Home</Text></Pressable>
            <Text style={s.logo}>Social Eating</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* ── SITUATION ── */}
          {socialStep === "situation" && (
            <View>
              <Text style={[s.h2, { marginTop: 16 }]}>What's the situation?</Text>
              <Text style={[s.cardBody, { marginBottom: 20 }]}>Tell us a little about the meal you're preparing for.</Text>
              {[["🍽️ Restaurant meal", "restaurant"], ["👨‍👩‍👧 Family dinner", "family"], ["💼 Work or school lunch", "work"], ["🎉 Social event", "event"], ["☕ Café or casual catch-up", "cafe"]].map(([label, val]) => (
                <Pressable key={val} onPress={() => setSocialSituation(val)}
                  style={{ borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 2,
                    borderColor: socialSituation === val ? COLORS.terracotta : COLORS.border,
                    backgroundColor: socialSituation === val ? COLORS.warm : COLORS.card }}>
                  <Text style={{ fontSize: 15, color: COLORS.text, fontWeight: socialSituation === val ? "bold" : "normal" }}>{label}</Text>
                </Pressable>
              ))}
              {socialSituation ? (
                <Pressable style={[s.btn, { marginTop: 8 }]} onPress={() => setSocialStep("bodycheckin")}>
                  <Text style={s.btnText}>Next — check in with your body →</Text>
                </Pressable>
              ) : null}
            </View>
          )}

          {/* ── BODY CHECK-IN ── */}
          {socialStep === "bodycheckin" && (
            <View>
              <Text style={[s.h2, { marginTop: 16 }]}>Check in with your body.</Text>
              <Text style={[s.cardBody, { marginBottom: 20 }]}>Before we do anything else — let's hear from your body, not your ED.</Text>

              {[["How is your energy right now?", socialBodyEnergy, setSocialBodyEnergy],
                ["How hungry do you feel?", socialBodyHunger, setSocialBodyHunger],
                ["How comfortable do you feel in your body?", socialBodyComfort, setSocialBodyComfort],
              ].map(([label, val, setter]: any) => (
                <View key={label} style={[s.card, { marginBottom: 12 }]}>
                  <Text style={s.label}>{label}</Text>
                  <Text style={{ fontSize: 28, textAlign: "center", marginBottom: 8 }}>{val}/10</Text>
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    {Array.from({ length: 10 }, (_, i) => (
                      <Pressable key={i} onPress={() => setter(i + 1)}
                        style={{ flex: 1, height: 28, borderRadius: 6,
                          backgroundColor: i < val ? COLORS.terracotta : COLORS.border }} />
                    ))}
                  </View>
                </View>
              ))}

              <View style={s.card}>
                <Text style={s.label}>What sounds good to your body right now?</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 12 }}>
                  {["warm", "cold", "familiar", "adventurous"].map(feel => (
                    <Pressable key={feel} onPress={() => { setSocialWantsFeel(feel); }}
                      style={{ borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 2,
                        borderColor: socialWantsFeel === feel ? COLORS.terracotta : COLORS.border,
                        backgroundColor: socialWantsFeel === feel ? COLORS.warm : COLORS.card }}>
                      <Text style={{ color: COLORS.text, fontWeight: socialWantsFeel === feel ? "bold" : "normal" }}>{feel}</Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  style={[s.input, { marginTop: 4 }]}
                  placeholder="or write your own..."
                  placeholderTextColor={COLORS.muted}
                  value={["warm","cold","familiar","adventurous"].includes(socialWantsFeel) ? "" : socialWantsFeel}
                  onChangeText={t => setSocialWantsFeel(t)}
                  onFocus={() => { if (["warm","cold","familiar","adventurous"].includes(socialWantsFeel)) setSocialWantsFeel(""); }}
                />
              </View>

              <View style={s.card}>
                <Text style={s.label}>What are you most worried about?</Text>
                <TextInput style={s.textarea} multiline placeholder="e.g. comparing what I order, feeling anxious and having to hide it..." placeholderTextColor={COLORS.muted} value={socialWorry} onChangeText={setSocialWorry}  maxLength={500} />
              </View>

              <Pressable style={s.btn} onPress={() => setSocialStep("menu")}>
                <Text style={s.btnText}>Next — the menu →</Text>
              </Pressable>
            </View>
          )}

          {/* ── MENU ── */}
          {socialStep === "menu" && (
            <View>
              <Text style={[s.h2, { marginTop: 16 }]}>The menu.</Text>
              <Text style={[s.cardBody, { marginBottom: 8 }]}>Looking at a menu beforehand can reduce overwhelm — as long as you stay curious, not controlling.</Text>
              <View style={{ backgroundColor: COLORS.warm, borderRadius: 12, padding: 14, marginBottom: 20 }}>
                <Text style={{ fontSize: 13, color: COLORS.text, fontStyle: "italic", lineHeight: 20 }}>
                  💛 Look with curiosity, not to find what's "safe." You're allowed to change your mind when you get there.
                </Text>
              </View>

              <View style={s.card}>
                <Text style={s.label}>Restaurant name</Text>
                <TextInput style={s.input} placeholder="e.g. Olive Garden" placeholderTextColor={COLORS.muted} value={socialRestaurant} onChangeText={setSocialRestaurant}  maxLength={200} />
                {socialRestaurant.length > 2 && (
                  <Pressable
                    style={{ backgroundColor: COLORS.terracotta, borderRadius: 10, padding: 12, alignItems: "center", marginTop: 10 }}
                    onPress={() => { Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(socialRestaurant + " menu")}`); setSocialMenuLooked(true); }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>🔍 Search for their menu</Text>
                  </Pressable>
                )}
              </View>

              <Pressable style={s.btn} onPress={() => setSocialStep(socialMenuLooked ? "menuquestions" : "affirmation")}>
                <Text style={s.btnText}>{socialMenuLooked ? "I looked — next →" : "Skip menu lookup →"}</Text>
              </Pressable>
              <Pressable style={{ padding: 14, alignItems: "center" }} onPress={() => setSocialStep("affirmation")}>
                <Text style={{ color: COLORS.muted, fontSize: 13, fontStyle: "italic" }}>skip this step</Text>
              </Pressable>
            </View>
          )}

          {/* ── MENU QUESTIONS ── */}
          {socialStep === "menuquestions" && (
            <View>
              <Text style={[s.h2, { marginTop: 16 }]}>What did you notice?</Text>
              <Text style={[s.cardBody, { marginBottom: 20 }]}>Not what felt safe — what felt interesting.</Text>

              <View style={s.card}>
                <Text style={s.label}>What looked good to you?</Text>
                <TextInput style={s.textarea} multiline placeholder="What caught your eye?" placeholderTextColor={COLORS.muted} value={socialMenuLooks} onChangeText={setSocialMenuLooks}  maxLength={500} />
              </View>

              <View style={s.card}>
                <Text style={s.label}>Was anything scary on the menu?</Text>
                <TextInput style={s.textarea} multiline placeholder="You can be honest here..." placeholderTextColor={COLORS.muted} value={socialMenuScary} onChangeText={setSocialMenuScary}  maxLength={500} />
                {socialMenuScary.length > 3 && (
                  <View style={{ backgroundColor: COLORS.warm, borderRadius: 10, padding: 12, marginTop: 10 }}>
                    <Text style={{ fontSize: 13, color: COLORS.text, fontStyle: "italic", lineHeight: 20 }}>
                      💛 Something feels scary — and you're facing it anyway just by being here. Fear about food doesn't mean the food is dangerous. Your body knows how to handle this.
                    </Text>
                  </View>
                )}
              </View>

              <View style={s.card}>
                <Text style={s.label}>Can you give yourself permission to change your mind when you get there?</Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                  {[["Yes 💚", "yes"], ["I'll try", "try"], ["Not sure", "unsure"]].map(([label, val]: any) => (
                    <Pressable key={label} onPress={() => setSocialFlexible(val)}
                      style={{ flex: 1, borderRadius: 10, padding: 12, alignItems: "center", borderWidth: 2,
                        borderColor: socialFlexible === val ? COLORS.terracotta : COLORS.border,
                        backgroundColor: socialFlexible === val ? COLORS.warm : COLORS.card }}>
                      <Text style={{ color: socialFlexible === val ? COLORS.text : COLORS.muted, fontSize: 13, fontWeight: socialFlexible === val ? "bold" : "normal" }}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
                {socialFlexible !== null && (
                  <Text style={{ fontSize: 12, color: COLORS.sage, fontStyle: "italic", marginTop: 10 }}>
                    {socialFlexible !== "unsure" ? "That flexibility is recovery. 💚" : "That's okay — just noticing is enough."}
                  </Text>
                )}
              </View>

              <Pressable style={s.btn} onPress={() => setSocialStep("affirmation")}>
                <Text style={s.btnText}>Next →</Text>
              </Pressable>
            </View>
          )}

          {/* ── AFFIRMATION ── */}
          {socialStep === "affirmation" && (
            <View>
              <Text style={[s.h2, { marginTop: 16 }]}>You're ready.</Text>
              <View style={{ backgroundColor: COLORS.dark, borderRadius: 20, padding: 28, marginVertical: 20, alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontFamily: "PlayfairDisplay_600SemiBold_Italic", color: "#F7F4EE", textAlign: "center", lineHeight: 28 }}>
                  {getSocialAffirmation()}
                </Text>
                {socialWorry.length > 3 && (
                  <Text style={{ fontSize: 14, color: COLORS.sage, textAlign: "center", fontStyle: "italic", marginTop: 16, lineHeight: 22 }}>
                    You're carrying a lot going into this. The anxiety you feel doesn't mean something is wrong — it means you're doing something brave.
                  </Text>
                )}
              </View>

              <View style={{ backgroundColor: COLORS.warm, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: COLORS.terracotta, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>At the table, remember</Text>
                <Text style={{ fontSize: 13, color: COLORS.text, lineHeight: 22, marginBottom: 6 }}>🤍 Nobody can see what you're carrying inside right now.</Text>
                <Text style={{ fontSize: 13, color: COLORS.text, lineHeight: 22, marginBottom: 6 }}>🍽️ Your plate is yours. Theirs is theirs.</Text>
                <Text style={{ fontSize: 13, color: COLORS.text, lineHeight: 22, marginBottom: 6 }}>🌊 You don't have to finish at the same pace as everyone else.</Text>
                <Text style={{ fontSize: 13, color: COLORS.text, lineHeight: 22 }}>💚 You don't need a perfect environment to deserve nourishment.</Text>
              </View>

              <Pressable style={s.btn} onPress={() => setSocialStep("during")}>
                <Text style={s.btnText}>I'm at the meal — during support →</Text>
              </Pressable>
              <Pressable style={{ padding: 14, alignItems: "center" }} onPress={() => setSocialStep("after")}>
                <Text style={{ color: COLORS.muted, fontSize: 13, fontStyle: "italic" }}>skip to after the meal</Text>
              </Pressable>
            </View>
          )}

          {/* ── DURING ── */}
          {socialStep === "during" && (
            <View>
              <Text style={[s.h2, { marginTop: 16 }]}>You're doing it.</Text>
              <Text style={[s.cardBody, { marginBottom: 20 }]}>Quick support for right now, at the table.</Text>

              <View style={[s.card, { backgroundColor: COLORS.dark, borderColor: COLORS.dark }]}>
                <Text style={{ fontSize: 13, color: "#7AB8C8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Nobody can see this</Text>
                <Text style={{ fontSize: 16, color: "#F7F4EE", lineHeight: 26, marginBottom: 8 }}>You are sitting at a table, managing something enormous, and nobody around you knows. That is not weakness. That is survival.</Text>
              </View>

              <View style={s.card}>
                <Text style={{ fontSize: 13, fontWeight: "bold", color: COLORS.terracotta, marginBottom: 12 }}>🌬️ One breath right now</Text>
                <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22, marginBottom: 4 }}>In for 4 · Hold for 4 · Out for 6</Text>
                <Text style={{ fontSize: 13, color: COLORS.muted, fontStyle: "italic" }}>Just once. Nobody will notice.</Text>
              </View>

              <View style={s.card}>
                <Text style={{ fontSize: 13, fontWeight: "bold", color: COLORS.terracotta, marginBottom: 12 }}>🍽️ On pacing</Text>
                <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22 }}>You don't have to eat at the same speed as the people around you. Put your fork down between bites if that helps. Take a sip of water. There is no right pace.</Text>
              </View>

              <View style={s.card}>
                <Text style={{ fontSize: 13, fontWeight: "bold", color: COLORS.terracotta, marginBottom: 12 }}>👁️ On comparison</Text>
                <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22 }}>If you notice yourself looking at other plates — that's okay, it happens. Gently bring your eyes back to your own. Your plate is yours. Theirs is theirs.</Text>
              </View>

              <View style={s.card}>
                <Text style={{ fontSize: 13, fontWeight: "bold", color: COLORS.terracotta, marginBottom: 12 }}>💬 If someone comments on your food</Text>
                <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22, marginBottom: 12 }}>
                  You are allowed to be at this table. You don't owe anyone an explanation about what's on your plate. If someone comments, that's about them — not about you or your recovery.
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22, marginBottom: 12 }}>
                  A subject change, silence, or simply continuing to eat are all valid responses. You are entitled to your own recovery — even when others don't understand it.
                </Text>
                <View style={{ backgroundColor: COLORS.warm, borderRadius: 10, padding: 12 }}>
                  <Text style={{ fontSize: 13, color: COLORS.text, fontStyle: "italic", lineHeight: 20 }}>
                    💛 You do not have to justify yourself to anyone — not a friend, not a colleague, not a parent. Your recovery belongs to you.
                  </Text>
                </View>
              </View>

              <Pressable style={s.btn} onPress={() => setSocialStep("after")}>
                <Text style={s.btnText}>After the meal →</Text>
              </Pressable>
            </View>
          )}

          {/* ── AFTER ── */}
          {socialStep === "after" && (
            <View>
              <Text style={[s.h2, { marginTop: 16 }]}>You did it.</Text>
              <Text style={[s.cardBody, { marginBottom: 20 }]}>Let's process how it went — just for you.</Text>

              <View style={s.card}>
                <Text style={s.label}>Overall how did it go? (1–10)</Text>
                <Text style={{ fontSize: 28, textAlign: "center", marginBottom: 8 }}>{socialOverallRating}/10</Text>
                <View style={{ flexDirection: "row", gap: 4 }}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <Pressable key={i} onPress={() => setSocialOverallRating(i + 1)}
                      style={{ flex: 1, height: 28, borderRadius: 6, backgroundColor: i < socialOverallRating ? COLORS.terracotta : COLORS.border }} />
                  ))}
                </View>
              </View>

              <View style={s.card}>
                <Text style={s.label}>What was the hardest moment?</Text>
                <TextInput style={s.textarea} multiline placeholder="You don't have to minimize it here..." placeholderTextColor={COLORS.muted} value={socialHardestMoment} onChangeText={setSocialHardestMoment}  maxLength={500} />
              </View>

              <View style={s.card}>
                <Text style={s.label}>What did you handle that nobody knew about?</Text>
                <TextInput style={s.textarea} multiline placeholder="What were you carrying at that table that was invisible to everyone else?" placeholderTextColor={COLORS.muted} value={socialHiddenStrength} onChangeText={setSocialHiddenStrength}  maxLength={500} />
              </View>

              <Pressable style={s.btn} onPress={() => setSocialStep("reframe")}>
                <Text style={s.btnText}>Reframe a thought →</Text>
              </Pressable>
              <Pressable style={{ padding: 14, alignItems: "center" }} onPress={() => setSocialStep("done")}>
                <Text style={{ color: COLORS.muted, fontSize: 13, fontStyle: "italic" }}>I'm done, skip reframing</Text>
              </Pressable>
            </View>
          )}

          {/* ── REFRAME ── */}
          {socialStep === "reframe" && (
            <View>
              <Text style={[s.h2, { marginTop: 16 }]}>Reframe a thought.</Text>
              <Text style={[s.cardBody, { marginBottom: 20 }]}>Pick a thought that came up — or write your own.</Text>

              {Object.keys(SOCIAL_REFRAMES).map(thought => (
                <Pressable key={thought} onPress={() => setSocialReframePick(socialReframePick === thought ? "" : thought)}
                  style={{ borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 2,
                    borderColor: socialReframePick === thought ? COLORS.terracotta : COLORS.border,
                    backgroundColor: socialReframePick === thought ? COLORS.warm : COLORS.card }}>
                  <Text style={{ fontSize: 13, color: COLORS.text, fontStyle: "italic", lineHeight: 20 }}>"{thought}"</Text>
                </Pressable>
              ))}

              {socialReframePick && (
                <View style={{ backgroundColor: COLORS.dark, borderRadius: 14, padding: 20, marginTop: 8, marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: "#7AB8C8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>A different way to see it</Text>
                  <Text style={{ fontSize: 14, color: "#F7F4EE", lineHeight: 24, fontStyle: "italic" }}>{SOCIAL_REFRAMES[socialReframePick]}</Text>
                </View>
              )}

              <View style={[s.card, { marginTop: 16 }]}>
                <Text style={s.label}>Or write your own thought</Text>
                <TextInput style={s.textarea} multiline placeholder="A thought that's stuck with you..." placeholderTextColor={COLORS.muted} value={socialCustomThought} onChangeText={setSocialCustomThought}  maxLength={500} />
                {socialCustomThought.length > 3 && (
                  <>
                    <Text style={[s.label, { marginTop: 12 }]}>What would you say to a friend who thought this?</Text>
                    <TextInput style={s.textarea} multiline placeholder="Be as kind to yourself as you would be to them..." placeholderTextColor={COLORS.muted} value={socialCustomReframe} onChangeText={setSocialCustomReframe}  maxLength={500} />
                  </>
                )}
              </View>

              <Pressable style={s.btn} onPress={() => setSocialStep("done")}>
                <Text style={s.btnText}>Finish →</Text>
              </Pressable>
            </View>
          )}

          {/* ── DONE ── */}
          {socialStep === "done" && (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🫂</Text>
              <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 28, color: COLORS.text, textAlign: "center", marginBottom: 12 }}>
                That took courage.
              </Text>
              <Text style={{ fontSize: 15, color: COLORS.muted, textAlign: "center", lineHeight: 24, marginBottom: 8, fontStyle: "italic" }}>
                Social eating is one of the hardest parts of recovery. You showed up anyway.
              </Text>
              {socialHiddenStrength.length > 3 && (
                <View style={{ backgroundColor: COLORS.dark, borderRadius: 16, padding: 20, marginVertical: 20, width: "100%" }}>
                  <Text style={{ fontSize: 12, color: "#7AB8C8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, textAlign: "center" }}>What you carried invisibly</Text>
                  <Text style={{ fontSize: 15, color: "#F7F4EE", fontStyle: "italic", textAlign: "center", lineHeight: 24 }}>"{socialHiddenStrength}"</Text>
                  <Text style={{ fontSize: 13, color: COLORS.sage, textAlign: "center", marginTop: 12 }}>That is your proof. 💚</Text>
                </View>
              )}
              <View style={[s.card, { backgroundColor: "#F0F7F1", borderColor: "#B5D4BA", width: "100%", marginBottom: 8 }]}>
                <Text style={{ fontSize: 13, color: "#3D6B45", textAlign: "center", lineHeight: 20 }}>💚 This meal has been saved to your evidence journal.</Text>
              </View>
              <Pressable style={[s.btn, { width: "100%", marginTop: 8 }]} onPress={async () => {
                await saveSocialMeal();
                resetSocial();
                await startWaveTimer();
                setScreen("home");
              }}>
                <Text style={s.btnText}>Start the wave timer →</Text>
              </Pressable>
              <Pressable style={[s.btnOutline, { width: "100%", marginTop: 8 }]} onPress={async () => {
                await saveSocialMeal();
                resetSocial();
                setScreen("home");
              }}>
                <Text style={s.btnOutlineText}>Skip timer — go home</Text>
              </Pressable>
              <Pressable style={{ padding: 14 }} onPress={() => { resetSocial(); setScreen("home"); }}>
                <Text style={{ color: COLORS.muted, fontSize: 13 }}>Back to home without saving</Text>
              </Pressable>
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─── CHALLENGE FOODS SCREEN ───────────────────────────────────────────
  if (screen === "fearfoods") return (
    <SafeAreaView style={s.safe}>
      {globalModals}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <TouchableOpacity onPress={() => setScreen("progress")}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
          <Text style={s.logo}>Challenge Foods</Text>
          <View style={{ width: 50 }} />
        </View>

        {!fearFoodUnlocked ? (
          <View style={{ paddingTop: 24 }}>
            <View style={[s.card, { backgroundColor: "#F0F7F1", borderColor: "#B5D4BA", alignItems: "center" }]}>
              <Text style={{ fontSize: 32, marginBottom: 12 }}>🌿</Text>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: COLORS.text, textAlign: "center", marginBottom: 8 }}>Building your foundation</Text>
              <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", lineHeight: 22, marginBottom: 16 }}>Challenge foods unlock after {FEAR_FOOD_UNLOCK_COUNT} meals. You've logged {pastMeals.length} so far.</Text>
              <View style={{ width: "100%", height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                <View style={{ width: `${(pastMeals.length / FEAR_FOOD_UNLOCK_COUNT) * 100}%`, height: 8, backgroundColor: COLORS.sage, borderRadius: 4 }} />
              </View>
              <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 8 }}>{pastMeals.length} of {FEAR_FOOD_UNLOCK_COUNT} meals</Text>
            </View>
          </View>
        ) : (
          <View style={{ paddingTop: 8 }}>
            <Text style={[s.cardBody, { marginBottom: 16 }]}>Foods you're working toward. When you're ready, tap one to begin.</Text>
            {fearFoods.length === 0 && (
              <View style={[s.card, { alignItems: "center" }]}>
                <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", lineHeight: 22 }}>You haven't added any challenge foods yet.</Text>
              </View>
            )}
            {fearFoods.map((food, i) => {
              const scheduled = scheduledFearFoods.find(s => s.foodId === food.id);
              const done = fearFoodAttempts.some((a: any) => a.fear_food_id === food.id);
              return (
                <View key={i} style={[s.card, { gap: 12 }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, color: COLORS.text, fontWeight: "600", marginBottom: 4 }}>{food.food}</Text>
                      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        {done && (
                          <View style={s.tagGreen}><Text style={s.tagGreenText}>Done ✓</Text></View>
                        )}
                        {scheduled && !done && (
                          <View style={s.tagBlue}><Text style={s.tagBlueText}>📅 {new Date(scheduled.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Text></View>
                        )}
                        {!done && !scheduled && (
                          <View style={s.tagWave}><Text style={s.tagWaveText}>Not yet scheduled</Text></View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity style={{ backgroundColor: COLORS.terracotta, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }} onPress={() => { setActiveChallengeFood(food); setChallengeStep("safety"); }}>
                      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "bold" }}>I'm ready</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, alignItems: "center" }}
                    onPress={() => {
                      setScheduleTarget(food);
                      setScheduleDate(scheduled?.date || "");
                      if (scheduled?.date) {
                        const d = new Date(scheduled.date + "T12:00:00");
                        setSchedulePickerDate({ month: d.getMonth() + 1, day: d.getDate(), year: d.getFullYear() });
                      } else {
                        const today = new Date();
                        setSchedulePickerDate({ month: today.getMonth() + 1, day: today.getDate(), year: today.getFullYear() });
                      }
                      setShowScheduleModal(true);
                    }}>
                    <Text style={{ fontSize: 12, color: COLORS.muted }}>📅 {scheduled ? "Change scheduled date" : "Schedule for a day"}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            <TouchableOpacity style={s.btnOutline} onPress={() => { setSelectedCategories([]); setManualFearFood(""); setScreen("addfearfood"); }}><Text style={s.btnOutlineText}>+ Add a challenge food</Text></TouchableOpacity>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Schedule modal */}
      <Modal visible={showScheduleModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: COLORS.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28 }}>
            <Text style={[s.h2, { marginBottom: 4 }]}>Schedule a day</Text>
            <Text style={[s.cardBody, { marginBottom: 20 }]}>Pick a date for <Text style={{ fontWeight: "bold", color: COLORS.text }}>{scheduleTarget?.food}</Text>. We'll remind you the day before and the morning of.</Text>

            {/* Inline date picker */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
              {/* Month */}
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={[s.label, { marginBottom: 8 }]}>Month</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <TouchableOpacity onPress={() => setSchedulePickerDate(d => ({ ...d, month: d.month > 1 ? d.month - 1 : 12 }))} style={{ padding: 8 }}><Text style={{ fontSize: 18, color: COLORS.terracotta }}>‹</Text></TouchableOpacity>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: COLORS.text, minWidth: 28, textAlign: "center" }}>{schedulePickerDate.month}</Text>
                  <TouchableOpacity onPress={() => setSchedulePickerDate(d => ({ ...d, month: d.month < 12 ? d.month + 1 : 1 }))} style={{ padding: 8 }}><Text style={{ fontSize: 18, color: COLORS.terracotta }}>›</Text></TouchableOpacity>
                </View>
              </View>
              {/* Day */}
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={[s.label, { marginBottom: 8 }]}>Day</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <TouchableOpacity onPress={() => setSchedulePickerDate(d => ({ ...d, day: d.day > 1 ? d.day - 1 : 31 }))} style={{ padding: 8 }}><Text style={{ fontSize: 18, color: COLORS.terracotta }}>‹</Text></TouchableOpacity>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: COLORS.text, minWidth: 28, textAlign: "center" }}>{schedulePickerDate.day}</Text>
                  <TouchableOpacity onPress={() => setSchedulePickerDate(d => ({ ...d, day: d.day < 31 ? d.day + 1 : 1 }))} style={{ padding: 8 }}><Text style={{ fontSize: 18, color: COLORS.terracotta }}>›</Text></TouchableOpacity>
                </View>
              </View>
              {/* Year */}
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={[s.label, { marginBottom: 8 }]}>Year</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <TouchableOpacity onPress={() => setSchedulePickerDate(d => ({ ...d, year: d.year - 1 }))} style={{ padding: 8 }}><Text style={{ fontSize: 18, color: COLORS.terracotta }}>‹</Text></TouchableOpacity>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: COLORS.text, minWidth: 40, textAlign: "center" }}>{schedulePickerDate.year}</Text>
                  <TouchableOpacity onPress={() => setSchedulePickerDate(d => ({ ...d, year: d.year + 1 }))} style={{ padding: 8 }}><Text style={{ fontSize: 18, color: COLORS.terracotta }}>›</Text></TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={s.btn} onPress={async () => {
              const { month, day, year } = schedulePickerDate;
              const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              await scheduleFearFoodNotifications(scheduleTarget.food, dateStr, scheduleTarget.id);
              setShowScheduleModal(false);
            }}>
              <Text style={s.btnText}>Set reminder 💚</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 14, alignItems: "center" }} onPress={() => setShowScheduleModal(false)}>
              <Text style={{ color: COLORS.muted, fontSize: 13 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );

  // ─── ADD FEAR FOOD ────────────────────────────────────────────────────
  if (screen === "addfearfood") return (
    <SafeAreaView style={s.safe}>
      {globalModals}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <TouchableOpacity onPress={() => setScreen("fearfoods")}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
          <Text style={s.logo}>Add a food</Text>
          <View style={{ width: 50 }} />
        </View>
        <Text style={[s.cardBody, { marginTop: 8 }]}>Add a food you want to work toward feeling more comfortable with. Go at your own pace.</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          {FEAR_FOOD_CATEGORIES.map(cat => {
            const sel = selectedCategories.includes(cat.label);
            return (
              <TouchableOpacity key={cat.label} style={{ backgroundColor: sel ? COLORS.terracotta : COLORS.card, borderWidth: 1, borderColor: sel ? COLORS.terracotta : COLORS.border, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}
                onPress={() => setSelectedCategories(p => sel ? p.filter(c => c !== cat.label) : [...p, cat.label])}>
                <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
                <Text style={{ fontSize: 13, color: sel ? "#fff" : COLORS.text }}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[s.label, { marginBottom: 8 }]}>Or write your own</Text>
        <TextInput style={[s.input, { marginBottom: 20 }]} placeholder="e.g. pasta, eating out, dessert" placeholderTextColor={COLORS.muted} value={manualFearFood} onChangeText={setManualFearFood}  maxLength={200} />
        <TouchableOpacity style={s.btn} onPress={async () => {
          const all = [...selectedCategories, ...manualFearFood.split(",").map(f => f.trim()).filter(f => f.length > 0)];
          if (all.length === 0) { Alert.alert("Add at least one food"); return; }
          await supabase.from("fear_foods").insert(all.map(f => ({ food: f, user_id: session?.user?.id })));
          await fetchFearFoods(); fetchFearFoodAttempts(); setSelectedCategories([]); setManualFearFood(""); setScreen("fearfoods");
        }}>
          <Text style={s.btnText}>Save →</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // ─── COPING SKILLS ────────────────────────────────────────────────────
  if (screen === "cope") return (
    <SafeAreaView style={[s.safe, { backgroundColor: COLORS.dark }]}>
      {globalModals}
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setScreen("home")}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
          <Text style={s.logo}>Cope</Text>
          <View style={{ width: 50 }} />
        </View>
        <Text style={[s.cardBody, { marginTop: 8 }]}>Tools for hard moments — right now and before they happen.</Text>

        {/* Social Eating Card */}
        <TouchableOpacity style={[s.card, { borderLeftWidth: 4, borderLeftColor: COLORS.sage, backgroundColor: COLORS.warm }]} onPress={() => { setSocialStep("situation"); setActiveChallengeFood(null); setScreen("social"); }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ fontSize: 28 }}>🫂</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "bold", color: COLORS.text }}>Social Eating</Text>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Prepare for, get through, and process a meal with others</Text>
            </View>
            <Text style={{ color: COLORS.muted, fontSize: 18 }}>→</Text>
          </View>
        </TouchableOpacity>

        <Text style={[s.label, { marginTop: 8, marginBottom: 12 }]}>Coping Skills</Text>
        {favoriteCopingSkills.length > 0 && (
          <>
            <Text style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Saved</Text>
            {COPING_SKILLS.filter(skill => favoriteCopingSkills.includes(skill.id)).map(skill => (
              <TouchableOpacity key={skill.id} style={[s.card, { borderLeftWidth: 4, borderLeftColor: skill.color }]} onPress={() => { setActiveCopingSkill(skill); setCopingStep(0); setCopingNote(""); setCopingReturnTo("cope"); }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Text style={{ fontSize: 28 }}>{skill.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "bold", color: COLORS.text }}>{skill.title}</Text>
                    <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{skill.subtitle}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleFavoriteCoping(skill.id)} style={{ padding: 8 }}>
                    <Text style={{ fontSize: 18 }}>💚</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            <Text style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8, marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>All skills</Text>
          </>
        )}
        {COPING_SKILLS.map(skill => (
          <TouchableOpacity key={skill.id} style={[s.card, { borderLeftWidth: 4, borderLeftColor: skill.color }]} onPress={() => { setActiveCopingSkill(skill); setCopingStep(0); setCopingNote(""); setCopingReturnTo("cope"); }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontSize: 28 }}>{skill.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "bold", color: COLORS.text }}>{skill.title}</Text>
                <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{skill.subtitle}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavoriteCoping(skill.id)} style={{ padding: 8 }}>
                <Text style={{ fontSize: 18 }}>{favoriteCopingSkills.includes(skill.id) ? "💚" : "🤍"}</Text>
              </TouchableOpacity>
              <View style={{ backgroundColor: skill.color, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 11, color: "#fff", fontWeight: "bold" }}>{skill.duration}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
      </View>
      {tabBar}
    </SafeAreaView>
  );

  // ─── LOG MEAL ─────────────────────────────────────────────────────────
  if (screen === "log") return (
    <SafeAreaView style={[s.safe, { backgroundColor: COLORS.dark }]}>
      {crisisModal}
      {globalModals}
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setScreen("home")}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
          <Text style={s.logo}>Log a Meal</Text>
          <View style={{ width: 50 }} />
        </View>
        <TouchableOpacity style={{ backgroundColor: COLORS.text, borderRadius: 14, padding: 16, marginVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }} onPress={() => setShowCrisis(true)}>
          <IconHeart size={20} color="#F7F4EE" />
          <Text style={{ color: "#F7F4EE", fontSize: 15, fontWeight: "bold" }}>I feel like I can't do this</Text>
        </TouchableOpacity>
        <Text style={[s.cardBody, { marginTop: 4 }]}>Be honest with yourself — this is your safe space.</Text>

        {/* Before meal photo — only shown if clinician has enabled */}
        {photosEnabled && <View style={s.card}>
          <Text style={s.label}>Before meal photo</Text>
          <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12, lineHeight: 18 }}>Optional — only visible to your care team, not to you.</Text>
          {mealPhotoUri ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ backgroundColor: COLORS.sage, borderRadius: 10, padding: 10, flex: 1 }}>
                <Text style={{ fontSize: 13, color: "#fff", fontWeight: "600" }}>📷 Photo captured</Text>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Sent to your care team only</Text>
              </View>
              <TouchableOpacity onPress={() => setMealPhotoUri(null)} style={{ padding: 8 }}>
                <Text style={{ fontSize: 13, color: COLORS.muted }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={takeMealPhoto} style={{ flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 14 }}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={COLORS.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <Circle cx="12" cy="13" r="4" stroke={COLORS.muted} strokeWidth="1.8" />
                    </Svg>
              <Text style={{ fontSize: 14, color: COLORS.muted }}>Take a photo</Text>
            </TouchableOpacity>
          )}
        </View>}

        {[["What did you eat?", "meal", "e.g. scrambled eggs, toast, orange juice", false],
          ["🧠 Thoughts before or during", "thoughts", "What was going through your mind?", true],
          ["🫀 Physical sensations", "sensations", "What did you feel in your body?", true],
          ["⚡ Urges & behaviors", "urges", "Any urges to restrict, purge, or compensate? (no judgment here)", true]
        ].map(([label, key, placeholder, multi]: any) => (
          <View key={key} style={s.card}>
            <Text style={s.label}>{label}</Text>
            <TextInput style={multi ? s.textarea : s.input} multiline={multi} placeholder={placeholder} placeholderTextColor={COLORS.muted} value={(logData as any)[key]} onChangeText={t => setLogData({ ...logData, [key]: t })} />
          </View>
        ))}
        <TouchableOpacity style={s.btn} onPress={() => { setPostMealStep(0); setBreathPhase(0); setBreathCount(0); setBreathProgress(0); setScreen("postmeal"); }}>
          <Text style={s.btnText}>Finish & Start Post-Meal Routine →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnOutline} onPress={async () => {
          const mealId = await saveMeal();
          if (mealId) {
            await scheduleCheckinNotifications(mealId, logData.meal, new Date());
            setLogData({ meal: "", thoughts: "", sensations: "", urges: "" });
            setReappraisal("");
            setScreen("home");
          }
        }}>
          <Text style={s.btnOutlineText}>Save & Skip Routine</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
      </View>
      {tabBar}
    </SafeAreaView>
  );

  // ─── POST MEAL ────────────────────────────────────────────────────────
  if (screen === "postmeal") return (
    <SafeAreaView style={s.safe}>
      {crisisModal}
      {globalModals}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <TouchableOpacity onPress={() => setScreen("home")}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
          <Text style={s.logo}>Post-Meal</Text>
          <TouchableOpacity onPress={() => setPostMealStep(4)}><Text style={{ fontSize: 12, color: COLORS.muted }}>Skip →</Text></TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginVertical: 16 }}>
          {[0, 1, 2, 3, 4].map(i => <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: postMealStep === i ? COLORS.terracotta : COLORS.border }} />)}
        </View>

        {postMealStep === 0 && (
          <View style={{ alignItems: "center" }}>
            <Text style={s.h2}>Breathe with me.</Text>
            <Text style={[s.cardBody, { textAlign: "center" }]}>Your nervous system is activated. Let's slow it down. Complete 3 breath cycles.</Text>
            <View style={{ width: 200, height: 200, alignItems: "center", justifyContent: "center", marginVertical: 24 }}>
              <Svg width="200" height="200" style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
                <Circle cx="100" cy="100" r={radius} fill="none" stroke={COLORS.border} strokeWidth="8" />
                <Circle cx="100" cy="100" r={radius} fill="none" stroke={currentBreathStep.color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${circumference}`} strokeDashoffset={`${circumference * (1 - breathProgress)}`} />
              </Svg>
              <Text style={{ fontSize: 22, fontWeight: "bold", color: COLORS.text }}>{currentBreathStep.label}</Text>
              <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{breathCount}/3 cycles</Text>
            </View>
            <Text style={{ color: COLORS.muted, fontSize: 13 }}>{breathCount >= 3 ? "Beautiful. Moving on..." : "Breathe at your own pace."}</Text>
          </View>
        )}

        {postMealStep === 1 && (
          <View>
            <Text style={s.h2}>How are you feeling right now?</Text>
            <Text style={s.cardBody}>Rate each emotion honestly.</Text>
            <View style={s.card}>
              {EMOTIONS.map(e => <EmotionSlider key={e} label={e} value={emotions[e]} onChange={v => setEmotions((p: any) => ({ ...p, [e]: v }))} />)}
              <EmotionSlider label="Physical Discomfort" value={emotions.Physical} onChange={v => setEmotions((p: any) => ({ ...p, Physical: v }))} />
            </View>
            <TouchableOpacity style={s.btn} onPress={async () => { setCheckinType("initial"); await saveCheckin(); setPostMealStep(2); }}><Text style={s.btnText}>Continue →</Text></TouchableOpacity>
          </View>
        )}

        {postMealStep === 2 && (
          <View>
            <Text style={s.h2}>Let's reframe a thought.</Text>
            <Text style={s.cardBody}>You wrote: <Text style={{ color: COLORS.terracotta, fontStyle: "italic" }}>"{logData.thoughts || "something difficult"}"</Text></Text>
            <View style={s.card}>
              <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 24, marginBottom: 16 }}>🔄 <Text style={{ fontWeight: "bold" }}>Reappraisal prompts:</Text>{"\n\n"}• Is that thought a fact, or the eating disorder talking?{"\n"}• What would you say to a friend?{"\n"}• What's a kinder interpretation?</Text>
              <Text style={s.label}>Write a kinder thought</Text>
              <TextInput style={s.textarea} multiline placeholder="e.g. 'I ate because my body needs fuel.'" placeholderTextColor={COLORS.muted} value={reappraisal} onChangeText={setReappraisal}  maxLength={500} />
            </View>
            <TouchableOpacity style={s.btn} onPress={() => { setAffirmIdx(Math.floor(Math.random() * affirmations.length)); setPostMealStep(3); }}><Text style={s.btnText}>Continue →</Text></TouchableOpacity>
            <TouchableOpacity style={{ padding: 16, alignItems: "center" }} onPress={() => { setReappraisal("My thoughts were already kind."); setAffirmIdx(Math.floor(Math.random() * affirmations.length)); setPostMealStep(3); }}>
              <Text style={{ fontSize: 13, color: COLORS.sage, fontStyle: "italic" }}>my thoughts were already kind 💚</Text>
            </TouchableOpacity>
          </View>
        )}

        {postMealStep === 3 && (
          <View>
            <Text style={s.h2}>You've been here before.</Text>
            <Text style={s.cardBody}>These are meals you logged. Evidence that you can do hard things.</Text>
            {loading ? <ActivityIndicator color={COLORS.terracotta} /> : pastMeals.filter(m => !m.meal?.startsWith("Moment check-in")).slice(0, 3).map((m, i) => (
              <View key={i} style={s.card}>
                <Text style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>{new Date(m.created_at).toLocaleDateString()} · {m.meal}</Text>
                {m.reappraisal ? <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22, fontStyle: "italic" }}>"{m.reappraisal}"</Text> : null}
              </View>
            ))}
            {pastMeals.length === 0 && <View style={s.card}><Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22, fontStyle: "italic" }}>This is your first logged meal. You're building your evidence right now. 💚</Text></View>}
            <View style={[s.card, { backgroundColor: "#F0F7F1", borderColor: "#B5D4BA", alignItems: "center" }]}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>💚</Text>
              <Text style={{ fontSize: 15, color: "#3D6B45", fontStyle: "italic", lineHeight: 24, textAlign: "center" }}>{affirmations[affirmIdx]}</Text>
            </View>
            <TouchableOpacity style={s.btn} onPress={() => setPostMealStep(4)}><Text style={s.btnText}>I'm ready to finish →</Text></TouchableOpacity>
          </View>
        )}

        {postMealStep === 4 && (
          <View style={{ alignItems: "center", paddingTop: 32 }}>
            <Text style={{ fontSize: 60, marginBottom: 16 }}>🌿</Text>
            <Text style={[s.h2, { textAlign: "center" }]}>You did it.</Text>
            <Text style={[s.cardBody, { textAlign: "center", fontSize: 16 }]}>You ate. You stayed with the discomfort. You chose yourself.</Text>
            <View style={[s.card, { width: "100%", marginTop: 24 }]}>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>YOUR KINDER THOUGHT</Text>
              <Text style={{ fontSize: 14, color: COLORS.text, fontStyle: "italic", lineHeight: 22 }}>"{reappraisal || "I nourished my body today."}"</Text>
            </View>

            {/* After meal photo — only shown if clinician has enabled */}
            {photosEnabled && <View style={[s.card, { width: "100%", marginTop: 0 }]}>
              <Text style={s.label}>After meal photo</Text>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12, lineHeight: 18 }}>Optional — only visible to your care team, not to you.</Text>
              {mealPhotoUri ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ backgroundColor: COLORS.sage, borderRadius: 10, padding: 10, flex: 1 }}>
                    <Text style={{ fontSize: 13, color: "#fff", fontWeight: "600" }}>📷 Photo captured</Text>
                    <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Sent to your care team only</Text>
                  </View>
                  <TouchableOpacity onPress={() => setMealPhotoUri(null)} style={{ padding: 8 }}>
                    <Text style={{ fontSize: 13, color: COLORS.muted }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={takeMealPhoto} style={{ flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 14 }}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={COLORS.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <Circle cx="12" cy="13" r="4" stroke={COLORS.muted} strokeWidth="1.8" />
                    </Svg>
                  <Text style={{ fontSize: 14, color: COLORS.muted }}>Take a photo</Text>
                </TouchableOpacity>
              )}
            </View>}

            <TouchableOpacity style={[s.btn, { width: "100%" }]} onPress={async () => {
              if (saving) return;
              const mealId = await saveMeal();
              if (mealId) {
                if (mealPhotoUri) { await uploadMealPhoto(mealId, mealPhotoUri, "after"); setMealPhotoUri(null); }
                await scheduleCheckinNotifications(mealId, logData.meal, new Date());
                setLogData({ meal: "", thoughts: "", sensations: "", urges: "" });
                setReappraisal("");
                await startWaveTimer(mealId);
                setScreen("home");
              }
            }}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save & Ride the Wave 🌊</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[s.btnOutline, { width: "100%" }]} disabled={saving} onPress={async () => {
              if (saving) return;
              const mealId = await saveMeal();
              if (mealId) {
                if (mealPhotoUri) { await uploadMealPhoto(mealId, mealPhotoUri, "after"); setMealPhotoUri(null); }
                await scheduleCheckinNotifications(mealId, logData.meal, new Date());
                setLogData({ meal: "", thoughts: "", sensations: "", urges: "" });
                setReappraisal("");
                setScreen("home");
              }
            }}>
              <Text style={s.btnOutlineText}>Save & Return Home</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // ─── MY WHYS ──────────────────────────────────────────────────────────
  // ─── WEEKLY SUMMARY ───────────────────────────────────────────────────
  if (screen === "weeklysummary") {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + (weekOffset * 7));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const isCurrentWeek = weekOffset === 0;
    const weekLabel = isCurrentWeek ? "This Week"
      : weekOffset === -1 ? "Last Week"
      : weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " – " + weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const weekMeals = pastMeals.filter((m: any) => { const d = new Date(m.created_at); return d >= weekStart && d <= weekEnd; });
    const weekMealsMeals = weekMeals.filter((m: any) => !m.meal?.startsWith("Moment check-in"));
    const weekMoments = weekMeals.filter((m: any) => m.meal?.startsWith("Moment check-in"));
    const weekCheckins = checkins.filter((c: any) => { const d = new Date(c.created_at); return d >= weekStart && d <= weekEnd; });
    const daysActive = new Set(weekMealsMeals.map((m: any) => new Date(m.created_at).toDateString())).size;
    const routinesDone = weekMealsMeals.filter((m: any) => m.reappraisal).length;
    const avg = (key: string) => {
      const vals = weekCheckins.map((c: any) => c[key]).filter((v: any) => v != null);
      return vals.length ? (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(1) : null;
    };
    const emotionData = [
      { label: "Anxiety", key: "anxiety", color: "#E8896A", bg: "rgba(232,137,106,0.15)" },
      { label: "Guilt", key: "guilt", color: "#E8A87C", bg: "rgba(232,168,124,0.15)" },
      { label: "Shame", key: "shame", color: "#7AB8C8", bg: "rgba(122,184,200,0.15)" },
      { label: "Fear", key: "fear", color: "#9BB8D4", bg: "rgba(155,184,212,0.15)" },
      { label: "Sadness", key: "sadness", color: "#B8A8C8", bg: "rgba(184,168,200,0.15)" },
    ];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });
    const dailyCounts = last7Days.map(d => ({
      label: days[d.getDay()],
      count: weekMealsMeals.filter((m: any) => new Date(m.created_at).toDateString() === d.toDateString()).length,
      isToday: d.toDateString() === now.toDateString(),
    }));
    const maxCount = Math.max(...dailyCounts.map(d => d.count), 1);
    const reappraisals = weekMealsMeals.filter((m: any) => m.reappraisal && m.reappraisal.length > 10);

    // Monthly distress buckets
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthCheckins = checkins.filter((c: any) => new Date(c.created_at) >= monthAgo);
    const monthlyBuckets: { label: string; avg: number | null; weekStart: Date }[] = Array.from({ length: 4 }, (_, wi) => {
      const bStart = new Date(now.getTime() - (4 - wi) * 7 * 24 * 60 * 60 * 1000);
      const bEnd = new Date(bStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const bCheckins = monthCheckins.filter((c: any) => { const d = new Date(c.created_at); return d >= bStart && d < bEnd; });
      const avgVal: number | null = bCheckins.length ? bCheckins.reduce((sum: number, c: any) => sum + ((c.anxiety + c.guilt + c.fear + c.shame) / 4), 0) / bCheckins.length : null;
      return { label: `W${wi + 1}`, avg: avgVal, weekStart: bStart };
    });
    const hasMonthlyData = monthlyBuckets.filter(b => b.avg !== null).length >= 2;

    return (
      <SafeAreaView style={s.safe}>
      {globalModals}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <TouchableOpacity onPress={() => setScreen("progress")}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
          <Text style={s.logo}>Summary</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Week navigator */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 12 }}>
          <TouchableOpacity onPress={() => setWeekOffset(wo => wo - 1)} style={{ padding: 8 }}>
            <Text style={{ fontSize: 22, color: COLORS.terracotta }}>‹</Text>
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: COLORS.text }}>{weekLabel}</Text>
            <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
              {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setWeekOffset(wo => Math.min(wo + 1, 0))} style={{ padding: 8, opacity: isCurrentWeek ? 0.25 : 1 }} disabled={isCurrentWeek}>
            <Text style={{ fontSize: 22, color: COLORS.terracotta }}>›</Text>
          </TouchableOpacity>
        </View>

        {weekMealsMeals.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 48, marginBottom: 20 }}>🌊</Text>
            <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 22, color: COLORS.text, textAlign: "center", marginBottom: 12 }}>
              {isCurrentWeek ? "Your week is just beginning." : "No meals logged this week."}
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.muted, textAlign: "center", lineHeight: 24, marginBottom: 32 }}>
              {isCurrentWeek ? "Log your first meal and your summary will take shape." : "Try going back to a week when you were active."}
            </Text>
            {isCurrentWeek && <TouchableOpacity style={s.btn} onPress={() => setScreen("log")}><Text style={s.btnText}>Log a meal →</Text></TouchableOpacity>}
          </View>
        ) : (<>

        <View style={[s.card, { backgroundColor: COLORS.dark, borderColor: COLORS.dark, marginBottom: 14 }]}>
          <Text style={{ fontSize: 11, color: COLORS.sage, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>At a glance</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            {[
              { n: weekMealsMeals.length, l: "Meals\nLogged", color: COLORS.sage },
              { n: routinesDone, l: "Routines\nDone", color: "#E8A87C" },
              { n: daysActive, l: "Days\nActive", color: COLORS.terracotta },
              { n: weekMoments.length, l: "Moment\ncheck-ins", color: "#C4A870" },
            ].map(({ n, l, color }: any) => (
              <View key={l} style={{ alignItems: "center", width: "22%" }}>
                <Text style={{ fontSize: 36, fontWeight: "bold", color, lineHeight: 44 }}>{n}</Text>
                <Text style={{ fontSize: 11, color: "rgba(200,223,232,0.6)", textAlign: "center", lineHeight: 16, marginTop: 6 }}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.card}>
          <Text style={[s.label, { marginBottom: 16 }]}>Meal activity</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 80, marginBottom: 8 }}>
            {dailyCounts.map(({ label, count, isToday }) => (
              <View key={label} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 10, color: COLORS.terracotta, fontWeight: "bold" }}>{count > 0 ? count : ""}</Text>
                <View style={{ width: 28, height: Math.max((count / maxCount) * 60, count > 0 ? 8 : 3), borderRadius: 6, backgroundColor: isToday ? COLORS.terracotta : count > 0 ? COLORS.sage : COLORS.border }} />
                <Text style={{ fontSize: 10, color: isToday ? COLORS.terracotta : COLORS.muted, fontWeight: isToday ? "bold" : "normal" }}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {weekCheckins.length > 0 && (
          <View style={s.card}>
            <Text style={[s.label, { marginBottom: 4 }]}>Emotion averages</Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, fontStyle: "italic", marginBottom: 16 }}>Based on {weekCheckins.length} check-in{weekCheckins.length !== 1 ? "s" : ""} this week</Text>
            {emotionData.map(e => {
              const val = avg(e.key);
              if (!val) return null;
              const pct = (parseFloat(val) / 10) * 100;
              return (
                <View key={e.key} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: e.color }} />
                      <Text style={{ fontSize: 13, color: COLORS.text, fontWeight: "500" }}>{e.label}</Text>
                    </View>
                    <View style={{ backgroundColor: e.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 12, color: e.color, fontWeight: "bold" }}>{val}/10</Text>
                    </View>
                  </View>
                  <View style={{ height: 8, backgroundColor: COLORS.border, borderRadius: 4 }}>
                    <View style={{ height: 8, width: `${pct}%`, backgroundColor: e.color, borderRadius: 4 }} />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {reappraisals.length > 0 && (
          <View style={s.card}>
            <Text style={[s.label, { marginBottom: 12 }]}>Thoughts reframed this week</Text>
            {reappraisals.slice(0, 3).map((m: any, i: number) => (
              <View key={i} style={{ borderLeftWidth: 3, borderLeftColor: COLORS.sage, paddingLeft: 14, marginBottom: 14 }}>
                <Text style={{ fontSize: 13, color: COLORS.text, fontStyle: "italic", lineHeight: 20, marginBottom: 4 }}>"{m.reappraisal}"</Text>
                <Text style={{ fontSize: 11, color: COLORS.muted }}>{new Date(m.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</Text>
              </View>
            ))}
          </View>
        )}

        {weekMealsMeals.length > 0 && (
          <View style={s.card}>
            <Text style={[s.label, { marginBottom: 12 }]}>What you faced this week</Text>
            {weekMealsMeals.slice(0, 5).map((m: any, i: number) => (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 8, borderBottomWidth: i < Math.min(weekMealsMeals.length, 5) - 1 ? 1 : 0, borderBottomColor: COLORS.border }}>
                <Text style={{ fontSize: 13, color: COLORS.text, flex: 1, marginRight: 12 }}>{m.meal || "Unnamed meal"}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  {m.reappraisal && <Text style={{ fontSize: 10, color: COLORS.sage }}>✓ routine</Text>}
                  <Text style={{ fontSize: 11, color: COLORS.muted }}>{new Date(m.created_at).toLocaleDateString("en-US", { weekday: "short" })}</Text>
                </View>
              </View>
            ))}
            {weekMealsMeals.length > 5 && <Text style={{ fontSize: 12, color: COLORS.muted, fontStyle: "italic", marginTop: 8 }}>+{weekMealsMeals.length - 5} more meals</Text>}
          </View>
        )}

        <View style={{ backgroundColor: COLORS.warm, borderRadius: 14, padding: 20, marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: COLORS.terracotta, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>For your next session</Text>
          <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22 }}>Share this screen with your therapist. It shows your meals logged, how you were feeling, and the thoughts you worked to reframe this week.</Text>
        </View>
        <Text style={{ fontSize: 11, color: COLORS.muted, fontStyle: "italic", textAlign: "center", marginBottom: 16 }}>💚 Every number here is evidence of your effort.</Text>

        </>)}

        {/* Monthly distress trend — always visible */}
        {hasMonthlyData && (
          <View style={[s.card, { backgroundColor: COLORS.dark, borderColor: COLORS.dark, marginTop: 8 }]}>
            <Text style={{ fontSize: 10, color: COLORS.sage, fontWeight: "bold", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>30-day trend</Text>
            <Text style={{ fontSize: 12, color: "rgba(200,223,232,0.55)", marginBottom: 16, fontStyle: "italic" }}>Average distress across the last 4 weeks</Text>
            {(() => {
              const validBuckets = monthlyBuckets.filter(b => b.avg !== null);
              const trend = validBuckets.length >= 2
                ? (validBuckets[validBuckets.length - 1].avg as number) < (validBuckets[0].avg as number) ? "↓ improving"
                : (validBuckets[validBuckets.length - 1].avg as number) > (validBuckets[0].avg as number) ? "↑ watch this"
                : "→ steady"
                : null;
              return (
                <>
                  <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", height: 80, marginBottom: 12 }}>
                    {monthlyBuckets.map((b, i) => {
                      const h = b.avg !== null ? Math.max((b.avg / 10) * 64, 6) : 6;
                      const isLow = b.avg !== null && validBuckets.length > 0 && b.avg === Math.min(...validBuckets.map(x => x.avg as number));
                      return (
                        <View key={i} style={{ flex: 1, alignItems: "center", gap: 6 }}>
                          <Text style={{ fontSize: 10, color: "rgba(200,223,232,0.6)" }}>{b.avg !== null ? b.avg.toFixed(1) : "–"}</Text>
                          <View style={{ width: 32, height: h, borderRadius: 8, backgroundColor: b.avg === null ? "rgba(200,223,232,0.1)" : isLow ? COLORS.sage : "rgba(122,184,200,0.4)" }} />
                          <Text style={{ fontSize: 10, color: "rgba(200,223,232,0.5)" }}>{b.label}</Text>
                          <Text style={{ fontSize: 8, color: "rgba(200,223,232,0.3)" }}>{b.weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Text>
                        </View>
                      );
                    })}
                  </View>
                  {trend && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: 1, borderTopColor: "rgba(122,184,200,0.15)", paddingTop: 12 }}>
                      <Text style={{ fontSize: 13, color: trend.startsWith("↓") ? COLORS.sage : trend.startsWith("→") ? COLORS.muted : "#E8896A", fontWeight: "600" }}>{trend}</Text>
                      <Text style={{ fontSize: 12, color: "rgba(200,223,232,0.5)", flex: 1 }}>
                        {trend.startsWith("↓") ? "Distress is falling. This is recovery." : trend.startsWith("→") ? "Holding steady. Keep showing up." : "Higher this month. Be gentle with yourself."}
                      </Text>
                    </View>
                  )}
                </>
              );
            })()}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
  // ─── ABOUT SCREEN ────────────────────────────────────────────────────
  if (screen === "about") {
    const ACCORDIONS = [
      {
        key: "wave",
        emoji: "🌊",
        title: "The wave",
        dark: true,
        content: (
          <View>
            <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold_Italic", fontSize: 16, color: "#F7F4EE", lineHeight: 24, marginBottom: 12 }}>
              Emotions — like waves — rise, peak, and fall. They always fall.
            </Text>
            <Text style={{ fontSize: 14, color: "rgba(200,223,232,0.85)", lineHeight: 22 }}>
              From DBT: no feeling stays at its peak forever. The anxiety before a meal, the guilt after, the urge to compensate — it will crest and pass. You don't have to act on it. You just have to ride it. Every meal you sit with is evidence the wave fell.
            </Text>
          </View>
        ),
      },
      {
        key: "approach",
        emoji: "🧠",
        title: "The clinical approach",
        dark: false,
        content: (
          <View style={{ gap: 14 }}>
            {[
              { emoji: "🧠", title: "Exposure & Response Prevention", color: COLORS.terracotta, body: "Logging meals and sitting with discomfort instead of avoiding it. The post-meal routine helps you ride the wave rather than act on urges." },
              { emoji: "💭", title: "Cognitive Defusion", color: COLORS.sage, body: "'I am having the thought that I ate too much' is different from 'I ate too much.' That distance is where recovery lives." },
              { emoji: "🫀", title: "Interoceptive Awareness", color: "#E8A87C", body: "Body check-ins rebuild the connection between what you feel and what you need — reconnecting you with your body's signals." },
              { emoji: "📍", title: "Real-World Recovery", color: COLORS.terracotta, body: "Recovery doesn't pause when you leave the clinic. proof. works at your desk, in the car, at a family dinner. Nourishment doesn't require a perfect environment." },
            ].map((p, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                <View style={{ width: 4, borderRadius: 2, backgroundColor: p.color, marginTop: 4, alignSelf: "stretch" }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "bold", color: COLORS.text, marginBottom: 4 }}>{p.emoji} {p.title}</Text>
                  <Text style={{ fontSize: 13, color: COLORS.muted, lineHeight: 20 }}>{p.body}</Text>
                </View>
              </View>
            ))}
          </View>
        ),
      },
      {
        key: "promise",
        emoji: "💚",
        title: "Our promise",
        dark: false,
        content: (
          <View style={{ gap: 10 }}>
            {[
              ["💚", "Free forever — no subscriptions, no paywalls"],
              ["🚫", "No calorie tracking, ever"],
              ["🔒", "No ads, no data selling"],
              ["🫂", "Built by someone in recovery"],
              ["📍", "Designed for real life, not just the dinner table"],
            ].map(([emoji, text], i) => (
              <View key={i} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <Text style={{ fontSize: 16 }}>{emoji}</Text>
                <Text style={{ fontSize: 14, color: COLORS.text, flex: 1, lineHeight: 20 }}>{text}</Text>
              </View>
            ))}
          </View>
        ),
      },
      {
        key: "clinicians",
        emoji: "🏥",
        title: "For clinicians",
        dark: false,
        content: (
          <View>
            <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22, marginBottom: 12 }}>
              proof. is a between-session support tool that complements — not replaces — professional ED treatment. The weekly summary is designed to be reviewed with a therapist in session.
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.terracotta }}>celine@proofrecoveryapp.com</Text>
          </View>
        ),
      },
    ];

    return (
      <SafeAreaView style={s.safe}>
      {globalModals}
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <TouchableOpacity onPress={() => setScreen("home")}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
            <Text style={s.logo}>About</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* Hero */}
          <View style={{ backgroundColor: COLORS.dark, borderRadius: 20, padding: 24, marginTop: 16, marginBottom: 20 }}>
            <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 36, color: "#F7F4EE", letterSpacing: -1, marginBottom: 12 }}>
              proof<Text style={{ color: COLORS.sage }}>.</Text>
            </Text>
            <Text style={{ fontSize: 15, color: "rgba(200,223,232,0.9)", lineHeight: 24 }}>
              Recovery happens between therapy sessions — at the dinner table, in the car, at a work lunch, standing in a kitchen. We built the tools we wished we had.
            </Text>
          </View>

          {/* Accordions */}
          {ACCORDIONS.map(({ key, emoji, title, dark, content }) => {
            const open = (aboutOpen as any)[key];
            return (
              <View key={key} style={[s.card, dark ? { backgroundColor: COLORS.dark, borderColor: COLORS.dark } : {}, { marginBottom: 10 }]}>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                  onPress={() => setAboutOpen((prev: any) => ({ ...prev, [key]: !prev[key] }))}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: dark ? "rgba(122,184,200,0.1)" : "rgba(58,122,154,0.1)", alignItems: "center", justifyContent: "center" }}>
                      {key === "wave"       && <IconWave  size={17} color={dark ? COLORS.sage : COLORS.terracotta} />}
                      {key === "approach"   && <IconMedic size={17} color={dark ? COLORS.sage : COLORS.terracotta} />}
                      {key === "promise"    && <IconHeart size={17} color={dark ? COLORS.sage : COLORS.terracotta} filled />}
                      {key === "clinicians" && <IconUsers size={17} color={dark ? COLORS.sage : COLORS.terracotta} />}
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: "bold", color: dark ? "#F7F4EE" : COLORS.text }}>{title}</Text>
                  </View>
                  <Text style={{ fontSize: 18, color: dark ? COLORS.sage : COLORS.muted }}>{open ? "−" : "+"}</Text>
                </TouchableOpacity>
                {open && <View style={{ marginTop: 16 }}>{content}</View>}
              </View>
            );
          })}

          {/* Crisis note */}
          <Text style={{ fontSize: 12, color: COLORS.muted, fontStyle: "italic", textAlign: "center", marginTop: 8, marginBottom: 16, lineHeight: 18 }}>
            proof. is a support tool, not a crisis service. If you are in immediate danger please call 988.
          </Text>

          {/* Legal links */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 8, flexWrap: "wrap" }}>
            <TouchableOpacity onPress={() => setLegalScreen("disclaimer")}>
              <Text style={{ fontSize: 12, color: COLORS.terracotta, textDecorationLine: "underline" }}>Medical Disclaimer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLegalScreen("privacy")}>
              <Text style={{ fontSize: 12, color: COLORS.terracotta, textDecorationLine: "underline" }}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLegalScreen("terms")}>
              <Text style={{ fontSize: 12, color: COLORS.terracotta, textDecorationLine: "underline" }}>Terms & Conditions</Text>
            </TouchableOpacity>
          </View>

          {/* Replay onboarding */}
          <TouchableOpacity
            style={{ padding: 14, alignItems: "center" }}
            onPress={async () => {
              await AsyncStorage.removeItem("proof_intro_seen");
              setIntroSlide(0);
              setHasSeenIntro(false);
            }}>
            <Text style={{ fontSize: 12, color: COLORS.muted, fontStyle: "italic" }}>replay intro →</Text>
          </TouchableOpacity>

          {/* Version — long press to unlock clinician mode */}
          <TouchableOpacity
            onLongPress={() => { setClinicianCode(""); setClinicianCodeError(false); setShowClinicianModal(true); }}
            delayLongPress={800}
            style={{ padding: 16, alignItems: "center" }}
          >
            <Text style={{ fontSize: 11, color: "rgba(100,120,130,0.35)", letterSpacing: 1 }}>proof.™ v1.0.0 — Proof Health Technologies LLC</Text>
            {clinicianMode && (
              <Text style={{ fontSize: 10, color: COLORS.sage, marginTop: 4, letterSpacing: 1 }}>✓ CLINICIAN MODE ACTIVE</Text>
            )}
          </TouchableOpacity>

          {/* Legal document modal */}
          <Modal visible={legalScreen !== null} animationType="slide">
            <SafeAreaView style={s.safe}>
              <View style={s.header}>
                <TouchableOpacity onPress={() => setLegalScreen(null)}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
                <Text style={s.logo}>{legalScreen === "terms" ? "Terms" : legalScreen === "privacy" ? "Privacy" : "Disclaimer"}</Text>
                <View style={{ width: 50 }} />
              </View>
              <ScrollView contentContainerStyle={s.container}>
                {legalScreen === "terms" && <TermsContent />}
                {legalScreen === "privacy" && <PrivacyContent />}
                {legalScreen === "disclaimer" && <DisclaimerContent />}
                <View style={{ height: 60 }} />
              </ScrollView>
            </SafeAreaView>
          </Modal>

          {/* Clinician unlock modal */}
          <Modal visible={showClinicianModal} animationType="fade" transparent>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 32 }}>
              <View style={{ backgroundColor: COLORS.bg, borderRadius: 20, padding: 28 }}>
                <Text style={[s.h2, { marginBottom: 8 }]}>Clinician Access</Text>
                <Text style={[s.cardBody, { marginBottom: 20 }]}>Enter your access code to unlock the clinical summary view.</Text>
                <TextInput
                  style={[s.input, { marginBottom: 8, fontSize: 16, letterSpacing: 2 }]}
                  placeholder="Access code"
                  placeholderTextColor={COLORS.muted}
                  value={clinicianCode}
                  onChangeText={t => { setClinicianCode(t.toUpperCase()); setClinicianCodeError(false); }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                {clinicianCodeError && (
                  <Text style={{ fontSize: 12, color: "#C47060", marginBottom: 8 }}>Incorrect code. Please try again.</Text>
                )}
                <TouchableOpacity style={[s.btn, { marginTop: 8 }]} onPress={async () => {
                  const code = clinicianCode.trim();
                  if (!code) return;
                  // Verify against Supabase — code never lives in the bundle
                  const { data, error } = await supabase.rpc("verify_clinician_code", { input_code: code });
                  if (!error && data === true) {
                    setClinicianMode(true);
                    setClinicianCodeError(false);
                    setShowClinicianModal(false);
                  } else {
                    setClinicianCodeError(true);
                  }
                }}>
                  <Text style={s.btnText}>Unlock</Text>
                </TouchableOpacity>
                {clinicianMode && (
                  <>
                    <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16 }}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.text, marginBottom: 12 }}>Patient settings</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: "500", color: COLORS.text }}>Meal photos</Text>
                          <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2, lineHeight: 16 }}>Show photo option before and after meals. Photos go to clinician only — not visible to patient.</Text>
                        </View>
                        <TouchableOpacity
                          onPress={async () => {
                            const next = !photosEnabled;
                            setPhotosEnabled(next);
                            await AsyncStorage.setItem("proof_photos_enabled", next ? "true" : "false");
                          }}
                          style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: photosEnabled ? COLORS.terracotta : COLORS.border, justifyContent: "center", paddingHorizontal: 3, marginLeft: 12 }}>
                          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", alignSelf: photosEnabled ? "flex-end" : "flex-start", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 }} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <TouchableOpacity style={{ padding: 14, alignItems: "center", marginTop: 8 }} onPress={() => { setClinicianMode(false); setShowClinicianModal(false); }}>
                      <Text style={{ fontSize: 13, color: "#C47060" }}>Deactivate clinician mode</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity style={{ padding: 14, alignItems: "center" }} onPress={() => setShowClinicianModal(false)}>
                  <Text style={{ fontSize: 13, color: COLORS.muted }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─── PROGRESS TAB ────────────────────────────────────────────────────
  if (screen === "progress") {
    const now = new Date();
    const allMeals = pastMeals.filter(m => !m.meal?.startsWith("Moment check-in"));
    const allExposures = pastMeals.filter(m => m.meal?.startsWith("Exposure:"));
    const allSocial = pastMeals.filter(m => m.meal?.startsWith("Social meal"));
    const allMoments = pastMeals.filter(m => m.meal?.startsWith("Moment check-in"));

    // Build 8-week buckets
    const weeks = Array.from({ length: 8 }, (_, wi) => {
      const wEnd = new Date(now.getTime() - wi * 7 * 24 * 60 * 60 * 1000);
      const wStart = new Date(wEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      const label = wi === 0 ? "This wk" : wi === 1 ? "Last wk" : `${wEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      return {
        label,
        meals: allMeals.filter(m => { const d = new Date(m.created_at); return d >= wStart && d < wEnd; }).length,
        exposures: allExposures.filter(m => { const d = new Date(m.created_at); return d >= wStart && d < wEnd; }).length,
        social: allSocial.filter(m => { const d = new Date(m.created_at); return d >= wStart && d < wEnd; }).length,
        moments: allMoments.filter(m => { const d = new Date(m.created_at); return d >= wStart && d < wEnd; }).length,
      };
    }).reverse();

    // Emotion averages over time (4 weeks)
    const emotionWeeks = Array.from({ length: 4 }, (_, wi) => {
      const wEnd = new Date(now.getTime() - wi * 7 * 24 * 60 * 60 * 1000);
      const wStart = new Date(wEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      const wCheckins = checkins.filter(c => { const d = new Date(c.created_at); return d >= wStart && d < wEnd; });
      const avg = wCheckins.length
        ? wCheckins.reduce((sum, c: any) => sum + (c.anxiety + c.guilt + c.fear + c.shame) / 4, 0) / wCheckins.length
        : null;
      return { label: wi === 0 ? "Now" : `${4 - wi}w ago`, avg };
    }).reverse();

    const BarChart = ({ data, color, maxVal }: { data: number[]; color: string; maxVal: number }) => (
      <View style={{ flexDirection: "row", alignItems: "flex-end", height: 60, gap: 4 }}>
        {data.map((v, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center", gap: 3 }}>
            <View style={{ width: "100%", height: Math.max(v > 0 ? (v / Math.max(maxVal, 1)) * 52 : 0, v > 0 ? 6 : 2), borderRadius: 4, backgroundColor: v > 0 ? color : COLORS.border }} />
          </View>
        ))}
      </View>
    );

    return (
      <SafeAreaView style={[s.safe, { backgroundColor: COLORS.dark }]}>
        {globalModals}
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>

          <View style={[s.header, { marginBottom: 8 }]}>
            <View style={{ width: 40 }} />
            <Text style={s.logo}>Progress</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Quick stats */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
            {[
              { n: allMeals.length, l: "Meals", color: COLORS.terracotta },
              { n: allExposures.length, l: "Exposures", color: COLORS.sage },
              { n: allSocial.length, l: "Social", color: "#E8A87C" },
              { n: allMoments.length, l: "Check-ins", color: "#C4A870" },
            ].map(({ n, l, color }) => (
              <View key={l} style={{ flex: 1, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 12, alignItems: "center" }}>
                <Text style={{ fontSize: 22, fontWeight: "bold", color }}>{n}</Text>
                <Text style={{ fontSize: 9, color: COLORS.muted, marginTop: 2, textAlign: "center" }}>{l}</Text>
              </View>
            ))}
          </View>

          {/* Meals per week chart */}
          <View style={s.card}>
            <Text style={[s.label, { marginBottom: 4 }]}>Meals logged</Text>
            <Text style={{ fontSize: 11, color: COLORS.muted, marginBottom: 14, fontStyle: "italic" }}>Last 8 weeks</Text>
            <BarChart data={weeks.map(w => w.meals)} color={COLORS.terracotta} maxVal={Math.max(...weeks.map(w => w.meals), 1)} />
            <View style={{ flexDirection: "row", marginTop: 6 }}>
              {weeks.map((w, i) => (
                <Text key={i} style={{ flex: 1, fontSize: 7, color: COLORS.muted, textAlign: "center" }}>{i % 2 === 0 ? w.label : ""}</Text>
              ))}
            </View>
          </View>

          {/* Fear food exposures */}
          <View style={s.card}>
            <Text style={[s.label, { marginBottom: 4 }]}>Challenge food completions</Text>
            <Text style={{ fontSize: 11, color: COLORS.muted, marginBottom: 14, fontStyle: "italic" }}>Last 8 weeks</Text>
            {allExposures.length === 0 ? (
              <Text style={{ fontSize: 13, color: COLORS.muted, fontStyle: "italic" }}>No challenge foods completed yet — they unlock after 8 meals.</Text>
            ) : (
              <>
                <BarChart data={weeks.map(w => w.exposures)} color={COLORS.sage} maxVal={Math.max(...weeks.map(w => w.exposures), 1)} />
                <View style={{ flexDirection: "row", marginTop: 6 }}>
                  {weeks.map((w, i) => (
                    <Text key={i} style={{ flex: 1, fontSize: 7, color: COLORS.muted, textAlign: "center" }}>{i % 2 === 0 ? w.label : ""}</Text>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Social meals */}
          <View style={s.card}>
            <Text style={[s.label, { marginBottom: 4 }]}>Social meals</Text>
            <Text style={{ fontSize: 11, color: COLORS.muted, marginBottom: 14, fontStyle: "italic" }}>Last 8 weeks</Text>
            {allSocial.length === 0 ? (
              <Text style={{ fontSize: 13, color: COLORS.muted, fontStyle: "italic" }}>No social meals logged yet. Use the Social Eating tool next time.</Text>
            ) : (
              <>
                <BarChart data={weeks.map(w => w.social)} color="#E8A87C" maxVal={Math.max(...weeks.map(w => w.social), 1)} />
                <View style={{ flexDirection: "row", marginTop: 6 }}>
                  {weeks.map((w, i) => (
                    <Text key={i} style={{ flex: 1, fontSize: 7, color: COLORS.muted, textAlign: "center" }}>{i % 2 === 0 ? w.label : ""}</Text>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Distress trend */}
          {emotionWeeks.filter(w => w.avg !== null).length >= 2 && (
            <View style={[s.card, { backgroundColor: COLORS.dark, borderColor: COLORS.dark }]}>
              <Text style={[s.label, { marginBottom: 4, color: COLORS.sage }]}>Average distress</Text>
              <Text style={{ fontSize: 11, color: "rgba(200,223,232,0.55)", marginBottom: 14, fontStyle: "italic" }}>Last 4 weeks — lower is progress</Text>
              <View style={{ flexDirection: "row", alignItems: "flex-end", height: 60, gap: 8 }}>
                {emotionWeeks.map((w, i) => {
                  const h = w.avg !== null ? Math.max((w.avg / 10) * 52, 6) : 4;
                  const isLow = w.avg !== null && w.avg === Math.min(...emotionWeeks.filter(x => x.avg !== null).map(x => x.avg as number));
                  return (
                    <View key={i} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                      <Text style={{ fontSize: 9, color: "rgba(200,223,232,0.6)" }}>{w.avg !== null ? w.avg.toFixed(1) : ""}</Text>
                      <View style={{ width: "100%", height: h, borderRadius: 6, backgroundColor: w.avg === null ? "rgba(200,223,232,0.1)" : isLow ? COLORS.sage : "rgba(122,184,200,0.45)" }} />
                      <Text style={{ fontSize: 9, color: "rgba(200,223,232,0.5)" }}>{w.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Weekly summary link */}
          <TouchableOpacity onPress={() => setScreen("weeklysummary")} style={[s.card, { backgroundColor: COLORS.dark, borderColor: COLORS.dark, flexDirection: "row", alignItems: "center", gap: 14 }]}>
            <IconChart size={22} color={COLORS.terracotta} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#F7F4EE" }}>Weekly summary</Text>
              <Text style={{ fontSize: 12, color: "rgba(200,223,232,0.6)", marginTop: 2 }}>Detailed view with emotion averages</Text>
            </View>
            <Text style={{ color: COLORS.sage, fontSize: 16 }}>→</Text>
          </TouchableOpacity>

          {/* Fear foods link */}
          <TouchableOpacity onPress={() => setScreen("fearfoods")} style={[s.card, { flexDirection: "row", alignItems: "center", gap: 14 }]}>
            <IconStar size={22} color={COLORS.terracotta} filled />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: COLORS.text }}>Challenge foods</Text>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Track your exposure progress</Text>
            </View>
            <Text style={{ color: COLORS.muted, fontSize: 16 }}>→</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
        </KeyboardAvoidingView>
        </View>
        {tabBar}
      </SafeAreaView>
    );
  }

  if (screen === "notifsettings") return (
    <SafeAreaView style={s.safe}>
      {globalModals}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <TouchableOpacity onPress={() => setScreen("home")}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
          <Text style={s.logo}>Notifications</Text>
          <View style={{ width: 50 }} />
        </View>

        <Text style={[s.cardBody, { marginTop: 8, marginBottom: 20 }]}>Choose which reminders work for you.</Text>

        <Text style={[s.label, { marginBottom: 10 }]}>Check-ins</Text>

        <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10 }]}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(58,122,154,0.1)", alignItems: "center", justifyContent: "center" }}><IconBell size={18} color={COLORS.terracotta} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text }}>20-minute check-in</Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>After logging a meal</Text>
          </View>
          <TouchableOpacity onPress={() => saveNotifSettings({ ...notifSettings, checkin20: !notifSettings.checkin20 })} style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: notifSettings.checkin20 ? COLORS.terracotta : COLORS.border, justifyContent: "center", paddingHorizontal: 3 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", alignSelf: notifSettings.checkin20 ? "flex-end" : "flex-start" }} />
          </TouchableOpacity>
        </View>

        <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10 }]}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(58,122,154,0.1)", alignItems: "center", justifyContent: "center" }}><IconBell size={18} color={COLORS.terracotta} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text }}>60-minute check-in</Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>An hour after logging a meal</Text>
          </View>
          <TouchableOpacity onPress={() => saveNotifSettings({ ...notifSettings, checkin60: !notifSettings.checkin60 })} style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: notifSettings.checkin60 ? COLORS.terracotta : COLORS.border, justifyContent: "center", paddingHorizontal: 3 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", alignSelf: notifSettings.checkin60 ? "flex-end" : "flex-start" }} />
          </TouchableOpacity>
        </View>

        <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10 }]}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(58,122,154,0.1)", alignItems: "center", justifyContent: "center" }}><IconMedic size={18} color={COLORS.terracotta} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text }}>Daily check-in</Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Noon body check-in — no meal needed</Text>
          </View>
          <TouchableOpacity onPress={async () => { const n = { ...notifSettings, dailyCheckin: !notifSettings.dailyCheckin }; await saveNotifSettings(n); await applyRecurringNotifSettings(n); }} style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: notifSettings.dailyCheckin ? COLORS.terracotta : COLORS.border, justifyContent: "center", paddingHorizontal: 3 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", alignSelf: notifSettings.dailyCheckin ? "flex-end" : "flex-start" }} />
          </TouchableOpacity>
        </View>

        <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10 }]}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(58,122,154,0.1)", alignItems: "center", justifyContent: "center" }}><IconCalendar size={18} color={COLORS.terracotta} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text }}>Weekly reflection</Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Sunday morning — see your week's proof</Text>
          </View>
          <TouchableOpacity onPress={async () => { const n = { ...notifSettings, weekly: !notifSettings.weekly }; await saveNotifSettings(n); await applyRecurringNotifSettings(n); }} style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: notifSettings.weekly ? COLORS.terracotta : COLORS.border, justifyContent: "center", paddingHorizontal: 3 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", alignSelf: notifSettings.weekly ? "flex-end" : "flex-start" }} />
          </TouchableOpacity>
        </View>

        <Text style={[s.label, { marginTop: 8, marginBottom: 10 }]}>Meal reminders</Text>

        <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10 }]}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(58,122,154,0.1)", alignItems: "center", justifyContent: "center" }}><IconUtensils size={18} color={COLORS.terracotta} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text }}>Enable meal reminders</Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Daily nudges before meals you choose</Text>
          </View>
          <TouchableOpacity onPress={() => { const n = { ...notifSettings, mealReminders: !notifSettings.mealReminders }; saveMealReminderSettings(n); }} style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: notifSettings.mealReminders ? COLORS.terracotta : COLORS.border, justifyContent: "center", paddingHorizontal: 3 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", alignSelf: notifSettings.mealReminders ? "flex-end" : "flex-start" }} />
          </TouchableOpacity>
        </View>

        {notifSettings.mealReminders && (
          <MealReminderSlots notifSettings={notifSettings} saveMealReminderSettings={saveMealReminderSettings} />
        )}

        <View style={[s.card, { backgroundColor: COLORS.warm, borderColor: COLORS.blush, marginTop: 4 }]}>
          <Text style={{ fontSize: 13, color: COLORS.text, lineHeight: 20, fontStyle: "italic" }}>💚 These are here to support you. Turn off anything that doesn't feel right.</Text>
        </View>

        <TouchableOpacity onPress={() => { setDeleteConfirmText(""); setShowDeleteModal(true); }} style={{ padding: 16, alignItems: "center", marginTop: 8 }}>
          <Text style={{ fontSize: 12, color: "rgba(180,100,90,0.5)" }}>Delete my account</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 32 }}>
          <View style={{ backgroundColor: COLORS.bg, borderRadius: 20, padding: 28 }}>
            <Text style={[s.h2, { marginBottom: 8 }]}>Delete account</Text>
            <Text style={[s.cardBody, { marginBottom: 8 }]}>This will permanently delete all your meals, check-ins, fear food progress, and account data. This cannot be undone.</Text>
            <Text style={[s.cardBody, { marginBottom: 20, color: COLORS.muted }]}>Type <Text style={{ fontWeight: "bold", color: COLORS.text }}>delete</Text> to confirm.</Text>
            <TextInput style={[s.input, { marginBottom: 16 }]} placeholder="type delete to confirm" placeholderTextColor={COLORS.muted} value={deleteConfirmText} onChangeText={setDeleteConfirmText} autoCapitalize="none" autoCorrect={false} maxLength={200} />
            <TouchableOpacity style={[s.btn, { backgroundColor: deleteConfirmText.toLowerCase() === "delete" ? "#C47060" : COLORS.border, marginBottom: 12 }]} onPress={() => { if (deleteConfirmText.toLowerCase() === "delete") handleDeleteAccount(); }} disabled={deleteConfirmText.toLowerCase() !== "delete" || deletingAccount}>
              {deletingAccount ? <ActivityIndicator color="#fff" /> : <Text style={[s.btnText, { color: deleteConfirmText.toLowerCase() === "delete" ? "#fff" : COLORS.muted }]}>Delete everything</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowDeleteModal(false)} style={{ alignItems: "center", padding: 8 }}>
              <Text style={{ fontSize: 14, color: COLORS.muted }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
  if (screen === "whys") return (
    <SafeAreaView style={s.safe}>
      {globalModals}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <TouchableOpacity onPress={() => setScreen("home")}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
          <Text style={s.logo}>My Why</Text>
          <View style={{ width: 50 }} />
        </View>
        <Text style={[s.cardBody, { marginTop: 8 }]}>These reasons will appear when you need them most.</Text>
        {motivations.map((m, i) => (
          <View key={i} style={[s.card, { flexDirection: "row", alignItems: "flex-start", gap: 12 }]}>
            <Text style={{ fontSize: 18, color: COLORS.sage, marginTop: 2 }}>💚</Text>
            <TextInput style={{ flex: 1, fontSize: 14, color: COLORS.text }} value={m} multiline onChangeText={t => { const u = [...motivations]; u[i] = t; setMotivations(u); }} placeholder="Your reason..." placeholderTextColor={COLORS.muted} />
            <TouchableOpacity onPress={() => setMotivations(motivations.filter((_, j) => j !== i))}><Text style={{ color: COLORS.blush, fontSize: 18 }}>×</Text></TouchableOpacity>
          </View>
        ))}
        {motivations.length < 5 && <TouchableOpacity style={s.btnOutline} onPress={() => setMotivations([...motivations, ""])}><Text style={s.btnOutlineText}>+ Add another reason</Text></TouchableOpacity>}
        <View style={{ height: 16 }} />
        <TouchableOpacity style={s.btn} onPress={() => saveMotivations(false)}>
          {savingMotivations ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save my whys →</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // ─── HISTORY ──────────────────────────────────────────────────────────
  if (screen === "history") {
    // Full meal detail view
    if (selectedMeal) return (
      <SafeAreaView style={s.safe}>
      {globalModals}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <TouchableOpacity onPress={() => setSelectedMeal(null)}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
            <Text style={s.logo}>Entry</Text>
            <View style={{ width: 50 }} />
          </View>
          <Text style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>{new Date(selectedMeal.created_at).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</Text>
          <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 26, color: COLORS.text, marginBottom: 24 }}>{selectedMeal.meal}</Text>

          {selectedMeal.thoughts ? (
            <View style={s.card}>
              <Text style={s.label}>Thoughts before</Text>
              <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22 }}>{selectedMeal.thoughts}</Text>
            </View>
          ) : null}
          {selectedMeal.sensations ? (
            <View style={s.card}>
              <Text style={s.label}>Body sensations</Text>
              <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22 }}>{selectedMeal.sensations}</Text>
            </View>
          ) : null}
          {selectedMeal.urges ? (
            <View style={s.card}>
              <Text style={s.label}>Urges noticed</Text>
              <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22 }}>{selectedMeal.urges}</Text>
            </View>
          ) : null}
          {selectedMeal.reappraisal ? (
            <View style={[s.card, { backgroundColor: "#F0F7F1", borderColor: "#B5D4BA" }]}>
              <Text style={[s.label, { color: "#3D6B45" }]}>Kinder thought</Text>
              <Text style={{ fontSize: 15, color: "#3D6B45", lineHeight: 24, fontStyle: "italic" }}>"{selectedMeal.reappraisal}"</Text>
            </View>
          ) : null}
          {(() => {
            const mealCheckins = checkins.filter((c: any) => c.meal_id === selectedMeal.id);
            return mealCheckins.length >= 2 ? <DistressWaveChart checkins={mealCheckins} /> : null;
          })()}
          <View style={[s.card, { backgroundColor: selectedMeal.meal?.startsWith("Moment check-in") ? "#E8D5A8" : COLORS.dark, alignItems: "center" }]}>
            <Text style={{ fontSize: 13, color: selectedMeal.meal?.startsWith("Moment check-in") ? "#6A4F1A" : COLORS.sage, fontStyle: "italic", textAlign: "center", lineHeight: 22 }}>
              {selectedMeal.meal?.startsWith("Moment check-in")
                ? "You paused and checked in with yourself. That takes awareness. 💚"
                : "You showed up for this meal. That is your proof. 💚"}
            </Text>
          </View>
          <TouchableOpacity
            style={{ borderWidth: 1, borderColor: "#E8B4A0", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 8 }}
            onPress={() => Alert.alert(
              "Delete this entry?",
              "This will be removed from your evidence journal.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: async () => {
                  await supabase.from("meals").delete().eq("id", selectedMeal.id);
                  await fetchMeals();
                  setSelectedMeal(null);
                }},
              ]
            )}>
            <Text style={{ fontSize: 13, color: "#C47060" }}>Delete this entry</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );

    return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <TouchableOpacity onPress={() => setScreen("home")}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
          <Text style={s.logo}>Your Evidence</Text>
          <View style={{ width: 50 }} />
        </View>
        <Text style={[s.cardBody, { marginTop: 8 }]}>Every entry here is proof you survived a hard moment.</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          {[
            [String(pastMeals.filter(m => !m.meal?.startsWith("Moment check-in")).length), "Meals\nlogged"],
            [String(pastMeals.filter(m => m.reappraisal && !m.meal?.startsWith("Moment check-in")).length), "Routines\ncompleted"],
            [String(pastMeals.filter(m => m.meal?.startsWith("Moment check-in")).length), "Moment\ncheck-ins"],
          ].map(([n, l]) => (
            <View key={l} style={{ flex: 1, backgroundColor: l.startsWith("Moment") ? "#E8D5A8" : COLORS.card, borderWidth: 1, borderColor: l.startsWith("Moment") ? "#C4A870" : COLORS.border, borderRadius: 14, padding: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 22, fontWeight: "bold", color: l.startsWith("Moment") ? "#6A4F1A" : COLORS.terracotta }}>{n}</Text>
              <Text style={{ fontSize: 9, color: l.startsWith("Moment") ? "#8A6A30" : COLORS.muted, textAlign: "center", lineHeight: 13, marginTop: 2 }}>{l}</Text>
            </View>
          ))}
        </View>
        {loading ? <ActivityIndicator color={COLORS.terracotta} /> : pastMeals.map((m, i) => {
          const isMoment = m.meal?.startsWith("Moment check-in");
          const isExposure = m.meal?.startsWith("Exposure:");
          const mealCheckins = checkins.filter((c: any) => c.meal_id === m.id);
          const initial = mealCheckins.find((c: any) => c.checkin_type === "initial");
          const hasPostCheckin = mealCheckins.some((c: any) => c.checkin_type !== "initial");
          const has20min = mealCheckins.some((c: any) => c.checkin_type === "20min");
          const has60min = mealCheckins.some((c: any) => c.checkin_type === "60min");
          const hasBothCheckins = has20min && has60min;
          const last = mealCheckins.filter((c: any) => c.checkin_type !== "initial").sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          const initialAvg = initial ? (initial.anxiety + initial.guilt + initial.fear + initial.shame) / 4 : null;
          const lastAvg = last ? (last.anxiety + last.guilt + last.fear + last.shame) / 4 : null;
          const fell = initialAvg !== null && lastAvg !== null && lastAvg < initialAvg;
          const mealAgeMs = Date.now() - new Date(m.created_at).getTime();
          const mealAgeMins = Math.round(mealAgeMs / 60000);
          const mealAgeLabel = mealAgeMins < 60
            ? `${mealAgeMins} min ago`
            : mealAgeMins < 1440
            ? `${Math.floor(mealAgeMins / 60)} hr ${mealAgeMins % 60 > 0 ? `${mealAgeMins % 60} min` : ""} ago`.trim()
            : `${Math.floor(mealAgeMins / 1440)}d ago`;
          return (
            <View key={i} style={isMoment
              ? [s.card, { backgroundColor: "#F5EDD6", borderColor: "#C4A870" }]
              : s.card
            }>
              <TouchableOpacity onPress={() => setSelectedMeal(m)}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6, gap: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: isMoment ? "#3A2A10" : COLORS.text, flex: 1 }}>
                    {isMoment ? "🫀 Moment check-in" : m.meal}
                  </Text>
                  <Text style={{ fontSize: 11, color: isMoment ? "#8A6A30" : COLORS.muted, flexShrink: 0 }}>{mealAgeLabel}</Text>
                </View>
                {m.reappraisal && <Text style={{ fontSize: 13, color: isMoment ? "#8A6A30" : COLORS.muted, fontStyle: "italic", lineHeight: 20, marginBottom: 10 }}>"{m.reappraisal}"</Text>}
                {hasBothCheckins && (
                  <View style={{ marginBottom: 10 }}>
                    <DistressWaveChart checkins={mealCheckins} />
                  </View>
                )}
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: hasPostCheckin ? 0 : 10 }}>
                  {isMoment && <View style={{ alignSelf: "flex-start", backgroundColor: "#E8D5A8", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 }}><Text style={{ fontSize: 11, color: "#6A4F1A", fontWeight: "600" }}>check-in</Text></View>}
                  {isExposure && <View style={s.tagBlue}><Text style={s.tagBlueText}>Exposure ⚡</Text></View>}
                  {fell && <View style={s.tagGreen}><Text style={s.tagGreenText}>anxiety fell ↓</Text></View>}
                  {m.reappraisal && !isExposure && !fell && !isMoment && <View style={s.tagWave}><Text style={s.tagWaveText}>routine done ✓</Text></View>}
                </View>
              </TouchableOpacity>
              {!hasPostCheckin && !isMoment && (
                <TouchableOpacity
                  style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, flexDirection: "row", alignItems: "center", gap: 8 }}
                  onPress={async () => {
                    setCurrentMealId(m.id);
                    setCheckinType("20min");
                    setCheckinNotifAt(new Date());
                    setCheckinMealName(m.meal || "");
                    // Schedule a follow-up 60min reminder from NOW since they missed the original
                    if (notifSettings.checkin60) {
                      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
                      for (const n of allScheduled) {
                        if (n.content.data?.mealId === m.id) {
                          await Notifications.cancelScheduledNotificationAsync(n.identifier);
                        }
                      }
                      await Notifications.scheduleNotificationAsync({
                        content: { title: "One more check-in 🌿", body: `An hour since you logged "${m.meal || "your meal"}". How are you feeling now?`, data: { mealId: m.id, checkinType: "60min", mealName: m.meal || "" } },
                        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 60 * 60 },
                      });
                    }
                    setShowCheckin(true);
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><IconCheckCircle size={14} color={COLORS.terracotta} /><Text style={{ fontSize: 12, color: COLORS.terracotta, fontWeight: "600" }}>Check in now</Text></View>
                  <Text style={{ fontSize: 11, color: COLORS.muted }}>missed the notification?</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    );
  }

  // ─── THERAPIST SUMMARY ───────────────────────────────────────────────
  if (screen === "therapist") {
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentMeals = pastMeals.filter((m: any) => new Date(m.created_at) >= fourWeeksAgo && !m.meal?.startsWith("Moment check-in"));
    const weekMeals = pastMeals.filter((m: any) => new Date(m.created_at) >= weekAgo && !m.meal?.startsWith("Moment check-in"));
    const recentCheckins = checkins.filter((c: any) => new Date(c.created_at) >= fourWeeksAgo);

    const avg = (key: string, data = recentCheckins) => {
      const vals = data.map((c: any) => c[key]).filter((v: any) => v != null);
      return vals.length ? (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(1) : "—";
    };

    const daysActive = new Set(recentMeals.map((m: any) => new Date(m.created_at).toDateString())).size;
    const routinesDone = recentMeals.filter((m: any) => m.reappraisal).length;
    const reappraisals = recentMeals.filter((m: any) => m.reappraisal && m.reappraisal !== "My thoughts were already kind." && m.reappraisal.length > 10);

    const generatePDF = async () => {
      const dateRange = `${fourWeeksAgo.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
      const mealRows = recentMeals.slice(0, 20).map((m: any) => `
        <tr>
          <td>${new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
          <td>${m.meal || "—"}</td>
          <td>${m.thoughts ? m.thoughts.substring(0, 60) + (m.thoughts.length > 60 ? "..." : "") : "—"}</td>
          <td>${m.reappraisal ? m.reappraisal.substring(0, 60) + (m.reappraisal.length > 60 ? "..." : "") : "—"}</td>
        </tr>`).join("");

      const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', serif; color: #1A2E38; background: #fff; padding: 48px; }
  .header { border-bottom: 3px solid #3A7A9A; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
  .logo { font-size: 32px; font-weight: bold; color: #3A7A9A; letter-spacing: -1px; }
  .logo span { font-style: italic; }
  .subtitle { font-size: 11px; color: #6A9AAA; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
  .meta { text-align: right; font-size: 12px; color: #6A9AAA; line-height: 1.8; }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #3A7A9A; font-weight: bold; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #C8DFE8; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 8px; }
  .stat-box { background: #F7F4EE; border: 1px solid #C8DFE8; border-radius: 8px; padding: 16px; text-align: center; }
  .stat-num { font-size: 28px; font-weight: bold; color: #3A7A9A; }
  .stat-label { font-size: 10px; color: #6A9AAA; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; line-height: 1.4; }
  .emotion-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .emotion-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #F7F4EE; border-radius: 6px; border: 1px solid #C8DFE8; }
  .emotion-label { font-size: 12px; color: #1A2E38; }
  .emotion-val { font-size: 16px; font-weight: bold; color: #3A7A9A; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #F0E8D0; color: #1A2E38; text-align: left; padding: 8px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
  td { padding: 8px 12px; border-bottom: 1px solid #E8EFF2; color: #1A2E38; line-height: 1.5; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .reappraisal-item { background: #F0F7F1; border-left: 3px solid #7AB8C8; padding: 12px 16px; margin-bottom: 10px; border-radius: 0 6px 6px 0; font-style: italic; font-size: 13px; color: #1A2E38; line-height: 1.6; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #C8DFE8; font-size: 10px; color: #6A9AAA; display: flex; justify-content: space-between; }
  .clinical-note { background: #FFF8EE; border: 1px solid #E8D5A8; border-radius: 8px; padding: 16px 20px; font-size: 12px; color: #5A4A30; line-height: 1.7; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">proof<span>.</span></div>
      <div class="subtitle">Eating Disorder Recovery App</div>
    </div>
    <div class="meta">
      <strong>Clinical Progress Summary</strong><br>
      ${dateRange}<br>
      Generated: ${now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
    </div>
  </div>

  <div class="section">
    <div class="section-title">28-Day Overview</div>
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-num">${recentMeals.length}</div><div class="stat-label">Meals Logged</div></div>
      <div class="stat-box"><div class="stat-num">${daysActive}</div><div class="stat-label">Days Active</div></div>
      <div class="stat-box"><div class="stat-num">${routinesDone}</div><div class="stat-label">Routines Completed</div></div>
      <div class="stat-box"><div class="stat-num">${reappraisals.length}</div><div class="stat-label">Cognitive Reappraisals</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Emotion Averages (Post-Meal Check-ins, 1–10 scale)</div>
    <div class="emotion-grid">
      ${[["Anxiety","anxiety"],["Guilt","guilt"],["Shame","shame"],["Fear","fear"],["Sadness","sadness"],["Physical Discomfort","physical_discomfort"]].map(([l, k]) =>
        `<div class="emotion-item"><span class="emotion-label">${l}</span><span class="emotion-val">${avg(k)}</span></div>`
      ).join("")}
    </div>
  </div>

  ${reappraisals.length > 0 ? `
  <div class="section">
    <div class="section-title">Cognitive Reappraisals (Patient's Own Words)</div>
    ${reappraisals.slice(0, 6).map((m: any) =>
      `<div class="reappraisal-item">"${m.reappraisal}" <span style="font-style:normal;font-size:10px;color:#6A9AAA;">— ${new Date(m.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span></div>`
    ).join("")}
  </div>` : ""}

  <div class="section">
    <div class="section-title">Meal Log (Most Recent ${Math.min(recentMeals.length, 20)} Entries)</div>
    <table>
      <thead><tr><th>Date</th><th>Meal</th><th>Pre-meal Thoughts</th><th>Reappraisal</th></tr></thead>
      <tbody>${mealRows}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Clinical Note</div>
    <div class="clinical-note">
      This summary was generated by proof., a free eating disorder recovery app using evidence-based techniques including Exposure and Response Prevention (ERP), cognitive defusion, and interoceptive awareness. Data reflects self-reported information logged by the patient. This document is intended to supplement, not replace, clinical assessment. All entries are patient-authored and unedited.
    </div>
  </div>

  <div class="footer">
    <span>proof. — recovery, one meal at a time — proofrecoveryapp.com</span>
    <span>Confidential — For clinical use only</span>
  </div>
</body>
</html>`;

      try {
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Share Clinical Summary" });
      } catch (e: any) {
        Alert.alert("Could not generate PDF", e.message);
      }
    };

    return (
      <SafeAreaView style={s.safe}>
      {globalModals}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <TouchableOpacity onPress={() => setScreen("home")}><Text style={s.navBtn}>← Back</Text></TouchableOpacity>
            <Text style={s.logo}>For Your Therapist</Text>
            <View style={{ width: 50 }} />
          </View>

          <Text style={[s.cardBody, { marginBottom: 24 }]}>A clinical summary of your last 28 days. Share this with your therapist, dietitian, or care team.</Text>

          {/* 28-day stats */}
          <View style={[s.card, { backgroundColor: COLORS.dark, borderColor: COLORS.dark }]}>
            <Text style={{ fontSize: 11, color: COLORS.sage, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>28-Day Overview</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              {[
                { n: recentMeals.length, l: "Meals\nLogged", color: COLORS.sage },
                { n: daysActive, l: "Days\nActive", color: "#E8A87C" },
                { n: routinesDone, l: "Routines\nDone", color: COLORS.terracotta },
                { n: reappraisals.length, l: "Reap-\npraisals", color: "#B8A8C8" },
              ].map(({ n, l, color }: any) => (
                <View key={l} style={{ alignItems: "center", width: "22%" }}>
                  <Text style={{ fontSize: 32, fontWeight: "bold", color, lineHeight: 40 }}>{n}</Text>
                  <Text style={{ fontSize: 9, color: "rgba(200,223,232,0.6)", textAlign: "center", lineHeight: 14, marginTop: 4 }}>{l}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Emotion averages */}
          <View style={s.card}>
            <Text style={s.label}>Emotion Averages (1–10)</Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>Post-meal self-reported ratings over 28 days</Text>
            {[["Anxiety","anxiety"],["Guilt","guilt"],["Shame","shame"],["Fear","fear"],["Sadness","sadness"],["Physical Discomfort","physical_discomfort"]].map(([label, key]) => {
              const val = avg(key);
              const numVal = parseFloat(val) || 0;
              return (
                <View key={key} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, color: COLORS.text }}>{label}</Text>
                    <Text style={{ fontSize: 13, fontWeight: "bold", color: COLORS.terracotta }}>{val}</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: COLORS.border, borderRadius: 3 }}>
                    <View style={{ width: `${Math.min((numVal / 10) * 100, 100)}%`, height: 6, backgroundColor: COLORS.terracotta, borderRadius: 3 }} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Reappraisals */}
          {reappraisals.length > 0 && (
            <View style={s.card}>
              <Text style={s.label}>Cognitive Reappraisals</Text>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>Kinder thoughts the patient wrote after difficult meals</Text>
              {reappraisals.slice(0, 4).map((m: any, i: number) => (
                <View key={i} style={{ borderLeftWidth: 3, borderLeftColor: COLORS.sage, paddingLeft: 12, paddingVertical: 8, marginBottom: 10, backgroundColor: "#F0F7F1", borderRadius: 4 }}>
                  <Text style={{ fontSize: 13, color: COLORS.text, fontStyle: "italic", lineHeight: 20 }}>"{m.reappraisal}"</Text>
                  <Text style={{ fontSize: 10, color: COLORS.muted, marginTop: 4 }}>{new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {m.meal}</Text>
                </View>
              ))}
            </View>
          )}

          {/* This week */}
          <View style={s.card}>
            <Text style={s.label}>This Week</Text>
            {weekMeals.length === 0
              ? <Text style={{ fontSize: 13, color: COLORS.muted, fontStyle: "italic" }}>No meals logged this week yet.</Text>
              : weekMeals.slice(0, 7).map((m: any, i: number) => (
                <View key={i} style={{ paddingVertical: 8, borderBottomWidth: i < weekMeals.length - 1 ? 1 : 0, borderBottomColor: COLORS.border }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.text, flex: 1 }}>{m.meal}</Text>
                    <Text style={{ fontSize: 11, color: COLORS.muted }}>{new Date(m.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</Text>
                  </View>
                  {m.reappraisal && <Text style={{ fontSize: 12, color: COLORS.muted, fontStyle: "italic", marginTop: 3 }}>"{m.reappraisal}"</Text>}
                </View>
              ))
            }
          </View>

          {/* Clinical note */}
          <View style={[s.card, { backgroundColor: "#FFF8EE", borderColor: "#E8D5A8" }]}>
            <Text style={[s.label, { color: "#8A6A30", marginBottom: 8 }]}>Clinical Note</Text>
            <Text style={{ fontSize: 12, color: "#5A4A30", lineHeight: 20 }}>This summary was generated by proof., a free eating disorder recovery app using ERP, cognitive defusion, and interoceptive awareness techniques. All data is self-reported and patient-authored. Intended to supplement clinical assessment, not replace it.</Text>
          </View>

          {/* Share button */}
          <TouchableOpacity style={[s.btn, { marginTop: 8 }]} onPress={generatePDF}>
            <Text style={s.btnText}>📄 Share as PDF</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 11, color: COLORS.muted, textAlign: "center", marginTop: 8, lineHeight: 18 }}>Generates a formatted clinical document you can email, AirDrop, or print for your care team.</Text>

          <View style={{ height: 40 }} />
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─── CHECK IN ─────────────────────────────────────────────────────────
  if (screen === "checkin") {
    const CHECKIN_SITUATIONS = [
      { label: "I'm dreading eating", emoji: "😶" },
      { label: "I feel guilty about what I ate", emoji: "💭" },
      { label: "My body feels uncomfortable", emoji: "🫀" },
      { label: "I'm eating around other people", emoji: "🫂" },
      { label: "I'm having urges to restrict", emoji: "⚡" },
      { label: "I can't stop thinking about food", emoji: "🌀" },
      { label: "Something upset me today", emoji: "🌧️" },
      { label: "I feel numb or disconnected", emoji: "🌫️" },
      { label: "I'm scared of what comes next", emoji: "🌊" },
      { label: "I just feel off", emoji: "🍂" },
    ];

    const COPING_MATCHES: Record<string, number> = {
      "I'm dreading eating": 0,
      "I feel guilty about what I ate": 3,
      "My body feels uncomfortable": 1,
      "I'm eating around other people": 2,
      "I'm having urges to restrict": 0,
      "I can't stop thinking about food": 1,
      "Something upset me today": 3,
      "I feel numb or disconnected": 2,
      "I'm scared of what comes next": 0,
      "I just feel off": 1,
    };

    const CHECKIN_AFFIRMATIONS: Record<string, string> = {
      "I'm dreading eating": "Dread before a meal is your nervous system trying to protect you. It doesn't mean something bad will happen. It means you're doing something brave.",
      "I feel guilty about what I ate": "Guilt after eating is not a signal that you did something wrong. It is a feeling — and feelings pass. You ate. That is not a mistake.",
      "My body feels uncomfortable": "Your body is not punishing you. It is adjusting, digesting, existing. Discomfort is not danger.",
      "I'm eating around other people": "You don't have to perform comfort you don't feel. You just have to stay at the table. That is enough.",
      "I'm having urges to restrict": "The urge is loud right now. It doesn't have to win. You've felt this before and made it through.",
      "I can't stop thinking about food": "Food thoughts are exhausting. They are also a sign your body is asking for something. You don't have to solve it right now.",
      "Something upset me today": "Something hard happened. You're still here, still taking care of yourself. That matters.",
      "I feel numb or disconnected": "Numbness is protection. It makes sense that you're here. You don't have to feel everything all at once.",
      "I'm scared of what comes next": "Fear about what's next is real. And you have gotten through every hard thing so far. This one too.",
      "I just feel off": "You don't have to name it perfectly. Off is enough. You showed up anyway.",
    };

    const showResult = checkinSelected !== null;
    const matchedSkillIdx = checkinSelected ? (COPING_MATCHES[checkinSelected] ?? 0) : 0;
    const matchedSkill = COPING_SKILLS[matchedSkillIdx];
    const affirmation = checkinSelected ? CHECKIN_AFFIRMATIONS[checkinSelected] : "";

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.dark }}>
      {globalModals}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">

          {/* Ambient orbs */}
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }} pointerEvents="none">
            {[
              { top: 60, left: -40, size: 200, color: "rgba(58,122,154,0.18)" },
              { top: 300, right: -60, size: 180, color: "rgba(122,184,200,0.12)" },
              { top: 500, left: 40, size: 150, color: "rgba(232,213,168,0.1)" },
              { top: 150, right: 20, size: 100, color: "rgba(232,137,106,0.1)" },
            ].map((orb, i) => (
              <View key={i} style={{
                position: "absolute", top: orb.top,
                left: (orb as any).left ?? undefined,
                right: (orb as any).right ?? undefined,
                width: orb.size, height: orb.size,
                borderRadius: orb.size / 2,
                backgroundColor: orb.color,
              }} />
            ))}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, marginBottom: 8 }}>
            <TouchableOpacity onPress={() => setScreen("log")}><Text style={{ fontSize: 14, color: "rgba(200,223,232,0.5)" }}>← Back</Text></TouchableOpacity>
            <Text style={{ flex: 1, textAlign: "center", fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 22, color: "#F7F4EE" }}>proof.</Text>
            <View style={{ width: 50 }} />
          </View>

          {!showResult ? (
            <>
              <View style={{ alignItems: "center", marginVertical: 32 }}>
                {/* Soft glowing orb */}
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(122,184,200,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(122,184,200,0.25)", alignItems: "center", justifyContent: "center" }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(200,223,232,0.6)" }} />
                  </View>
                </View>
                <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 26, color: "#F7F4EE", textAlign: "center", marginBottom: 8 }}>
                  What's making this{"\n"}moment hard?
                </Text>
                <Text style={{ fontSize: 13, color: "rgba(200,223,232,0.5)", textAlign: "center", fontStyle: "italic" }}>
                  Tap what feels closest. There's no wrong answer.
                </Text>
              </View>

              <View style={{ gap: 10, marginBottom: 24 }}>
                {CHECKIN_SITUATIONS.map(({ label, emoji }) => (
                  <TouchableOpacity
                    key={label}
                    onPress={() => setCheckinSelected(label)}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 14,
                      backgroundColor: checkinSelected === label ? "rgba(122,184,200,0.2)" : "rgba(255,255,255,0.05)",
                      borderWidth: 1.5,
                      borderColor: checkinSelected === label ? "rgba(122,184,200,0.6)" : "rgba(200,223,232,0.1)",
                      borderRadius: 14, padding: 16,
                    }}>
                    <Text style={{ fontSize: 20 }}>{emoji}</Text>
                    <Text style={{ fontSize: 14, color: checkinSelected === label ? "#F7F4EE" : "rgba(200,223,232,0.7)", flex: 1, lineHeight: 20 }}>{label}</Text>
                    {checkinSelected === label && <Text style={{ fontSize: 16, color: COLORS.sage }}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Open text */}
              <View style={{ backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(200,223,232,0.1)", borderRadius: 14, padding: 16, marginBottom: 24 }}>
                <Text style={{ fontSize: 12, color: "rgba(200,223,232,0.4)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" as "uppercase" }}>Or put it in your own words</Text>
                <TextInput
                  style={{ fontSize: 14, color: "#F7F4EE", minHeight: 64, textAlignVertical: "top" }}
                  placeholder="Anything you want to say..."
                  placeholderTextColor="rgba(200,223,232,0.25)"
                  multiline
                  value={checkinResponse}
                  onChangeText={setCheckinResponse} maxLength={500} />
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: checkinSelected || checkinResponse.length > 2 ? "rgba(122,184,200,0.9)" : "rgba(122,184,200,0.2)",
                  borderRadius: 14, padding: 16, alignItems: "center",
                }}
                onPress={() => {
                  if (!checkinSelected && checkinResponse.length < 3) return;
                  if (!checkinSelected) setCheckinSelected("I just feel off");
                }}>
                <Text style={{ fontSize: 15, fontWeight: "bold", color: checkinSelected || checkinResponse.length > 2 ? COLORS.dark : "rgba(200,223,232,0.4)" }}>
                  I named it →
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Result — affirmation + coping skill */}
              <View style={{ alignItems: "center", marginVertical: 32 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(232,213,168,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(232,213,168,0.2)", alignItems: "center", justifyContent: "center" }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(232,213,168,0.5)" }} />
                  </View>
                </View>
                <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 14, color: COLORS.sage, textTransform: "uppercase" as "uppercase", letterSpacing: 2, marginBottom: 16 }}>you named it</Text>
                <View style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(200,223,232,0.12)", borderRadius: 16, padding: 22, marginBottom: 8, width: "100%" }}>
                  <Text style={{ fontSize: 15, color: "#F0E8D0", lineHeight: 26, fontStyle: "italic", textAlign: "center", fontFamily: "PlayfairDisplay_600SemiBold_Italic" }}>"{affirmation}"</Text>
                </View>
                {checkinResponse.length > 2 && (
                  <Text style={{ fontSize: 12, color: "rgba(200,223,232,0.35)", fontStyle: "italic", textAlign: "center", marginTop: 8 }}>"{checkinResponse}"</Text>
                )}
              </View>

              {/* Matched coping skill */}
              <Text style={{ fontSize: 11, color: "rgba(200,223,232,0.35)", textAlign: "center", letterSpacing: 2, textTransform: "uppercase" as "uppercase", marginBottom: 14 }}>something that might help</Text>
              <TouchableOpacity
                style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1.5, borderColor: `${matchedSkill?.color}55`, borderRadius: 16, padding: 20, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24 }}
                onPress={() => { setActiveCopingSkill(matchedSkill); setCopingStep(0); setCopingNote(""); setCopingReturnTo("log"); setScreen("coping"); }}>
                <Text style={{ fontSize: 32 }}>{matchedSkill?.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "bold", color: "#F7F4EE", marginBottom: 3 }}>{matchedSkill?.title}</Text>
                  <Text style={{ fontSize: 12, color: "rgba(200,223,232,0.55)", lineHeight: 18 }}>{matchedSkill?.subtitle}</Text>
                </View>
                <View style={{ backgroundColor: matchedSkill?.color, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 11, color: "#fff", fontWeight: "bold" }}>{matchedSkill?.duration}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: "rgba(122,184,200,0.85)", borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 12 }}
                onPress={() => setScreen("log")}>
                <Text style={{ fontSize: 15, fontWeight: "bold", color: COLORS.dark }}>Go log my meal →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 14, alignItems: "center" }} onPress={() => { setCheckinSelected(null); setCheckinResponse(""); }}>
                <Text style={{ fontSize: 13, color: "rgba(200,223,232,0.4)", fontStyle: "italic" }}>← choose something different</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {globalModals}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  logo: { fontSize: 26, fontFamily: "PlayfairDisplay_600SemiBold", color: COLORS.terracotta },
  tagline: { fontSize: 11, color: COLORS.muted, fontStyle: "italic", marginTop: 2 },
  navBtn: { fontSize: 14, color: COLORS.muted },
  quote: { fontSize: 15, fontFamily: "PlayfairDisplay_600SemiBold_Italic", color: COLORS.muted, lineHeight: 26, marginBottom: 20 },
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: "#1A2E38", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  pill: { backgroundColor: COLORS.warm, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 8 },
  pillText: { fontSize: 11, color: COLORS.terracotta, fontWeight: "bold" },
  cardTitle: { fontSize: 16, color: COLORS.text, marginBottom: 8, fontWeight: "600" },
  cardBody: { fontSize: 14, color: COLORS.muted, lineHeight: 22, marginBottom: 16 },
  btn: { backgroundColor: COLORS.terracotta, padding: 16, borderRadius: 14, alignItems: "center", marginTop: 8 },
  btnText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  btnOutline: { borderWidth: 1.5, borderColor: COLORS.terracotta, padding: 14, borderRadius: 14, alignItems: "center", marginTop: 8 },
  btnOutlineText: { color: COLORS.terracotta, fontSize: 14, fontWeight: "bold" },
  label: { fontSize: 11, fontWeight: "bold" as const, color: COLORS.terracotta, letterSpacing: 1.2, marginBottom: 6, textTransform: "uppercase" as "uppercase" },
  input: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 14, color: COLORS.text },
  textarea: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 14, color: COLORS.text, minHeight: 80, textAlignVertical: "top" },
  h2: { fontSize: 24, fontFamily: "PlayfairDisplay_600SemiBold", color: COLORS.text, marginBottom: 12 },
  // tags & badges
  tagGreen: { alignSelf: "flex-start", backgroundColor: "#E1F5EE", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  tagGreenText: { fontSize: 11, color: "#0F6E56", fontWeight: "600" },
  tagBlue: { alignSelf: "flex-start", backgroundColor: "#E8D5A8", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  tagBlueText: { fontSize: 11, color: "#6A4F1A", fontWeight: "600" },
  tagWave: { alignSelf: "flex-start", backgroundColor: "rgba(122,184,200,0.18)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  tagWaveText: { fontSize: 11, color: COLORS.terracotta, fontWeight: "600" },
});
