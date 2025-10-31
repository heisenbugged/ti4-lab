import { isAudioAlertEnabled } from "./audioAlert";

export function requestNotificationPermission() {
  if ("Notification" in window && navigator.serviceWorker) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      } else {
        console.log("Notification permission denied.");
      }
    });
  } else {
    console.log("Browser does not support notifications.");
  }
}

export function showNotification(title: string, options: NotificationOptions) {
  if ("Notification" in window && navigator.serviceWorker) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options);
    });
  }
}

export function playNotificationSound() {
  // Only play sound if user has enabled audio alerts
  if (!isAudioAlertEnabled()) return;

  const audio = document.getElementById("notificationSound");
  if (audio) (audio as any).play();
}
