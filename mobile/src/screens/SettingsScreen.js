import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import * as authService from '../services/authService';
import { validatePassword } from '../utils/validationHelper';

export default function SettingsScreen() {
  const { user, logout, profileImage, updateProfileImage, token } = useAuth();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const styles = getStyles(theme);

  // Change Password States
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to change your profile picture.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      updateProfileImage(result.assets[0].uri);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    const passStatus = validatePassword(newPassword);
    if (!passStatus.isValid) {
      Alert.alert('Invalid Password', passStatus.message);
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword, token);
      Alert.alert('Success', 'Password updated successfully!');
      setIsPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AVATAR SECTION */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarGlow}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity 
                style={styles.avatarBg} 
                onPress={handlePickImage}
                activeOpacity={0.9}
              >
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={60} color={theme.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.editAvatarBtn} 
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={16} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* PROFILE INFO */}
        <View style={styles.infoSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>USERNAME</Text>
            <View style={styles.displayCard}>
              <Text style={styles.displayText}>{user?.name?.toLowerCase().replace(' ', '_') || 'oracle_architect'}</Text>
              <Ionicons name="finger-print-outline" size={20} color={theme.textDim} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.displayCard}>
              <Text style={styles.displayText}>{user?.email || 'alex.v@truthlens.ai'}</Text>
              <Ionicons name="mail-outline" size={20} color={theme.textDim} />
            </View>
          </View>
        </View>

        {/* APP PREFERENCES */}
        <Text style={styles.sectionHeading}>App Preferences</Text>
        <GlassCard style={styles.preferenceCard}>
          <View style={styles.itemIconContainer}>
            <Ionicons name="moon" size={24} color={theme.primary} />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Visual Theme</Text>
            <Text style={styles.itemSubtitle}>Switch between Dark and Light mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#3e3e3e', true: theme.primary }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          />
        </GlassCard>


        {/* SECURITY */}
        <Text style={styles.sectionHeading}>Security</Text>
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => setIsPasswordModalVisible(true)}
        >
          <GlassCard style={styles.preferenceCard}>
            <View style={styles.itemIconContainer}>
              <Ionicons name="lock-closed-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Change Password</Text>
              <Text style={styles.itemSubtitle}>Secure your account with a fresh key</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textDim} />
          </GlassCard>
        </TouchableOpacity>

        {/* ACTIONS */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={22} color={theme.text} style={styles.actionIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={20} color={theme.danger} style={styles.actionIcon} />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={isPasswordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setIsPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textDim} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>CURRENT PASSWORD</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter current password"
                  placeholderTextColor={theme.textDim}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>NEW PASSWORD</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Min 8 chars, number & special char"
                  placeholderTextColor={theme.textDim}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>CONFIRM NEW PASSWORD</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Repeat new password"
                  placeholderTextColor={theme.textDim}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <TouchableOpacity 
                style={[styles.saveBtn, isUpdatingPassword && styles.btnDisabled]} 
                onPress={handleChangePassword}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  editAvatarBtn: {

    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: theme.textDim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  displayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.card,
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  displayText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '500',
  },
  sectionHeading: {
    color: theme.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 10,
  },
  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 194, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    color: theme.text,
    fontSize: 17,
    fontWeight: '700',
  },
  itemSubtitle: {
    color: theme.textDim,
    fontSize: 13,
    marginTop: 2,
  },
  actionContainer: {
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.card,
    height: 60,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  logoutText: {
    color: theme.text,
    fontSize: 17,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 91, 91, 0.08)',
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 91, 91, 0.2)',
  },
  deleteText: {
    color: theme.danger,
    fontSize: 17,
    fontWeight: '700',
  },
  actionIcon: {
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 24,
    borderRadius: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '800',
  },
  modalBody: {
    marginTop: 10,
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalLabel: {
    color: theme.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    color: theme.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  saveBtn: {
    backgroundColor: theme.primary,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});