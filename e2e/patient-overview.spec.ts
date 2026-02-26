import { test, expect } from "@playwright/test";
import {
  mockLoginRoute,
  mockAllRoutes,
  mockPatientsRoute,
  mockPatientDetailRoute,
  seedAuth,
  MOCK_PATIENTS,
} from "./fixtures";

test.describe("Patient Overview", () => {
  test("Login form submits and navigates to verification page", async ({
    page,
  }) => {
    await mockLoginRoute(page);
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    await page.getByLabel("Email").fill("test@clinic.com");
    await page.getByLabel("Password").fill("securepass123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL("**/verify**");
    await expect(
      page.getByRole("heading", { name: "Enter verification code" })
    ).toBeVisible();
    await expect(page.getByText("test@clinic.com")).toBeVisible();
    await expect(page.getByText("spam folder")).toBeVisible();
  });

  test("Full auth flow — verify code and land on overview with prioritized patients", async ({
    page,
  }) => {
    await mockAllRoutes(page);
    await page.goto("/login");

    await page.getByLabel("Email").fill("test@clinic.com");
    await page.getByLabel("Password").fill("securepass123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/verify**");

    await page.getByLabel("Verification code").fill("123456");
    await page.getByRole("button", { name: "Verify" }).click();

    await page.waitForURL("**/overview");
    await expect(
      page.getByRole("heading", { name: "Patient Overview" })
    ).toBeVisible();

    const highSection = page.getByRole("heading", {
      name: /Needs Immediate Attention/,
    });
    await expect(highSection).toBeVisible();

    const allCards = page.locator(".patient-card");
    await expect(allCards).toHaveCount(MOCK_PATIENTS.length);

    const firstCardName = allCards.first().locator(".patient-name");
    await expect(firstCardName).toHaveText("Anna Larsen");

    await expect(page.getByText("Next step →").first()).toBeVisible();

    await expect(
      page.getByText("worsening_headache_frequency").first()
    ).toBeVisible();
  });

  test("Filtering patients by attention level and condition", async ({
    page,
  }) => {
    await mockPatientsRoute(page);
    await seedAuth(page);
    await page.goto("/overview");

    await expect(page.locator(".patient-card")).toHaveCount(6, {
      timeout: 10_000,
    });

    const countText = page.getByText(/Showing \d+ of \d+ patients/);
    await expect(countText).toContainText("Showing 6 of 6 patients");

    await page.getByLabel("Filter by attention level").selectOption("high");
    await expect(countText).toContainText("Showing 2 of 6 patients");
    await expect(page.locator(".patient-card")).toHaveCount(2);

    await page.getByLabel("Filter by condition").selectOption("migraine");
    await expect(countText).toContainText("Showing 1 of 6 patients");
    await expect(page.locator(".patient-card")).toHaveCount(1);
    await expect(page.locator(".patient-card").first()).toContainText(
      "Anna Larsen"
    );

    await page.getByLabel("Filter by attention level").selectOption("");
    await page.getByLabel("Filter by condition").selectOption("");
    await expect(countText).toContainText("Showing 6 of 6 patients");
    await expect(page.locator(".patient-card")).toHaveCount(6);
  });

  test("Patient detail modal opens and displays full information", async ({
    page,
  }) => {
    await mockPatientsRoute(page);
    await mockPatientDetailRoute(page);
    await seedAuth(page);
    await page.goto("/overview");

    await expect(page.locator(".patient-card")).toHaveCount(6, {
      timeout: 10_000,
    });
    await page.locator(".patient-card").first().click();

    const modal = page.locator(".patient-detail-panel");
    await expect(modal).toBeVisible();

    await expect(modal.getByRole("heading", { level: 2 })).toContainText(
      "Anna Larsen"
    );

    await expect(modal.getByRole("heading", { name: "Demographics" })).toBeVisible();
    await expect(modal.getByText("MRN HMI-0001")).toBeVisible();

    await expect(modal.getByRole("heading", { name: "Status" })).toBeVisible();
    await expect(modal.getByText("Risk score:")).toBeVisible();
    await expect(modal.getByText("92/100")).toBeVisible();
    await expect(modal.getByText("Adherence:")).toBeVisible();
    await expect(modal.getByText("45%")).toBeVisible();
    await expect(
      modal.getByText("Neurologist review of preventive medication within 48h")
    ).toBeVisible();

    await expect(modal.getByRole("heading", { name: "Coordination" })).toBeVisible();
    await expect(modal.getByText("Handoff risk: high")).toBeVisible();
    await expect(modal.getByText("None")).toBeVisible();

    await modal.locator(".btn-close").click();
    await expect(modal).not.toBeVisible();
  });
});
