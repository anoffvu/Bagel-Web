import { Message } from "discord.js";

export interface PlatformMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  channelId: string;
  guildId: string;
  createdAt: Date;
  isIntroduction?: boolean;
}

export function convertDiscordMessage(message: Message): PlatformMessage {
  return {
    id: message.id,
    userId: message.author.id,
    username: message.author.username,
    content: message.content,
    channelId: message.channel.id,
    guildId: message.guild?.id || '',
    createdAt: message.createdAt,
    isIntroduction: false,
  };
}
