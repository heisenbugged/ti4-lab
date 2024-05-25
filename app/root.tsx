// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "./main.css";

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
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

const mantineTheme = createTheme({
  colors: {
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
  // fontFamily: "Orbitron",
  headings: {
    // fontFamily: '"Quantico", sans-serif',
    fontFamily: "Orbitron",
  },
  components: {
    Button: Button.extend({
      defaultProps: {
        variant: "gradient",
        gradient: { from: "purple", to: "indigo.7", deg: 90 },
      },
    }),
  },
});

export function Layout({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket>();

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

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={mantineTheme}>
          <SocketProvider socket={socket}>{children}</SocketProvider>
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
