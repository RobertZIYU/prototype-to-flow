// Example Puppeteer script for capturing multi-step wizard flows
// This demonstrates how to navigate through wizard steps and trigger Figma captures

import puppeteer from 'puppeteer';

/**
 * Captures all steps of a multi-step wizard by navigating through the UI
 *
 * @param {string[]} captureIds - Array of capture IDs (one per step) from generate_figma_design
 * @param {number} port - Localhost port where dev server is running
 * @param {string} continueButtonSelector - CSS selector for the "Continue" button
 */
async function captureAllSteps(captureIds, port = 5173, continueButtonSelector = '.wizard-footer button:last-child') {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    defaultViewport: { width: 1920, height: 1080 }
  });

  for (let i = 0; i < captureIds.length; i++) {
    const page = await browser.newPage();
    const captureId = captureIds[i];
    const stepNum = i + 1;

    console.log(`Capturing Step ${stepNum}...`);

    // Load page with Figma capture script
    const captureUrl = `http://localhost:${port}/#figmacapture=${captureId}&figmaendpoint=https%3A%2F%2Fmcp.figma.com%2Fmcp%2Fcapture%2F${captureId}%2Fsubmit&figmadelay=1000`;
    await page.goto(captureUrl);

    // Wait for app to load
    await page.waitForSelector('.wizard-content', { timeout: 5000 });

    // Navigate to the target step by clicking "Continue" button
    // For step 1: no clicks needed (0 clicks)
    // For step 2: click once (1 click)
    // For step 3: click twice (2 clicks), etc.
    for (let click = 0; click < stepNum - 1; click++) {
      const continueBtn = await page.$(continueButtonSelector);
      if (continueBtn) {
        await continueBtn.click();
        // Wait for transition/animation
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Wait for Figma capture to complete
    // The delay is set in the URL (figmadelay=1000), so wait a bit longer
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log(`Step ${stepNum} captured`);
    await page.close();
  }

  await browser.close();
  console.log('All steps captured!');
}

// Example usage:
// const captureIds = [
//   'abc123-step1',
//   'def456-step2',
//   'ghi789-step3',
//   'jkl012-step4'
// ];
//
// captureAllSteps(captureIds, 5173, '.wizard-footer button:last-child')
//   .catch(console.error);

export { captureAllSteps };
