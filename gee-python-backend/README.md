# Google Earth Engine Python Backend

This Python service provides real Sentinel-2 satellite data processing using Google Earth Engine.

## Setup

### Prerequisites

1. Python 3.8+
2. Google Earth Engine account
3. GEE authentication configured

### Installation

```bash
cd gee-python-backend
pip install -r requirements.txt
```

### Environment Variables

Create `.env.local` in the project root:

```bash
GEE_SERVICE_ACCOUNT_KEY=path/to/service-account-key.json
GEE_PROJECT_ID=your-gee-project-id
PORT=5000
```

### Authentication

Authenticate with Google Earth Engine:

```bash
earthengine authenticate --service-account path/to/service-account-key.json
```

### Running

```bash
python server.py
```

The service will run on `http://localhost:5000`

## API Endpoints

### POST /api/compute-ndvi

Compute NDVI from Sentinel-2 data.

**Request:**
```json
{
  "latitude": 11.1085,
  "longitude": 77.3411,
  "radiusKm": 5,
  "startYear": 2018,
  "endYear": 2024
}
```

**Response:**
```json
{
  "baseline_ndvi": 0.82,
  "current_ndvi": 0.67,
  "ndvi_change": -0.15,
  "vegetation_loss_percent": 18,
  "monthly_ndvi": [
    {
      "month": "2018-01",
      "ndvi": 0.82,
      "normalized": 0.81
    }
  ]
}
```

### POST /api/generate-tiles

Generate GEE tile layer configuration.

**Request:**
```json
{
  "latitude": 11.1085,
  "longitude": 77.3411,
  "radiusKm": 5,
  "viewType": "true-color"
}
```

**Response:**
```json
{
  "mapid": "abc123",
  "token": "xyz789",
  "urlTemplate": "https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/maps/{mapid}/tiles/{z}/{x}/{y}?token={token}"
}
```

## Implementation Notes

- Uses Sentinel-2 L2A (COPERNICUS/S2_SR_HARMONIZED)
- Cloud masking: cloud cover < 20%
- Monthly median composite
- NDVI formula: (B8 - B4) / (B8 + B4)
