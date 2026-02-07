"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ModePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-100">
      <div className="flex w-225 rounded-3xl bg-white p-10 shadow-lg border-l-8 border-blue-500">
        <div className="flex w-1/2 flex-col items-center justify-center pt-2">
          <Image src="/logo.png" alt="MabelHub Logo" width={170} height={150} />
          <h1 className="text-3xl font-semibold text-blue-500">MabelHub</h1>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex w-1/2 flex-col items-center justify-center px-10">
          <h2 className="mb-8 text-3xl font-semibold">MODE</h2>

          <div className="flex w-full flex-col gap-4">
            <button
              onClick={() => router.push("/dashboard-visit")}
              className="h-11 rounded-full bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              VISIT ACTIVITY
            </button>

            <button
              onClick={() => router.push("/dashboard-sph")}
              className="h-11 rounded-full bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              SPH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
