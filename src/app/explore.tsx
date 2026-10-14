import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTabs } from '@/components/app-tabs';
import { CURRENT_USER_ID } from '@/constants/current-user';
import { ApiUser, getUsers, sendConnectionRequest } from '@/services/api';

const profileImages: Record<string, number> = {
  'Image-1.png': require('../../assets/Profile image/Image-1.png'),
  'Image-2.png': require('../../assets/Profile image/Image-2.png'),
  'Image-3.png': require('../../assets/Profile image/Image-3.png'),
  'Image-4.png': require('../../assets/Profile image/Image-4.png'),
  'Image.png': require('../../assets/Profile image/Image.png'),
};

export default function DiscoverScreen() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [requestedUserIds, setRequestedUserIds] = useState<string[]>([]);
  const [pendingUserIds, setPendingUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getUsers()
      .then((result) => {
        if (!active) return;
        setUsers(result.users);
        setRequestedUserIds(result.requestedUserIds);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : 'Could not load profiles.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredSuggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users
      .filter((user) => user._id !== CURRENT_USER_ID)
      .filter(
        (user) =>
          !query ||
          `${user.name} ${user.occupation}`.toLowerCase().includes(query),
      );
  }, [search, users]);

  const onConnect = async (userId: string) => {
    setPendingUserIds((ids) => [...ids, userId]);
    try {
      await sendConnectionRequest(userId);
      setRequestedUserIds((ids) => (ids.includes(userId) ? ids : [...ids, userId]));
    } catch (requestError) {
      Alert.alert(
        'Connection request failed',
        requestError instanceof Error ? requestError.message : 'Could not send the request.',
      );
    } finally {
      setPendingUserIds((ids) => ids.filter((id) => id !== userId));
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Text accessibilityElementsHidden style={styles.searchIcon}>
            ⌕
          </Text>
          <TextInput
            accessibilityLabel="Search profiles and organizations"
            value={search}
            onChangeText={setSearch}
            placeholder="Search profiles, organizations..."
            placeholderTextColor="#8E8E91"
            returnKeyType="search"
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setSearch('')}
              hitSlop={8}>
              <Text style={styles.clearIcon}>×</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.sectionTitle}>People you may know</Text>
      </View>
      <ScrollView
        style={styles.results}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {filteredSuggestions.map((user) => {
          const isRequested = requestedUserIds.includes(user._id);
          const isPending = pendingUserIds.includes(user._id);
          return (
            <View key={user._id} style={styles.card}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`View ${user.name} profile`}
                onPress={() => Alert.alert(user.name, user.occupation)}>
                <View style={styles.connectionStrip}>
                  <Text style={styles.connectionGlyph}>↔</Text>
                  <Text style={styles.connectionText}>2 Connects</Text>
                </View>
                <Image
                  source={profileImages[user.profileImage] ?? profileImages['Image.png']}
                  style={styles.profileIcon}
                  contentFit="cover"
                />
                <Text style={styles.doctorName}>{user.name}</Text>
                <Text style={styles.specialty}>{user.occupation}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isRequested ? `Requested ${user.name}` : `Connect with ${user.name}`}
                accessibilityState={{ selected: isRequested, disabled: isRequested || isPending }}
                disabled={isRequested || isPending}
                onPress={() => onConnect(user._id)}
                style={[styles.actionButton, isRequested && styles.messageButton]}>
                <Text style={[styles.actionGlyph, isRequested && styles.messageGlyph]}>
                  {isPending ? '…' : isRequested ? '✓' : '+'}
                </Text>
                <Text style={[styles.actionText, isRequested && styles.messageText]}>
                  {isPending ? 'Sending...' : isRequested ? 'Requested' : 'Connect'}
                </Text>
              </Pressable>
            </View>
          );
        })}
        {!loading && error && (
          <View style={styles.emptyState}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Loading profiles...</Text>
          </View>
        )}
        {!loading && !error && filteredSuggestions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No profiles found</Text>
          </View>
        )}
      </ScrollView>
      <AppTabs activeTab="discover" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  searchHeader: {
    paddingHorizontal: 11,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchBox: {
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F5F5F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#29292C',
    fontSize: 13,
    paddingVertical: 0,
  },
  searchIcon: {
    color: '#777777',
    fontSize: 25,
    lineHeight: 26,
  },
  clearIcon: {
    color: '#8E8E91',
    fontSize: 22,
    lineHeight: 24,
  },
  sectionTitle: {
    color: '#767679',
    fontSize: 13,
    marginTop: 9,
  },
  results: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
    rowGap: 10,
  },
  card: {
    width: '48.5%',
    minHeight: 148,
    alignItems: 'center',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    paddingBottom: 7,
  },
  connectionStrip: {
    width: '100%',
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F0FAFA',
  },
  connectionGlyph: {
    color: '#008681',
    fontSize: 12,
    fontWeight: '700',
  },
  connectionText: {
    color: '#6D6D70',
    fontSize: 10,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginTop: 9,
    marginBottom: 5,
  },
  doctorName: {
    color: '#29292C',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  specialty: {
    color: '#77777A',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 1,
    textAlign: 'center',
  },
  actionButton: {
    minHeight: 31,
    alignSelf: 'stretch',
    marginHorizontal: 7,
    marginTop: 6,
    borderRadius: 7,
    backgroundColor: '#00B5B4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  messageButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    backgroundColor: '#FFFFFF',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  actionGlyph: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 18,
  },
  messageGlyph: {
    color: '#858585',
    fontSize: 14,
  },
  messageText: {
    color: '#858585',
    fontWeight: '400',
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    color: '#77777A',
    fontSize: 14,
  },
  errorText: {
    color: '#A33D3D',
    fontSize: 13,
    textAlign: 'center',
  },
});
