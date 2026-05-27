# Predicting Price of Real Estate Using Deep Learning and Regression Techniques

This project predicts residential property prices in Pune using a full-stack web application and regression-based machine learning workflow. It combines a cleaned real estate dataset, exploratory analysis, model training experiments, and an interactive prediction interface.

## Features

- Pune property price prediction based on location, area, BHK, bathrooms, balcony count, and furnishing status
- Regression model comparison for real estate price estimation
- Interactive dashboard with charts, summary metrics, and prediction output
- Express backend for API endpoints and model execution
- React and Vite frontend for a responsive user interface

## Tech Stack

- React
- TypeScript
- Vite
- Express.js
- Python
- Regression and deep learning techniques
- Recharts

## Project Structure

```text
src/                         Frontend application
server.ts                    Express server and prediction logic
data/                        Pune real estate dataset
package.json                 Project scripts and dependencies
.env.example                 Environment variable template
```

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

## Dataset

The dataset contains Pune real estate records with property attributes such as location, size, total square footage, bathrooms, balcony count, furnishing status, and price. The model uses these features to estimate property price in lakhs.

## Author

Rohan Thakare
