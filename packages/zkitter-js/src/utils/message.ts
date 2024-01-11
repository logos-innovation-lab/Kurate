import crypto from 'crypto';

export enum MessageType {
  _TWEET = '@TWEET@',
  Post = 'POST',
  Moderation = 'MODERATION',
  Profile = 'PROFILE',
  Connection = 'CONNECTION',
  Chat = 'CHAT',
  File = 'FILE',
}

export type MessageOption = {
  type: MessageType;
  creator?: string;
  createdAt?: Date;
};

export type AnyMessage = Post | Moderation | Connection | Profile | Chat;

export class Message {
  type: MessageType;
  subtype: string;
  creator: string;
  createdAt: Date;

  static getType(type: string): MessageType | null {
    switch (type.toUpperCase()) {
      case 'POST':
        return MessageType.Post;
      case 'CONNECTION':
        return MessageType.Connection;
      case 'FILE':
        return MessageType.File;
      case 'PROFILE':
        return MessageType.Profile;
      case 'MODERATION':
        return MessageType.Moderation;
      case 'CHAT':
        return MessageType.Chat;
      default:
        return null;
    }
  }

  static fromHex(hex: string): Message | undefined {
    let d = hex;
    const [type] = decodeString(d, 2, cb);

    switch (type) {
      case MessageType.Post:
        return Post.fromHex(hex);
      case MessageType.Moderation:
        return Moderation.fromHex(hex);
      case MessageType.Connection:
        return Connection.fromHex(hex);
      case MessageType.Profile:
        return Profile.fromHex(hex);
      case MessageType.Chat:
        return Chat.fromHex(hex);
    }

    function cb(n: number) {
      d = d.slice(n);
    }
  }

  constructor(opt: MessageOption) {
    this.type = opt.type;
    this.creator = opt.creator || '';
    this.createdAt = opt.createdAt || new Date();
  }

  toJSON() {
    throw new Error('toJSON is not implemented');
  }

  hash(): string {
    throw new Error('toHex is not implemented');
  }

  toHex(): string {
    throw new Error('toHex is not implemented');
  }
}

export enum PostMessageSubType {
  Default = '',
  Repost = 'REPOST',
  Reply = 'REPLY',
  MirrorPost = 'M_POST',
  MirrorReply = 'M_REPLY',
}

export type PostMessagePayload = {
  topic: string;
  title: string;
  content: string;
  reference: string;
  attachment: string;
};

export type PostJSON = {
  type: MessageType;
  messageId: string;
  hash: string;
  createdAt: number;
  subtype: PostMessageSubType;
  payload: PostMessagePayload;
  meta?: any;
};

export type PostMessageOption = {
  subtype: PostMessageSubType;
  payload: {
    topic?: string;
    title?: string;
    content?: string;
    reference?: string;
    attachment?: string;
  };
  hash?: string;
} & MessageOption;

export class Post extends Message {
  subtype: PostMessageSubType;

  payload: PostMessagePayload;

  tweetId?: string;

  static fromHex(hex: string) {
    let d = hex;

    const [type] = decodeString(d, 2, cb);
    const [subtype] = decodeString(d, 2, cb);
    const [creator] = decodeString(d, 3, cb);
    const [createdAt] = decodeNumber(d, 12, cb);
    const [topic] = decodeString(d, 3, cb);
    const [title] = decodeString(d, 3, cb);
    const [content] = decodeString(d, 6, cb);
    const [reference] = decodeString(d, 3, cb);
    const [attachment] = decodeString(d, 3, cb);

    return new Post({
      createdAt: new Date(createdAt),
      creator,
      payload: {
        attachment,
        content,
        reference,
        title,
        topic,
      },
      subtype: subtype as PostMessageSubType,
      type: type as MessageType.Post,
    });

    function cb(n: number) {
      d = d.slice(n);
    }
  }

  static getSubtype(subtype: string): PostMessageSubType {
    switch (subtype) {
      case '':
        return PostMessageSubType.Default;
      case 'REPLY':
        return PostMessageSubType.Reply;
      case 'REPOST':
        return PostMessageSubType.Repost;
      case 'M_POST':
        return PostMessageSubType.MirrorPost;
      case 'M_REPLY':
        return PostMessageSubType.MirrorReply;
      default:
        return PostMessageSubType.Default;
    }
  }

  constructor(opt: PostMessageOption) {
    super(opt);
    this.type = opt.type === MessageType._TWEET ? MessageType._TWEET : MessageType.Post;
    this.tweetId = opt.type === MessageType._TWEET ? opt.hash : undefined;
    this.subtype = Post.getSubtype(opt.subtype);
    this.payload = {
      attachment: opt.payload.attachment || '',
      content: opt.payload.content || '',
      reference: opt.payload.reference || '',
      title: opt.payload.title || '',
      topic: opt.payload.topic || '',
    };
  }

  hash() {
    if (this.tweetId) return this.tweetId;
    return crypto.createHash('sha256').update(this.toHex()).digest('hex');
  }

  toJSON(): PostJSON {
    const hash = this.hash();
    return {
      createdAt: this.createdAt.getTime(),
      hash: hash,
      messageId: this.creator ? `${this.creator}/${hash}` : hash,
      payload: this.payload,
      subtype: this.subtype,
      type: this.type,
    };
  }

  toHex() {
    const type = encodeString(this.type, 2);
    const subtype = encodeString(this.subtype, 2);
    const creator = encodeString(this.creator, 3);
    const createdAt = encodeNumber(this.createdAt.getTime(), 12);
    const topic = encodeString(this.payload.topic, 3);
    const title = encodeString(this.payload.title, 3);
    const content = encodeString(this.payload.content, 6);
    const reference = encodeString(this.payload.reference, 3);
    const attachment = encodeString(this.payload.attachment, 3);
    return type + subtype + creator + createdAt + topic + title + content + reference + attachment;
  }
}

export enum ModerationMessageSubType {
  Like = 'LIKE',
  Block = 'BLOCK',
  ThreadBlock = 'THREAD_HIDE_BLOCK',
  ThreadFollow = 'THREAD_SHOW_FOLLOW',
  ThreadMention = 'THREAD_ONLY_MENTION',
  Global = 'GLOBAL',
  Default = '',
}

export type ModerationMessagePayload = {
  reference: string;
};

export type ModerationJSON = {
  type: MessageType;
  messageId: string;
  hash: string;
  createdAt: number;
  subtype: ModerationMessageSubType;
  payload: ModerationMessagePayload;
};

export type ModerationMessageOption = {
  subtype: ModerationMessageSubType;
  payload: {
    reference?: string;
  };
} & MessageOption;

export class Moderation extends Message {
  subtype: ModerationMessageSubType;

  payload: ModerationMessagePayload;

  static fromHex(hex: string) {
    let d = hex;

    const [type] = decodeString(d, 2, cb);
    const [subtype] = decodeString(d, 2, cb);
    const [creator] = decodeString(d, 3, cb);
    const [createdAt] = decodeNumber(d, 12, cb);
    const [reference] = decodeString(d, 3, cb);

    return new Moderation({
      createdAt: new Date(createdAt),
      creator,
      payload: {
        reference,
      },
      subtype: subtype as ModerationMessageSubType,
      type: type as MessageType.Moderation,
    });

    function cb(n: number) {
      d = d.slice(n);
    }
  }

  static getSubtype(subtype: string): ModerationMessageSubType {
    switch (subtype) {
      case 'LIKE':
        return ModerationMessageSubType.Like;
      case 'BLOCK':
        return ModerationMessageSubType.Block;
      case 'THREAD_HIDE_BLOCK':
        return ModerationMessageSubType.ThreadBlock;
      case 'THREAD_SHOW_FOLLOW':
        return ModerationMessageSubType.ThreadFollow;
      case 'THREAD_ONLY_MENTION':
        return ModerationMessageSubType.ThreadMention;
      case 'GLOBAL':
        return ModerationMessageSubType.Global;
      default:
        return ModerationMessageSubType.Default;
    }
  }

  constructor(opt: ModerationMessageOption) {
    super(opt);
    this.type = MessageType.Moderation;
    this.subtype = Moderation.getSubtype(opt.subtype);
    this.payload = {
      reference: opt.payload.reference || '',
    };
  }

  hash() {
    return crypto.createHash('sha256').update(this.toHex()).digest('hex');
  }

  toJSON(): ModerationJSON {
    const hash = this.hash();
    return {
      createdAt: this.createdAt.getTime(),
      hash: hash,
      messageId: `${this.creator}/${hash}`,
      payload: this.payload,
      subtype: this.subtype,
      type: this.type,
    };
  }

  toHex() {
    const type = encodeString(this.type, 2);
    const subtype = encodeString(this.subtype, 2);
    const creator = encodeString(this.creator, 3);
    const createdAt = encodeNumber(this.createdAt.getTime(), 12);
    const reference = encodeString(this.payload.reference, 3);
    return type + subtype + creator + createdAt + reference;
  }
}

export enum ConnectionMessageSubType {
  Follow = 'FOLLOW',
  Block = 'BLOCK',
  MemberInvite = 'MEMBER_INVITE',
  MemberAccept = 'MEMBER_ACCEPT',
  Default = '',
}

export type ConnectionMessagePayload = {
  name: string;
};

export type ConnectionJSON = {
  type: MessageType;
  messageId: string;
  hash: string;
  createdAt: number;
  subtype: ConnectionMessageSubType;
  payload: ConnectionMessagePayload;
};

export type ConnectionMessageOption = {
  subtype: ConnectionMessageSubType;
  payload: {
    name: string;
  };
} & MessageOption;

export class Connection extends Message {
  type: MessageType.Connection;

  subtype: ConnectionMessageSubType;

  payload: ConnectionMessagePayload;

  static fromHex(hex: string): Connection {
    let d = hex;

    const [type] = decodeString(d, 2, cb);
    const [subtype] = decodeString(d, 2, cb);
    const [creator] = decodeString(d, 3, cb);
    const [createdAt] = decodeNumber(d, 12, cb);
    const [name] = decodeString(d, 3, cb);

    return new Connection({
      createdAt: new Date(createdAt),
      creator,
      payload: {
        name,
      },
      subtype: subtype as ConnectionMessageSubType,
      type: type as MessageType.Profile,
    });

    function cb(n: number) {
      d = d.slice(n);
    }
  }

  static getSubtype(subtype: string): ConnectionMessageSubType {
    switch (subtype) {
      case 'FOLLOW':
        return ConnectionMessageSubType.Follow;
      case 'BLOCK':
        return ConnectionMessageSubType.Block;
      case 'MEMBER_INVITE':
        return ConnectionMessageSubType.MemberInvite;
      case 'MEMBER_ACCEPT':
        return ConnectionMessageSubType.MemberAccept;
      default:
        return ConnectionMessageSubType.Default;
    }
  }

  constructor(opt: ConnectionMessageOption) {
    super(opt);
    this.type = MessageType.Connection;
    this.subtype = Connection.getSubtype(opt.subtype);
    this.payload = {
      name: opt.payload.name,
    };
  }

  hash(): string {
    return crypto.createHash('sha256').update(this.toHex()).digest('hex');
  }

  toJSON(): ConnectionJSON {
    const hash = this.hash();
    return {
      createdAt: this.createdAt.getTime(),
      hash: hash,
      messageId: `${this.creator}/${hash}`,
      payload: this.payload,
      subtype: this.subtype,
      type: this.type,
    };
  }

  toHex(): string {
    const type = encodeString(this.type, 2);
    const subtype = encodeString(this.subtype, 2);
    const creator = encodeString(this.creator, 3);
    const createdAt = encodeNumber(this.createdAt.getTime(), 12);
    const name = encodeString(this.payload.name, 3);
    return type + subtype + creator + createdAt + name;
  }
}

export enum ProfileMessageSubType {
  Default = '',
  Name = 'NAME',
  Bio = 'BIO',
  ProfileImage = 'PROFILE_IMAGE',
  CoverImage = 'COVER_IMAGE',
  Website = 'WEBSITE',
  TwitterVerification = 'TWT_VERIFICATION',
  Group = 'GROUP',
  Custom = 'CUSTOM',
}

export type ProfileMessagePayload = {
  key: string;
  value: string;
};

export type ProfileJSON = {
  type: MessageType;
  messageId: string;
  hash: string;
  createdAt: number;
  subtype: ProfileMessageSubType;
  payload: ProfileMessagePayload;
};

export type ProfileMessageOption = {
  subtype: ProfileMessageSubType;
  payload: {
    key?: string;
    value?: string;
  };
} & MessageOption;

export class Profile extends Message {
  subtype: ProfileMessageSubType;

  payload: ProfileMessagePayload;

  static fromHex(hex: string): Profile {
    let d = hex;

    const [type] = decodeString(d, 2, cb);
    const [subtype] = decodeString(d, 2, cb);
    const [creator] = decodeString(d, 3, cb);
    const [createdAt] = decodeNumber(d, 12, cb);
    const [key] = decodeString(d, 3, cb);
    const [value] = decodeString(d, 3, cb);

    return new Profile({
      createdAt: new Date(createdAt),
      creator,
      payload: {
        key,
        value,
      },
      subtype: subtype as ProfileMessageSubType,
      type: type as MessageType.Profile,
    });

    function cb(n: number) {
      d = d.slice(n);
    }
  }

  static getSubtype(subtype: string): ProfileMessageSubType {
    switch (subtype) {
      case 'NAME':
        return ProfileMessageSubType.Name;
      case 'PROFILE_IMAGE':
        return ProfileMessageSubType.ProfileImage;
      case 'COVER_IMAGE':
        return ProfileMessageSubType.CoverImage;
      case 'TWT_VERIFICATION':
        return ProfileMessageSubType.TwitterVerification;
      case 'BIO':
        return ProfileMessageSubType.Bio;
      case 'WEBSITE':
        return ProfileMessageSubType.Website;
      case 'GROUP':
        return ProfileMessageSubType.Group;
      case 'CUSTOM':
        return ProfileMessageSubType.Custom;
      default:
        return ProfileMessageSubType.Default;
    }
  }

  constructor(opt: ProfileMessageOption) {
    super(opt);
    this.type = MessageType.Profile;
    this.subtype = Profile.getSubtype(opt.subtype);
    this.payload = {
      key: opt.payload.key || '',
      value: opt.payload.value || '',
    };
  }

  hash(): string {
    return crypto.createHash('sha256').update(this.toHex()).digest('hex');
  }

  toJSON(): ProfileJSON {
    const hash = this.hash();
    return {
      createdAt: this.createdAt.getTime(),
      hash: hash,
      messageId: `${this.creator}/${hash}`,
      payload: this.payload,
      subtype: this.subtype,
      type: this.type,
    };
  }

  toHex(): string {
    const type = encodeString(this.type, 2);
    const subtype = encodeString(this.subtype, 2);
    const creator = encodeString(this.creator, 3);
    const createdAt = encodeNumber(this.createdAt.getTime(), 12);
    const key = encodeString(this.payload.key, 3);
    const value = encodeString(this.payload.value, 3);
    return type + subtype + creator + createdAt + key + value;
  }
}

function encodeString(str: string, maxBytes: number): string {
  const hex = Buffer.from(str, 'utf-8').toString('hex');
  const len = hex.length;
  const hexlen = len.toString(16).padStart(maxBytes, '0');
  return `${hexlen}${hex}`;
}

function decodeString(data: string, maxBytes: number, cb?: (n: number) => void): [string, number] {
  const lenHex = data.slice(0, maxBytes);
  const len = parseInt(lenHex, 16);
  const str = data.slice(maxBytes, maxBytes + len);
  cb && cb(maxBytes + len);
  return [Buffer.from(str, 'hex').toString('utf-8'), maxBytes + len];
}

function encodeNumber(num: number, maxBytes: number): string {
  return num.toString(16).padStart(maxBytes, '0');
}

function decodeNumber(data: string, maxBytes: number, cb?: (n: number) => void): [number, number] {
  const hex = data.slice(0, maxBytes);
  cb && cb(maxBytes);
  return [parseInt(hex, 16), maxBytes];
}

const HEX_64_REGEX = /\b[A-Fa-f0-9]{64}$\b/;
export function parseMessageId(id: string) {
  const parsed = id.split('/');
  let hash = '',
    creator = '';

  if (parsed.length > 2) {
    return {
      creator: '',
      hash: '',
    };
  }

  if (parsed.length === 2) {
    creator = parsed[0];
    hash = parsed[1];
  }

  if (parsed.length === 1) {
    hash = parsed[0];
  }

  if (!hash || !HEX_64_REGEX.test(hash)) {
    return {
      creator: '',
      hash: '',
    };
  }

  return {
    creator,
    hash,
  };
}

export enum ChatMessageSubType {
  Default = '',
  Direct = 'DIRECT',
}

export type ChatMessagePayload = {
  encryptedContent: string;
  reference: string;
  senderECDH: string;
  senderSeed: string;
  receiverECDH: string;
  content?: string;
};

export type ChatJSON = {
  type: MessageType;
  messageId: string;
  hash: string;
  createdAt: number;
  subtype: ChatMessageSubType;
  payload: ChatMessagePayload;
  meta?: any;
};

export type ChatMessageOption = {
  subtype: ChatMessageSubType;
  payload: {
    encryptedContent: string;
    reference?: string;
    senderECDH: string;
    senderSeed?: string;
    receiverECDH: string;
  };
  hash?: string;
} & MessageOption;

export class Chat extends Message {
  subtype: ChatMessageSubType;

  payload: ChatMessagePayload;

  static fromHex(hex: string) {
    let d = hex;

    const [type] = decodeString(d, 2, cb);
    const [subtype] = decodeString(d, 2, cb);
    const [creator] = decodeString(d, 3, cb);
    const [createdAt] = decodeNumber(d, 12, cb);
    const [encryptedContent] = decodeString(d, 6, cb);
    const [reference] = decodeString(d, 3, cb);
    const [senderECDH] = decodeString(d, 3, cb);
    const [receiverECDH] = decodeString(d, 3, cb);
    const [senderSeed] = decodeString(d, 3, cb);

    return new Chat({
      createdAt: new Date(createdAt),
      creator,
      payload: {
        encryptedContent,
        receiverECDH,
        reference,
        senderECDH,
        senderSeed,
      },
      subtype: subtype as ChatMessageSubType,
      type: type as MessageType.Chat,
    });

    function cb(n: number) {
      d = d.slice(n);
    }
  }

  static getSubtype(subtype: string): ChatMessageSubType {
    switch (subtype) {
      case 'DIRECT':
        return ChatMessageSubType.Direct;
      default:
        return ChatMessageSubType.Default;
    }
  }

  constructor(opt: ChatMessageOption) {
    super(opt);
    this.type = MessageType.Chat;
    this.subtype = Chat.getSubtype(opt.subtype);
    this.payload = {
      encryptedContent: opt.payload.encryptedContent || '',
      receiverECDH: opt.payload.receiverECDH || '',
      reference: opt.payload.reference || '',
      senderECDH: opt.payload.senderECDH || '',
      senderSeed: opt.payload.senderSeed || '',
    };
  }

  hash() {
    return crypto.createHash('sha256').update(this.toHex()).digest('hex');
  }

  toJSON(): ChatJSON {
    const hash = this.hash();
    return {
      createdAt: this.createdAt.getTime(),
      hash: hash,
      messageId: this.creator ? `${this.creator}/${hash}` : hash,
      payload: this.payload,
      subtype: this.subtype,
      type: this.type,
    };
  }

  toHex() {
    const type = encodeString(this.type, 2);
    const subtype = encodeString(this.subtype, 2);
    const creator = encodeString(this.creator, 3);
    const createdAt = encodeNumber(this.createdAt.getTime(), 12);
    const encryptedContent = encodeString(this.payload.encryptedContent, 6);
    const reference = encodeString(this.payload.reference, 3);
    const senderECDH = encodeString(this.payload.senderECDH, 3);
    const receiverECDH = encodeString(this.payload.receiverECDH, 3);
    const senderSeed = encodeString(this.payload.senderSeed, 3);
    return (
      type +
      subtype +
      creator +
      createdAt +
      encryptedContent +
      reference +
      senderECDH +
      receiverECDH +
      senderSeed
    );
  }
}
