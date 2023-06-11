import { QuantizationReport, RGBA, RGBAImage } from '../interfaces';
//Hi
interface RGBACube {
  rMin: number;
  rMax: number;
  gMin: number;
  gMax: number;
  bMin: number;
  bMax: number;
}

function updateClusters(image: RGBAImage, cubes: RGBACube[], clusters: number[]): boolean {
  let changed = false;

  const pixel: RGBA = [0, 0, 0, 0];

  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      image.getPixel(x, y, pixel);
      let cluster = 0;
      let bestDistance = distance(pixel, getCentroid(cubes[0]));

      for (let i = 1; i < cubes.length; i++) {
        const centroidDistance = distance(pixel, getCentroid(cubes[i]));
        if (centroidDistance >= bestDistance) continue;
        bestDistance = centroidDistance;
        cluster = i;
      }

      const clusterIndex = y * image.width + x;
      if (clusters[clusterIndex] !== cluster) changed = true;
      clusters[clusterIndex] = cluster;
    }
  }

  return changed;
}

function applyClusters(image: RGBAImage, cubes: RGBACube[], clusters: number[]): void {
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const clusterIndex = clusters[y * image.width + x];
      const cube = cubes[clusterIndex];
      const centroid = getCentroid(cube);
      image.setPixel(x, y, centroid);
    }
  }
}

function updateCentroids(image: RGBAImage, cubes: RGBACube[], histogram: number[], clusters: number[]): void {
  const pixel: RGBA = [0, 0, 0, 0];

  for (let i = 0; i < cubes.length; i++) {
    const cube = cubes[i];
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    let count = 0;

    for (let y = cube.rMin; y <= cube.rMax; y++) {
      for (let x = cube.gMin; x <= cube.gMax; x++) {
        for (let z = cube.bMin; z <= cube.bMax; z++) {
          const clusterIndex = y * image.width * image.width + x * image.width + z;
          if (clusters[clusterIndex] !== i) continue;
          image.getPixel(x, y, pixel);
          rSum += pixel[0];
          gSum += pixel[1];
          bSum += pixel[2];
          count++;
        }
      }
    }

    histogram[i] = count;

    if (count === 0) count = 1;
    const centroid = getCentroid(cube);
    centroid[0] = Math.floor(rSum / count);
    centroid[1] = Math.floor(gSum / count);
    centroid[2] = Math.floor(bSum / count);
  }
}

function getCentroid(cube: RGBACube): RGBA {
  const r = Math.floor((cube.rMin + cube.rMax) / 2);
  const g = Math.floor((cube.gMin + cube.gMax) / 2);
  const b = Math.floor((cube.bMin + cube.bMax) / 2);
  return [r, g, b, 255];
}

function distance(c1: RGBA, c2: RGBA): number {
  const [r1, g1, b1] = c1;
  const [r2, g2, b2] = c2;

  return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}


export function medianCutSync(image: RGBAImage, count: number): QuantizationReport {
  const cubes: RGBACube[] = [];
  const histogram: number[] = [];
  const clusters: number[] = [];

  cubes.push({ rMin: 0, rMax: 255, gMin: 0, gMax: 255, bMin: 0, bMax: 255 });
  histogram.push(0);

  for (let i = 0; i < image.width * image.height; i++) {
    clusters[i] = 0;
  }

  let iterations = 0;

  while (cubes.length < count) {
    let largestCubeIndex = 0;
    let largestCubeSize = 0;

    for (let i = 0; i < cubes.length; i++) {
      const cube = cubes[i];
      const size = (cube.rMax - cube.rMin + 1) * (cube.gMax - cube.gMin + 1) * (cube.bMax - cube.bMin + 1);

      if (size > largestCubeSize) {
        largestCubeSize = size;
        largestCubeIndex = i;
      }
    }

    const largestCube = cubes[largestCubeIndex];

    if (largestCube.rMax - largestCube.rMin >= largestCube.gMax - largestCube.gMin && largestCube.rMax - largestCube.rMin >= largestCube.bMax - largestCube.bMin) {
      const mid = Math.floor((largestCube.rMax + largestCube.rMin) / 2);
      const cube1 = { rMin: largestCube.rMin, rMax: mid, gMin: largestCube.gMin, gMax: largestCube.gMax, bMin: largestCube.bMin, bMax: largestCube.bMax };
      const cube2 = { rMin: mid + 1, rMax: largestCube.rMax, gMin: largestCube.gMin, gMax: largestCube.gMax, bMin: largestCube.bMin, bMax: largestCube.bMax };
      cubes.splice(largestCubeIndex, 1, cube1, cube2);
    } else if (largestCube.gMax - largestCube.gMin >= largestCube.bMax - largestCube.bMin) {
      const mid = Math.floor((largestCube.gMax + largestCube.gMin) / 2);
      const cube1 = { rMin: largestCube.rMin, rMax: largestCube.rMax, gMin: largestCube.gMin, gMax: mid, bMin: largestCube.bMin, bMax: largestCube.bMax };
      const cube2 = { rMin: largestCube.rMin, rMax: largestCube.rMax, gMin: mid + 1, gMax: largestCube.gMax, bMin: largestCube.bMin, bMax: largestCube.bMax };
      cubes.splice(largestCubeIndex, 1, cube1, cube2);
    } else {
      const mid = Math.floor((largestCube.bMax + largestCube.bMin) / 2);
      const cube1 = { rMin: largestCube.rMin, rMax: largestCube.rMax, gMin: largestCube.gMin, gMax: largestCube.gMax, bMin: largestCube.bMin, bMax: mid };
      const cube2 = { rMin: largestCube.rMin, rMax: largestCube.rMax, gMin: largestCube.gMin, gMax: largestCube.gMax, bMin: mid + 1, bMax: largestCube.bMax };
      cubes.splice(largestCubeIndex, 1, cube1, cube2);
    }

    histogram[largestCubeIndex] = 0;
    histogram.splice(largestCubeIndex, 0, 0);
    clusters.splice(largestCubeIndex, 0, 0);

    updateClusters(image, cubes, clusters);
    updateCentroids(image, cubes, histogram, clusters);
    iterations++;
  }

  console.info(`Took ${iterations} iterations to quantize with ${count} colors.`);

  applyClusters(image, cubes, clusters);

  return {
    palette: cubes.map(getCentroid),
    histogram,
  };
}
