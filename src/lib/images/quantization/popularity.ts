import { RGBAImage, QuantizationReport, RGBA } from '../interfaces';

export function popularitySync(image: RGBAImage, numColors: number): QuantizationReport {
    const colorCounts: Map<number, number> = new Map();
    const distinctColors: Set<number> = new Set();
  
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const pixel = image.getPixel(x, y);
        const colorKey = getColorKey(pixel);
        colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
        distinctColors.add(colorKey);
      }
    }
  
    const palette: RGBA[] = [];
    const histogram: number[] = [];
  
    // Sort distinct colors by count in descending order
    const sortedColors = Array.from(distinctColors).sort((a, b) => (colorCounts.get(b) || 0) - (colorCounts.get(a) || 0));
  
    // Take the top 'numColors' colors or all distinct colors if there are fewer
    const count = Math.min(sortedColors.length, numColors);
    for (let i = 0; i < count; i++) {
      const colorKey = sortedColors[i];
      const color = getColorFromKey(colorKey);
      palette.push(color);
      histogram.push(colorCounts.get(colorKey) || 0);
    }
  
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const pixel = image.getPixel(x, y);
        const quantizedPixel = closestColor(pixel, palette);
        image.setPixel(x, y, quantizedPixel);
      }
    }
  
    return {
      palette,
      histogram,
    };
  }
  
  function getColorKey(color: RGBA): number {
    const [r, g, b] = color;
    return (r << 16) | (g << 8) | b;
  }
  
  function getColorFromKey(key: number): RGBA {
    const r = (key >> 16) & 0xFF;
    const g = (key >> 8) & 0xFF;
    const b = key & 0xFF;
    return [r, g, b, 255];
  }
  
  function getColorDistance(color1: RGBA, color2: RGBA): number {
    const [r1, g1, b1] = color1;
    const [r2, g2, b2] = color2;
    const dr = r2 - r1;
    const dg = g2 - g1;
    const db = b2 - b1;
    return dr * dr + dg * dg + db * db;
  }
  
  function closestColor(color: RGBA, palette: RGBA[]): RGBA {
    let minDistance = Number.MAX_VALUE;
    let closestColor = palette[0];
  
    for (const paletteColor of palette) {
      const distance = getColorDistance(color, paletteColor);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = paletteColor;
      }
    }
  
    return closestColor;
  }