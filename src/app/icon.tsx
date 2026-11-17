import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 128, height: 128 };
export const contentType = "image/png";

const layers = ["body", "head", "eyebrow", "mouth-normal", "pupil", "eyelid", "hair"];

export default async function Icon() {
  const images = await Promise.all(layers.map(async (layer) => {
    const file = await readFile(path.join(process.cwd(), "public/assets/images/character", `${layer}.png`));
    return `data:image/png;base64,${file.toString("base64")}`;
  }));

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", overflow: "hidden", borderRadius: 22, background: "#f1f1f1" }}>
      {images.map((src, index) => (
        // These are the same layered assets used by the profile character.
        // eslint-disable-next-line @next/next/no-img-element
        <img key={layers[index]} src={src} alt="" width={338} height={338} style={{ position: "absolute", left: -102, top: -64 }} />
      ))}
    </div>,
    size,
  );
}
