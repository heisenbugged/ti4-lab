import "./ui/global.css";
import "./main.css";

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import io from "socket.io-client";
import { SocketProvider } from "./socketContext";
import { LoaderFunctionArgs, redirect } from "react-router";
import { ThemeProvider, Toaster, TooltipProvider, themeScript } from "./ui";

export function Layout({ children }: { children: React.ReactNode }) {
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

  const result = useRouteLoaderData<typeof loader>("root");

  return (
    <html lang="en" data-theme={result?.forcedColorScheme ?? "dark"} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#070b16"></meta>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Saira:wdth,wght@50..125,300..700&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
        {!result?.forcedColorScheme && <script dangerouslySetInnerHTML={{ __html: themeScript }} />}
      </head>
      <body>
        <ThemeProvider forced={result?.forcedColorScheme ?? null}>
          <TooltipProvider>
            <Toaster>
              <SocketProvider socket={socket}>{children}</SocketProvider>
            </Toaster>
          </TooltipProvider>
        </ThemeProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.hostname === "ti4-lab.fly.dev") {
    // Construct the new URL, preserving the path and query parameters
    const newUrl = new URL(url.pathname + url.search, "https://tidraft.com");
    return redirect(newUrl.toString(), 301);
  }

  const forcedColorScheme = url.searchParams.get("FORCED_COLOR_SCHEME") as
    | "dark"
    | "light";
  return { forcedColorScheme };
};

export default function App() {
  return <Outlet />;
}
