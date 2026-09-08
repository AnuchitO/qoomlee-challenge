import { test, expect } from "./fixtures";
import { airportName, DEFAULT_SEARCH } from "./helpers/test-data";

test.describe("Flight search form", () => {
  test.beforeEach(async ({ flightSearchPage }) => {
    await flightSearchPage.goto();
  });

  test("Given origin and destination are selected, When the passenger swaps them, Then origin and destination are reversed (desktop)", async ({
    flightSearchPage,
  }) => {
    test.skip(flightSearchPage.isMobile, "desktop only");

    await test.step("Given origin and destination are selected", async () => {
      await flightSearchPage.selectOrigin(airportName(DEFAULT_SEARCH.origin));
      await flightSearchPage.selectDestination(airportName(DEFAULT_SEARCH.destination));
    });

    await test.step("When the passenger swaps origin and destination", async () => {
      await flightSearchPage.swapOriginAndDestination();
    });

    await test.step("Then origin and destination are reversed", async () => {
      await expect(flightSearchPage.selectedAirport("SIN")).toBeVisible();
      await expect(flightSearchPage.selectedAirport("BKK")).toBeVisible();
    });
  });

  test("Given the mobile search form, When the passenger taps From, Then the origin bottom sheet opens with popular cities", async ({
    flightSearchPage,
  }) => {
    test.skip(!flightSearchPage.isMobile, "mobile only");

    await test.step("When the passenger taps From", async () => {
      await flightSearchPage.openMobileBottomSheet();
    });

    await test.step("Then the origin bottom sheet opens with popular cities", async () => {
      await expect(flightSearchPage.bottomSheetTitle).toBeVisible();
      await expect(flightSearchPage.popularCitiesHeading).toBeVisible();
    });
  });

  test("Given the origin bottom sheet is open, When the passenger picks an airport, Then it's selected and the sheet closes (mobile)", async ({
    flightSearchPage,
  }) => {
    test.skip(!flightSearchPage.isMobile, "mobile only");

    await test.step("When the passenger selects an airport from the bottom sheet", async () => {
      await flightSearchPage.selectOriginMobile(airportName(DEFAULT_SEARCH.origin));
    });

    await test.step("Then the airport is selected and the sheet closes", async () => {
      await expect(flightSearchPage.selectedAirport("BKK")).toBeVisible();
      await expect(flightSearchPage.bottomSheetTitle).not.toBeVisible();
    });
  });

  test("Given the origin bottom sheet is open, When the passenger taps the backdrop, Then the sheet closes (mobile)", async ({
    flightSearchPage,
  }) => {
    test.skip(!flightSearchPage.isMobile, "mobile only");

    await test.step("Given the origin bottom sheet is open", async () => {
      await flightSearchPage.openMobileBottomSheet();
    });

    await test.step("When the passenger taps the backdrop", async () => {
      await flightSearchPage.dismissMobileBottomSheet();
    });

    await test.step("Then the bottom sheet closes", async () => {
      await expect(flightSearchPage.bottomSheetTitle).not.toBeVisible({ timeout: 10000 });
    });
  });

  test("Given a valid one-way search, When the passenger searches, Then they land on the results page for that route (desktop)", async ({
    page,
    flightSearchPage,
  }) => {
    test.skip(flightSearchPage.isMobile, "desktop only");

    await test.step("Given origin, destination, and departure date are filled in", async () => {
      await flightSearchPage.selectOrigin(airportName(DEFAULT_SEARCH.origin));
      await flightSearchPage.selectDestination(airportName(DEFAULT_SEARCH.destination));
      await flightSearchPage.selectFirstAvailableDate();
    });

    await test.step("When the passenger searches", async () => {
      await flightSearchPage.search();
    });

    await test.step(`Then they land on the results page for ${DEFAULT_SEARCH.origin} → ${DEFAULT_SEARCH.destination}`, async () => {
      await expect(page).toHaveURL(/\/flights\/results/, { timeout: 10000 });
      await expect(page).toHaveURL(new RegExp(`origin=${DEFAULT_SEARCH.origin}`));
      await expect(page).toHaveURL(new RegExp(`destination=${DEFAULT_SEARCH.destination}`));
    });
  });
});
