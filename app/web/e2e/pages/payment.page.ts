import { expect, type Page } from "@playwright/test";

export class PaymentPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get cardholderName() {
    return this.page.getByPlaceholder("e.g. Johnathan Doe");
  }

  get cardNumber() {
    return this.page.getByPlaceholder("0000 0000 0000 0000");
  }

  get expiry() {
    return this.page.getByPlaceholder("MM/YY");
  }

  get cvv() {
    return this.page.getByPlaceholder("•••");
  }

  get agreeCheckbox() {
    return this.page.getByRole("checkbox", { name: /i agree/i });
  }

  get payButton() {
    return this.page.getByRole("button", { name: /pay.*securely/i });
  }

  get countdown() {
    return this.page.getByTestId("countdown");
  }

  async fillCardDetails(card: { name: string; number: string; expiry: string; cvv: string }) {
    await this.cardholderName.fill(card.name);
    await this.cardNumber.fill(card.number);
    await this.expiry.fill(card.expiry);
    await this.cvv.fill(card.cvv);
  }

  async agreeToTerms() {
    await this.agreeCheckbox.check();
  }

  async pay() {
    await this.payButton.click();
  }

  async fillAndPay(card: { name: string; number: string; expiry: string; cvv: string }) {
    await expect(this.countdown).toBeVisible({ timeout: 5000 });
    await this.fillCardDetails(card);
    await this.agreeToTerms();
    await this.pay();
  }

  async expectOnPaymentPage(bookingRef?: string) {
    await expect(this.page).toHaveURL(/\/payment/, { timeout: 5000 });
    if (bookingRef) {
      await expect(this.page).toHaveURL(new RegExp(`ref=${bookingRef}`));
    }
  }
}
