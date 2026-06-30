import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

// Create a client to send and receive events from Inngest
export const inngest = new Inngest({
  id: "talent-iq",
});

const syncUser = inngest.createFunction(
  {
    id: "sync-user",
    triggers: [
      {
        event: "clerk/user.created",
      },
    ],
  },
  async ({ event }) => {
    await connectDB();

    const {
      id,
      email_addresses,
      first_name,
      last_name,
      image_url,
    } = event.data;

    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      profileImage: image_url,
    };

    // Sync MongoDB
    await User.findOneAndUpdate(
      { clerkId: id },
      { $set: newUser },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // Sync Stream (don't fail the whole job if Stream is unavailable)
    try {
      await upsertStreamUser({
        id: newUser.clerkId,
        name: newUser.name,
        image: newUser.profileImage,
      });
    } catch (error) {
      console.error("Failed to sync Stream user:", error);
    }
  }
);

const deleteUserFromDB = inngest.createFunction(
  {
    id: "delete-user-from-db",
    triggers: [
      {
        event: "clerk/user.deleted",
      },
    ],
  },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;

    // Delete from MongoDB
    await User.deleteOne({ clerkId: id });

    // Delete from Stream (don't fail the whole job if Stream is unavailable)
    try {
      await deleteStreamUser(id);
    } catch (error) {
      console.error("Failed to delete Stream user:", error);
    }
  }
);

export const functions = [syncUser, deleteUserFromDB];