import { test, expect } from "./fixtures";

test.describe("Flight search form", () => {
  test.beforeEach(async ({ flightSearchPage }) => {
    await flightSearchPage.goto();
  });

  test("swaps origin and destination (desktop)", async ({ flightSearchPage }) => {
    test.skip(flightSearchPage.isMobile, "desktop only");

    await flightSearchPage.selectOrigin("Suvarnabhumi Airport");
    await flightSearchPage.selectDestination("Singapore Changi Airport");
    await flightSearchPage.swapOriginAndDestination();

    await expect(flightSearchPage.selectedAirport("SIN")).toBeVisible();
    await expect(flightSearchPage.selectedAirport("BKK")).toBeVisible();
  });

  test("opens bottom sheet when From is tapped (mobile)", async ({ flightSearchPage }) => {
    test.skip(!flightSearchPage.isMobile, "mobile only");

    await flightSearchPage.openMobileBottomSheet();

    await expect(flightSearchPage.bottomSheetTitle).toBeVisible();
    await expect(flightSearchPage.popularCitiesHeading).toBeVisible();
  });

  test("selects an airport via the mobile bottom sheet", async ({ flightSearchPage }) => {
    test.skip(!flightSearchPage.isMobile, "mobile only");

    await flightSearchPage.selectOriginMobile("Suvarnabhumi Airport");

    await expect(flightSearchPage.selectedAirport("BKK")).toBeVisible();
    await expect(flightSearchPage.bottomSheetTitle).not.toBeVisible();
  });

  test("closes mobile bottom sheet when backdrop is tapped", async ({ flightSearchPage }) => {
    test.skip(!flightSearchPage.isMobile, "mobile only");

    await flightSearchPage.openMobileBottomSheet();
    await flightSearchPage.dismissMobileBottomSheet();

    await expect(flightSearchPage.bottomSheetTitle).not.toBeVisible({ timeout: 10000 });
  });

  test("navigates to results page on valid one-way search (desktop)", async ({ page, flightSearchPage }) => {
    test.skip(flightSearchPage.isMobile, "desktop only");

    await flightSearchPage.selectOrigin("Suvarnabhumi Airport");
    await flightSearchPage.selectDestination("Singapore Changi Airport");
    await flightSearchPage.selectFirstAvailableDate();
    await flightSearchPage.search();

    await expect(page).toHaveURL(/\/flights\/results/, { timeout: 10000 });
    await expect(page).toHaveURL(/origin=BKK/);
    await expect(page).toHaveURL(/destination=SIN/);
  });
});
