# Favicon Setup

The favicon has been updated to use a TBF-branded SVG favicon. The system is configured to use:

1. **Primary**: `favicon.svg` - SVG format (modern browsers, scalable)
2. **Fallback**: PNG formats for older browsers (optional)

## Current Setup

- ✅ `public/favicon.svg` - TBF-branded SVG favicon (basketball + TBF text)
- ✅ `index.html` - Updated to reference the new favicon

## To Use Your Own TBF Logo

If you have an official TBF logo file, you can replace the current favicon:

### Option 1: Replace SVG (Recommended)
1. Convert your TBF logo to SVG format
2. Replace `public/favicon.svg` with your logo
3. Ensure the SVG has a `viewBox="0 0 64 64"` or similar square dimensions

### Option 2: Use PNG/ICO
1. Create favicon files in these sizes:
   - `favicon-16x16.png` (16x16 pixels)
   - `favicon-32x32.png` (32x32 pixels)
   - `apple-touch-icon.png` (180x180 pixels for iOS)
   - `favicon.ico` (traditional ICO format)

2. Place them in the `public/` folder
3. The HTML already references these files

### Recommended Logo Specifications
- **Format**: SVG (preferred) or PNG
- **Size**: Square (1:1 aspect ratio)
- **Dimensions**: 64x64 minimum, 512x512 recommended
- **Background**: Transparent or solid color
- **Colors**: Should work well on both light and dark backgrounds

## Testing

After updating the favicon:
1. Clear your browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check the browser tab to see the new favicon

## Notes

- Modern browsers prefer SVG favicons for scalability
- The current SVG favicon includes a basketball icon and "TBF" text
- You can customize the colors in `favicon.svg` to match your brand

