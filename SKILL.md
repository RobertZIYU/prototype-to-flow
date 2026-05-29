---
name: prototype-to-flow
description: Convert a prototype, set of screens, or mockups into a documented user flow in Figma with standardized layout — step labels, connecting arrows, screen explanations, persona metadata, and date stamp. Use this skill whenever a user wants to create a user flow, document a prototype flow, export screens as a flow diagram, or turn mockups into a presentable flow. Trigger on phrases like "convert to user flow", "make a flow from these screens", "document this flow in Figma", "create user flow diagram", "export as flow", "prototype to flow", "screen flow", "user journey", or "flow documentation". Also use when arranging screens with step annotations and arrows in Figma for design reviews or handoff documentation, even if the user doesn't explicitly say "user flow".
---

# Prototype to User Flow

Converts prototype screens into a professional, documented user flow in Figma. The output is a section containing labeled steps connected by arrows, **editable screen content**, step explanations, persona metadata, and a date stamp — ready for stakeholder review and design documentation.

Reference design: https://www.figma.com/design/EYqiJSOjOGBUj0rzLWAu1m/Untitled?node-id=1-8

## Skill Invocation Format

```
/prototype-to-flow [live demo link] [figma page/section link] [method]

Parameters:
- [live demo link]* (required) - URL to running app (localhost or live)
- [figma page/section link]* (required) - Target Figma file URL
- [method] (optional) - "screenshot" or "editable" (default: "editable")

Optional flags:
- --name "Flow Name" - Override auto-detected flow name

Examples:
/prototype-to-flow http://localhost:5173 https://figma.com/design/ABC123
/prototype-to-flow https://myapp.com https://figma.com/design/ABC123 screenshot
/prototype-to-flow http://localhost:3000 https://figma.com/design/ABC123 --name "Onboarding Flow"
```

**If parameters are missing:**
- Missing live demo link → Ask: "What's the URL of your running app?"
- Missing Figma link → Ask: "Which Figma file should I add this to?" (show recent files list)

## Prerequisites Check

**CRITICAL: Before doing anything, verify these prerequisites in order:**

### 1. Figma MCP Connection

```javascript
// Test by calling generate_figma_design with no captureId
```

**If `generate_figma_design` tool is not available:**
- ❌ **STOP immediately**
- Tell user: "Figma MCP server is not connected. This skill requires the Figma MCP plugin."
- **How to fix:**
  1. Install Figma MCP server: `npm install -g @figma/mcp-server` (or check MCP settings)
  2. Restart Claude Code
  3. Verify connection: Look for Figma tools in available tools list

**Do not proceed until Figma MCP is connected.**

### 2. App Accessibility

- **Localhost apps**: Dev server must be running on the specified port
  - Check with: `lsof -i :PORT` (macOS/Linux) or `netstat -ano | findstr :PORT` (Windows)
  - If not running, ask user to start it first
- **External apps**: Must be publicly accessible (test with curl/fetch)

### 3. Figma File Access

- User must have **edit access** to target file
- File must be a **Design file** (not FigJam or Slides)
- Extract fileKey from URL: `figma.com/design/{fileKey}/...`

**If any prerequisite fails, STOP and guide user to fix it before proceeding.**

## Why This Exists

Designers prototype fast in Claude, but prototypes aren't structured for documentation or handoff. Converting manually screen-by-screen is tedious and inconsistent. This skill exports a complete, consistently structured flow to Figma in one step — with proper annotations, naming, and layout.

## Workflow

### Step 1: Analyze the App and Detect Flows

**Before gathering flow information, analyze the running app to detect available flows:**

1. Load the live demo URL
2. Inspect the app structure (read source code if available, or use dev tools)
3. Detect flow type:

**Flow Types:**

| Type | Detection | User Action |
|------|-----------|-------------|
| **Single-page wizard** | Step navigation within one page (e.g., step counter, "Continue" buttons) | Ask which steps to capture |
| **Multi-page site** | Separate routes/URLs | List all routes, allow multi-select |
| **Single screen** | No navigation detected | Capture directly, proceed |

**For multi-step wizards:**
```
Example output:
"I found a 4-step wizard: Campaign Setup → Audience Targeting → Creative Assets → Review & Launch

Would you like to capture:
○ All 4 steps (recommended)
○ Specific steps (select below)
  ☐ Step 1: Campaign Setup
  ☐ Step 2: Audience Targeting  
  ☐ Step 3: Creative Assets
  ☐ Step 4: Review & Launch"
```

Use `AskUserQuestion` with multiSelect when user needs to choose specific steps.

**For multi-page sites:**
- List discovered routes (from routing config or sitemap)
- Let user multi-select which pages to include in the flow
- Each selected page becomes one step in the flow

### Step 2: Gather Flow Information

Collect from the user (or infer from conversation context):

| Field | Required | Default | Source |
|-------|----------|---------|--------|
| Flow Title | Yes | — | Auto-detect from app or ask |
| Screens (source) | Yes | — | From Step 1 detection |
| Step Names (one per screen) | Yes | — | Auto-detect from UI or ask |
| Persona | Ask | "General User" | Infer from app purpose |
| Description (user's goal) | Ask | Derive from flow title | Infer from app |
| Key Decision | Ask | "N/A" | Infer from code/design |
| Step Explanations | Generate | Infer from screen content | Auto-generate per step |

**Screen sources** the skill handles:
- **Running app URL** (localhost or live) → Use `generate_figma_design` (MANDATORY, see Step 4)
- **Existing Figma prototype**: Extract frames via `get_screenshot`
- **Screenshots or images the user provides**: Place directly as fills
- **Verbal description or code**: Create labeled placeholder frames

If the user has been building a prototype in the conversation (artifacts, code, etc.), use those screens directly — don't make them describe what they already showed you.

### Step 3: Create the Flow Structure in Figma

1. If no target Figma file exists, invoke `/figma-create-new-file` to create a new design file
2. Invoke `/figma-use` — this is **mandatory** before every `use_figma` call
3. Read the code template from `references/flow-template.md`
4. Replace the `CONFIG` object at the top with the actual flow data (title, persona, steps, etc.)
5. Execute via `use_figma` to create the complete flow layout

The template creates everything in a single `use_figma` call: section, header, metadata, date pill, step labels, screen frames, explanations, and connecting arrows.

### Step 4: Populate Screen Frames with Editable Content

**MANDATORY: Use `generate_figma_design` for all screen captures** (do NOT use screenshots or manual component building)

**Why `generate_figma_design`:**
- ✅ Creates **editable Figma layers** (frames, text nodes, shapes)
- ✅ Faster and more accurate than manual building
- ✅ Preserves app structure (nested frames match DOM hierarchy)
- ❌ NOT just screenshots (those are flat images)

**Method: "editable" (default) - Uses `generate_figma_design`**

For each screen/step:

1. **Generate capture ID**
   ```javascript
   generate_figma_design({
     outputMode: "existingFile",
     fileKey: "TARGET_FILE_KEY"
   })
   // Returns: { captureId: "abc123..." }
   ```

2. **Add capture script to HTML** (if localhost)
   ```html
   <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
   ```

3. **Navigate to the screen state**
   - For multi-step wizards: Use Puppeteer to click through to the target step
   - For multi-page sites: Navigate to the target URL
   - For single screen: Load the base URL

4. **Open capture URL** (localhost apps)
   ```bash
   open "http://localhost:PORT/#figmacapture={captureId}&figmaendpoint=https%3A%2F%2Fmcp.figma.com%2Fmcp%2Fcapture%2F{captureId}%2Fsubmit&figmadelay=1000"
   ```

5. **Poll for completion**
   ```javascript
   // Wait 5 seconds, then poll
   generate_figma_design({ captureId: "abc123..." })
   // Repeat every 5s until status: "completed"
   ```

6. **Move captured content into flow frame**
   ```javascript
   // Get captured frame (returned node ID from polling)
   // Move children into corresponding screen frame in the flow
   ```

**Multi-step wizard apps - Example pattern:**

```javascript
// See references/capture-all-steps.mjs for complete example
import puppeteer from 'puppeteer';

async function captureAllSteps(captureIds, stepsCount) {
  const browser = await puppeteer.launch({ headless: false });
  
  for (let i = 0; i < captureIds.length; i++) {
    const page = await browser.newPage();
    const captureId = captureIds[i];
    const stepNum = i + 1;
    
    // Load with capture script
    await page.goto(`http://localhost:PORT/#figmacapture=${captureId}&...`);
    
    // Navigate to step (click "Continue" buttons stepNum-1 times)
    for (let click = 0; click < stepNum - 1; click++) {
      await page.$('.continue-button').click();
      await page.waitForTimeout(300);
    }
    
    // Wait for capture
    await page.waitForTimeout(3000);
    await page.close();
  }
  
  await browser.close();
}
```

**Method: "screenshot" (legacy) - Only if explicitly requested**
- Uses Puppeteer screenshots → image fills
- Faster but NOT editable
- Only use when user specifically asks for screenshots

### Step 5: Post-Capture Fixes (MANDATORY)

After moving captured content into flow frames, **always apply these fixes:**

#### 5.1 Fix Text Wrapping for Explanations

**Problem:** Explanation text runs as one long line instead of wrapping within frame width.

**Fix:**
```javascript
// Find all explanation text nodes
const explanationTexts = section.findAll(n => 
  n.type === 'TEXT' && n.name.startsWith('Explanation')
);

// Load font
await figma.loadFontAsync({ family: "Inter", style: "Regular" });

// Fix wrapping
for (const textNode of explanationTexts) {
  textNode.textAutoResize = "HEIGHT"; // Width fixed, height grows
  textNode.resize(1790, textNode.height); // Frame width minus padding
}
```

#### 5.2 Use Published Design System Components (When Available)

**IMPORTANT:** When building screen content with `use_figma`, always prefer components from published Figma libraries over creating raw frames.

**How to use library components:**

1. **Discover available libraries:**
   ```javascript
   get_libraries({ fileKey: "TARGET_FILE_KEY" })
   // Returns: libraries_added_to_file, libraries_available_to_add
   ```

2. **Search for components:**
   ```javascript
   search_design_system({
     fileKey: "TARGET_FILE_KEY",
     query: "button input card",
     includeComponents: true,
     includeLibraryKeys: ["lk-abc123..."] // Scope to specific library
   })
   ```

3. **Import and use components:**
   ```javascript
   const buttonSet = await figma.importComponentSetByKeyAsync("COMPONENT_KEY");
   const buttonInstance = buttonSet.defaultVariant.createInstance();
   // Add to frame...
   ```

**Benefits:**
- ✅ Components stay linked to design system (updates propagate)
- ✅ Consistent with existing designs in the organization
- ✅ Properly configured variants, states, and properties
- ❌ Avoid creating raw rectangles/text when library components exist

**When to use library components:**
- User's organization has a published design system (check with `get_libraries`)
- Captured content uses common UI patterns (buttons, inputs, cards, navigation)
- Building additional content with `use_figma` beyond what was captured

**Example workflow:**
```javascript
// 1. Check for design system
const libs = await get_libraries({ fileKey });
const hasDesignSystem = libs.libraries_added_to_file.length > 0;

if (hasDesignSystem) {
  // 2. Search for needed components
  const results = await search_design_system({
    fileKey,
    query: "button",
    includeComponents: true
  });
  
  // 3. Import and use
  const button = await figma.importComponentSetByKeyAsync(
    results.components[0].componentKey
  );
  const instance = button.defaultVariant.createInstance();
  // ... configure and add to frame
}
```

## Layout Specification

### Structure

```
 ┌────────────────────────────────────────────────────────────────────┐
 │                                                        ┌─ DATE ─┐│
 │  FLOW TITLE   │ Persona: ...                           └────────┘│
 │               │ Description: ...                                  │
 │               │ Key Decision: ...                                 │
 │                                                                   │
 │  ┌─Step 1─┐ ───► ┌─Step 2─┐ ───► ┌─Step 3─┐ ───► ┌─Step N─┐    │
 │  ┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐     │
 │  │        │      │        │      │        │      │        │     │
 │  │ SCREEN │      │ SCREEN │      │ SCREEN │      │ SCREEN │     │
 │  │        │      │        │      │        │      │        │     │
 │  └────────┘      └────────┘      └────────┘      └────────┘     │
 │  Explanation     Explanation     Explanation     Explanation      │
 └────────────────────────────────────────────────────────────────────┘
```

### Design Tokens

**Typography:**

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Flow Title | Lora | 200 | Bold | #000000 |
| Step Label | Lora | 68 | SemiBold | #000000 |
| Persona / Description / Key Decision | Inter | 64 | Regular | #616161 |
| Date | Inter | 64 | Semi Bold | #131313 at 70% opacity |
| Step Explanation | Inter | 60 | Regular | #616161 |

**Colors & Shapes:**

| Element | Style |
|---------|-------|
| Section background | #E8E2D9 (warm beige) |
| Step label pill | #D9D9D9 fill, 48px corner radius |
| Date pill | No fill, 1px #000000 stroke, full corner radius (pill shape) |
| Connecting arrow | #C8C4BD stroke, 6px weight, ARROW_LINES cap on end |
| Screen frame | #FFFFFF fill, 1920 x 1080 |

### Dimensions

| Measurement | Value |
|-------------|-------|
| Screen frame size | 1920 x 1080 |
| Step label pill size | 1915 x 236 |
| Horizontal gap between steps (arrow space) | 542px |
| Step pitch (frame width + gap) | 2462px |
| Step label to screen frame gap | 129px |
| Screen frame to explanation gap | 98px |
| Left margin | 436px |
| Section height | 3368px |
| Section width | dynamic: `436 + (N * 1920) + ((N-1) * 542) + 436` |

### Layer Naming Convention

Every layer follows this pattern so flows are consistent and searchable:

| Layer | Pattern | Example |
|-------|---------|---------|
| Section | `User Flow — {Title}` | `User Flow — Onboarding` |
| Step label background | `Step {N} — {Name} BG` | `Step 1 — Welcome BG` |
| Step label text | `Step {N} — {Name}` | `Step 1 — Welcome` |
| Screen frame | `Screen {N} — {Name}` | `Screen 1 — Welcome` |
| Explanation text | `Explanation {N}` | `Explanation 1` |
| Arrow | `Arrow {N} -> {N+1}` | `Arrow 1 -> 2` |
| Date pill | `Date Pill` | |
| Flow title text | `Flow Title` | |
| Divider line | `Divider` | |
| Metadata texts | `Persona` / `Description` / `Key Decision` | |

## Code Template

Read `references/flow-template.md` for the complete Figma Plugin API code. Adapt the `CONFIG` object at the top with the actual flow data before executing via `use_figma`.

## Reference Files

- `references/flow-template.md` - Complete Figma Plugin API code for creating flow structure
- `references/capture-all-steps.mjs` - Example Puppeteer script for multi-step wizard capture

## Tips

- The template dynamically sizes the section width based on the number of steps — works for any count
- Lora and Inter are Google Fonts available in Figma by default
- For very long flows (7+ steps), consider splitting into multiple rows or separate flow sections
- After creating the flow, the user can manually adjust positions, add annotations, or swap placeholder frames for real designs
- If a step has branching (e.g., success/error paths), create separate flows for each path rather than trying to branch within one flow
- Always use `generate_figma_design` for editable content — it's faster and more accurate than manual building
- The capture script toolbar allows manual re-capture if the user wants to update a screen later
