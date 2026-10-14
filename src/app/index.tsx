import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTabs } from '@/components/app-tabs';
import { CURRENT_USER_ID } from '@/constants/current-user';
import { ApiPost, ApiUser, getPosts, getUsers } from '@/services/api';

const profileImages: Record<string, number> = {
  'Image-1.png': require('../../assets/Profile image/Image-1.png'),
  'Image-2.png': require('../../assets/Profile image/Image-2.png'),
  'Image-3.png': require('../../assets/Profile image/Image-3.png'),
  'Image-4.png': require('../../assets/Profile image/Image-4.png'),
  'Image.png': require('../../assets/Profile image/Image.png'),
};

const postImages: Record<string, number> = {
  'create-post-image-1@2x.png': require('../../assets/Post image/create-post-image-1.png'),
  'create-post-image-2@2x.png': require('../../assets/Post image/create-post-image-2.png'),
  'create-post-image-3@2x.png': require('../../assets/Post image/create-post-image-3.png'),
  'create-post-image-4@2x.png': require('../../assets/Post image/create-post-image-4.png'),
  'create-post-image-5@2x.png': require('../../assets/Post image/create-post-image-5.png'),
};

const fallbackProfileImage = require('../../assets/Profile image/Image.png');
const fallbackPostImage = require('../../assets/Post image/create-post-image-5.png');

function FeedPost({
  post,
  imageHeight,
}: {
  post: ApiPost;
  imageHeight: number;
}) {
  const [liked, setLiked] = useState(false);
  const author = post.author;

  return (
    <View style={styles.post}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${author.name} profile`}
        onPress={() => Alert.alert(author.name, author.occupation)}>
        <View style={styles.authorRow}>
          <Image
            source={profileImages[author.profileImage] ?? fallbackProfileImage}
            style={styles.authorAvatar}
            contentFit="cover"
          />
          <View>
            <Text style={styles.authorName}>{author.name}</Text>
            <Text style={styles.authorSubtitle}>{author.occupation}</Text>
          </View>
        </View>
      </Pressable>
      <Text style={styles.postDescription}>{post.content}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open post image"
        onPress={() => Alert.alert(author.name, author.occupation)}>
        <Image
          source={postImages[post.image] ?? fallbackPostImage}
          style={[styles.postImage, { height: imageHeight }]}
          contentFit="cover"
        />
      </Pressable>
      <View style={styles.postActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
          accessibilityState={{ selected: liked }}
          onPress={() => setLiked((value) => !value)}
          style={styles.postAction}>
          <Text style={[styles.likeIcon, liked && styles.likedIcon]}>{liked ? '♥' : '♡'}</Text>
          <Text style={styles.actionCount}>{5 + (liked ? 1 : 0)}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share post"
          onPress={() => Alert.alert('Share post', 'Sharing is ready to connect to your device share sheet.')}
          style={styles.postAction}>
          <Text style={styles.shareIcon}>➤</Text>
          <Text style={styles.actionCount}>3</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const imageHeight = width * 1.24;
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getPosts(), getUsers()])
      .then(([postsResult, usersResult]) => {
        if (!active) return;
        setPosts(postsResult.posts);
        setCurrentUser(usersResult.users.find((user) => user._id === CURRENT_USER_ID) ?? null);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : 'Could not load posts.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.brand}>
          <Text style={styles.brandDark}>Doc</Text>
          <Text style={styles.brandTeal}>Connect</Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create a post"
          onPress={() => Alert.alert('Create post', 'Post creation is not part of these two screens.')}
          style={styles.createButton}>
          <Text style={styles.createIcon}>+</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}>
        {currentUser && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${currentUser.name} profile`}
            onPress={() => Alert.alert(currentUser.name, currentUser.occupation)}>
            <View style={styles.profileCard}>
              <Image
                source={profileImages[currentUser.profileImage] ?? fallbackProfileImage}
                style={styles.profileImage}
                contentFit="cover"
              />
              <View style={styles.connectCount}>
                <Text style={styles.connectIcon}>↔</Text>
                <Text style={styles.connectCountText}>2 Connects</Text>
              </View>
              <Text style={styles.profileName}>{currentUser.name}</Text>
              <Text style={styles.profileSpecialty}>{currentUser.occupation}</Text>
            </View>
          </Pressable>
        )}
        {posts.map((post) => (
          <FeedPost
            key={post._id}
            post={post}
            imageHeight={imageHeight}
          />
        ))}
        {loading && (
          <View style={styles.feedMessage}>
            <Text style={styles.feedMessageText}>Loading posts...</Text>
          </View>
        )}
        {!loading && error && (
          <View style={styles.feedMessage}>
            <Text style={styles.feedErrorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
      <AppTabs activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  brand: {
    fontSize: 21,
    letterSpacing: -0.7,
  },
  brandDark: {
    color: '#28282B',
    fontWeight: '500',
  },
  brandTeal: {
    color: '#008681',
    fontWeight: '500',
  },
  createButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00B5B4',
  },
  createIcon: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '300',
    lineHeight: 30,
  },
  feed: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  feedContent: {
    paddingBottom: 12,
  },
  feedMessage: {
    paddingHorizontal: 18,
    paddingVertical: 22,
    alignItems: 'center',
  },
  feedMessageText: {
    color: '#77777A',
    fontSize: 14,
  },
  feedErrorText: {
    color: '#A33D3D',
    fontSize: 13,
    textAlign: 'center',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F7F7F8',
  },
  profileImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    marginBottom: 10,
  },
  connectCount: {
    minHeight: 28,
    borderWidth: 1,
    borderColor: '#D6EEEE',
    borderRadius: 16,
    backgroundColor: '#F3FBFB',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  connectIcon: {
    color: '#008681',
    fontSize: 13,
    fontWeight: '700',
  },
  connectCountText: {
    color: '#6B6B6B',
    fontSize: 12,
  },
  profileName: {
    color: '#29292C',
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '700',
  },
  profileSpecialty: {
    color: '#68686B',
    fontSize: 16,
    marginTop: 2,
  },
  post: {
    marginTop: 3,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  authorRow: {
    minHeight: 62,
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  authorName: {
    color: '#29292C',
    fontSize: 15,
    fontWeight: '500',
  },
  authorSubtitle: {
    color: '#747477',
    fontSize: 13,
    marginTop: 2,
  },
  postDescription: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    color: '#29292C',
    fontSize: 14,
    lineHeight: 18,
  },
  postImage: {
    width: '100%',
    backgroundColor: '#EAF4F5',
  },
  postActions: {
    minHeight: 55,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postAction: {
    minWidth: 52,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  likeIcon: {
    color: '#777777',
    fontSize: 25,
    lineHeight: 26,
  },
  likedIcon: {
    color: '#D95757',
  },
  shareIcon: {
    color: '#777777',
    fontSize: 19,
    lineHeight: 24,
  },
  actionCount: {
    color: '#747477',
    fontSize: 13,
  },
});
