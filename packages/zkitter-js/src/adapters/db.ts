import { ChatMeta } from "../models/chats";
import { GroupMember } from "../models/group";
import { PostMeta } from "../models/postmeta";
import { Proof } from "../models/proof";
import { User } from "../models/user";
import { UserMeta } from "../models/usermeta";
import { Filter } from "../utils/filters";
import {
  AnyMessage,
  Chat,
  Connection,
  Moderation,
  Post,
  Profile,
} from "../utils/message";

export interface GenericDBAdapterInterface {
  getUserCount: () => Promise<number>;
  getLastArbitrumBlockScanned: () => Promise<number>;
  updateLastArbitrumBlockScanned: (block: number) => Promise<number>;
  getHistoryDownloaded: (user?: string) => Promise<boolean>;
  setHistoryDownloaded: (downloaded: boolean, user?: string) => Promise<void>;
  updateUser: (user: User) => Promise<User>;
  getUsers: (limit?: number, offset?: number | string) => Promise<User[]>;
  getUser: (address: string) => Promise<User | null>;
  getUserMeta: (address: string) => Promise<UserMeta>;
  getUserByECDH: (ecdh: string) => Promise<string | null>;
  getProof: (hash: string) => Promise<Proof | null>;
  insertGroupMember: (
    groupId: string,
    member: GroupMember
  ) => Promise<GroupMember | null>;
  getGroupMembers: (
    groupId: string,
    limit?: number,
    offset?: number | string
  ) => Promise<string[]>;
  findGroupHash: (hash: string, groupId?: string) => Promise<string | null>;
  insertPost: (post: Post, proof: Proof) => Promise<Post>;
  insertChat: (chat: Chat, proof: Proof) => Promise<Chat>;
  insertModeration: (
    moderation: Moderation,
    proof: Proof
  ) => Promise<Moderation | null>;
  insertConnection: (
    connection: Connection,
    proof: Proof
  ) => Promise<Connection | null>;
  insertProfile: (profile: Profile, proof: Proof) => Promise<Profile | null>;
  saveChatECDH: (
    addressOrIdCommitment: string,
    ecdh: string
  ) => Promise<string>;
  getMessagesByUser: (
    address: string,
    limit?: number,
    offset?: number | string
  ) => Promise<AnyMessage[]>;
  getPostMeta: (postHash: string) => Promise<PostMeta>;
  getPost: (hash: string) => Promise<Post | null>;
  getPosts: (limit?: number, offset?: number | string) => Promise<Post[]>;
  getFollowings: (address: string) => Promise<string[]>;
  getHomefeed: (
    filter: Filter,
    limit?: number,
    offset?: number | string
  ) => Promise<Post[]>;
  getUserPosts: (
    address: string,
    limit?: number,
    offset?: number | string
  ) => Promise<Post[]>;
  getGroupPosts: (
    groupId: string,
    limit?: number,
    offset?: number | string
  ) => Promise<Post[]>;
  getReplies: (
    hash: string,
    limit?: number,
    offset?: number | string
  ) => Promise<Post[]>;
  getReposts: (
    hash: string,
    limit?: number,
    offset?: number | string
  ) => Promise<string[]>;
  getModerations: (
    hash: string,
    limit?: number,
    offset?: number | string
  ) => Promise<Moderation[]>;
  getConnections: (
    address: string,
    limit?: number,
    offset?: number | string
  ) => Promise<Connection[]>;
  getChatECDHByUser: (addressOrIdCommitment: string) => Promise<string[]>;
  getChatByECDH: (ecdh: string) => Promise<ChatMeta[]>;
  getChatMeta: (ecdh: string, chatId: string) => Promise<ChatMeta | null>;
  getChatMessages: (
    chatId: string,
    limit?: number,
    offset?: number | string
  ) => Promise<Chat[]>;
}
