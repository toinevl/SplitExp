"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/Button";

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back
        </button>
        {slug && (
          <button
            onClick={() => {
              const url = `${window.location.origin}/events/${slug}`;
              navigator.clipboard.writeText(url);
              alert("Link copied to clipboard!");
            }}
            className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Copy Link
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
