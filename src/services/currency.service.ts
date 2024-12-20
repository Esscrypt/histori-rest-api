import { Injectable, NotFoundException } from '@nestjs/common';

import bn from 'bignumber.js';

@Injectable()
export class CurrencyService {
  private readonly currencies: Record<
    string,
    { name: string; symbol: string }
  > = {
    USD: { name: 'United States Dollar', symbol: '$' },
    EUR: { name: 'Euro', symbol: '€' },
    GBP: { name: 'British Pound Sterling', symbol: '£' },
    JPY: { name: 'Japanese Yen', symbol: '¥' },
    AUD: { name: 'Australian Dollar', symbol: 'A$' },
    CAD: { name: 'Canadian Dollar', symbol: 'C$' },
    CHF: { name: 'Swiss Franc', symbol: 'CHF' },
    CNY: { name: 'Chinese Yuan Renminbi', symbol: '¥' },
    INR: { name: 'Indian Rupee', symbol: '₹' },
    RUB: { name: 'Russian Ruble', symbol: '₽' },
    BRL: { name: 'Brazilian Real', symbol: 'R$' },
    ZAR: { name: 'South African Rand', symbol: 'R' },
    KRW: { name: 'South Korean Won', symbol: '₩' },
    MXN: { name: 'Mexican Peso', symbol: '$' },
    SGD: { name: 'Singapore Dollar', symbol: 'S$' },
    HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
    SEK: { name: 'Swedish Krona', symbol: 'kr' },
    NOK: { name: 'Norwegian Krone', symbol: 'kr' },
    DKK: { name: 'Danish Krone', symbol: 'kr' },
    PLN: { name: 'Polish Zloty', symbol: 'zł' },
    TRY: { name: 'Turkish Lira', symbol: '₺' },
    AED: { name: 'United Arab Emirates Dirham', symbol: 'د.إ' },
    SAR: { name: 'Saudi Riyal', symbol: 'ر.س' },
    THB: { name: 'Thai Baht', symbol: '฿' },
    MYR: { name: 'Malaysian Ringgit', symbol: 'RM' },
  };

  private readonly rates: Record<string, number> = {
    USD: 1,
    EUR: 0.89,
    GBP: 0.77,
    JPY: 110.45,
    AUD: 1.44,
    CAD: 1.31,
    CHF: 0.98,
    CNY: 7.08,
    INR: 74.57,
    RUB: 74.25,
    BRL: 5.03,
    ZAR: 14.7,
    KRW: 1160.45,
    MXN: 20.15,
    SGD: 1.34,
    HKD: 7.85,
    SEK: 8.9,
    NOK: 9.1,
    DKK: 6.63,
    PLN: 3.96,
    TRY: 8.53,
    AED: 3.67,
    SAR: 3.75,
    THB: 31.09,
    MYR: 4.18,
  };

  /**
   * Fetch the currency symbol by the currency code.
   * @param currencyCode - The 3-letter currency code (e.g., USD, EUR).
   * @returns The currency symbol (e.g., $, €).
   */
  public getCurrencySymbol(currencyCode: string): string {
    const currency = this.currencies[currencyCode.toUpperCase()];
    if (!currency) {
      throw new NotFoundException(`Currency code ${currencyCode} not found`);
    }
    return currency.symbol;
  }

  /**
   * Fetch the currency name by the currency code.
   * @param currencyCode - The 3-letter currency code (e.g., USD, EUR).
   * @returns The currency name (e.g., United States Dollar, Euro).
   */
  public getCurrencyName(currencyCode: string): string {
    const currency = this.currencies[currencyCode.toUpperCase()];
    if (!currency) {
      throw new NotFoundException(`Currency code ${currencyCode} not found`);
    }
    return currency.name;
  }

  /**
   * Get the conversion rate from a given currency to USD.
   * @param currencyCode - The 3-letter currency code (e.g., EUR, GBP).
   * @returns Conversion rate to USD.
   */
  public getCurrencyConversionRate(currencyCode: string): bn {
    const rate = this.rates[currencyCode.toUpperCase()];
    if (!rate) {
      throw new NotFoundException(`Rate for ${currencyCode} not found`);
    }
    return new bn(rate.toString());
  }

  /**
   * Convert an amount from one currency to another.
   * @param amount - The amount to convert.
   * @param fromCurrency - The source currency code.
   * @param toCurrency - The target currency code.
   * @returns Converted amount.
   */
  public convertAmount(
    amount: bn,
    fromCurrency: string,
    toCurrency: string,
  ): bn {
    const fromRate = this.getCurrencyConversionRate(fromCurrency);
    const toRate = this.getCurrencyConversionRate(toCurrency);

    if (!fromRate || !toRate) {
      throw new NotFoundException(
        `Rates for ${fromCurrency} or ${toCurrency} not found`,
      );
    }

    // Convert the amount to USD first, then to the target currency
    const amountInUSD = amount.dividedBy(fromRate);
    return amountInUSD.multipliedBy(toRate);
  }

  /**
   * Convert an amount from one currency to another.
   * @param amount - The amount to convert.
   * @param toCurrency - The target currency code.
   * @returns Converted amount.
   */
  public convertAmountUSD(amountInUSD: bn, toCurrency: string): bn {
    const toRate = this.getCurrencyConversionRate(toCurrency);

    if (!toRate) {
      throw new NotFoundException(`Rates for ${toCurrency} not found`);
    }

    return amountInUSD.multipliedBy(toRate);
  }
}
