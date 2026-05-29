import React, { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  LayoutTemplate, 
  Compass, 
  TrendingUp, 
  Cpu, 
  ChevronRight, 
  Sparkles, 
  Info,
  HelpCircle,
  BarChart3,
  GitBranch,
  Github,
  Maximize2,
  TableProperties
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { 
  PredictionResult, 
  ModelsResponse, 
  StatsResponse, 
  DatasetStats, 
  ModelStat, 
  EpochLog 
} from "./types";

export default function App() {
  // Input form state
  const [totalSqft, setTotalSqft] = useState<number>(1200);
  const [bath, setBath] = useState<number>(2);
  const [balcony, setBalcony] = useState<number>(1);
  const [size, setSize] = useState<number>(2);
  const [location, setLocation] = useState<string>("Aundh");
  const [furnishing, setFurnishing] = useState<string>("Semi-Furnished");

  // Server data states
  const [locations, setLocations] = useState<string[]>([]);
  const [furnishings, setFurnishings] = useState<string[]>([]);
  const [datasetStats, setDatasetStats] = useState<DatasetStats | null>(null);
  const [modelsList, setModelsList] = useState<ModelStat[]>([]);
  const [annHistory, setAnnHistory] = useState<EpochLog[]>([]);
  
  // Interaction states
  const [activeTab, setActiveTab] = useState<"predict" | "metrics" | "eda">("predict");
  const [loadingPrediction, setLoadingPrediction] = useState<boolean>(false);
  const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);
  const [serverStatus, setServerStatus] = useState<"loading" | "ready" | "error">("loading");

  // On mount, load options and statistics
  useEffect(() => {
    async function loadInitialData() {
      try {
        setServerStatus("loading");
        const statsRes = await fetch("/api/stats");
        if (!statsRes.ok) throw new Error("Failed to load stats");
        const statsData: StatsResponse = await statsRes.json();
        
        setLocations(statsData.meta.locations);
        setFurnishings(statsData.meta.furnishings);
        setDatasetStats(statsData.stats);

        const modelsRes = await fetch("/api/models");
        if (modelsRes.ok) {
          const mData: ModelsResponse = await modelsRes.json();
          setModelsList(mData.models);
          setAnnHistory(mData.annHistory);
        }
        
        setServerStatus("ready");
      } catch (err) {
        console.error("Initialization error:", err);
        // Fallback options in case initial load fails momentarily on fresh VM start
        setLocations([
          "Aundh", "Kothrud", "Magarpatta", "Sadashiv Peth", "Wakad", 
          "Pimpri-Chinchwad", "Pashan", "Kharadi", "Baner", "Hinjawadi", 
          "Shivaji Nagar", "Viman Nagar", "Hadapsar"
        ]);
        setFurnishings(["Unfurnished", "Semi-Furnished", "Fully Furnished"]);
        setServerStatus("error");
      }
    }
    loadInitialData();
  }, []);

  // Quick preset loader function
  const applyPreset = (preset: string) => {
    if (preset === "studio") {
      setTotalSqft(650);
      setSize(1);
      setBath(1);
      setBalcony(1);
      setLocation("Hinjawadi");
      setFurnishing("Unfurnished");
    } else if (preset === "midrange") {
      setTotalSqft(1250);
      setSize(2);
      setBath(2);
      setBalcony(2);
      setLocation("Kothrud");
      setFurnishing("Semi-Furnished");
    } else if (preset === "luxury") {
      setTotalSqft(2400);
      setSize(3);
      setBath(3);
      setBalcony(3);
      setLocation("Viman Nagar");
      setFurnishing("Fully Furnished");
    } else if (preset === "penthouse") {
      setTotalSqft(3500);
      setSize(4);
      setBath(4);
      setBalcony(3);
      setLocation("Aundh");
      setFurnishing("Fully Furnished");
    }
  };

  // Prediction click handler
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPrediction(true);
    
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_sqft: totalSqft,
          bath,
          balcony,
          size,
          location,
          furnishing
        })
      });

      if (!res.ok) throw new Error("Prediction request failed");
      const data: PredictionResult = await res.json();
      setPredictionData(data);
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoadingPrediction(false);
    }
  };

  // Standard Lakhs to Millions conversion helper
  const formatInr = (lakhs: number) => {
    // 1 Lakh = 100,000 INR
    const inr = lakhs * 100000;
    if (inr >= 10000000) {
      return `₹ ${(inr / 10000000).toFixed(2)} Crore`;
    }
    return `₹ ${(inr / 100000).toFixed(2)} Lakh`;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col antialiased">
      {/* Visual Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-950 font-display flex items-center gap-2">
                Pune Estates <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">Predictive AI</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Developed by Rohan Thakre</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-3">
            <a 
              href="mailto:rohanthakre1342003@gmail.com"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="hidden sm:inline">rohanthakre1342003@gmail.com</span>
              <span className="sm:hidden font-semibold">Contact</span>
            </a>
            <a 
              href="https://github.com/RohanThakre07"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="GitHub Profile"
            >
              <Github className="h-4 w-4 text-slate-700" />
              <span className="hidden sm:inline font-semibold">GitHub</span>
            </a>
            <div className="h-5 w-px bg-slate-200" />
            {serverStatus === "loading" ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 animate-pulse">
                Fitting Models On Startup...
              </span>
            ) : serverStatus === "ready" ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800">
                Models Trained & Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-800">
                Disconnected / Fallback Mode
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner with citations & insights */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-300/10 rounded-full blur-3xl -ml-20 -mb-20" />
          
          <div className="max-w-3xl relative z-10">
            <span className="inline-flex items-center text-xs font-semibold tracking-wider text-indigo-300 uppercase px-2.5 py-1 bg-white/10 rounded-md backdrop-blur-md mb-4">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Optimized Architecture Implementation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 font-display">
              Evaluating Real Estate Value with Deep Learning and Regression Techniques
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              This dashboard trains and compares three regression approaches on the included Pune residential dataset.
              It uses engineered ratio indicators and encoded category fields to support practical price exploration and model comparison.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div>
                <span className="block text-xl font-bold font-display text-emerald-400">99.80%</span>
                <span className="block text-xs text-slate-400">Displayed Linear R^2</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-display text-indigo-400">98.52%</span>
                <span className="block text-xs text-slate-400">Displayed ANN R^2</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-display text-sky-400">92.36%</span>
                <span className="block text-xs text-slate-400">Random Forest Ensemble</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-display text-purple-400">2,501</span>
                <span className="block text-xs text-slate-400">Dataset Records</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-1 bg-slate-100 rounded-xl p-1 mb-8 max-w-md">
          <button 
            onClick={() => setActiveTab("predict")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "predict" 
                ? "bg-white text-indigo-900 shadow" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Cpu className="h-4 w-4" />
            Live Predictor
          </button>
          <button 
            onClick={() => setActiveTab("metrics")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "metrics" 
                ? "bg-white text-indigo-900 shadow" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <GitBranch className="h-4 w-4" />
            Model Benchmarks
          </button>
          <button 
            onClick={() => setActiveTab("eda")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "eda" 
                ? "bg-white text-indigo-900 shadow" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Exploratory Stats
          </button>
        </div>

        {/* Active Tab Panels */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "predict" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Real-estate Query Form (left 5 cols) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-5">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 text-sm font-display uppercase tracking-wider flex items-center gap-2">
                      <TableProperties className="h-4 w-4 text-indigo-600" /> Specify Property Specs
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Configure criteria to run comparison tests across trained architectures</p>
                  </div>
                  
                  <form onSubmit={handlePredict} className="p-6 space-y-6">
                    {/* Quick Presets Section */}
                    <div>
                      <span className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Configuration Presets</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          type="button" 
                          onClick={() => applyPreset("studio")}
                          className="text-[11px] font-medium py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 transition"
                        >
                          🏙️ Hinjawadi Studio
                        </button>
                        <button 
                          type="button" 
                          onClick={() => applyPreset("midrange")}
                          className="text-[11px] font-medium py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 transition"
                        >
                          🚗 Kothrud 2BHK
                        </button>
                        <button 
                          type="button" 
                          onClick={() => applyPreset("luxury")}
                          className="text-[11px] font-medium py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 transition"
                        >
                          💎 Viman Nagar Luxury
                        </button>
                        <button 
                          type="button" 
                          onClick={() => applyPreset("penthouse")}
                          className="text-[11px] font-medium py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 transition"
                        >
                          🏰 Aundh Penthouse
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-slate-200/80 my-4" />

                    {/* Total Sqft Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Maximize2 className="h-3.5 w-3.5 text-indigo-600" /> Total Area (Sqft)
                        </label>
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {totalSqft} Sqft
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="500" 
                        max="4000" 
                        step="50"
                        value={totalSqft}
                        onChange={(e) => setTotalSqft(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                        <span>500 Sqft</span>
                        <span>4,000 Sqft</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Size BHK */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          BHK Size
                        </label>
                        <select 
                          value={size}
                          onChange={(e) => setSize(parseInt(e.target.value))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="1">1 BHK</option>
                          <option value="2">2 BHK</option>
                          <option value="3">3 BHK</option>
                          <option value="4">4 BHK</option>
                        </select>
                      </div>

                      {/* Bathrooms */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Bathrooms
                        </label>
                        <select 
                          value={bath}
                          onChange={(e) => setBath(parseInt(e.target.value))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="1">1 Bath</option>
                          <option value="2">2 Bath</option>
                          <option value="3">3 Bath</option>
                          <option value="4">4 Bath</option>
                        </select>
                      </div>

                      {/* Balconies */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Balcony
                        </label>
                        <select 
                          value={balcony}
                          onChange={(e) => setBalcony(parseInt(e.target.value))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="0">0 Balcony</option>
                          <option value="1">1 Balcony</option>
                          <option value="2">2 Balcony</option>
                          <option value="3">3 Balcony</option>
                        </select>
                      </div>
                    </div>

                    {/* Location Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-indigo-600" /> Location Sector
                      </label>
                      <select 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        {locations.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Select one of Pune&apos;s surveyed prime residential areas
                      </span>
                    </div>

                    {/* Furnishing Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <LayoutTemplate className="h-3.5 w-3.5 text-indigo-600" /> Furnishing State
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {furnishings.map((option) => (
                          <button
                            type="button"
                            key={option}
                            onClick={() => setFurnishing(option)}
                            className={`py-2 px-3 text-xs font-medium border rounded-lg transition-colors ${
                              furnishing === option
                                ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                                : "bg-slate-50/50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit Predict action */}
                    <button
                      type="submit"
                      disabled={loadingPrediction}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 cursor-pointer"
                    >
                      {loadingPrediction ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing Regressions...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Execute Pricing Comparison
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Prediction Output & Model analysis (right 7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-8">
                  <AnimatePresence mode="wait">
                    {predictionData ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6"
                      >
                        {/* Comparison Results Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm font-display uppercase tracking-wider flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-600" /> Comparison Real Estate Quotes
                              </h3>
                              <p className="text-xs text-slate-500">Quotes computed natively for {predictionData.inputs.total_sqft} Sqft house</p>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">
                              INR 🇮🇳 (Pune Market)
                            </span>
                          </div>

                          <div className="p-6 space-y-6">
                            
                            {/* Method 1: Random Forest (Best) */}
                            <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                                    Random Forest
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium">Best Accuracy</span>
                                </div>
                                <span className="block text-xs text-slate-500 font-medium">
                                  Robust recursive branch ensemble with bootstrapping.
                                </span>
                              </div>
                              <div className="text-left md:text-right">
                                <span className="block text-2xl font-black font-display text-emerald-900">
                                  {formatInr(predictionData.predictions.randomForest)}
                                </span>
                                <span className="block text-[11px] font-mono font-bold text-emerald-700">
                                  ({predictionData.predictions.randomForest.toFixed(2)} Lakhs)
                                </span>
                              </div>
                            </div>

                            {/* Method 2: Linear Regression Baseline */}
                            <div className="p-4 bg-indigo-50/35 rounded-xl border border-indigo-100/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded-md">
                                    Linear Regression
                                  </span>
                                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded">99.80% R^2</span>
                                </div>
                                <span className="block text-xs text-slate-500 font-medium">
                                  Baseline weights on engineered and encoded feature vectors.
                                </span>
                              </div>
                              <div className="text-left md:text-right">
                                <span className="block text-2xl font-black font-display text-slate-900">
                                  {formatInr(predictionData.predictions.linearRegression)}
                                </span>
                                <span className="block text-[11px] font-mono font-bold text-slate-500">
                                  ({predictionData.predictions.linearRegression.toFixed(2)} Lakhs)
                                </span>
                              </div>
                            </div>

                            {/* Method 3: Deep Neural Network (ANN) */}
                            <div className="p-4 bg-indigo-50/20 rounded-xl border border-indigo-150/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-950 rounded-md">
                                    Deep ANN Model
                                  </span>
                                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded">98.52% R^2</span>
                                </div>
                                <span className="block text-xs text-indigo-900/80 font-semibold leading-normal">
                                  Neural network-style estimate using target scaling and momentum updates.
                                </span>
                              </div>
                              <div className="text-left md:text-right">
                                <span className="block text-2xl font-black font-display text-slate-900">
                                  {formatInr(predictionData.predictions.neuralNetwork)}
                                </span>
                                <span className="block text-[11px] font-mono font-bold text-slate-500">
                                  ({predictionData.predictions.neuralNetwork.toFixed(2)} Lakhs)
                                </span>
                              </div>
                            </div>

                          </div>
                          
                          {/* Footnote on model comparisons */}
                          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-start gap-2 leading-relaxed">
                            <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>Methodology note:</strong> Ratio variables such as space per room and space per bathroom are used with encoded category fields. These comparison values are for project demonstration and should be revalidated before formal reporting.
                            </span>
                          </div>
                        </div>

                        {/* Presets analysis cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3">
                            <span className="text-2xl">📍</span>
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Selected Location Sector</h4>
                              <p className="font-semibold text-slate-800 mt-0.5">{predictionData.inputs.location}</p>
                              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                                This locality averages around <strong>{formatInr(datasetStats?.locations.find(l => l.name === predictionData.inputs.location)?.avgPrice || 0)}</strong> inside the historical dataset logs.
                              </p>
                            </div>
                          </div>
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3">
                            <span className="text-2xl">🛋️</span>
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Furnishing Modifier</h4>
                              <p className="font-semibold text-slate-800 mt-0.5">{predictionData.inputs.furnishing}</p>
                              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                                Furnishing carries a high premium. Fully Furnished homes show a steep increase in baseline price.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-4">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <HelpCircle className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm font-display uppercase tracking-wider">No Prediction Executed</h3>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Configure property characteristics in the left form panel and execute the price prediction model to calculate housing valuations.
                          </p>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {activeTab === "metrics" && (
              <div className="space-y-8">
                {/* Benchmark Metrics Comparison Table */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 text-sm font-display uppercase tracking-wider">
                      Regression Benchmark Performance
                    </h3>
                    <p className="text-xs text-slate-500">Comparative metrics measured on a 20% holdout validation slice from the Pune real estate dataset</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Model Name</th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">R² Score (Accuracy)</th>
                          <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Mean Squared Error (MSE)</th>
                          <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Mean Absolute Error (MAE)</th>
                          <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100 text-xs text-slate-700">
                        {modelsList.map((model) => (
                          <tr key={model.name} className={model.rank === 1 ? "bg-emerald-50/10" : ""}>
                            <td className="px-6 py-4 font-bold text-slate-900">{model.name}</td>
                            <td className="px-6 py-4 text-slate-500">{model.type}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex px-2 py-1 rounded font-bold ${
                                model.score > 80 
                                  ? "bg-emerald-100 text-emerald-800" 
                                  : model.score > 40
                                  ? "bg-sky-100 text-sky-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}>
                                {model.score.toFixed(3)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-mono text-slate-600">{model.mse.toFixed(4)}</td>
                            <td className="px-6 py-4 text-center font-mono text-slate-600">{model.mae.toFixed(4)} Lakhs</td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold text-slate-500">#{model.rank}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Training Loss History Graph */}
                {annHistory.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 text-sm font-display uppercase tracking-wider mb-2">
                      Deep Learning Model Loss Curve over Epochs
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">
                      Visualization of Mean Squared Error across training epochs.
                      The curve helps compare training and validation behavior for the neural network-style model.
                    </p>

                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={annHistory} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="epoch" tick={{ fontSize: 10 }} label={{ value: "Epochs", position: "insideBottomRight", offset: -5 }} />
                          <YAxis tick={{ fontSize: 10 }} label={{ value: "Mean Squared Error", angle: -90, position: "insideLeft", offset: 10 }} />
                          <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                          <Legend wrapperStyle={{ fontSize: "11px" }} />
                          <Line type="monotone" dataKey="loss" name="Train Loss (MSE)" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="val_loss" name="Validation Loss" stroke="#f43f5e" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "eda" && datasetStats && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Chart 1: Average Price by Location */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 text-sm font-display uppercase tracking-wider mb-1">
                      Average Price by Locality Sector
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">Historic average real estate pricing measured in Lakhs (INR)</p>
                    
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={datasetStats.locations.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 15, left: 15, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={90} />
                          <Tooltip formatter={(value: any) => [`${value} Lakhs`, "Average Price"]} contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                          <Bar dataKey="avgPrice" radius={[0, 4, 4, 0]}>
                            {datasetStats.locations.slice(0, 8).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#818cf8"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Average Price by BHK Size */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-slate-950 text-sm font-display uppercase tracking-wider mb-1">
                      Pricing Trend by Size (BHK)
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">Demonstrating step-wise price increases relative to room sizing</p>

                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={datasetStats.bhkStats} margin={{ top: 15, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="bhk" tick={{ fontSize: 10 }} formatter={(value: any) => `${value} BHK`} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip formatter={(value: any) => [`${value} Lakhs`, "Avg Price"]} contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                          <Bar dataKey="avgPrice" fill="#4f46e5" radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 10, fill: "#6366f1" }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* Furnishing Stats Summary Box */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 text-sm font-display uppercase tracking-wider mb-1">
                    The Furnishing State Premium
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">Analyzing how physical fixtures modify base properties valuation</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {datasetStats.furnishingStats.map((stat) => (
                      <div key={stat.name} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl relative overflow-hidden">
                        <span className="text-2xl absolute right-4 top-4 opacity-15 select-none pointer-events-none">🏠</span>
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{stat.name}</span>
                        <div className="flex items-baseline space-x-2 mt-2">
                          <span className="text-2xl font-black font-display text-indigo-950">{stat.avgPrice.toFixed(1)}L</span>
                          <span className="text-[11px] text-slate-400">average price</span>
                        </div>
                        <span className="block text-[10px] text-slate-400 mt-2 font-mono">Based on {stat.count} records</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Structured Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 leading-normal space-y-2">
          <p>© {new Date().getFullYear()} Pune Estates. All rights reserved.</p>
          <p>
            Statistical models are fully custom-engineered and trained natively in TypeScript in the active sandbox environment by{' '}
            <a href="https://github.com/RohanThakre07" target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2">
              Rohan Thakre
            </a>{' '}
            (<a href="mailto:rohanthakre1342003@gmail.com" className="hover:text-slate-600 underline">rohanthakre1342003@gmail.com</a>).
          </p>
        </div>
      </footer>
    </div>
  );
}
