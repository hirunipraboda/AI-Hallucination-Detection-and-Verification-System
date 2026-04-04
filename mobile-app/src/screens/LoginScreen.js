import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme);

  // Brand colors mapping
  const authColors = {
    background: theme.background,
    inputBg: theme.input,
    primary: theme.primary,
    textSubtitle: theme.textMuted,
    textDim: theme.textDim,
    divider: theme.border,
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      // Navigation is handled by AuthContext guard in AppNavigator
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* LOGO SECTION */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <View style={styles.logoInner}>
              <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
              <View style={styles.magnifierOverlay}>
                <Ionicons name="search" size={14} color="#FFFFFF" />
              </View>
            </View>
          </View>
          <Text style={styles.brandName}>TruthLens</Text>
          <Text style={styles.brandSubtitle}>AI VERIFICATION SYSTEM</Text>
        </View>

        {/* FORM SECTION */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="at" size={20} color={authColors.textSubtitle} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="name@company.com"
                placeholderTextColor={authColors.textDim}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>PASSWORD</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={authColors.textSubtitle} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={authColors.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={authColors.textDim} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.secureBadge}>
            <Ionicons name="shield-checkmark" size={16} color={authColors.textSubtitle} />
            <Text style={styles.secureText}>Continue Securely</Text>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupButtonText}>Create New Trust Profile</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER SECTION */}
        <View style={styles.footer}>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
            <Text style={styles.footerLink}>Terms of Service</Text>
            <Text style={styles.footerLink}>Support</Text>
          </View>
          <Text style={styles.copyright}>
            © 2024 TRUTHLENS AI DETECTION SYSTEMS. ENCRYPTED SESSION.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  logoInner: {
    position: 'relative',
  },
  magnifierOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.background,
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.text,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 12,
    color: theme.textMuted,
    letterSpacing: 2,
    marginTop: 8,
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: theme.textMuted,
    fontWeight: '700',
    marginBottom: 8,
  },
  forgotLink: {
    fontSize: 12,
    color: theme.textMuted,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.input,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: theme.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  secureText: {
    color: theme.textMuted,
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
  },
  dividerText: {
    color: theme.textDim,
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '700',
  },
  signupButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  signupButtonText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  footerLink: {
    color: theme.textMuted,
    fontSize: 12,
    marginHorizontal: 12,
    fontWeight: '500',
  },
  copyright: {
    color: theme.textDim,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
  },
});

