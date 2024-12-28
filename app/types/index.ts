import { ChatInputCommandInteraction } from "discord.js";

export type CommandHandler = (
  interaction: ChatInputCommandInteraction
) => Promise<void>;

export interface Summary {
  summary: string;
  endDate: Date;
} 