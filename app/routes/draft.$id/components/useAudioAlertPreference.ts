import { useSyncExternalStore } from "react";
import {
  AUDIO_ALERT_CHANGE_EVENT,
  hasAudioAlertConsent,
  isAudioAlertEnabled,
} from "~/utils/audioAlert";

function subscribe(onChange: () => void) {
  window.addEventListener(AUDIO_ALERT_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(AUDIO_ALERT_CHANGE_EVENT, onChange);
}

/** The stored sound-alert preference. The server has no localStorage, so it renders alerts off and consent given. */
export function useAudioAlertPreference() {
  const enabled = useSyncExternalStore(subscribe, isAudioAlertEnabled, () => false);
  const consentGiven = useSyncExternalStore(subscribe, hasAudioAlertConsent, () => true);
  return { enabled, consentGiven };
}
