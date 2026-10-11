import posthog from "posthog-js";

export interface VoiceLineClickEvent {
  faction: string;
  lineType: string;
  sessionId?: string;
  isQueued?: boolean;
}

export interface ButtonClickEvent {
  buttonType: string;
  context: string;
  sessionId?: string;
}

export interface PageViewEvent {
  route: string;
  sessionId?: string;
  userAgent?: string;
}

export interface SessionEvent {
  action: "session_started" | "session_ended" | "session_joined";
  sessionId: string;
  userCount?: number;
}

// Track page views
export function trackPageView(data: PageViewEvent) {
  if (typeof window === "undefined") return;

  posthog.capture("page_view", {
    route: data.route,
    session_id: data.sessionId,
    user_agent: data.userAgent || navigator.userAgent,
    timestamp: new Date().toISOString(),
  });
}

// Track voice line clicks - this is the key metric for the app
export function trackVoiceLineClick(data: VoiceLineClickEvent) {
  if (typeof window === "undefined") return;

  posthog.capture("voice_line_clicked", {
    faction: data.faction,
    line_type: data.lineType,
    voice_line_id: `${data.faction}-${data.lineType}`,
    session_id: data.sessionId,
    is_queued: data.isQueued || false,
    timestamp: new Date().toISOString(),
  });
}

// Track button clicks with context
export function trackButtonClick(data: ButtonClickEvent) {
  if (typeof window === "undefined") return;

  posthog.capture("button_clicked", {
    button_type: data.buttonType,
    context: data.context,
    session_id: data.sessionId,
    timestamp: new Date().toISOString(),
  });
}

// Track session-related events
export function trackSessionEvent(data: SessionEvent) {
  if (typeof window === "undefined") return;

  posthog.capture("session_event", {
    action: data.action,
    session_id: data.sessionId,
    user_count: data.userCount,
    timestamp: new Date().toISOString(),
  });
}

// Track time spent on page
export function trackTimeOnPage(route: string, sessionId?: string) {
  if (typeof window === "undefined") return;

  const startTime = Date.now();

  return () => {
    const timeSpent = Date.now() - startTime;
    posthog.capture("time_on_page", {
      route,
      session_id: sessionId,
      time_spent_ms: timeSpent,
      time_spent_seconds: Math.round(timeSpent / 1000),
      timestamp: new Date().toISOString(),
    });
  };
}
