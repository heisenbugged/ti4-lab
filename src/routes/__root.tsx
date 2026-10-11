import globalCss from "~/ui/global.css?url";
import mainCss from "~/main.css?url";

import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import io from "socket.io-client";
import { SocketProvider } from "~/socketContext";
import { ThemeProvider, Toaster, TooltipProvider, themeScript } from "~/ui";

type ColorScheme = "dark" | "light";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Screenshot jobs pin the theme with ?FORCED_COLOR_SCHEME=light|dark.
  validateSearch: (search): { FORCED_COLOR_SCHEME?: ColorScheme } => ({
    FORCED_COLOR_SCHEME:
      search.FORCED_COLOR_SCHEME === "dark" || search.FORCED_COLOR_SCHEME === "light"
        ? search.FORCED_COLOR_SCHEME
        : undefined,
  }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "msapplication-TileColor", content: "#da532c" },
      { name: "theme-color", content: "#070b16" },
    ],
    links: [
      { rel: "apple-touch-icon", sizes: "76x76", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Saira:wdth,wght@50..125,300..700&display=swap",
      },
      { rel: "stylesheet", href: globalCss },
      { rel: "stylesheet", href: mainCss },
    ],
  }),
  shellComponent: RootDocument,
  component: Outlet,
});

function RootDocument({ children }: { children: ReactNode }) {
  const forcedColorScheme = Route.useSearch({ select: (s) => s.FORCED_COLOR_SCHEME });
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
    }
  }, []);

  useEffect(() => {
    const socket = io();
    setSocket(socket);
    return () => {
      socket.close();
    };
  }, []);

  return (
    <html lang="en" data-theme={forcedColorScheme ?? "dark"} suppressHydrationWarning>
      <head>
        <HeadContent />
        {!forcedColorScheme && <script dangerouslySetInnerHTML={{ __html: themeScript }} />}
      </head>
      <body>
        <ThemeProvider forced={forcedColorScheme ?? null}>
          <TooltipProvider>
            <Toaster>
              <SocketProvider socket={socket}>{children}</SocketProvider>
            </Toaster>
          </TooltipProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
