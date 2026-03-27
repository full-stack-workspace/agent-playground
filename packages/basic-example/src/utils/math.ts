import * as math from 'mathjs'

export function mathCalculator(expression: string): string {
  const result = math.evaluate(expression)
  return result.toString()
}