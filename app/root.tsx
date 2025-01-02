import "@mantine/core/styles.css";
import "./main.css";

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "@remix-run/react";
import {
  Button,
  ColorSchemeScript,
  MantineProvider,
  createTheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import io from "socket.io-client";
import { SocketProvider } from "./socketContext";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

const mantineTheme = createTheme({
  colors: {
    // override dark colors here to change them for all components
    dark: [
      "#d5d7e0",
      "#acaebf",
      "#8c8fa3",
      "#666980",
      "#4d4f66",
      "#34354a",
      "#2b2c3d",
      "#1d1e30",
      "#0c0d21",
      "#01010a",
    ],
    // used by dark theme
    palePurple: [
      "#f3f2f7",
      "#e2e2e8",
      "#c3c2d2",
      "#a2a0bc",
      "#8583aa",
      "#73719e",
      "#6a679a",
      "#595787",
      "#4f4c79",
      "#44426c",
    ],
    purple: [
      "#f3edff",
      "#e0d7fa",
      "#beabf0",
      "#9a7ce6",
      "#7c56de",
      "#683dd9",
      "#5f2fd8",
      "#4f23c0",
      "#451eac",
      "#3a1899",
    ],
    spaceBlue: [
      "#eef3ff",
      "#dee4f3",
      "#bcc6df",
      "#98a7cc",
      "#798cbb",
      "#657cb2",
      "#5a73ae",
      "#4a6299",
      "#40578a",
      "#324b7c",
    ],
    discordBlue: [
      "#ecf1ff",
      "#d7e0fa",
      "#afbded",
      "#8499e0",
      "#5f79d5",
      "#4866cf",
      "#3b5ccd",
      "#2c4cb6",
      "#2444a4",
      "#173992",
    ],
    magenta: [
      "#ffe9f6",
      "#ffd1e6",
      "#faa1c9",
      "#f66eab",
      "#f24391",
      "#f02881",
      "#f01879",
      "#d60867",
      "#c0005c",
      "#a9004f",
    ],
  },
  breakpoints: {
    xs: "36em",
    sm: "48em",
    md: "62em",
    lg: "75em",
    xl: "88em",
    xxl: "120em",
  },
  primaryColor: "purple",
  fontFamily: '"Quantico", sans-serif',
  headings: {
    fontFamily: "Orbitron",
  },
  components: {
    Button: Button.extend({
      defaultProps: {
        variant: "gradient",
        gradient: { from: "purple", to: "indigo.9", deg: 90 },
      },
    }),
  },
});

export function Layout({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope,
          );
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
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

  useEffect(() => {
    if (!socket) return;
    socket.on("confirmation", (data) => {
      console.log(data);
    });
  }, [socket]);

  const result = useRouteLoaderData<typeof loader>("root");

  return (
    <html lang="en">
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
        <meta name="theme-color" content="#ffffff"></meta>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Quantico:ital,wght@0,400;0,700;1,400;1,700&display=swap&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
        <ColorSchemeScript defaultColorScheme="auto" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:5175222,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `,
          }}
        />
      </head>
      <body>
        <MantineProvider
          theme={mantineTheme}
          defaultColorScheme="dark"
          forceColorScheme={result?.forcedColorScheme ?? undefined}
        >
          <SocketProvider socket={socket}>{children}</SocketProvider>
        </MantineProvider>
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
