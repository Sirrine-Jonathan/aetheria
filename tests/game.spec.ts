import { test, expect } from '@playwright/test';

test.describe('Aetheria End-to-End Tests', () => {
  // Give LLM generation steps plenty of time to succeed
  test.setTimeout(60000);

  test('Mocked core game loop: Start game, make choice, check history, and reset', async ({ page }) => {
    // 1. Intercept the network request to the backend function
    // This allows us to test the entire UI logic locally and in CI without consuming real Groq API credits
    await page.route('**/.netlify/functions/story', async route => {
      const json = {
        title: "The Mocked Caverns",
        description: "This is a deterministic mocked scene. You are in a cold, stone cavern.",
        choices: [
          { id: "1", text: "Proceed deeper", action: "proceed_deeper" },
          { id: "2", text: "Examine the walls", action: "examine_walls" },
          { id: "3", text: "Rest a moment", action: "rest" }
        ],
        imagePrompt: "A cold stone cavern.",
        statChanges: { health: -5, sanity: 0, experience: 10, itemFound: "Torch" }
      };
      await route.fulfill({ json });
    });

    // 2. Load the App
    await page.goto('/');

    // Verify Start Screen
    await expect(page.getByText('Aetheria', { exact: true }).first()).toBeVisible();
    await expect(page.getByPlaceholder('Where shall your legend begin?')).toBeVisible();

    // 3. Start the Game via Custom Input
    await page.getByPlaceholder('Where shall your legend begin?').fill('A lonely knight entering a cave');
    await page.getByRole('button', { name: /Begin Journey/i }).click();

    // 4. Verify Scene Loaded
    await expect(page.getByText('Preparing Reality...')).not.toBeVisible();
    await expect(page.getByText('The Mocked Caverns')).toBeVisible();
    await expect(page.getByText('This is a deterministic mocked scene. You are in a cold, stone cavern.')).toBeVisible();

    // 5. Make a Choice
    await page.getByRole('button', { name: 'Proceed deeper' }).click();

    // Verify next scene loads (our mock returns the same payload)
    await expect(page.getByText('Preparing Reality...')).not.toBeVisible();
    await expect(page.getByText('The Mocked Caverns')).toBeVisible(); // Check title is back

    // 6. Verify Character Stats updated based on the mock payload
    // Open sidebar (on desktop, sidebar is rendered by default but might be hidden on mobile viewport, Playwright uses desktop by default)
    // The Adventurer tab should be active by default
    await expect(page.getByText('Adventurer')).toBeVisible();
    await expect(page.getByText('Torch')).toBeVisible(); // itemFound
    await expect(page.getByText('95/100')).toBeVisible(); // health went down by 5

    // 7. Check History
    await page.getByText('Chronicle').click();
    
    // There should be 1 item in history since we made 1 choice
    const historyItem = page.getByText('Log 1');
    await expect(historyItem).toBeVisible();
    
    // View history
    await historyItem.click();
    
    // Verify historical view active
    await expect(page.getByText('Historical Record')).toBeVisible();
    await expect(page.getByText('Awaken to Reality')).toBeVisible();
    
    // Return to present
    await page.getByText('Awaken to Reality').click();

    // 8. Settings and Reset
    // Toggle narration
    const narrationToggle = page.locator('button').filter({ has: page.locator('div.translate-x-6') }).first(); // Finds active toggle (autoDictate is true by default)
    await narrationToggle.click(); 

    // Reset game
    await page.getByText('Sever Connection').click();

    // Verify return to start screen
    await expect(page.getByPlaceholder('Where shall your legend begin?')).toBeVisible();
  });

  // Example of how a "real" integration test would look. 
  // It is skipped by default to prevent API spam on every single local test run, but can be forced via CLI if needed.
  test.skip('Real API loop: End-to-end integration', async ({ page }) => {
    // Note: To run this against production, you would set BASE_URL=https://aetheria-adventure.netlify.app/
    await page.goto('/');

    await expect(page.getByPlaceholder('Where shall your legend begin?')).toBeVisible();
    await page.getByText('"A cyberpunk detective').click();

    // Wait for the LLM to generate the scene (can take up to 30s)
    await expect(page.getByText('Preparing Reality...')).not.toBeVisible({ timeout: 45000 });
    
    // The scene should load and show at least 3 choices
    const choices = page.locator('button.group');
    await expect(choices).toHaveCount(3, { timeout: 10000 });

    // Pick the first choice
    await choices.nth(0).click();

    // Wait for next scene
    await expect(page.getByText('Preparing Reality...')).not.toBeVisible({ timeout: 45000 });
    await expect(choices).toHaveCount(3, { timeout: 10000 });
  });
});
