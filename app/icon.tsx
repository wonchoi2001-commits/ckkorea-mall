import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#ffffff",
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        CK
      </div>
    ),
    size
  );
}
