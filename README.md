# Prototype to Flow

Convert running prototypes and apps into professional, documented user flows in Figma — automatically.

![Prototype to Flow](https://img.shields.io/badge/Claude-Skill-5865F2)
![Figma](https://img.shields.io/badge/Figma-MCP-F24E1E)
![Status](https://img.shields.io/badge/Status-Active-success)

## What It Does

This Claude Code skill captures live web applications (localhost or deployed) and converts them into annotated user flow diagrams in Figma with:

- ✅ **Editable Figma layers** (not just screenshots)
- ✅ **Step labels & connecting arrows**
- ✅ **Screen explanations & metadata** (persona, description, key decisions)
- ✅ **Professional layout** with standardized spacing and typography
- ✅ **Multi-step wizard support** (automatically navigates through steps)
- ✅ **Flows longer than four steps** with every step kept in one horizontal row
- ✅ **Published library components** (uses your design system when available)

### Before & After

**Before:** A running prototype at `localhost:5173` with 6 wizard steps

**After:** A complete user flow in Figma with:
```
┌────────────────────────────────────────────────────────────┐
│  Campaign Creation Flow                          5/29/2026 │
│  Persona: Marketing Manager                                │
│  Description: Create and launch a new ad campaign          │
│                                                             │
│  Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6          │
│  [Screen] [Screen] [Screen] [Screen] [Screen] [Screen]        │
│  Explanation for each step...                              │
└────────────────────────────────────────────────────────────┘
```

## Installation

### Prerequisites

1. **Claude Code** (CLI, Desktop, or Web)
2. **Figma MCP Server** - Required for this skill
   ```bash
   # Install via Claude Code settings or:
   npm install -g @figma/mcp-server
   ```
3. **Node.js** - For localhost app captures
4. **Puppeteer** - For multi-step wizard navigation
   ```bash
   npm install puppeteer
   ```

### Install the Skill

```bash
# Clone to your Claude skills directory
cd ~/.claude/skills
git clone https://github.com/RobertZIYU/prototype-to-flow.git

# Restart Claude Code to load the skill
```

## Usage

### Basic Syntax

```
/prototype-to-flow [live demo link] [figma page/section link] [method]

Parameters:
- [live demo link]* (required) - URL to your running app
- [figma link]* (required) - Target Figma file URL  
- [method] (optional) - "editable" (default) or "screenshot"

Flags:
--name "Flow Name" - Override auto-detected name
```

### Examples

**Capture localhost app:**
```
/prototype-to-flow http://localhost:5173 https://figma.com/design/ABC123
```

**Capture live site:**
```
/prototype-to-flow https://myapp.com https://figma.com/design/ABC123
```

**Custom flow name:**
```
/prototype-to-flow http://localhost:3000 https://figma.com/design/ABC123 --name "Onboarding Flow"
```

**Use screenshots instead of editable layers:**
```
/prototype-to-flow http://localhost:5173 https://figma.com/design/ABC123 screenshot
```

## How It Works

### 1. Detects Flow Type

The skill analyzes your app and detects:
- **Single-page wizards** (step navigation)
- **Multi-page sites** (separate routes)  
- **Single screens**

### 2. Captures Screens

For **editable layers** (default):
- Injects Figma capture script into your HTML
- Uses `generate_figma_design` to convert DOM → Figma layers
- Navigates through wizard steps with Puppeteer
- Creates editable text, frames, and shapes in Figma

For **screenshots**:
- Takes PNG captures of each screen
- Places images in flow frames

### 3. Creates Flow Structure

- Generates a Figma section with standardized layout
- Adds step labels, arrows, explanations
- Includes persona, description, and key decision metadata
- Applies professional typography and spacing
- Expands section width to keep the complete flow on one horizontal row

### 4. Post-Processing

- Fixes text wrapping for long explanations
- Uses published library components when available
- Ensures consistent naming conventions
- Verifies every requested screen is present and aligned in the same row

## Features

### Multi-Step Wizard Support

Automatically detects and captures wizard flows:

```javascript
// The skill will:
1. Detect every step in your wizard
2. Capture all requested steps (ask for a selection when needed)
3. Navigate through each step
4. Capture editable content at each step
5. Assemble into a complete flow in one horizontal row
```

There is no four-step limit. Longer flows keep the same screen dimensions and spacing while the section grows horizontally. Each distinct flow has its own section; step count never causes a flow to wrap or split.

### Published Library Integration

When your Figma file has published design systems:
- Searches for matching components (buttons, inputs, etc.)
- Uses library components instead of raw frames
- Maintains design system consistency

### Editable Content

Unlike screenshot-based tools, this creates **editable Figma layers**:
- Text is editable text nodes
- Buttons are editable frames
- Colors, spacing, and fonts are modifiable
- Can be refined and polished in Figma

## Configuration

### Customize Layout

Edit `references/flow-template.md` to customize:
- Colors and typography
- Spacing and dimensions
- Step label styling
- Arrow styles

### Multi-Step Capture

See `references/capture-all-steps.mjs` for the Puppeteer pattern:
```javascript
// Customize for your app:
const continueButtonSelector = '.wizard-footer button:last-child';
const waitTime = 300; // ms between clicks
```

## Troubleshooting

### "Figma MCP server not connected"

**Fix:**
1. Install Figma MCP: Check Claude Code MCP settings
2. Restart Claude Code
3. Verify in tools list: Look for `generate_figma_design`

### "Permission denied" when pushing to Figma

**Fix:**
- Ensure you have **edit access** to the target Figma file
- File must be a **Design file** (not FigJam or Slides)

### Text not wrapping in explanations

**Fix:** The skill automatically fixes this in post-processing. If you see long single-line text, the fix step may have failed. Manually set:
```javascript
textNode.textAutoResize = "HEIGHT"
textNode.resize(1790, textNode.height)
```

### Multi-step wizard not capturing all steps

**Fix:** 
- Verify the continue button selector in your app
- Check Puppeteer script in `references/capture-all-steps.mjs`
- Ensure dev server is running and accessible

## Advanced Usage

### Capture Specific Steps

When prompted, select only the steps you want:
```
☑ Step 1: Campaign Setup
☐ Step 2: Audience Targeting  
☑ Step 3: Creative Assets
☑ Step 4: Review & Launch
```

### Use with Design Systems

The skill automatically searches for and uses published Figma libraries:
```javascript
// Automatically searches for:
- Buttons, inputs, dropdowns
- Cards, modals, navigation
- Typography styles
- Color variables
```

### Custom Flow Metadata

Customize the flow information:
- **Persona**: Who uses this flow
- **Description**: User's goal
- **Key Decision**: Critical design decisions

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Test with a sample app
5. Submit a pull request

### Areas for Improvement

- [ ] Support for FigJam and Slides
- [ ] Branching flows (decision trees)
- [ ] Mobile app support (React Native, Flutter)
- [ ] Dark mode detection
- [ ] Custom templates

## Examples

### Campaign Creation Wizard

**Input:** 4-step marketing campaign wizard at `localhost:5173`

**Output:** [View in Figma](https://www.figma.com/design/EYqiJSOjOGBUj0rzLWAu1m/Untitled?node-id=11-2)
- 4 fully editable screens
- Step labels with arrows
- Campaign flow metadata
- Professional layout

## License

MIT License - See LICENSE file for details

## Credits

Built for [Claude Code](https://claude.com/claude-code) by the Figma AI Suites team.

Uses:
- [Figma MCP Server](https://github.com/figma/mcp-server)
- [Puppeteer](https://pptr.dev/)
- [Figma Plugin API](https://www.figma.com/plugin-docs/)

## Support

- **Issues**: [GitHub Issues](https://github.com/RobertZIYU/prototype-to-flow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/RobertZIYU/prototype-to-flow/discussions)
- **Skill Documentation**: See `SKILL.md`

---

**Made with Claude Code** | [View on GitHub](https://github.com/RobertZIYU/prototype-to-flow)
