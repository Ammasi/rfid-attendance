// src/pushSetup.ts
import axios from "axios";

// Paste your actual VAPID public key from your .env here:
const VITE_VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const backend_URI = import.meta.env.VITE_Backend_URI;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorkerAndSubscribe() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported.");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker registered:", registration);

    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") {
      console.warn("Notifications permission denied.");
      return null;
    }

    const existingSubscription =
      await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log("Existing push subscription:", existingSubscription);
      return existingSubscription;
    }

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VITE_VAPID_PUBLIC_KEY),
    });
    console.log("New push subscription created:", newSubscription);
    return newSubscription;
  } catch (err) {
    console.error(
      "Error registering service worker or subscribing to push:",
      err
    );
    return null;
  }
}

export async function sendSubscriptionToServer(subscription: PushSubscription) {
  try {
    await axios.post(
      `${backend_URI}/api/push/subscribe`,
      subscription.toJSON(),
      {
        withCredentials: true,
      }
    );
    console.log("Subscription saved on server");
  } catch (err) {
    console.error("Failed to store subscription on server:", err);
  }
}
