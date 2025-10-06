# OCR Testing Guide for Digital Scale Weight Extraction

## Overview
This document provides guidance for testing and improving the OCR (Optical Character Recognition) system used to extract weight readings from digital scale images.

## Current Implementation

### Smart Features
1. **Decimal Point Detection**: Automatically corrects missing decimals (e.g., "974" → "97.4 kg")
2. **Weight Validation**: Rejects readings outside 20-400 kg range
3. **Multi-Number Filtering**: Skips dates (2024) and times (0800) in text
4. **Flexible Input**: Handles both `.` and `,` as decimal separators
5. **Auto-Rounding**: All weights rounded to 1 decimal place

### Testing Modes
- **Development**: Uses mock OCR with 98% success rate and realistic weight values
- **Production**: Uses Google Cloud Vision API for real text detection

## Test Cases for Scale Images

### ✅ Ideal Images (Should Always Work)
1. **Clear Digital Display**
   - Direct front view of scale
   - Good lighting, no shadows
   - Numbers clearly visible (e.g., "97.4", "85.5", "72.3")
   - Solid background

2. **Different Number Formats**
   - With decimal: `97.4 kg`, `85.5`, `72.3 kg`
   - Without decimal: `974` (should detect as `97.4`)
   - With comma: `97,4 kg` (European format)
   - Whole numbers: `95 kg`, `80 kg`

3. **Various Scale Types**
   - LED displays (red/green digits)
   - LCD displays (black digits)
   - Backlit displays
   - Different fonts/styles

### ⚠️ Challenging Images (May Need Retries)
1. **Lighting Issues**
   - Slight glare on display
   - Low light conditions
   - Angled view (< 30 degrees)

2. **Partial Obstructions**
   - Feet partially covering numbers
   - Shadow on part of display
   - Slight blur or motion

3. **Unusual Formats**
   - Very large or small font
   - Unusual color combinations
   - Multiple numbers on screen

### ❌ Invalid Images (Should Fail with Helpful Error)
1. **Completely Unreadable**
   - No scale in image
   - Display turned off
   - Complete shadow/darkness
   - Extreme blur

2. **Out of Range**
   - Readings < 20 kg or > 400 kg
   - Non-weight numbers (years, times, etc.)

## Testing With Real Images

### Sample Scale Images to Test

1. **Standard Digital Scale (White/Silver)**
   - Search: "digital bathroom scale 85 kg"
   - Expected: Should detect weight accurately

2. **Glass Top Scale (Black Display)**
   - Search: "tempered glass digital scale"
   - Expected: Should work with dark backgrounds

3. **LED Red Display**
   - Search: "LED digital scale red display"
   - Expected: Should detect red LED numbers

4. **Smart Scale with App**
   - Search: "smart scale display 97 kg"
   - Expected: Should extract weight ignoring other UI

5. **Medical Scale**
   - Search: "medical digital scale hospital"
   - Expected: Should work with professional scales

### Testing Procedure

1. **Find Test Images**
   ```bash
   # Use Google Images, Unsplash, or stock photo sites
   # Search terms:
   - "digital scale 85 kg display"
   - "bathroom scale weight reading"
   - "smart scale LED display"
   ```

2. **Prepare Test Images**
   - Download 10-15 different scale images
   - Ensure variety: different scales, lighting, angles
   - Include both ideal and challenging cases

3. **Test Through API**
   ```bash
   # Convert image to base64
   base64 -i scale_image.jpg > scale_base64.txt
   
   # Test via API
   curl -X POST https://weight-win.vercel.app/api/weight/process \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "imageBase64": "data:image/jpeg;base64,BASE64_HERE",
       "photoUrl": "test_photo_url"
     }'
   ```

4. **Analyze Results**
   - Track success rate (target: >90%)
   - Note common failure patterns
   - Document edge cases

## Expected Behavior

### Successful Detection
```json
{
  "success": true,
  "data": {
    "weight": 97.4,
    "confidence": 0.95,
    "rawText": "97.4 kg"
  }
}
```

### Failed Detection
```json
{
  "success": false,
  "error": {
    "code": "OCR_FAILED",
    "message": "Could not find a valid weight reading...",
    "details": {
      "rawText": "detected text here"
    }
  }
}
```

## Improving OCR Accuracy

### For Developers

1. **Add More Test Cases**
   - Update `__tests__/ocr-weight-parsing.test.ts`
   - Add edge cases discovered during testing

2. **Enhance parseWeightFromText()**
   - Add support for more number formats
   - Improve decimal detection heuristics
   - Handle scale-specific text patterns

3. **Adjust Validation Ranges**
   - Current: 20-400 kg
   - Consider regional variations
   - Add pound (lbs) support if needed

4. **Better Error Messages**
   - Provide specific guidance based on failure type
   - Suggest retaking photo with tips

### For Production Setup

1. **Enable Google Vision API**
   ```bash
   # Set environment variable in Vercel
   GOOGLE_APPLICATION_CREDENTIALS_JSON={...credentials...}
   ```

2. **Monitor Performance**
   - Log all OCR attempts (success/failure)
   - Track confidence scores
   - Identify common failure patterns

3. **Optimize for Cost**
   - Cache results for duplicate images
   - Use lower-quality API tier for non-critical uses
   - Implement rate limiting (already in place: 20 req/min)

## Common Issues & Solutions

### Issue: "No text detected"
**Causes:**
- Poor lighting
- Display turned off
- Image too small/low resolution

**Solutions:**
- Ensure good lighting
- Take photo directly above scale
- Use device camera (not screenshot)

### Issue: "Could not find weight reading"
**Causes:**
- OCR detected text but no valid weight
- Numbers outside 20-400 kg range
- Mixed numbers (date, time, etc.)

**Solutions:**
- Ensure only weight is visible on display
- Check scale is showing actual weight (not error code)
- Wait for stable reading before photo

### Issue: Wrong weight detected
**Causes:**
- Missing decimal point in OCR
- Multiple numbers in image
- Scale showing different unit

**Solutions:**
- Smart decimal detection should auto-correct
- Crop image to show only scale display
- Ensure scale is set to kg (not lbs)

## Performance Benchmarks

### Target Metrics
- **Success Rate**: > 90% for clear images
- **Accuracy**: ± 0.1 kg from actual reading
- **Response Time**: < 3 seconds total
- **Confidence**: > 0.85 for valid detections

### Current Performance (Mock)
- **Success Rate**: 98% (intentional 2% failure for testing)
- **Response Time**: ~1.5 seconds
- **Weight Range**: 41.5 - 97.4 kg (realistic samples)

## Next Steps

1. ✅ **Reduce mock failure rate** (10% → 2%) - DONE
2. ✅ **Add comprehensive logging** - DONE
3. ✅ **Improve error messages** - DONE
4. 🔄 **Test with 20+ real scale images**
5. 🔄 **Fine-tune decimal detection algorithm**
6. 🔄 **Add support for more scale types**
7. 🔄 **Implement confidence-based retry suggestions**

## Resources

- [Google Vision API Docs](https://cloud.google.com/vision/docs)
- [Digital Scale Image Dataset](https://www.kaggle.com/datasets)
- [OCR Best Practices](https://developers.google.com/ml-kit/vision/text-recognition)

