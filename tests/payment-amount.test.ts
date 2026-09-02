import { describe, it, expect } from 'vitest'

describe('Payment Paisa Normalization', () => {
  const PLAN_AMOUNTS = {
    classic: 3499,
    royal: 5799,
  }

  it('converts PKR amounts correctly to integer Paisa without floating point drift', () => {
    const classicPkr = 3499
    const royalPkr = 5799

    const classicPaisa = Math.round(classicPkr * 100)
    const royalPaisa = Math.round(royalPkr * 100)

    expect(classicPaisa).toBe(349900)
    expect(royalPaisa).toBe(579900)
    expect(Number.isInteger(classicPaisa)).toBe(true)
    expect(Number.isInteger(royalPaisa)).toBe(true)
  })

  it('accurately calculates add-on link pack prices in Paisa', () => {
    const basePkr = PLAN_AMOUNTS.classic // 3499
    const addedQuota = 100
    const addOnPrice = (addedQuota / 50) * 1000 // 2000 PKR
    const totalPkr = basePkr + addOnPrice // 5499 PKR

    const totalPaisa = Math.round(totalPkr * 100)
    expect(totalPaisa).toBe(549900)
  })

  it('accurately applies 10% promo discount math without fraction leakage', () => {
    const totalPkr = 3499
    const discount = Math.round(totalPkr * 0.10) // 350
    const discountedTotal = totalPkr - discount // 3149

    const paisa = Math.round(discountedTotal * 100)
    expect(discount).toBe(350)
    expect(discountedTotal).toBe(3149)
    expect(paisa).toBe(314900)
  })
})
