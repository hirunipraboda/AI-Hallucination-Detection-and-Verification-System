import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ScreenHeader({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
}) {
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme);

  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={theme.background} 
      />
      <View style={styles.container}>
        {leftIcon ? (
          <TouchableOpacity style={styles.iconButton} onPress={onLeftPress} activeOpacity={0.8}>
            <Icon name={leftIcon} size={24} color={theme.primary} />
          </TouchableOpacity>
        ) : <View style={styles.placeholder} />}

        <Text style={styles.title}>{title}</Text>

        {rightIcon ? (
          <TouchableOpacity style={styles.iconButton} onPress={onRightPress} activeOpacity={0.8}>
            <Icon name={rightIcon} size={24} color={theme.primary} />
          </TouchableOpacity>
        ) : <View style={styles.placeholder} />}
      </View>
    </>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.isDarkMode ? 'rgba(30, 194, 255, 0.10)' : 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
  },
});