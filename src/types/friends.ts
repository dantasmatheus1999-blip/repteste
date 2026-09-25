import { Timestamp } from '../firebase/firestore';

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface UserSummary {
  uid: string;
  name: string;
  displayName?: string;
  photoURL?: string;
  mainCharacterName?: string;
  mainCharacterClass?: string;
  mainCharacterLevel?: number;
  mainCharacterRace?: string;
  isOnline?: boolean;
  lastSeen?: any;
  createdAt?: any;
}

export interface Friendship {
  id: string; // [uid1, uid2].sort().join('_')
  userIds: string[];
  requesterId: string;
  receiverId: string;
  status: FriendshipStatus;
  createdAt: any;
  updatedAt: any;
  requesterData?: UserSummary;
  receiverData?: UserSummary;
}

export interface FriendProfileDetail {
  user: UserSummary;
  characters?: {
    id: string;
    name: string;
    className?: string;
    raceName?: string;
    level?: number;
    imageUrl?: string;
  }[];
  isFriend: boolean;
  friendshipId?: string;
  friendshipStatus?: FriendshipStatus;
  isRequester?: boolean;
}
