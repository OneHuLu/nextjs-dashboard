import "@/app/ui/global.css";
import { inter, lusitana } from "@/app/ui/fonts";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${lusitana.className} text-xl text-gray-800 md:text-3xl md:leading-normal`}>{children}</body>
    </html>
  );
}
