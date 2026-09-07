import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication Error | Smart Invites",
  description: "Sign-in link expired or verification request cancelled.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthCodeErrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
