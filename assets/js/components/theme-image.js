/**
 * Theme Image Color System
 * 
 * This script dynamically applies CSS filters to images with theme-color-base* classes,
 * converting white (#FFFFFF) parts of the image to the corresponding theme color.
 * 
 * Usage: Add class "theme-color-base0X" to any image where X is the base16 color index
 * Example: <img src="logo.png" class="theme-color-base0C" alt="Logo">
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to convert a CSS variable color to RGB values
    function getRGBComponents(color) {
        // Create a temporary element
        const temp = document.createElement('div');
        document.body.appendChild(temp);
        
        // Set the background color to the CSS variable
        temp.style.color = color;
        
        // Get the computed style
        const computedColor = getComputedStyle(temp).color;
        document.body.removeChild(temp);
        
        // Extract RGB values using regex
        const match = computedColor.match(/rgba?\((\d+), (\d+), (\d+)(?:, [\d.]+)?\)/);
        
        if (match) {
            return {
                r: parseInt(match[1], 10) / 255,
                g: parseInt(match[2], 10) / 255,
                b: parseInt(match[3], 10) / 255
            };
        }
        
        return { r: 0, g: 0, b: 0 }; // Default to black if parsing fails
    }
    
    // Apply theme colors to all themed images
    function applyThemeColorsToImages() {
        // Get all theme-color classes
        const themeColorPattern = /theme-color-base0[0-9A-F]/;
        const themeImages = document.querySelectorAll('img[class*="theme-color-"]');
        
        themeImages.forEach(img => {
            // Find the theme color class
            const themeClass = Array.from(img.classList).find(cls => themeColorPattern.test(cls));
            
            if (themeClass) {
                const colorVar = '--' + themeClass.replace('theme-color-', '');
                const color = getRGBComponents(`var(${colorVar})`);
                
                // Create a CSS filter that will convert white to the theme color
                // For white areas: we color them with the theme color
                // For black areas: we leave them black
                // For gray areas: we apply a proportional amount of the theme color
                const filter = `brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%) drop-shadow(0 0 0 rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, 1))`;
                
                // Apply the filter directly to the image
                img.style.filter = filter;
            }
        });
    }
    
    // Apply colors initially
    applyThemeColorsToImages();
    
    // Update when theme changes (if you have a theme switcher)
    // If you have a theme switcher that changes CSS variables, call this function after the change
    window.updateThemeColors = applyThemeColorsToImages;
});