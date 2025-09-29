require('@testing-library/jest-dom')

// Mock Web APIs for Node.js tests
global.fetch = jest.fn()
global.Request = jest.fn()
global.Response = jest.fn()
global.Headers = jest.fn()

// Polyfill crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-1234567890',
  },
})
