import { CURRENT_USER_ID } from '@/constants/current-user';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.226:3000').replace(/\/$/, '');

export type ApiUser = {
  _id: string;
  name: string;
  occupation: string;
  profileImage: string;
};

export type ApiPost = {
  _id: string;
  content: string;
  author: ApiUser;
  timestamp: string;
  image: string;
};

export type UsersResponse = {
  users: ApiUser[];
  requestedUserIds: string[];
};

type PostsResponse = {
  posts: ApiPost[];
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error(`Could not reach the API at ${API_URL}. Check that the backend is running and the URL is correct.`);
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `API request failed with status ${response.status}.`);
  }
  return (await response.json()) as T;
}

export function getUsers(): Promise<UsersResponse> {
  return requestJson(
    `/users?currentUserId=${encodeURIComponent(CURRENT_USER_ID)}`,
  );
}

export function getPosts(): Promise<PostsResponse> {
  return requestJson('/posts');
}

export function sendConnectionRequest(toUserId: string): Promise<void> {
  return requestJson('/connect', {
    method: 'POST',
    body: JSON.stringify({ fromUserId: CURRENT_USER_ID, toUserId }),
  });
}
