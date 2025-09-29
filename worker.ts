import { parentPort } from 'worker_threads';
import crypto from 'crypto';

// Listen for messages from the parent thread
parentPort?.on('message', (text) => {
  // Calculate hash
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  // Send the result back to the parent thread

  parentPort.postMessage(hash);
});

type SnipeInfo = {
  startingAddress?: string;
  endingAddress?: string;
  hyped?: boolean;
  devWallet?: string;
  twitterHandle?: string;
  telegramLink: string;
  discordLink?: string;
  website?: string;
  ticker?: string;
}