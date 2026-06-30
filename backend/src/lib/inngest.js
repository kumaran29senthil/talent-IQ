import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";

// Create a client to send and receive events from Inngest
export const inngest = new Inngest({ id: "talent-iq" });

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

    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      profileImage: image_url,
    };

    await User.findOneAndUpdate(
      { clerkId: id },
      { $set: newUser },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // TODO: later
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

    await User.deleteOne({ clerkId: id });

    // TODO: later
  }
);

export const functions = [syncUser, deleteUserFromDB];