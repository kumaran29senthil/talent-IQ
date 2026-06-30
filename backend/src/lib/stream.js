import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";

let chatClient = null;

const getChatClient = () => {
  if (chatClient) return chatClient;

  const apiKey = ENV.STREAM_API_KEY;
  const apiSecret = ENV.STREAM_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Stream API credentials are missing.");
  }

  chatClient = StreamChat.getInstance(apiKey, apiSecret);
  return chatClient;
};

export const upsertStreamUser = async (userData) => {
  try {
    await getChatClient().upsertUser(userData);
    console.log(`✅ Stream user synced: ${userData.id}`);
  } catch (error) {
    console.error("❌ Error upserting Stream user:", error);
    throw error;
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await getChatClient().deleteUser(userId);
    console.log(`✅ Stream user deleted: ${userId}`);
  } catch (error) {
    console.error("❌ Error deleting Stream user:", error);
    throw error;
  }
};