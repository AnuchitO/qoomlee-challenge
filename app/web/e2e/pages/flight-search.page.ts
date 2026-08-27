import { expect, type Locator, type Page } from "@playwright/test";

export class FlightSearchPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get isMobile() {
    return (this.page.viewportSize()?.width ?? 1280) < 768;
  }

  private visibleText(text: string | RegExp): Locator {
    return this.page.getByText(text).filter({ visible: true });
  }

  private visibleRole(
    role: Parameters<Page["getByRole"]>[0],
    opts?: Parameters<Page["getByRole"]>[1],
  ): Locator {
    return this.page.getByRole(role, opts).filter({ visible: true });
  }

  get searchButton() {
    return this.visibleRole("button", { name: "Search Flights" });
  }

  get swapButton() {
    return this.visibleRole("button", { name: "Swap origin and destination" });
  }

  get departureTrigger() {
    return this.page.locator('[data-testid="departure-trigger"]').filter({ visible: true });
  }

  get calendarPanel() {
    return this.page.locator('[data-testid="calendar-panel"]');
  }

  get mobileFromButton() {
    return this.page
      .getByRole("button")
      .filter({ visible: true })
      .filter({ hasText: "Select city or airport" })
      .first();
  }

  get bottomSheetTitle() {
    return this.page.getByText("Flying from");
  }

  get popularCitiesHeading() {
    return this.visibleText("Popular Cities or Airports");
  }

  async goto() {
    await this.page.goto("/flights");
    await this.page.waitForLoadState("networkidle");
    await expect(this.searchButton).toBeVisible({ timeout: 15000 });
  }

  async selectOrigin(airportName: string) {
    await this.visibleText("Select origin").click();
    await this.visibleText(airportName).click();
  }

  async selectDestination(airportName: string) {
    await this.visibleText("Select destination").click();
    await this.visibleText(airportName).click();
  }

  async selectOriginMobile(airportName: string) {
    await this.mobileFromButton.click();
    await expect(this.bottomSheetTitle).toBeVisible({ timeout: 10000 });
    await this.visibleText(airportName).click();
  }

  async openMobileBottomSheet() {
    await this.mobileFromButton.click();
    await expect(this.bottomSheetTitle).toBeVisible({ timeout: 10000 });
  }

  async dismissMobileBottomSheet() {
    await this.page.mouse.click(10, 10);
  }

  async swapOriginAndDestination() {
    await this.swapButton.click();
  }

  async selectFirstAvailableDate() {
    await this.departureTrigger.click();
    await expect(this.calendarPanel).toBeVisible({ timeout: 10000 });
    await this.calendarPanel
      .locator('button[type="button"]:not([aria-label]):not([disabled])')
      .first()
      .click();
  }

  async search() {
    await this.searchButton.click();
  }

  selectedAirport(code: string) {
    const labels: Record<string, string> = {
      BKK: "Bangkok (BKK)",
      SIN: "Singapore (SIN)",
    };
    return this.visibleText(labels[code] ?? code);
  }
}
