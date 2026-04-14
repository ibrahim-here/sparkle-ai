# Konva.js + GSAP API Reference for AI Agents

This document provides a reference for the Konva.js API and the custom GSAP-powered action system used in the PF Visual Learner project.

## Core Components

- **Stage**: The root container. Fixed size `700x400`.
- **Layer**: Contains groups and shapes.
- **Group**: Logical grouping. Can have its own `x, y, opacity`. Use for "Scopes" or "Blocks".
- **Rect**: `x, y, width, height, fill, stroke, strokeWidth, cornerRadius`.
  - *Tip*: Use for Statement Nodes (Rectangle).
- **Circle**: `x, y, radius, fill, stroke, strokeWidth`.
  - *Tip*: Use for start/end points.
- **Text**: `x, y, text, fontSize, fontFamily, fill, width, align`.
- **Arrow**: `points [x1, y1, x2, y2, ...], pointerLength, pointerWidth, fill, stroke, strokeWidth`.
  - *Tip*: Use to show program flow between nodes.
- **Line**: `points [x1, y1, x2, y2], stroke, strokeWidth, dash [10, 5]` (for dashed lines).
- **RegularPolygon**: `x, y, sides: 4, radius, fill, stroke, rotation: 45`.
  - *Tip*: Use for Decision Diamonds (Conditions).

## Animation System (GSAP)

The `KonvaDiagramRenderer` uses GSAP for smooth animations. You trigger these by defining `actions` in the milestone JSON.

### Available Actions:
- **`swap`**: `payload: ["id1", "id2"]`
  - *Effect*: Physically swaps the X/Y coordinates of two shapes using an Ease-In-Out animation.
  - *Usage*: Best for sorting algorithms or swapping variable values.
- **`move`**: `payload: { id: "id", x: number, y: number }`
  - *Effect*: Smoothly moves a shape to a specific coordinate.
  - *Usage*: Moving pointers, pushing items onto a stack.
- **`highlight`**: `payload: { id: "id", color: "hex" }`
  - *Effect*: Pulses the shape with a color.
  - *Usage*: Comparing two elements, highlighting a found item.
- **`set_value`**: `payload: { id: "id", value: "new_value" }`
  - *Effect*: Updates the `text` property of a `Text` shape if its ID matches.

## Interactive Events

- **`onClick`**: Set this to an *ActionKey* (e.g., `"highlight"`).
- **`payload`**: The data passed to the action (e.g., `{ id: "box1", color: "#50FA7B" }`).

## Styling Rules

- **Background**: `#1E1E2E`
- **Primary**: `#6272A4` (Gray-Blue)
- **Success**: `#50FA7B` (Bright Green)
- **Error**: `#FF5555` (Soft Red)
- **Text**: `#F8F8F2` (Off-white)
- **Selection**: `#BD93F9` (Purple)

## Example Structure

```json
{
  "shapes": [
    { "id": "cell_0", "type": "Rect", "x": 100, "y": 150, "width": 60, "height": 60, "fill": "#6272A4" },
    { "id": "val_0", "type": "Text", "x": 120, "y": 170, "text": "42", "fill": "#F8F8F2" }
  ],
  "actions": [
    { "label": "Highlight Cell", "actionKey": "highlight", "payload": { "id": "cell_0", "color": "#50FA7B" } }
  ]
}
```

## Important Constraints
- Stage size is **700x400**.
- Keep interactive elements vertically centered `y: 100-300` for better visibility.
- Always include a `label` for each action button.
