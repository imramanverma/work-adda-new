import fs from "fs";
import path from "path";

// 1. Create public directory if not exists
const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 2. Generate a valid favicon.svg with Work Adda logo
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="12" fill="#0284C7"/>
  <circle cx="12" cy="16" r="3.5" fill="#60A5FA"/>
  <circle cx="36" cy="16" r="3.5" fill="#FBBF24"/>
  <circle cx="24" cy="36" r="3.5" fill="#34D399"/>
  <path d="M12 16L24 36L36 16" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.6"/>
  <path d="M15 16L20 28L24 20L28 28L33 16" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="24" cy="12" r="3" fill="#F59E0B"/>
  <path d="M24 15V20" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
  <path d="M24 6L25 9L28 10L25 11L24 14L23 11L20 10L23 9L24 6Z" fill="#FDE047"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, "favicon.svg"), svgContent);

// 3. Create a minimal valid 16x16 standard ICO binary file
// A standard Windows ICO header has 6 bytes (0,0, 1,0, 1,0), directory entry (16 bytes), then BMP or PNG data
// We can embed a 16x16 32-bit BMP into the ICO format
function createMinimalIco(): Buffer {
  const width = 16;
  const height = 16;
  const imageSize = 40 + (width * height * 4) + (width * height / 8); // Header (40) + XOR mask + AND mask
  const fileSize = 6 + 16 + imageSize;

  const buf = Buffer.alloc(fileSize);
  // ICONDIR
  buf.writeUInt16LE(0, 0); // reserved
  buf.writeUInt16LE(1, 2); // type: 1 = icon
  buf.writeUInt16LE(1, 4); // count: 1 image

  // ICONDIRENTRY
  buf.writeUInt8(width, 6); // width
  buf.writeUInt8(height, 7); // height
  buf.writeUInt8(0, 8); // color count
  buf.writeUInt8(0, 9); // reserved
  buf.writeUInt16LE(1, 10); // color planes
  buf.writeUInt16LE(32, 12); // bits per pixel
  buf.writeUInt32LE(imageSize, 14); // image size
  buf.writeUInt32LE(22, 18); // offset of BMP header

  // BITMAPINFOHEADER
  let offset = 22;
  buf.writeUInt32LE(40, offset); // header size
  buf.writeInt32LE(width, offset + 4);
  buf.writeInt32LE(height * 2, offset + 8); // height is doubled in ICO BMP (XOR + AND mask)
  buf.writeUInt16LE(1, offset + 12); // planes
  buf.writeUInt16LE(32, offset + 14); // bit count
  buf.writeUInt32LE(0, offset + 16); // compression (BI_RGB)
  buf.writeUInt32LE(imageSize - 40, offset + 20); // image size
  buf.writeInt32LE(0, offset + 24); // XPelsPerMeter
  buf.writeInt32LE(0, offset + 28); // YPelsPerMeter
  buf.writeUInt32LE(0, offset + 32); // ClrUsed
  buf.writeUInt32LE(0, offset + 36); // ClrImportant

  // Pixel data (BGRA): #0284C7 (Blue background with yellow/white pixel pattern)
  offset += 40;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x >= 2 && x <= 13 && y >= 2 && y <= 13) {
        // Brand blue #0284C7: B=199 (0xC7), G=132 (0x84), R=2 (0x02), A=255
        if ((x === 7 || x === 8) && (y === 7 || y === 8)) {
          // Yellow center
          buf.writeUInt8(0x24, offset++); // B
          buf.writeUInt8(0xBF, offset++); // G
          buf.writeUInt8(0xFB, offset++); // R
          buf.writeUInt8(0xFF, offset++); // A
        } else {
          buf.writeUInt8(0xC7, offset++); // B
          buf.writeUInt8(0x84, offset++); // G
          buf.writeUInt8(0x02, offset++); // R
          buf.writeUInt8(0xFF, offset++); // A
        }
      } else {
        // Transparent
        buf.writeUInt32LE(0, offset);
        offset += 4;
      }
    }
  }

  // AND mask (all 0 for 32-bit transparent where alpha is used)
  for (let i = 0; i < (width * height / 8); i++) {
    buf.writeUInt8(0, offset++);
  }

  return buf;
}

const icoBuffer = createMinimalIco();
fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuffer);
console.log("✅ Generated public/favicon.ico and public/favicon.svg");
