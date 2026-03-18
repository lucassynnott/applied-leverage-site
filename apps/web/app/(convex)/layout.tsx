import { Suspense } from "react";
import { connection } from "next/server";
import { ConvexClientProvider } from "../ConvexClientProvider";

export default async function ConvexRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-neutral-800/40 p-4 text-sm text-neutral-500">
          Loading authenticated view...
        </div>
      }
    >
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </Suspense>
  );
}
