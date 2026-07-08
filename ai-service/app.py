from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import ee
import os
import random

app = Flask(__name__)
CORS(app)

GEE_AVAILABLE = False
try:
    ee.Initialize()
    GEE_AVAILABLE = True
    print("Google Earth Engine initialized successfully.")
except Exception as e:
    print(f"GEE Initialization failed: {e}. Using static fallback for NDVI.")

@app.route('/api/verify', methods=['POST'])
def verify_project():
    data = request.json
    
    ocr_result = {
        'soilCarbonPercentage': round(random.uniform(2.0, 6.0), 2),
        'confidence': round(random.uniform(0.7, 0.95), 2),
        'notes': "Extracted via pytesseract simulation"
    }

    ndvi_value = 0.0
    is_fallback = False
    
    if GEE_AVAILABLE:
        try:
            coords = data.get('land', {}).get('coordinates', [])
            ee_coords = [[c[1], c[0]] for c in coords]
            if len(ee_coords) > 0:
                polygon = ee.Geometry.Polygon([ee_coords])
                collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                              .filterBounds(polygon)
                              .filterDate('2023-01-01', '2023-12-31')
                              .sort('CLOUDY_PIXEL_PERCENTAGE')
                              .first())
                
                ndvi = collection.normalizedDifference(['B8', 'B4'])
                ndvi_mean = ndvi.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=polygon,
                    scale=10
                ).getInfo()
                
                ndvi_value = ndvi_mean.get('nd', 0)
        except Exception as e:
            print("GEE NDVI Calculation failed, falling back.", e)
            ndvi_value = round(random.uniform(0.5, 0.85), 3)
            is_fallback = True
    else:
        ndvi_value = round(random.uniform(0.5, 0.85), 3)
        is_fallback = True

    area = data.get('land', {}).get('area', 10)
    tree_type = data.get('land', {}).get('treeType', 'Mixed')
    
    tree_multiplier = 1.0
    if 'pine' in tree_type.lower(): tree_multiplier = 1.2
    if 'oak' in tree_type.lower(): tree_multiplier = 1.5
    if 'redwood' in tree_type.lower(): tree_multiplier = 2.0
    
    base_biomass = area * tree_multiplier
    ndvi_factor = max(ndvi_value, 0.1) * 100
    soil_factor = ocr_result['soilCarbonPercentage'] * 10
    
    carbon_estimated = round((base_biomass * ndvi_factor) + soil_factor, 2)

    docs_present = len(data.get('documents', []))
    doc_score = min(docs_present / 2, 1.0) * 20
    ocr_score = ocr_result['confidence'] * 30
    
    ndvi_max_points = 30 if is_fallback else 50
    ndvi_score = min(ndvi_value * 1.2, 1.0) * ndvi_max_points
    
    trust_score = round(doc_score + ocr_score + ndvi_score, 1)

    result = {
        'ocrData': ocr_result,
        'ndviValue': ndvi_value,
        'satelliteChecked': not is_fallback,
        'fallbackUsed': is_fallback,
        'trustScore': trust_score,
        'carbonEstimated': carbon_estimated
    }

    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
