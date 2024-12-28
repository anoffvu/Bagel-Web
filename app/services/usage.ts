import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_API_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export type MessageType = 'chat' | 'summary' | 'match';

export class UsageService {
  static async trackMessage(userId: string, messageType: MessageType, tokensUsed: number) {
    try {
      // Get active subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subError || !subscription) {
        throw new Error('No active subscription found');
      }

      // Check if user has enough messages left
      if (subscription.messages_used >= subscription.messages_limit) {
        throw new Error('Message limit exceeded');
      }

      // Start a transaction
      const { data, error } = await supabase.rpc('track_message_usage', {
        p_user_id: userId,
        p_subscription_id: subscription.id,
        p_message_type: messageType,
        p_tokens_used: tokensUsed
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error tracking message usage:', error);
      throw error;
    }
  }

  static async getRemainingMessages(userId: string): Promise<{
    used: number;
    limit: number;
    remaining: number;
  }> {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('messages_used, messages_limit')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return {
        used: subscription.messages_used,
        limit: subscription.messages_limit,
        remaining: subscription.messages_limit - subscription.messages_used
      };
    } catch (error) {
      console.error('Error getting remaining messages:', error);
      throw error;
    }
  }

  static async getUsageHistory(userId: string, days: number = 30) {
    try {
      const { data, error } = await supabase
        .from('message_usage')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting usage history:', error);
      throw error;
    }
  }
} 