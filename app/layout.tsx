import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const briccolage = Bricolage_Grotesque({
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Mortgage Calculator",
    description: "Calculate your mortgage payments and see how much you can save by paying extra",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${briccolage.className} antialiased`}>{children}</body>
        </html>
    );
}
