import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'

// Extend Vitest matchers with jest-dom
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})
