import { fromImageData } from "./imagedata";
import { QuantizationResult, QuantizationTask } from "./messages";

import { kMeansSync } from "../quantization/k-means";
import { medianCutSync } from "../quantization/median-cut";
import { octreeSync } from "../quantization/octree";
import { popularitySync } from "../quantization/popularity";

console.log("Searchimages started!");
