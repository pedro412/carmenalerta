import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createReportId } from '../src/utils/createReportId.ts'
import { REPORT_AREA, validateReportLocation } from '../src/utils/reportLocation.ts'

test('uses randomUUID when the browser provides it', (context) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  context.after(() => Object.defineProperty(globalThis, 'crypto', descriptor))
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { randomUUID: () => 'browser-uuid' } })
  assert.equal(createReportId(), 'browser-uuid')
})

test('creates distinct IDs without randomUUID, even at the same time and random value', (context) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  context.after(() => Object.defineProperty(globalThis, 'crypto', descriptor))
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {} })
  context.mock.method(Date, 'now', () => 1_800_000_000_000)
  context.mock.method(Math, 'random', () => 0.5)
  const ids = Array.from({ length: 100 }, createReportId)
  assert.equal(new Set(ids).size, ids.length)
  assert(ids.every((id) => typeof id === 'string' && id.length > 0))
})

test('also creates an ID when the crypto object is missing', (context) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  context.after(() => Object.defineProperty(globalThis, 'crypto', descriptor))
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: undefined })
  assert.equal(typeof createReportId(), 'string')
})

test('accepts a location in Ciudad del Carmen and the configured coverage edges', () => {
  assert.equal(validateReportLocation({ latitude: 18.648, longitude: -91.79 }), null)
  for (const latitude of [REPORT_AREA.south, REPORT_AREA.north]) {
    for (const longitude of [REPORT_AREA.west, REPORT_AREA.east]) {
      assert.equal(validateReportLocation({ latitude, longitude }), null)
    }
  }
})

test('rejects valid world coordinates outside the coverage area on every edge', () => {
  const outside = [
    { latitude: 19.4326, longitude: -99.1332 },
    { latitude: REPORT_AREA.south - 0.001, longitude: -91.79 },
    { latitude: REPORT_AREA.north + 0.001, longitude: -91.79 },
    { latitude: 18.648, longitude: REPORT_AREA.west - 0.001 },
    { latitude: 18.648, longitude: REPORT_AREA.east + 0.001 },
  ]
  for (const point of outside) assert.match(validateReportLocation(point), /fuera de la zona/)
})

test('rejects missing, non-finite and impossible coordinates', () => {
  for (const point of [
    null,
    { latitude: NaN, longitude: -91.79 },
    { latitude: 18.648, longitude: Infinity },
    { latitude: 91, longitude: -91.79 },
    { latitude: 18.648, longitude: -181 },
  ]) assert.match(validateReportLocation(point), /válida/)
})
