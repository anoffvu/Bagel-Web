/**
 * Configuration constants for the bot's behavior
 */
export const CONFIG = {
  BATCH_SIZE: 100,      // Number of messages to process in one batch
  BATCH_DELAY: 1000,    // Delay between batch processing in milliseconds
  MESSAGE_DELAY: 100,   // Delay between processing individual messages
  MATCH_THRESHOLD: 0.5, // Minimum similarity score for matching
  MATCH_COUNT: 4,       // Number of matches to return
} as const; 