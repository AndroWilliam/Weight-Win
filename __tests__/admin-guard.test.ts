/**
 * @jest-environment node
 */

import { userIsAdmin } from '@/lib/admin/guard'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

describe('Admin Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return false when no user is authenticated', async () => {
    const { createClient } = require('@/lib/supabase/server')
    createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null
        })
      }
    })

    const result = await userIsAdmin()
    expect(result).toBe(false)
  })

  it('should return false when RPC call fails', async () => {
    const { createClient } = require('@/lib/supabase/server')
    createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null
        })
      },
      rpc: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' }
      })
    })

    const result = await userIsAdmin()
    expect(result).toBe(false)
  })

  it('should return true when user is admin', async () => {
    const { createClient } = require('@/lib/supabase/server')
    createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'admin-123', email: 'admin@example.com' } },
          error: null
        })
      },
      rpc: jest.fn().mockResolvedValue({
        data: true,
        error: null
      })
    })

    const result = await userIsAdmin()
    expect(result).toBe(true)
  })

  it('should handle unexpected errors gracefully', async () => {
    const { createClient } = require('@/lib/supabase/server')
    createClient.mockRejectedValue(new Error('Database connection failed'))

    const result = await userIsAdmin()
    expect(result).toBe(false)
  })
})

