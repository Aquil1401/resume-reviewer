import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

import MainTabNavigator from "@/navigation/MainTabNavigator";
import ResumeReportScreen from "@/screens/ResumeReportScreen";
import JDMatchScreen from "@/screens/JDMatchScreen";
import ImproveResumeScreen from "@/screens/ImproveResumeScreen";
import InterviewQuestionsScreen from "@/screens/InterviewQuestionsScreen";
import CoverLetterScreen from "@/screens/CoverLetterScreen";
import PremiumUpgradeScreen from "@/screens/PremiumUpgradeScreen";
import AuthScreen from "@/screens/AuthScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ResumeReport: { analysisId: string };
  JDMatch: undefined;
  ImproveResume: undefined;
  InterviewQuestions: undefined;
  CoverLetter: undefined;
  PremiumUpgrade: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.backgroundRoot }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {session ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ResumeReport"
            component={ResumeReportScreen}
            options={{
              headerTitle: "Resume Analysis",
            }}
          />
          <Stack.Screen
            name="JDMatch"
            component={JDMatchScreen}
            options={{
              headerTitle: "JD Match",
            }}
          />
          <Stack.Screen
            name="ImproveResume"
            component={ImproveResumeScreen}
            options={{
              headerTitle: "Improve Resume",
            }}
          />
          <Stack.Screen
            name="InterviewQuestions"
            component={InterviewQuestionsScreen}
            options={{
              headerTitle: "Interview Prep",
            }}
          />
          <Stack.Screen
            name="CoverLetter"
            component={CoverLetterScreen}
            options={{
              headerTitle: "Cover Letter",
            }}
          />
          <Stack.Screen
            name="PremiumUpgrade"
            component={PremiumUpgradeScreen}
            options={{
              presentation: "modal",
              headerTitle: "Go Premium",
            }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
