import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ActivityIndicator, Pressable, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    // States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Modes: 'login', 'signup', 'forgot_password'
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>('login');

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const redirectTo = makeRedirectUri({
                scheme: 'atsresumechecker',
                path: 'auth/callback',
            });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;
            if (!data?.url) throw new Error("No URL returned from Supabase");

            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

            if (result.type === 'success') {
                const { url } = result;
                // Parse access_token and refresh_token from hash
                // Supabase returns: #access_token=...&refresh_token=...&...
                const hashIndex = url.indexOf('#');
                if (hashIndex !== -1) {
                    const paramsString = url.substring(hashIndex + 1);
                    const params = new URLSearchParams(paramsString);
                    const access_token = params.get('access_token');
                    const refresh_token = params.get('refresh_token');

                    if (access_token && refresh_token) {
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token,
                            refresh_token,
                        });
                        if (sessionError) throw sessionError;
                    }
                }
            }
        } catch (e: any) {
            Alert.alert("Google Login Error", e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async () => {
        if (!email.trim() || !email.includes('@')) return Alert.alert("Required", "Please enter a valid email address");
        if ((mode === 'login' || mode === 'signup') && !password) return Alert.alert("Required", "Please enter your password");
        if (mode === 'signup' && !fullName.trim()) return Alert.alert("Required", "Please enter your full name");

        setLoading(true);
        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;
                Alert.alert("Success", "Check your email to confirm account!");
                setMode('login');
            } else if (mode === 'forgot_password') {
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                if (error) throw error;
                Alert.alert("Sent", "Password reset link sent to your email.");
                setMode('login');
            }
        } catch (e: any) {
            Alert.alert("Error", e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
            <KeyboardAwareScrollViewCompat
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + Spacing['3xl'], paddingBottom: insets.bottom + Spacing.xl }
                ]}
            >
                <View style={styles.header}>
                    <View style={[styles.logoPlaceholder, { backgroundColor: `${theme.primary}20` }]}>
                        <Feather name="shield" size={40} color={theme.primary} />
                    </View>
                    <ThemedText type="h1" style={{ textAlign: 'center', marginBottom: Spacing.xs }}>
                        {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                    </ThemedText>
                    <ThemedText type="body" style={{ textAlign: 'center', color: theme.textSecondary }}>
                        {mode === 'login' ? 'Sign in to access your dashboard' : mode === 'signup' ? 'Join to boost your resume' : 'Enter email to receive reset link'}
                    </ThemedText>
                </View>

                <View style={styles.form}>
                    {/* Full Name (Signup Only) */}
                    {mode === 'signup' && (
                        <View style={styles.inputGroup}>
                            <ThemedText type="small" style={{ marginBottom: Spacing.xs, color: theme.textSecondary }}>Full Name</ThemedText>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
                                onChangeText={setFullName}
                                value={fullName}
                                placeholder="John Doe"
                                placeholderTextColor={theme.textSecondary}
                            />
                        </View>
                    )}

                    {/* Email (Always) */}
                    <View style={styles.inputGroup}>
                        <ThemedText type="small" style={{ marginBottom: Spacing.xs, color: theme.textSecondary }}>Email</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
                            onChangeText={setEmail}
                            value={email}
                            placeholder="hello@example.com"
                            placeholderTextColor={theme.textSecondary}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Password (Login & Signup) */}
                    {mode !== 'forgot_password' && (
                        <View style={styles.inputGroup}>
                            <ThemedText type="small" style={{ marginBottom: Spacing.xs, color: theme.textSecondary }}>Password</ThemedText>
                            <View
                                style={[
                                    styles.passwordContainer,
                                    {
                                        backgroundColor: theme.backgroundDefault,
                                        borderColor: theme.border,
                                    },
                                ]}
                            >
                                <TextInput
                                    style={[styles.inputFlex, { color: theme.text }]}
                                    onChangeText={setPassword}
                                    value={password}
                                    secureTextEntry={!showPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor={theme.textSecondary}
                                />
                                <Pressable
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Feather
                                        name={showPassword ? 'eye' : 'eye-off'}
                                        size={20}
                                        color={theme.textSecondary}
                                    />
                                </Pressable>
                            </View>
                            {mode === 'login' && (
                                <Pressable onPress={() => setMode('forgot_password')} style={{ alignSelf: 'flex-end', marginTop: 4 }}>
                                    <ThemedText type="caption" style={{ color: theme.primary }}>Forgot Password?</ThemedText>
                                </Pressable>
                            )}
                        </View>
                    )}

                    <Button onPress={handleEmailAuth} disabled={loading} style={{ marginTop: Spacing.md }}>
                        {loading ? <ActivityIndicator color="#fff" /> : (mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link')}
                    </Button>

                    {/* Google Login (Login/Signup Only) */}
                    {mode !== 'forgot_password' && (
                        <View style={{ gap: Spacing.md }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                                <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
                                <ThemedText type="caption" style={{ color: theme.textSecondary }}>OR</ThemedText>
                                <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
                            </View>

                            <Button
                                onPress={handleGoogleLogin}
                                style={{ backgroundColor: theme.backgroundSecondary, borderWidth: 1, borderColor: theme.border }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                                    <FontAwesome name="google" size={16} color={theme.text} />
                                    <ThemedText type="body" style={{ color: theme.text, fontWeight: '600' }}>
                                        Continue with Google
                                    </ThemedText>
                                </View>
                            </Button>
                        </View>
                    )}

                    {/* Toggle Mode */}
                    <Pressable
                        onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        style={{ alignItems: 'center', padding: Spacing.md }}
                    >
                        {mode !== 'forgot_password' && (
                            <ThemedText type="body" style={{ color: theme.textSecondary }}>
                                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                                <ThemedText type="body" style={{ color: theme.primary, fontWeight: '600' }}>
                                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                                </ThemedText>
                            </ThemedText>
                        )}
                        {mode === 'forgot_password' && (
                            <ThemedText type="body" style={{ color: theme.primary, fontWeight: '600' }}>Back to Sign In</ThemedText>
                        )}
                    </Pressable>
                </View>
            </KeyboardAwareScrollViewCompat>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: Spacing.xl, justifyContent: 'center', flexGrow: 1 },
    header: { alignItems: 'center', marginBottom: Spacing['3xl'] },
    logoPlaceholder: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
    form: { gap: Spacing.lg },
    inputGroup: { gap: Spacing.xs },
    input: { height: Spacing.buttonHeight, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, borderWidth: 1, fontSize: 16 },
    passwordContainer: {
        height: Spacing.buttonHeight,
        borderRadius: BorderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
    },
    inputFlex: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 4,
    },
});
