import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
          borderRadius: "8px",
          border: "1px solid #44403c",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Nano Banana Outline */}
          <path d="M4 13c1.5 4.5 6 7 11 7 4 0 6-2 6-4s-2-3-5-3c-4.5 0-8.5-2.5-10-6-1-2.5-.5-5 0-6 1 0 2 1.5 2.5 3 .5 1.5 1.5 3 3.5 4" />
          <path d="M5 4c-.5 1-1 2-1 3" stroke="#d97706" strokeWidth="2.5" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
