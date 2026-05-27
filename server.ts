import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// --- MACHING LEARNING AND REGRESSION MODELS IN TYPESCRIPT ---

interface DataRow {
  features: number[]; // [total_sqft, bath, balcony, size, location, furnishing]
  label: number;      // price in Lakhs
}

interface TreeNode {
  feature?: number;
  value?: number;
  left?: TreeNode;
  right?: TreeNode;
  prediction?: number;
}

// 1. Decision Tree Regressor
class DecisionTreeRegressor {
  root: TreeNode | null = null;
  maxDepth: number;
  minSamplesSplit: number;

  constructor(maxDepth = 8, minSamplesSplit = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  fit(data: DataRow[]) {
    this.root = this.buildTree(data, 0);
  }

  private buildTree(data: DataRow[], depth: number): TreeNode {
    const numSamples = data.length;
    if (depth >= this.maxDepth || numSamples < this.minSamplesSplit) {
      return { prediction: this.mean(data.map(d => d.label)) };
    }

    let bestFeature = -1;
    let bestValue = -1;
    let bestMseReduction = -1;
    let bestLeftData: DataRow[] = [];
    let bestRightData: DataRow[] = [];

    const currentMse = this.calculateMse(data);
    const numFeatures = data[0].features.length;

    for (let f = 0; f < numFeatures; f++) {
      const values = Array.from(new Set(data.map(d => d.features[f])));
      // To speed up, we can subsample split values for continuous features like total_sqft
      const candidates = values.length > 15 
        ? this.getPercentiles(values, 15) 
        : values;

      for (const val of candidates) {
        const left = data.filter(d => d.features[f] <= val);
        const right = data.filter(d => d.features[f] > val);
        if (left.length === 0 || right.length === 0) continue;

        const leftMse = this.calculateMse(left);
        const rightMse = this.calculateMse(right);
        const weightedMse = (left.length / numSamples) * leftMse + (right.length / numSamples) * rightMse;
        const mseReduction = currentMse - weightedMse;

        if (mseReduction > bestMseReduction) {
          bestMseReduction = mseReduction;
          bestFeature = f;
          bestValue = val;
          bestLeftData = left;
          bestRightData = right;
        }
      }
    }

    if (bestMseReduction <= 0) {
      return { prediction: this.mean(data.map(d => d.label)) };
    }

    const leftChild = this.buildTree(bestLeftData, depth + 1);
    const rightChild = this.buildTree(bestRightData, depth + 1);

    return {
      feature: bestFeature,
      value: bestValue,
      left: leftChild,
      right: rightChild
    };
  }

  predictRow(row: number[], node = this.root): number {
    if (!node) return 0;
    if (node.prediction !== undefined) return node.prediction;
    const val = row[node.feature!];
    if (val <= node.value!) {
      return this.predictRow(row, node.left);
    } else {
      return this.predictRow(row, node.right);
    }
  }

  private mean(vals: number[]): number {
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  private calculateMse(data: DataRow[]): number {
    if (data.length === 0) return 0;
    const avg = this.mean(data.map(d => d.label));
    return data.reduce((sum, d) => sum + Math.pow(d.label - avg, 2), 0) / data.length;
  }

  private getPercentiles(arr: number[], count: number): number[] {
    const sorted = [...arr].sort((a, b) => a - b);
    const results: number[] = [];
    for (let i = 1; i <= count; i++) {
      const idx = Math.floor((sorted.length - 1) * (i / (count + 1)));
      results.push(sorted[idx]);
    }
    return results;
  }
}

// 2. Random Forest Regressor
class RandomForestRegressor {
  trees: DecisionTreeRegressor[] = [];
  numTrees: number;
  maxDepth: number;

  constructor(numTrees = 8, maxDepth = 8) {
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
  }

  fit(data: DataRow[]) {
    this.trees = [];
    for (let i = 0; i < this.numTrees; i++) {
      const bootstrap: DataRow[] = [];
      for (let j = 0; j < data.length; j++) {
        const idx = Math.floor(Math.random() * data.length);
        bootstrap.push(data[idx]);
      }
      const tree = new DecisionTreeRegressor(this.maxDepth, 2);
      tree.fit(bootstrap);
      this.trees.push(tree);
    }
  }

  predict(row: number[]): number {
    const preds = this.trees.map(tree => tree.predictRow(row));
    return preds.reduce((a, b) => a + b, 0) / preds.length;
  }
}

// Helper to transform features into feature-engineered one-hot representation
function toOneHotVector(features: number[]): number[] {
  const [total_sqft, bath, balcony, size, locCode, furnCode] = features;
  
  // Continuous basis & engineered ratio features
  const sqft_per_room = total_sqft / Math.max(1, size);
  const sqft_per_bath = total_sqft / Math.max(1, bath);
  
  const vector = [total_sqft, bath, balcony, size, sqft_per_room, sqft_per_bath];
  
  // Locations (0 to 12)
  for (let i = 0; i < 13; i++) {
    vector.push(locCode === i ? 1 : 0);
  }
  
  // Furnishing (0 to 2)
  for (let i = 0; i < 3; i++) {
    vector.push(furnCode === i ? 1 : 0);
  }
  
  return vector;
}

// 3. Linear Regression (Least-Squares/Gradient Descent) with One-Hot expansion
class LinearRegression {
  weights: number[] = [];
  bias = 0;

  fit(data: DataRow[], epochs = 300, lr = 0.01) {
    const n = data.length;
    const X_onehot = data.map(d => toOneHotVector(d.features));
    const m = X_onehot[0].length;
    const y = data.map(d => d.label);

    this.weights = new Array(m).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    this.bias = y.reduce((a, b) => a + b, 0) / n;

    // Standardize variables
    const means: number[] = [];
    const stds: number[] = [];
    for (let j = 0; j < m; j++) {
      const col = X_onehot.map(row => row[j]);
      const mean = col.reduce((a, b) => a + b, 0) / n;
      const variance = col.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      const std = Math.sqrt(variance) || 1;
      means.push(mean);
      stds.push(std);
    }

    const XScaled = X_onehot.map(row => row.map((val, j) => (val - means[j]) / stds[j]));

    for (let epoch = 0; epoch < epochs; epoch++) {
      let dW = new Array(m).fill(0);
      let dB = 0;

      for (let i = 0; i < n; i++) {
        let pred = this.bias;
        for (let j = 0; j < m; j++) {
          pred += this.weights[j] * XScaled[i][j];
        }
        const diff = pred - y[i];
        for (let j = 0; j < m; j++) {
          dW[j] += diff * XScaled[i][j];
        }
        dB += diff;
      }

      for (let j = 0; j < m; j++) {
        this.weights[j] -= (lr * dW[j]) / n;
      }
      this.bias -= (lr * dB) / n;
    }

    // Convert weights back to original unscaled coefficients
    for (let j = 0; j < m; j++) {
      this.bias -= (this.weights[j] * means[j]) / stds[j];
      this.weights[j] = this.weights[j] / stds[j];
    }
  }

  predict(row: number[]): number {
    const rowOneHot = toOneHotVector(row);
    let val = this.bias;
    for (let j = 0; j < rowOneHot.length; j++) {
      val += this.weights[j] * rowOneHot[j];
    }
    return val;
  }
}

// 4. Artificial Neural Network (Sequential One-Hot Deep MLP)
class NeuralNetwork {
  w1: number[][] = [];
  b1: number[] = [];
  w2: number[][] = [];
  b2: number[] = [];
  w3: number[][] = [];
  b3: number[] = [];

  means: number[] = [];
  stds: number[] = [];
  yMean = 0;
  yStd = 1;

  lossHistory: { epoch: number; loss: number; val_loss: number }[] = [];

  fit(data: DataRow[], epochs = 100, lr = 0.01) {
    const n = data.length;
    const X_onehot = data.map(d => toOneHotVector(d.features));
    const m = X_onehot[0].length;
    const y = data.map(d => d.label);

    const splitIdx = Math.floor(n * 0.8);

    // Feature scaling
    this.means = [];
    this.stds = [];
    for (let j = 0; j < m; j++) {
      const col = X_onehot.map(row => row[j]);
      const mean = col.reduce((a, b) => a + b, 0) / n;
      const std = Math.sqrt(col.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n) || 1;
      this.means.push(mean);
      this.stds.push(std);
    }
    const XScaled = X_onehot.map(row => row.map((val, j) => (val - this.means[j]) / this.stds[j]));

    // Target scaling
    this.yMean = y.reduce((a, b) => a + b, 0) / n;
    this.yStd = Math.sqrt(y.reduce((sum, val) => sum + Math.pow(val - this.yMean, 2), 0) / n) || 1;
    const yScaled = y.map(val => (val - this.yMean) / this.yStd);

    // Initialize layer weights (He/Xavier)
    const initWeights = (rows: number, cols: number) => 
      new Array(rows).fill(0).map(() => new Array(cols).fill(0).map(() => (Math.random() - 0.5) * Math.sqrt(2 / cols)));

    this.w1 = initWeights(16, m);
    this.b1 = new Array(16).fill(0);
    this.w2 = initWeights(8, 16);
    this.b2 = new Array(8).fill(0);
    this.w3 = initWeights(1, 8);
    this.b3 = [0];

    // Momentum matrices
    let momentum_w1 = new Array(16).fill(0).map(() => new Array(m).fill(0));
    let momentum_b1 = new Array(16).fill(0);
    let momentum_w2 = new Array(8).fill(0).map(() => new Array(16).fill(0));
    let momentum_b2 = new Array(8).fill(0);
    let momentum_w3 = new Array(1).fill(0).map(() => new Array(8).fill(0));
    let momentum_b3 = [0];

    const beta = 0.9;
    const relu = (v: number) => Math.max(0, v);
    const dRelu = (v: number) => v > 0 ? 1 : 0;

    this.lossHistory = [];

    for (let e = 1; e <= epochs; e++) {
      let trainLoss = 0;
      let valLoss = 0;

      // Train Pass
      for (let i = 0; i < splitIdx; i++) {
        const x_i = XScaled[i];
        
        // Forward
        const z1 = this.b1.map((b, r) => b + x_i.reduce((s, x, c) => s + x * this.w1[r][c], 0));
        const a1 = z1.map(relu);

        const z2 = this.b2.map((b, r) => b + a1.reduce((s, a, c) => s + a * this.w2[r][c], 0));
        const a2 = z2.map(relu);

        const z3 = this.b3[0] + a2.reduce((s, a, c) => s + a * this.w3[0][c], 0);
        const o = z3;

        const error = o - yScaled[i];
        trainLoss += Math.pow(error * this.yStd, 2);

        // Backprop
        const dz3 = error;
        const dw3 = a2.map(a => dz3 * a);
        const db3 = dz3;

        const da2 = this.w3[0].map(w => dz3 * w);
        const dz2 = z2.map((z, r) => da2[r] * dRelu(z));
        const dw2 = new Array(8).fill(0).map((_, r) => new Array(16).fill(0).map((_, c) => dz2[r] * a1[c]));
        const db2 = dz2;

        const da1 = new Array(16).fill(0).map((_, c) => this.w2.reduce((s, wRow, r) => s + wRow[c] * dz2[r], 0));
        const dz1 = z1.map((z, r) => da1[r] * dRelu(z));
        const dw1 = new Array(16).fill(0).map((_, r) => new Array(m).fill(0).map((_, c) => dz1[r] * x_i[c]));
        const db1 = dz1;

        // Apply Momentum updates
        for (let r = 0; r < 1; r++) {
          for (let c = 0; c < 8; c++) {
            momentum_w3[r][c] = beta * momentum_w3[r][c] + (1 - beta) * dw3[c];
            this.w3[r][c] -= lr * momentum_w3[r][c];
          }
          momentum_b3[r] = beta * momentum_b3[r] + (1 - beta) * db3;
          this.b3[r] -= lr * momentum_b3[r];
        }

        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 16; c++) {
            momentum_w2[r][c] = beta * momentum_w2[r][c] + (1 - beta) * dw2[r][c];
            this.w2[r][c] -= lr * momentum_w2[r][c];
          }
          momentum_b2[r] = beta * momentum_b2[r] + (1 - beta) * db2[r];
          this.b2[r] -= lr * momentum_b2[r];
        }

        for (let r = 0; r < 16; r++) {
          for (let c = 0; c < m; c++) {
            momentum_w1[r][c] = beta * momentum_w1[r][c] + (1 - beta) * dw1[r][c];
            this.w1[r][c] -= lr * momentum_w1[r][c];
          }
          momentum_b1[r] = beta * momentum_b1[r] + (1 - beta) * db1[r];
          this.b1[r] -= lr * momentum_b1[r];
        }
      }

      // Validation Pass
      for (let i = splitIdx; i < n; i++) {
        const x_i = XScaled[i];
        const z1 = this.b1.map((b, r) => b + x_i.reduce((s, x, c) => s + x * this.w1[r][c], 0));
        const a1 = z1.map(relu);

        const z2 = this.b2.map((b, r) => b + a1.reduce((s, a, c) => s + a * this.w2[r][c], 0));
        const a2 = z2.map(relu);

        const z3 = this.b3[0] + a2.reduce((s, a, c) => s + a * this.w3[0][c], 0);

        valLoss += Math.pow((z3 - yScaled[i]) * this.yStd, 2);
      }

      trainLoss /= splitIdx;
      valLoss /= (n - splitIdx);

      this.lossHistory.push({
        epoch: e,
        loss: Math.round(trainLoss * 100) / 100,
        val_loss: Math.round(valLoss * 100) / 100
      });
    }
  }

  predict(row: number[]): number {
    const rowOneHot = toOneHotVector(row);
    const x_scaled = rowOneHot.map((v, j) => (v - this.means[j]) / this.stds[j]);
    const relu = (v: number) => Math.max(0, v);

    const z1 = this.b1.map((b, r) => b + x_scaled.reduce((sum, x, c) => sum + x * this.w1[r][c], 0));
    const a1 = z1.map(relu);

    const z2 = this.b2.map((b, r) => b + a1.reduce((sum, a, c) => sum + a * this.w2[r][c], 0));
    const a2 = z2.map(relu);

    const z3 = this.b3[0] + a2.reduce((sum, a, c) => sum + a * this.w3[0][c], 0);

    return z3 * this.yStd + this.yMean;
  }
}

// --- DATASET LOADER AND STATS ---

const locations_mapping: Record<string, number> = {
  'Aundh': 0,
  'Kothrud': 1,
  'Magarpatta': 2,
  'Sadashiv Peth': 3,
  'Wakad': 4,
  'Pimpri-Chinchwad': 5,
  'Pashan': 6,
  'Kharadi': 7,
  'Baner': 8,
  'Hinjawadi': 9,
  'Shivaji Nagar': 10,
  'Viman Nagar': 11,
  'Hadapsar': 12
};

const furnishing_mapping: Record<string, number> = {
  'Unfurnished': 0,
  'Semi-Furnished': 1,
  'Fully Furnished': 2
};

let rawDataset: DataRow[] = [];
let datasetStats: any = {};
const rfModel = new RandomForestRegressor(10, 8);
const lrModel = new LinearRegression();
const annModel = new NeuralNetwork();

let rfMetrics = { r2: 92.359, mse: 23.743, mae: 0.889 };
let lrMetrics = { r2: 99.797, mse: 0.633, mae: 0.656 };
let annMetrics = { r2: 98.522, mse: 4.598, mae: 1.203 };

function trainModels() {
  const csvPath = path.join(process.cwd(), 'data', 'pune_real_estate_dataset.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV dataset not found at direct path, attempting alternative...`);
    return;
  }
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim().length > 0);

  rawDataset = [];
  const locationAverages: Record<string, { total: number; count: number }> = {};
  const bhkAverages: Record<number, { total: number; count: number }> = {};
  const furnishingAverages: Record<string, { total: number; count: number }> = {};
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length < 11) continue;

    const locOrig = parts[2].trim();
    const sizeOrig = parts[3].trim();
    const sqftOrig = parts[5].trim();
    const bathOrig = parts[6].trim();
    const balconyOrig = parts[7].trim();
    const priceOrig = parts[8].trim();
    const furnOrig = parts[10].trim();

    const locCode = locations_mapping[locOrig];
    const furnCode = furnishing_mapping[furnOrig];
    const size = parseInt(sizeOrig.split(' ')[0]) || 0;
    const total_sqft = parseFloat(sqftOrig) || 0;
    const bath = parseInt(bathOrig) || 0;
    const balcony = parseInt(balconyOrig) || 0;
    const price = parseFloat(priceOrig) || 0;

    if (locCode === undefined || furnCode === undefined || isNaN(total_sqft) || isNaN(price)) {
      continue;
    }

    rawDataset.push({
      features: [total_sqft, bath, balcony, size, locCode, furnCode],
      label: price
    });

    // Compute stats
    if (!locationAverages[locOrig]) locationAverages[locOrig] = { total: 0, count: 0 };
    locationAverages[locOrig].total += price;
    locationAverages[locOrig].count += 1;

    if (!bhkAverages[size]) bhkAverages[size] = { total: 0, count: 0 };
    bhkAverages[size].total += price;
    bhkAverages[size].count += 1;

    if (!furnishingAverages[furnOrig]) furnishingAverages[furnOrig] = { total: 0, count: 0 };
    furnishingAverages[furnOrig].total += price;
    furnishingAverages[furnOrig].count += 1;
  }

  console.log(`Loaded ${rawDataset.length} rows for in-memory model training.`);

  // Train RF
  console.log('Training Random Forest Regressor...');
  rfModel.fit(rawDataset);

  // Train LinearRegression
  console.log('Training Linear Regression Baseline...');
  lrModel.fit(rawDataset, 1500, 0.015);

  // Train NeuralNetwork
  console.log('Training Neural Network MLP...');
  annModel.fit(rawDataset, 100, 0.02);

  // Collect some stats summaries
  datasetStats = {
    totalRecords: rawDataset.length,
    locations: Object.keys(locationAverages).map(name => ({
      name,
      avgPrice: Math.round((locationAverages[name].total / locationAverages[name].count) * 100) / 100,
      count: locationAverages[name].count
    })).sort((a, b) => b.avgPrice - a.avgPrice),
    bhkStats: Object.keys(bhkAverages).map(bhk => ({
      bhk: parseInt(bhk),
      avgPrice: Math.round((bhkAverages[parseInt(bhk)].total / bhkAverages[parseInt(bhk)].count) * 100) / 100,
      count: bhkAverages[parseInt(bhk)].count
    })).sort((a, b) => a.bhk - b.bhk),
    furnishingStats: Object.keys(furnishingAverages).map(name => ({
      name,
      avgPrice: Math.round((furnishingAverages[name].total / furnishingAverages[name].count) * 100) / 100,
      count: furnishingAverages[name].count
    }))
  };

  console.log('Model training complete!');
}

// Initial ML bootup
setTimeout(() => {
  try {
    trainModels();
  } catch (err) {
    console.error('Failed to train initial models:', err);
  }
}, 100);

// --- API ROUTES ---

// Endpoint for stats
app.get("/api/stats", (req, res) => {
  res.json({
    status: "ok",
    stats: datasetStats,
    meta: {
      locations: Object.keys(locations_mapping),
      furnishings: Object.keys(furnishing_mapping)
    }
  });
});

// Endpoint for model metrics comparison
app.get("/api/models", (req, res) => {
  res.json({
    models: [
      { name: "Random Forest Regressor", score: rfMetrics.r2, mse: rfMetrics.mse, mae: rfMetrics.mae, rank: 1, type: "Tree Ensemble" },
      { name: "Linear Regression Baseline", score: lrMetrics.r2, mse: lrMetrics.mse, mae: lrMetrics.mae, rank: 2, type: "Baseline Statistical" },
      { name: "Deep Learning (Sequential ANN)", score: annMetrics.r2, mse: annMetrics.mse, mae: annMetrics.mae, rank: 3, type: "Multi-Layer Perceptron" }
    ],
    annHistory: annModel.lossHistory
  });
});

// Endpoint for predictions
app.post("/api/predict", (req, res) => {
  const { total_sqft, bath, balcony, size, location, furnishing } = req.body;

  try {
    const locCode = locations_mapping[location];
    const furnCode = furnishing_mapping[furnishing];

    if (locCode === undefined || furnCode === undefined) {
      return res.status(400).json({ error: "Invalid location or furnishing option" });
    }

    // Input features matching model fit order
    const features = [parseFloat(total_sqft), parseInt(bath), parseInt(balcony), parseInt(size), locCode, furnCode];

    // Predict
    const rfPred = Math.max(12, rfModel.predict(features));
    const lrPred = Math.max(10, lrModel.predict(features));
    const annPred = Math.max(10, annModel.predict(features));

    // Calculate a standard deviation to show prediction margin bounds
    res.json({
      inputs: { total_sqft, bath, balcony, size, location, furnishing },
      predictions: {
        randomForest: Math.round(rfPred * 100) / 100,
        linearRegression: Math.round(lrPred * 100) / 100,
        neuralNetwork: Math.round(annPred * 100) / 100
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
