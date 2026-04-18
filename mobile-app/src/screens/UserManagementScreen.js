import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import api from '../services/api';

const USER_TYPES = ['all', 'student', 'undergraduate', 'professor', 'teacher', 'professional', 'researcher', 'journalist', 'other'];

export default function UserManagementScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [activeType, setActiveType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      const allUsers = response.data;
      setUsers(allUsers);
      
      // Calculate stats
      const counts = allUsers.reduce((acc, user) => {
        const type = user.userType || 'other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      setStats(counts);
      
      applyFilter(allUsers, activeType);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch system users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (allUsers, type) => {
    if (type === 'all') {
      setFilteredUsers(allUsers);
    } else {
      setFilteredUsers(allUsers.filter(u => (u.userType || 'other') === type));
    }
  };

  const handleTypePress = (type) => {
    setActiveType(type);
    applyFilter(users, type);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'student': return 'school-outline';
      case 'undergraduate': return 'book-outline';
      case 'professor': return 'briefcase-outline';
      case 'teacher': return 'person-outline';
      case 'professional': return 'id-card-outline';
      case 'researcher': return 'search-outline';
      case 'journalist': return 'newspaper-outline';
      default: return 'help-circle-outline';
    }
  };

  const StatCard = ({ type, count, isActive }) => (
    <TouchableOpacity 
      style={[styles.statItem, isActive && styles.activeStat]} 
      onPress={() => handleTypePress(type)}
    >
      <View style={[styles.statIcon, { backgroundColor: isActive ? theme.primary : theme.input }]}>
        <Ionicons name={getTypeIcon(type)} size={20} color={isActive ? '#fff' : theme.textDim} />
      </View>
      <Text style={[styles.statCount, isActive && styles.activeText]}>{count || 0}</Text>
      <Text style={[styles.statLabel, isActive && styles.activeText]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader 
        title="User Management" 
        leftIcon="chevron-back" 
        onLeftPress={() => navigation.goBack()} 
      />

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        <View style={styles.flex}>
          <View style={styles.analyticsContainer}>
            <Text style={styles.sectionTitle}>User Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
              <StatCard type="all" count={users.length} isActive={activeType === 'all'} />
              {USER_TYPES.filter(t => t !== 'all').map(type => (
                <StatCard key={type} type={type} count={stats[type] || 0} isActive={activeType === type} />
              ))}
            </ScrollView>
          </View>

          <ScrollView 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          >
            <View style={styles.listHeader}>
              <Text style={styles.listCount}>Showing {filteredUsers.length} Users</Text>
              <View style={styles.filterChip}>
                <Text style={styles.filterText}>{activeType.toUpperCase()}</Text>
              </View>
            </View>
            
            {filteredUsers.map((user) => (
              <GlassCard key={user._id} style={styles.userCard}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                      {user.name}
                    </Text>
                    <View style={[styles.roleBadge, user.role === 'admin' && styles.adminBadge]}>
                      <Text style={[styles.roleText, user.role === 'admin' && styles.adminRoleText]}>
                        {user.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
                  
                  <View style={styles.footerRow}>
                    <View style={styles.typeTag}>
                      <Ionicons name={getTypeIcon(user.userType || 'other')} size={12} color={theme.primary} />
                      <Text style={styles.typeTagText}>{(user.userType || 'other').toUpperCase()}</Text>
                    </View>
                    <View style={styles.dateBox}>
                      <Ionicons name="calendar-outline" size={12} color={theme.textDim} />
                      <Text style={styles.dateText}>{new Date(user.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            ))}

            {filteredUsers.length === 0 && (
              <View style={styles.empty}>
                <Ionicons name="people-outline" size={60} color={theme.textDim} />
                <Text style={styles.emptyText}>No {activeType} users found.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  analyticsContainer: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.input + '22' },
  sectionTitle: { color: theme.text, fontSize: 14, fontWeight: '700', marginLeft: 20, marginBottom: 12, opacity: 0.7, textTransform: 'uppercase' },
  statsScroll: { paddingHorizontal: 15 },
  statItem: { 
    padding: 12, borderRadius: 16, backgroundColor: theme.input + '55', 
    marginHorizontal: 5, alignItems: 'center', width: 90,
    borderWidth: 1, borderColor: 'transparent'
  },
  activeStat: { backgroundColor: theme.primary + '15', borderColor: theme.primary + '44' },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statCount: { color: theme.text, fontSize: 16, fontWeight: '800' },
  statLabel: { color: theme.textDim, fontSize: 11, fontWeight: '600' },
  activeText: { color: theme.primary },
  content: { padding: 20, paddingBottom: 40 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  listCount: { color: theme.textDim, fontSize: 13, fontWeight: '600' },
  filterChip: { backgroundColor: theme.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  filterText: { color: theme.primary, fontSize: 10, fontWeight: '800' },
  userCard: { padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center' },
  avatarBox: { 
    width: 50, height: 50, borderRadius: 25, 
    backgroundColor: theme.primary + '22', 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.primary + '55'
  },
  avatarText: { color: theme.primary, fontSize: 20, fontWeight: '800' },
  userInfo: { marginLeft: 15, flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userName: { color: theme.text, fontSize: 16, fontWeight: '800', flex: 1, marginRight: 8 },
  roleBadge: { backgroundColor: theme.input, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  adminBadge: { backgroundColor: '#fdcb6e44' },
  roleText: { fontSize: 10, fontWeight: '900', color: theme.textDim },
  adminRoleText: { color: '#fdcb6e' },
  userEmail: { color: theme.textDim, fontSize: 13, marginTop: 2, marginBottom: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary + '11', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  typeTagText: { color: theme.primary, fontSize: 10, fontWeight: '800', marginLeft: 4 },
  dateBox: { flexDirection: 'row', alignItems: 'center' },
  dateText: { color: theme.textDim, fontSize: 11, marginLeft: 5 },
  empty: { alignItems: 'center', marginTop: 100, opacity: 0.5 },
  emptyText: { color: theme.textDim, marginTop: 15, fontSize: 16 },
});
