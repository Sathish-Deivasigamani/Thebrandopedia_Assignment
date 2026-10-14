import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeIcon from '../../assets/Icons - svg/icon-home-filled.svg';
import SearchIcon from '../../assets/Icons - svg/icon-search-filled.svg';
import SendIcon from '../../assets/Icons - svg/icon-send-filled.svg';

type AppTab = 'home' | 'discover';

const tabs = [
  {
    key: 'home',
    label: 'Home',
    route: '/',
  },
  {
    key: 'discover',
    label: 'Discover',
    route: '/explore',
  },
] as const;

export function AppTabs({ activeTab }: { activeTab: AppTab }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map((tab) => {
        const selected = tab.key === activeTab;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            key={tab.key}
            onPress={() => router.navigate(tab.route)}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}>
            {tab.key === 'home' ? (
              <HomeIcon width={25} height={25} fill={selected ? '#008681' : '#858585'} />
            ) : (
              <SearchIcon width={25} height={25} fill={selected ? '#008681' : '#858585'} />
            )}
            <Text style={[styles.tabLabel, selected && styles.selectedTabLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Messages"
        onPress={() => Alert.alert('Messages', 'Messaging is not part of these two screens.')}
        style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}>
        <SendIcon width={25} height={25} fill="#858585" />
        <Text style={styles.tabLabel}>Messages</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    flexDirection: 'row',
    height: 76,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabPressed: {
    opacity: 0.65,
  },
  tabLabel: {
    color: '#858585',
    fontSize: 11,
    fontWeight: '500',
  },
  selectedTabLabel: {
    color: '#008681',
    fontWeight: '700',
  },
});
