const fs = require('fs');

function getPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  const width = buffer.readInt32BE(16);
  const height = buffer.readInt32BE(20);
  return { width, height };
}

function getJpgDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  let i = 4;
  while (i < buffer.length) {
    const marker = buffer.readUInt16BE(i);
    i += 2;
    if (marker === 0xFFC0 || marker === 0xFFC2) {
      const height = buffer.readUInt16BE(i + 3);
      const width = buffer.readUInt16BE(i + 5);
      return { width, height };
    }
    const length = buffer.readUInt16BE(i);
    i += length;
  }
  return null;
}

try {
  console.log('Spendwise:', getJpgDimensions('public/assets/images/spendwise.jpg'));
} catch (e) {
  console.error('Error reading Spendwise:', e.message);
}

try {
  console.log('Onepiece:', getPngDimensions('public/assets/images/onepiece.png'));
} catch (e) {
  console.error('Error reading Onepiece:', e.message);
}
