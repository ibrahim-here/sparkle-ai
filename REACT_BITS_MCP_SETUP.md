# React Bits MCP Server Setup Guide

## ✅ Configuration Complete!

I've set up the MCP server configuration for React Bits in your Kiro IDE.

## 📁 Files Created

1. **`.kiro/settings/mcp.json`** - MCP server configuration
2. **`sparkle-landing/components.json`** - React Bits registry configuration

## 🚀 How to Use

### Step 1: Restart Kiro IDE or Reconnect MCP Server

The MCP server should automatically connect. If not:
1. Open Command Palette (Ctrl/Cmd + Shift + P)
2. Search for "MCP: Reconnect Servers"
3. Select it to reconnect

### Step 2: Browse React Bits Components

Once connected, you can use natural language prompts like:

```
"Show me all the available backgrounds from the React Bits registry"
"Add the Dither background from React Bits to this page, make it purple"
"Add a new section which fades in on scroll using FadeContent from React Bits"
```

### Step 3: Install Components from React Bits

You can now install any component from React Bits using:

```bash
npx shadcn@latest add https://reactbits.dev/r/{component-name}.json
```

For example:
```bash
# Install DotGrid component
npx shadcn@latest add https://reactbits.dev/r/DotGrid-JS-CSS.json

# Install Dither background
npx shadcn@latest add https://reactbits.dev/r/Dither-JS-CSS.json

# Install FadeContent animation
npx shadcn@latest add https://reactbits.dev/r/FadeContent-JS-CSS.json
```

## 🎨 Available React Bits Components

### Backgrounds
- DotGrid
- Dither
- Grid patterns
- Gradient backgrounds

### Text Animations
- Split Text
- Blur Text
- Circular Text
- Text Type
- Shuffle
- Shiny Text
- Text Pressure
- Curved Loop
- Fuzzy Text
- Gradient Text
- Falling Text
- Text Cursor
- Decrypted Text
- True Focus
- Scroll Float
- Scroll Reveal
- ASCII Text
- Scrambled Text
- Rotating Text
- Glitch Text
- Scroll Velocity
- Variable Proximity
- Count Up

### Animations
- Animated Content
- Fade Content
- Electric Border
- Pixel Transition
- Glass Hover

## 💡 Example Usage in Your Project

### Using DotGrid (Already Implemented)

```tsx
import { DotGrid } from '@/components/ui/DotGrid';

<DotGrid 
  dotSize={1.5}
  dotColor="rgba(0, 0, 0, 0.15)"
  gap={30}
  backgroundColor="#ffffff"
>
  {/* Your content */}
</DotGrid>
```

### Adding More Effects

You can now easily add more React Bits components to enhance your landing page:

1. **Animated text effects** for headlines
2. **Scroll-triggered animations** for sections
3. **Interactive backgrounds** for different sections
4. **Hover effects** for cards and buttons

## 🔧 Troubleshooting

### MCP Server Not Connecting?

1. Check if the MCP server is running:
   - Open Kiro IDE
   - Look for MCP status in the status bar
   - Check MCP Server view in the Kiro feature panel

2. Manually reconnect:
   - Command Palette → "MCP: Reconnect Servers"

3. Check logs:
   - Command Palette → "MCP: Show Logs"

### Component Installation Issues?

Make sure you're in the project directory:
```bash
cd sparkle-landing
npx shadcn@latest add https://reactbits.dev/r/{component}.json
```

## 📚 Resources

- **React Bits Documentation**: https://reactbits.dev
- **React Bits MCP Docs**: https://ui.shadcn.com/docs/mcp
- **Shadcn CLI**: https://ui.shadcn.com/docs/cli

## 🎉 Next Steps

Now you can:
1. Browse available React Bits components using natural language
2. Install components directly from the registry
3. Enhance your Sparkle.AI landing page with beautiful animations and effects

Try asking me:
- "Add a text animation effect to the hero heading"
- "Install the Dither background component"
- "Show me scroll animation options from React Bits"
