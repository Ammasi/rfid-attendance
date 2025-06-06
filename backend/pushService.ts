// backend/pushService.ts
import webpush from "web-push";

// These environment variables must be set in your backend .env
const PUBLIC_VAPID_KEY = process.env.VAPID_PUBLIC_KEY!;
const PRIVATE_VAPID_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT!; // e.g. "mailto:you@example.com"

webpush.setVapidDetails(
  VAPID_SUBJECT,
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: string
) {
  try {
    // subscription is the object you will store on your server (see next sections).
    // payload is a string—typically JSON‐stringified—containing { title, body, url, groupId } or 
    // whatever you need in the Service Worker to build the notification.
    await webpush.sendNotification(subscription, payload);
    console.log("Backend PushService",await webpush.sendNotification(subscription, payload))
  } catch (err) {
    console.error("Error sending push notification:", err);
    // If you get a 410 (Gone) or 404, you should remove that subscription from your DB.
  }
}
