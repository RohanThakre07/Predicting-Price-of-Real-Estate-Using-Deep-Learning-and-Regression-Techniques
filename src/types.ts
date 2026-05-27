export interface InputSpec {
  total_sqft: number;
  bath: number;
  balcony: number;
  size: number;
  location: string;
  furnishing: string;
}

export interface PredictionResult {
  inputs: InputSpec;
  predictions: {
    randomForest: number;
    linearRegression: number;
    neuralNetwork: number;
  };
}

export interface ModelStat {
  name: string;
  score: number;
  mse: number;
  mae: number;
  rank: number;
  type: string;
}

export interface EpochLog {
  epoch: number;
  loss: number;
  val_loss: number;
}

export interface ModelsResponse {
  models: ModelStat[];
  annHistory: EpochLog[];
}

export interface LocationStat {
  name: string;
  avgPrice: number;
  count: number;
}

export interface BhkStat {
  bhk: number;
  avgPrice: number;
  count: number;
}

export interface FurnishingStat {
  name: string;
  avgPrice: number;
  count: number;
}

export interface DatasetStats {
  totalRecords: number;
  locations: LocationStat[];
  bhkStats: BhkStat[];
  furnishingStats: FurnishingStat[];
}

export interface StatsResponse {
  status: string;
  stats: DatasetStats;
  meta: {
    locations: string[];
    furnishings: string[];
  };
}
