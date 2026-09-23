import fs from "fs";
import path from "path";

const publicDir = path.join(process.cwd(), "public");

// Minimal valid PNG buffer generator
function createPngBuffer(width = 32, height = 32): Buffer {
  // We can write a valid 1x1 transparent PNG or valid PNG structure
  // Base64 of a valid 32x32 blue PNG icon
  const base64Png =
    "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAVUlEQVR4nO2WsQ0AIAzDsPT/d5tG8gCq2DukBkkspZp3d5uZeZ8c7w7eHbw7eHfw7uDdwbuDdwfvDt4dvDt4d/Du4N3Bu4N3B+8O3h28O/xvAPoA6fQ1+a3yE2MAAAAASUVORK5CYII=";
  return Buffer.from(base64Png, "base64");
}

fs.writeFileSync(path.join(publicDir, "apple-icon.png"), createPngBuffer(180, 180));
fs.writeFileSync(path.join(publicDir, "icon.png"), createPngBuffer(32, 32));
console.log("✅ Generated public/apple-icon.png and public/icon.png");
