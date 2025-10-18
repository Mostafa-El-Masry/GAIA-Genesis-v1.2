import "./styles/globals.css";
import "./styles/glacium.css";
import TopNav from "./components/TopNav";
import { ThemeProvider } from "./providers/ThemeProvider";

export const metadata = {
  title: "GAIA Genesis",
  description: "Phase 2 v1.1 – Dashboard & Glacium UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <TopNav />
          <div className="page-with-nav">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
