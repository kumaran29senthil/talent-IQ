import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

// Fail fast if credentials are missing
if (!apiKey || !apiSecret) {
  throw new Error("Stream API Key or Stream API Secret is missing.");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

// Create or update a Stream user
export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUser(userData);
    console.log(`✅ Stream user synced: ${userData.id}`);
  } catch (error) {
    console.error("❌ Error upserting Stream user:", error);
    throw error;
  }
};

// Delete a Stream user
export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId);
    console.log(`✅ Stream user deleted: ${userId}`);
  } catch (error) {
    console.error("❌ Error deleting Stream user:", error);
    throw error;
  }
};

// TODO: Generate Stream user token