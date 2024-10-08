import localFont from "next/font/local";
import "./globals.css";

export const metadata = {
  title: "MDX Editor",
  description:
    "MDX Editor is a powerful and flexible markdown editor that allows you to create and edit markdown content easily.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
