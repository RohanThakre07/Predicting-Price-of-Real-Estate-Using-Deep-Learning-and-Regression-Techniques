# Pune Real Estate Price Prediction App

This project predicts residential property prices in Pune using a full-stack web application and regression-based machine learning workflow. It combines a cleaned real estate dataset, exploratory dashboard views, model comparison, and an interactive prediction interface.

The project is built as a practical data and web application: users can enter property details, view prediction outputs, compare model metrics, and explore summary charts from the dataset.

## Key Features

- Pune property price prediction based on location, area, BHK, bathrooms, balcony count, and furnishing status
- Express API endpoints for dataset statistics, model comparison, and prediction output
- In-memory model training from the included Pune real estate dataset
- Model comparison across Random Forest, Linear Regression, and neural network-style prediction logic
- Dashboard views for location averages, BHK patterns, furnishing-level summaries, and prediction metrics
- React and TypeScript frontend with charts and responsive UI

## Tech Stack

- React
- TypeScript
- Vite
- Express.js
- Python data workflow concepts
- Regression and neural-network-style prediction logic
- Recharts

## Architecture

```text
React frontend
    -> Express API
        -> Dataset loader
        -> Feature encoding
        -> Regression / tree / neural network prediction logic
        -> Prediction and model-metric responses
```

## Project Structure

```text
src/                         Frontend application
server.ts                    Express server, API routes, model logic, and dataset loading
data/                        Pune real estate dataset
package.json                 Project scripts and dependencies
.env.example                 Environment variable template
```

## Dataset

The dataset contains Pune real estate records with property attributes such as:

- Location
- Property size / BHK
- Total square footage
- Bathrooms
- Balcony count
- Furnishing status
- Price in lakhs

The included dataset has about 2,500 records. The model uses these fields to estimate property price and to generate dashboard summaries.

## Model Approach

The backend trains and compares multiple prediction approaches:

| Model | Purpose |
| --- | --- |
| Random Forest Regressor | Tree-based price estimation using bootstrapped decision trees |
| Linear Regression Baseline | Interpretable baseline with engineered and encoded features |
| Neural Network-style MLP | Multi-layer prediction logic with scaled features and training history |

The app exposes the comparison through `/api/models` and returns prediction outputs through `/api/predict`.

## Model Evaluation Note

The app displays model-comparison metrics for demonstration and dashboard review. For formal reporting, the metrics should be regenerated through a reproducible train/test evaluation script and documented with the exact split, preprocessing steps, and validation method.

This project should be treated as an educational and portfolio-level price prediction app, not a production real estate valuation system.

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Useful Routes

```text
GET  /api/stats      Dataset summaries and metadata
GET  /api/models     Model comparison data
POST /api/predict    Price prediction for user inputs
```

## Limitations

- The dataset is limited to the included Pune records and selected locations.
- Market prices change over time, so predictions should not be treated as financial advice.
- Model metrics should be revalidated before using the project for formal reporting.
- The prediction workflow is designed for learning, demonstration, and portfolio review.

## Author

Rohan Thakare
