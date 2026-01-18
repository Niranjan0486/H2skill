"""
Google Earth Engine Python Backend Server

Provides real Sentinel-2 satellite data processing using Google Earth Engine.
This service must be run separately from the Node.js backend.

Requirements:
- Google Earth Engine Python SDK
- Service account authentication
- GEE project with API enabled
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import ee
import os
from datetime import datetime, timedelta
import json

app = Flask(__name__)
CORS(app)

# Initialize Earth Engine
try:
    # Try service account authentication first
    service_account_key = os.getenv('GEE_SERVICE_ACCOUNT_KEY')
    if service_account_key and os.path.exists(service_account_key):
        credentials = ee.ServiceAccountCredentials(None, service_account_key)
        ee.Initialize(credentials)
        print("✓ GEE initialized with service account")
    else:
        # Fallback to user authentication
        ee.Initialize()
        print("✓ GEE initialized with user authentication")
except Exception as e:
    print(f"⚠ GEE initialization failed: {e}")
    print("⚠ Real satellite data will not be available")

# Sentinel-2 L2A collection
S2_COLLECTION = 'COPERNICUS/S2_SR_HARMONIZED'

def create_aoi(lat: float, lon: float, radius_km: float):
    """Create Area of Interest as a circle"""
    point = ee.Geometry.Point([lon, lat])
    return point.buffer(radius_km * 1000)  # Convert km to meters

def mask_clouds(image):
    """Mask clouds using QA60 band"""
    qa = image.select('QA60')
    cloud_bit_mask = 1 << 10
    cirrus_bit_mask = 1 << 11
    mask = qa.bitwiseAnd(cloud_bit_mask).eq(0).And(
        qa.bitwiseAnd(cirrus_bit_mask).eq(0)
    )
    return image.updateMask(mask).divide(10000).copyProperties(image, ['system:time_start'])

def calculate_ndvi(image):
    """Calculate NDVI: (B8 - B4) / (B8 + B4)"""
    ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
    return image.addBands(ndvi)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'gee-python-backend',
        'gee_initialized': ee.Number(1).getInfo() is not None
    })

@app.route('/api/compute-ndvi', methods=['POST'])
def compute_ndvi():
    """
    Compute NDVI from Sentinel-2 data
    
    Request body:
    {
        "latitude": float,
        "longitude": float,
        "radiusKm": float,
        "startYear": int,
        "endYear": int
    }
    """
    try:
        data = request.get_json()
        lat = data['latitude']
        lon = data['longitude']
        radius_km = data['radiusKm']
        start_year = data['startYear']
        end_year = data.get('endYear', datetime.now().year)
        
        # Create AOI
        aoi = create_aoi(lat, lon, radius_km)
        
        # Date range
        start_date = f'{start_year}-01-01'
        end_date = f'{end_year}-12-31'
        
        # Load Sentinel-2 collection
        collection = (ee.ImageCollection(S2_COLLECTION)
                     .filterBounds(aoi)
                     .filterDate(start_date, end_date)
                     .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                     .map(mask_clouds)
                     .map(calculate_ndvi))
        
        # Group by month and compute median
        monthly_ndvi = []
        
        for year in range(start_year, end_year + 1):
            for month in range(1, 13):
                month_start = f'{year}-{month:02d}-01'
                if month == 12:
                    month_end = f'{year + 1}-01-01'
                else:
                    month_end = f'{year}-{month + 1:02d}-01'
                
                # Filter for this month
                month_collection = collection.filterDate(month_start, month_end)
                
                if month_collection.size().getInfo() > 0:
                    # Compute median NDVI
                    median_ndvi = month_collection.select('NDVI').median()
                    ndvi_value = median_ndvi.reduceRegion(
                        reducer=ee.Reducer.mean(),
                        geometry=aoi,
                        scale=10,
                        maxPixels=1e9
                    ).get('NDVI').getInfo()
                    
                    if ndvi_value is not None:
                        monthly_ndvi.append({
                            'month': f'{year}-{month:02d}',
                            'ndvi': round(ndvi_value, 3)
                        })
        
        if not monthly_ndvi:
            return jsonify({'error': 'No valid satellite data found'}), 404
        
        # Calculate baseline and current NDVI
        baseline_ndvi = monthly_ndvi[0]['ndvi']
        current_ndvi = monthly_ndvi[-1]['ndvi']
        ndvi_change = current_ndvi - baseline_ndvi
        vegetation_loss_percent = abs((ndvi_change / baseline_ndvi) * 100) if baseline_ndvi > 0 else 0
        
        # Apply seasonal normalization (5-year rolling mean)
        normalized = apply_seasonal_normalization(monthly_ndvi)
        for i, item in enumerate(monthly_ndvi):
            if i < len(normalized):
                item['normalized'] = normalized[i]
        
        return jsonify({
            'baseline_ndvi': round(baseline_ndvi, 3),
            'current_ndvi': round(current_ndvi, 3),
            'ndvi_change': round(ndvi_change, 3),
            'vegetation_loss_percent': round(vegetation_loss_percent, 1),
            'monthly_ndvi': monthly_ndvi
        })
        
    except Exception as e:
        print(f"Error computing NDVI: {e}")
        return jsonify({'error': str(e)}), 500

def apply_seasonal_normalization(monthly_ndvi):
    """Apply seasonal normalization using 5-year rolling mean"""
    # Group by month (1-12)
    month_groups = {}
    for item in monthly_ndvi:
        month = int(item['month'].split('-')[1])
        if month not in month_groups:
            month_groups[month] = []
        month_groups[month].append(item['ndvi'])
    
    # Calculate monthly means (use last 5 years or all available)
    monthly_means = {}
    for month, values in month_groups.items():
        recent_values = values[-5:] if len(values) >= 5 else values
        monthly_means[month] = sum(recent_values) / len(recent_values)
    
    # Overall mean
    overall_mean = sum(item['ndvi'] for item in monthly_ndvi) / len(monthly_ndvi)
    
    # Apply normalization
    normalized = []
    for item in monthly_ndvi:
        month = int(item['month'].split('-')[1])
        mean = monthly_means.get(month, item['ndvi'])
        normalized_value = item['ndvi'] - mean + overall_mean
        normalized.append(round(normalized_value, 3))
    
    return normalized

@app.route('/api/generate-tiles', methods=['POST'])
def generate_tiles():
    """
    Generate GEE tile layer configuration
    
    Request body:
    {
        "latitude": float,
        "longitude": float,
        "radiusKm": float,
        "viewType": "true-color" | "false-color" | "ndvi"
    }
    """
    try:
        data = request.get_json()
        lat = data['latitude']
        lon = data['longitude']
        radius_km = data['radiusKm']
        view_type = data['viewType']
        
        # Create AOI
        aoi = create_aoi(lat, lon, radius_km)
        
        # Get most recent cloud-free image
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
        
        collection = (ee.ImageCollection(S2_COLLECTION)
                     .filterBounds(aoi)
                     .filterDate(start_date, end_date)
                     .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                     .map(mask_clouds)
                     .sort('system:time_start', False))
        
        image = collection.first()
        
        if view_type == 'true-color':
            # True Color: RGB (B4, B3, B2)
            vis_image = image.select(['B4', 'B3', 'B2']).clip(aoi)
        elif view_type == 'false-color':
            # False Color: NIR, Red, Green (B8, B4, B3)
            vis_image = image.select(['B8', 'B4', 'B3']).clip(aoi)
        else:  # ndvi
            # NDVI Heatmap
            ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
            # Colorize NDVI: green (high) to red (low)
            vis_image = ndvi.clip(aoi)
        
        # Get map ID and token
        map_id = vis_image.getMapId({
            'min': 0 if view_type != 'ndvi' else -1,
            'max': 0.3 if view_type != 'ndvi' else 1
        })
        
        map_id_info = map_id.getInfo()
        
        url_template = (
            f"https://earthengine.googleapis.com/v1alpha/projects/"
            f"earthengine-legacy/maps/{map_id_info['mapid']}/tiles/{{z}}/{{x}}/{{y}}"
            f"?token={map_id_info['token']}"
        )
        
        return jsonify({
            'mapid': map_id_info['mapid'],
            'token': map_id_info['token'],
            'urlTemplate': url_template
        })
        
    except Exception as e:
        print(f"Error generating tiles: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
