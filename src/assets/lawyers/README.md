# Lawyer Photos

This folder contains profile photos for lawyers featured in the research report.

## Naming Convention

Photos should be named using the lawyer ID for easy reference:
- `IND00569.png` - Ashwath Rau
- `IND0XXXX.png` - Other lawyers

## Image Specifications

- **Format**: PNG or JPG
- **Recommended Size**: 256x256px or larger (square)
- **Aspect Ratio**: 1:1 (square) works best for circular profile photos

## Usage

Photos are imported in components like this:
```tsx
import ashwathRauPhoto from '../../assets/lawyers/IND00569.png';
```

The system will automatically fall back to initials if a photo is not available.
