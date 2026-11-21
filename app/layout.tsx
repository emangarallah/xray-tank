import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "X-Ray Tank | Smart Water Monitor",
  description: "Wireless smart water tank monitoring with an interactive 3D dashboard.",
  applicationName: "X-Ray Tank"
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
