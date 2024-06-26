import { createDefer } from '@vitest/utils'
import { describe, test, vi } from 'vitest'

// 3 tests depend on each other,
// so they will deadlock when maxConcurrency < 3
//
//  [a]  [b]  [c]
//   * ->
//        * ->
//          <- *
//     <------

vi.setConfig({ maxConcurrency: 2 })

describe('wrapper', { concurrent: true, timeout: 500 }, () => {
  const defers = [
    createDefer<void>(),
    createDefer<void>(),
    createDefer<void>(),
  ]

  describe('1st suite', () => {
    test('a', async () => {
      defers[0].resolve()
      await defers[2]
    })

    test('b', async () => {
      await defers[0]
      defers[1].resolve()
      await defers[2]
    })
  })

  describe('2nd suite', () => {
    test('c', async () => {
      await defers[1]
      defers[2].resolve()
    })
  })
})
