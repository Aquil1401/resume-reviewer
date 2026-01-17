import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import ResumeReportScreen from "@/screens/ResumeReportScreen";
import JDMatchScreen from "@/screens/JDMatchScreen";
import ImproveResumeScreen from "@/screens/ImproveResumeScreen";
import InterviewQuestionsScreen from "@/screens/InterviewQuestionsScreen";
import CoverLetterScreen from "@/screens/CoverLetterScreen";
import PremiumUpgradeScreen from "@/screens/PremiumUpgradeScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
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

  return (
    <Stack.Navigator screenOptions={screenOptions}>
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
    </Stack.Navigator>
  );
}
