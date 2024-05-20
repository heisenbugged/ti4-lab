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
import { ColorSchemeScript, MantineProvider } from "@mantine/core";

export function Layout({ children }: { children: React.ReactNode }) {
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
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Staatliches&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider
          theme={{
            colors: {
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
            },
            headings: { fontFamily: '"Bebas Neue", sans-serif' },
          }}
        >
          {children}
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
