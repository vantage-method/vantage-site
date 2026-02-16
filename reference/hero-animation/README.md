# Hero Animation Files - Vanta.js TRUNK Effect

This folder contains the extracted animation files used in the hero section background.

## What is this?

The hero section uses **Vanta.js TRUNK** - a 3D animated background effect that creates organic, branching trunk-like structures that move and respond to mouse interaction.

## Files in this folder

- `vanta-trunk-init.js` - The initialization script for the Vanta.js animation
- `how-to-use.html` - Sample HTML showing how to implement the effect
- `required-css.css` - CSS styles needed for the animation to work properly

## Dependencies

You need to include these libraries before the animation script:

```html
<!-- Required Libraries -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.trunk.min.js"></script>

<!-- Your Animation Init -->
<script src="vanta-trunk-init.js"></script>
```

## How to Use

1. Add the required CSS to your section:
   - `position: relative`
   - `overflow: hidden`
   - White background

2. Add the gradient overlay (optional but recommended for text readability)

3. Include the p5.js and vanta.trunk.js libraries

4. Include the `vanta-trunk-init.js` script

5. Make sure your HTML has the appropriate selectors (`.hero` or `#pricing`)

See `how-to-use.html` for a complete example.

## Configuration Options

You can customize the effect by changing these parameters in `vanta-trunk-init.js`:

- `color: 0x14b1ab` - The color of the trunk structures (hex without #)
- `backgroundColor: 0xffffff` - Background color
- `scale: 1.50` - Size/zoom level
- `spacing: 5.00` - Density of the structures
- `chaos: 8.00` - How chaotic/branched the structures are
- `speed: 0.2` - Animation speed

## Browser Support

Works in all modern browsers with WebGL support.
