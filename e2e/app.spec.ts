import { expect, test } from '@playwright/test';

test('to-do with subtasks, routine, tabs, language switch and reload', async ({ page }) => {
  await page.goto('./');

  // First start: welcome screen with name.
  await expect(page.getByText('Schön, dass du da bist.')).toBeVisible();
  await page.getByRole('textbox', { name: 'Wie dürfen wir dich nennen?' }).fill('Seran');
  await page.getByRole('button', { name: "Los geht's" }).click();
  await expect(page.getByText(/Seran/).first()).toBeVisible();
  await expect(page.getByText('Noch keine To-dos')).toBeVisible();

  // New to-do for today with two subtasks.
  await page.getByRole('button', { name: 'Erstes To-do' }).click();
  await page.getByRole('textbox', { name: 'Was steht an?' }).fill('Steuererklärung abschicken');
  await page.getByRole('radio', { name: 'Heute' }).click();
  const newSub = page.getByRole('textbox', { name: 'Neuer Unterpunkt' });
  await newSub.fill('Belege sammeln');
  await newSub.press('Enter');
  await newSub.fill('Formular ausfüllen');
  await newSub.press('Enter');
  await page.getByRole('button', { name: 'Anlegen' }).click();
  await expect(page.getByText('To-do wartet heute auf dich')).toBeVisible();

  // Tick subtasks in the To-dos tab: XP toast, last subtask completes the to-do.
  await page.getByRole('tab', { name: 'To-Dos' }).click();
  await page.getByRole('checkbox', { name: 'Belege sammeln erledigt' }).click();
  await expect(page.getByText('+5 XP', { exact: true })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Formular ausfüllen erledigt' }).click();
  await expect(page.getByText('Erledigt (1)')).toBeVisible();
  await expect(page.getByText('Alles geschafft')).toBeVisible();

  // Routine from a suggestion, then +1.
  await page.getByRole('tab', { name: 'Routinen' }).click();
  await page.getByRole('button', { name: /Wasser trinken \(Glas\) · 8× am Tag/ }).click();
  await page.getByRole('button', { name: 'Anlegen' }).click();
  await page.getByRole('button', { name: 'Wasser trinken (Glas) geschafft, plus 10 XP' }).click();
  await expect(page.getByText('+10 XP', { exact: true })).toBeVisible();

  // A morning routine splits the list into time-of-day groups.
  await page.getByRole('button', { name: 'Neue Routine' }).click();
  await page.getByRole('textbox', { name: 'Was willst du regelmäßig tun?' }).fill('Meditieren');
  await page.getByRole('radio', { name: 'Morgens' }).click();
  await page.getByRole('button', { name: 'Anlegen' }).click();
  await expect(page.getByRole('heading', { name: /Morgens/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Jederzeit/ })).toBeVisible();

  // Level: 10 (to-do) + 2×5 (subtasks) + 10 (routine) = 30 XP.
  await page.getByRole('tab', { name: 'Level' }).click();
  await expect(page.getByText('Level 1 · 30 XP gesamt')).toBeVisible();

  // Switch to English; it applies immediately.
  await page.getByRole('button', { name: 'Einstellungen' }).click();
  await page.getByRole('radio', { name: 'English' }).click();
  await expect(page.getByRole('tab', { name: 'Home' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  // Data and language survive a reload.
  await page.reload();
  await expect(page.getByText('Level 1 · 30 XP total')).toBeVisible();
  await page.getByRole('tab', { name: 'Home' }).click();
  await expect(page.getByText('Nothing left waiting for you today.')).toBeVisible();
  // The welcome screen comes only once.
  await expect(page.getByText('Good to have you here.')).toHaveCount(0);
});
