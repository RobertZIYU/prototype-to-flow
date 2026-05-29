# User Flow Template — Figma Plugin API Code

Complete code template for creating a user flow in Figma. Customize the `CONFIG` section at the top, then execute the entire block via `use_figma`.

**Before running:** invoke `/figma-use` (mandatory before every `use_figma` call).

## Template

```javascript
// ================================================
// USER FLOW TEMPLATE
// Customize CONFIG below, then execute via use_figma
// ================================================

// --- CONFIGURATION (replace with actual flow data) ---
const CONFIG = {
  flowTitle: "User Flow Title",
  persona: "Who is this flow for",
  description: "Describe the user's goal, what the user is trying to achieve",
  keyDecision: "Explain key design decision in this workflow",
  date: new Date().toLocaleDateString('en-US'),
  steps: [
    {
      name: "Step Name",
      explanation: "Explain what this screen's goal is, what user is trying to do here"
    },
    {
      name: "Step Name",
      explanation: "Explain what this screen's goal is, what user is trying to do here"
    },
    {
      name: "Step Name",
      explanation: "Explain what this screen's goal is, what user is trying to do here"
    },
    {
      name: "Step Name",
      explanation: "Explain what this screen's goal is, what user is trying to do here"
    }
  ]
};

// --- LAYOUT CONSTANTS ---
const FRAME_W = 1920;
const FRAME_H = 1080;
const GAP = 542;
const LABEL_W = 1915;
const LABEL_H = 236;
const LABEL_RADIUS = 48;
const START_X = 436;
const HEADER_Y = 304;
const LABEL_Y = 1254;
const FRAME_Y = 1619;
const EXPLAIN_Y = 2797;
const STEP_PITCH = FRAME_W + GAP;
const SECTION_H = 3368;

// --- COLORS ---
const SECTION_BG = { r: 232/255, g: 226/255, b: 217/255 };
const LABEL_BG   = { r: 217/255, g: 217/255, b: 217/255 };
const BLACK       = { r: 0, g: 0, b: 0 };
const GRAY        = { r: 97/255, g: 97/255, b: 97/255 };
const DATE_COLOR  = { r: 19/255, g: 19/255, b: 19/255 };
const ARROW_COLOR = { r: 200/255, g: 196/255, b: 189/255 };
const WHITE       = { r: 1, g: 1, b: 1 };

// --- LOAD FONTS ---
await figma.loadFontAsync({ family: "Lora", style: "Bold" });
await figma.loadFontAsync({ family: "Lora", style: "SemiBold" });
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

// --- CALCULATE SECTION WIDTH ---
const numSteps = CONFIG.steps.length;
const sectionW = START_X + (numSteps * FRAME_W) + ((numSteps - 1) * GAP) + START_X;

// ============================================
// CREATE SECTION (container for entire flow)
// ============================================
const section = figma.createSection();
section.name = `User Flow — ${CONFIG.flowTitle}`;
section.resizeWithoutConstraints(sectionW, SECTION_H);
section.fills = [{ type: 'SOLID', color: SECTION_BG }];
figma.currentPage.appendChild(section);

// ============================================
// DATE PILL (top-right corner)
// ============================================
const datePill = figma.createFrame();
datePill.name = "Date Pill";
datePill.layoutMode = "HORIZONTAL";
datePill.primaryAxisAlignItems = "CENTER";
datePill.counterAxisAlignItems = "CENTER";
datePill.paddingLeft = 48;
datePill.paddingRight = 48;
datePill.paddingTop = 24;
datePill.paddingBottom = 24;
datePill.cornerRadius = 9999;
datePill.fills = [];
datePill.strokes = [{ type: 'SOLID', color: BLACK }];
datePill.strokeWeight = 1;

const dateText = figma.createText();
dateText.fontName = { family: "Inter", style: "Semi Bold" };
dateText.fontSize = 64;
dateText.characters = CONFIG.date;
dateText.fills = [{ type: 'SOLID', color: DATE_COLOR, opacity: 0.7 }];
datePill.appendChild(dateText);

section.appendChild(datePill);
datePill.x = sectionW - datePill.width - 105;
datePill.y = 111;

// ============================================
// FLOW TITLE
// ============================================
const titleText = figma.createText();
titleText.name = "Flow Title";
titleText.fontName = { family: "Lora", style: "Bold" };
titleText.fontSize = 200;
titleText.characters = CONFIG.flowTitle;
titleText.fills = [{ type: 'SOLID', color: BLACK }];
section.appendChild(titleText);
titleText.x = START_X;
titleText.y = HEADER_Y + 66;

// ============================================
// VERTICAL DIVIDER (between title and metadata)
// ============================================
const divider = figma.createRectangle();
divider.name = "Divider";
divider.resizeWithoutConstraints(2, 389);
divider.fills = [{ type: 'SOLID', color: BLACK }];
section.appendChild(divider);
divider.x = START_X + titleText.width + 200;
divider.y = HEADER_Y;

// ============================================
// METADATA (Persona, Description, Key Decision)
// ============================================
const metaX = divider.x + 200;
const metaLineHeight = 156; // 77px text + 79px gap

const personaText = figma.createText();
personaText.name = "Persona";
personaText.fontName = { family: "Inter", style: "Regular" };
personaText.fontSize = 64;
personaText.characters = `Persona: ${CONFIG.persona}`;
personaText.fills = [{ type: 'SOLID', color: GRAY }];
section.appendChild(personaText);
personaText.x = metaX;
personaText.y = HEADER_Y;

const descText = figma.createText();
descText.name = "Description";
descText.fontName = { family: "Inter", style: "Regular" };
descText.fontSize = 64;
descText.characters = `Description: ${CONFIG.description}`;
descText.fills = [{ type: 'SOLID', color: GRAY }];
section.appendChild(descText);
descText.x = metaX;
descText.y = HEADER_Y + metaLineHeight;

const kdText = figma.createText();
kdText.name = "Key Decision";
kdText.fontName = { family: "Inter", style: "Regular" };
kdText.fontSize = 64;
kdText.characters = `Key Decision: ${CONFIG.keyDecision}`;
kdText.fills = [{ type: 'SOLID', color: GRAY }];
section.appendChild(kdText);
kdText.x = metaX;
kdText.y = HEADER_Y + (metaLineHeight * 2);

// ============================================
// STEPS (labels, frames, explanations, arrows)
// ============================================
CONFIG.steps.forEach((step, i) => {
  const stepX = START_X + (i * STEP_PITCH);

  // --- Step label pill (rounded background) ---
  const labelBg = figma.createRectangle();
  labelBg.name = `Step ${i + 1} — ${step.name} BG`;
  labelBg.resizeWithoutConstraints(LABEL_W, LABEL_H);
  labelBg.cornerRadius = LABEL_RADIUS;
  labelBg.fills = [{ type: 'SOLID', color: LABEL_BG }];
  section.appendChild(labelBg);
  labelBg.x = stepX;
  labelBg.y = LABEL_Y;

  // --- Step label text (centered on pill) ---
  const labelText = figma.createText();
  labelText.name = `Step ${i + 1} — ${step.name}`;
  labelText.fontName = { family: "Lora", style: "SemiBold" };
  labelText.fontSize = 68;
  labelText.characters = step.name;
  labelText.fills = [{ type: 'SOLID', color: BLACK }];
  section.appendChild(labelText);
  labelText.x = stepX + (LABEL_W - labelText.width) / 2;
  labelText.y = LABEL_Y + (LABEL_H - labelText.height) / 2;

  // --- Screen frame ---
  const screenFrame = figma.createFrame();
  screenFrame.name = `Screen ${i + 1} — ${step.name}`;
  screenFrame.resizeWithoutConstraints(FRAME_W, FRAME_H);
  screenFrame.fills = [{ type: 'SOLID', color: WHITE }];
  section.appendChild(screenFrame);
  screenFrame.x = stepX;
  screenFrame.y = FRAME_Y;

  // --- Step explanation text ---
  const explainText = figma.createText();
  explainText.name = `Explanation ${i + 1}`;
  explainText.fontName = { family: "Inter", style: "Regular" };
  explainText.fontSize = 60;
  explainText.characters = step.explanation;
  explainText.fills = [{ type: 'SOLID', color: GRAY }];
  section.appendChild(explainText);
  explainText.x = stepX + 20;
  explainText.y = EXPLAIN_Y;

  // --- Connecting arrow (not after last step) ---
  if (i < numSteps - 1) {
    const arrowStartX = stepX + LABEL_W + 5;
    const arrowY = LABEL_Y + (LABEL_H / 2);
    const arrowLen = GAP - 10;

    const arrow = figma.createVector();
    arrow.name = `Arrow ${i + 1} -> ${i + 2}`;
    arrow.vectorNetwork = {
      vertices: [
        {
          x: 0,
          y: 0,
          strokeCap: 'NONE',
          strokeJoin: 'MITER',
          cornerRadius: 0,
          handleMirroring: 'NONE'
        },
        {
          x: arrowLen,
          y: 0,
          strokeCap: 'TRIANGLE_ARROW',
          strokeJoin: 'MITER',
          cornerRadius: 0,
          handleMirroring: 'NONE'
        }
      ],
      segments: [
        {
          start: 0,
          end: 1,
          tangentStart: { x: 0, y: 0 },
          tangentEnd: { x: 0, y: 0 }
        }
      ],
      regions: []
    };
    arrow.strokes = [{ type: 'SOLID', color: ARROW_COLOR }];
    arrow.strokeWeight = 6;
    section.appendChild(arrow);
    arrow.x = arrowStartX;
    arrow.y = arrowY;
  }
});

// ============================================
// ZOOM TO VIEW
// ============================================
figma.viewport.scrollAndZoomIntoView([section]);

return `Created user flow "${CONFIG.flowTitle}" with ${numSteps} steps`;
```

## Customization Notes

### Adding screen content after creation

To place screenshots or images into the screen frames after the flow is created, use a second `use_figma` call. Find the screen frames by name and set their fills:

```javascript
// Find screen frames by name pattern
const section = figma.currentPage.findOne(n => n.name.startsWith("User Flow —"));
if (section) {
  const screenFrames = section.findAll(n => n.name.startsWith("Screen ") && n.type === "FRAME");
  // screenFrames[0], screenFrames[1], etc. — set fills or add children
}
```

### Adjusting for more/fewer steps

The template handles any number of steps automatically. Just add or remove entries in the `CONFIG.steps` array. The section width scales dynamically.

### Using a component library

If the user's Figma file has a component library, you can replace the plain screen frames with component instances:

```javascript
// Find a component by name
const component = figma.currentPage.findOne(n => n.type === "COMPONENT" && n.name === "Card");
if (component) {
  const instance = component.createInstance();
  instance.x = stepX;
  instance.y = FRAME_Y;
  section.appendChild(instance);
}
```

### Alternative arrow approach

If the vectorNetwork approach for arrows doesn't work in your Figma version, use this fallback with a line and separate arrowhead:

```javascript
// Line body
const line = figma.createRectangle();
line.resizeWithoutConstraints(arrowLen - 20, 4);
line.fills = [{ type: 'SOLID', color: ARROW_COLOR }];
line.y = -2; // center on arrow y

// Arrowhead (triangle)
const head = figma.createVector();
head.vectorPaths = [{
  windingRule: 'NONZERO',
  data: `M 0 -12 L 20 0 L 0 12 Z`
}];
head.fills = [{ type: 'SOLID', color: ARROW_COLOR }];
head.x = arrowLen - 20;
head.y = -12;
```
