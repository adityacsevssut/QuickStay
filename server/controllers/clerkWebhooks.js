import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    // req.body is now a Buffer because of express.raw()
    const payloadString = req.body.toString("utf8");

    // Create A Svix Instance With Clerk Webhook Secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Getting Headers
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // Verifying Headers
    let evt;
    try {
      evt = whook.verify(payloadString, headers);
    } catch (err) {
      console.error("Webhook verification failed:", err.message);
      return res.status(400).json({ success: false, message: err.message });
    }

    // Getting Data From parsed event
    const { data, type } = evt;
    console.log("Webhook received type:", type);

    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      username: data.first_name + " " + data.last_name,
      image: data.image_url,
    };
    console.log("User data to save:", userData);

    // Switch Cases For Different Events
    switch (type) {
      case "user.created": {
        const createdUser = await User.create(userData);
        console.log("User created:", createdUser);
        break;
      }
      case "user.updated": {
        const updatedUser = await User.findByIdAndUpdate(data.id, userData, {
          new: true,
        });
        console.log("User updated:", updatedUser);
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        console.log("User deleted:", data.id);
        break;
      }
      default:
        console.log("Unknown event type:", type);
        break;
    }
    res.json({ success: true, message: "Webhook Received" });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export default clerkWebhooks;
