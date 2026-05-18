#!/usr/bin/env node
// Generate PWA app icons using Sharp
import sharp from 'sharp';
import fs from 'fs';

// Create a simple SVG golf pin icon (dark bg #1A1A1A, orange flag #E87722)
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background -->
  <rect width="512" height="512" fill="#1A1A1A"/>

  <!-- Pin pole (dark grey) -->
  <rect x="228" y="200" width="56" height="220" fill="#888888" rx="8"/>

  <!-- Pin flag (orange) -->
  <rect x="284" y="160" width="140" height="100" fill="#E87722" rx="12"/>

  <!-- Flag detail stripe -->
  <rect x="284" y="160" width="140" height="20" fill="#FF9340" rx="12"/>

  <!-- Pin ball (orange with glow effect) -->
  <circle cx="256" cy="420" r="48" fill="#E87722"/>
  <circle cx="256" cy="420" r="48" fill="none" stroke="#FF9340" stroke-width="8" opacity="0.4"/>
</svg>
`;

async function generateIcons() {
  const publicDir = './public';

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generate 192x192 icon
  await sharp(Buffer.from(svgIcon))
    .resize(192, 192, { fit: 'cover' })
    .png()
    .toFile(`${publicDir}/icon-192.png`);

  // Generate 512x512 icon
  await sharp(Buffer.from(svgIcon))
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(`${publicDir}/icon-512.png`);

  console.log('✓ Generated icon-192.png and icon-512.png');
}

generateIcons().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
