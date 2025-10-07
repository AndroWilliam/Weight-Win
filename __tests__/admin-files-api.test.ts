/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/admin/applicants/[id]/files/route'

// Mock admin guard
jest.mock('@/lib/admin/guard', () => ({
  userIsAdmin: jest.fn()
}))

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

describe('Admin Files API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should reject non-admin users', async () => {
    const { userIsAdmin } = require('@/lib/admin/guard')
    userIsAdmin.mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/admin/applicants/123/files')
    const response = await GET(request, { params: { id: '123' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Unauthorized')
    expect(data.success).toBe(false)
  })

  it('should return 404 when application not found', async () => {
    const { userIsAdmin } = require('@/lib/admin/guard')
    const { createClient } = require('@/lib/supabase/server')
    
    userIsAdmin.mockResolvedValue(true)
    createClient.mockResolvedValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      })
    })

    const request = new NextRequest('http://localhost:3000/api/admin/applicants/999/files')
    const response = await GET(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Application not found')
  })

  it('should return signed URLs for admin users', async () => {
    const { userIsAdmin } = require('@/lib/admin/guard')
    const { createClient } = require('@/lib/supabase/server')
    
    userIsAdmin.mockResolvedValue(true)
    
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          cv_file_path: 'path/to/cv.pdf',
          id_file_path: 'path/to/id.jpg'
        },
        error: null
      }),
      storage: {
        from: jest.fn().mockReturnThis(),
        createSignedUrl: jest.fn()
          .mockResolvedValueOnce({ data: { signedUrl: 'https://example.com/cv.pdf' } })
          .mockResolvedValueOnce({ data: { signedUrl: 'https://example.com/id.jpg' } })
      }
    }
    
    createClient.mockResolvedValue(mockSupabase)

    const request = new NextRequest('http://localhost:3000/api/admin/applicants/123/files')
    const response = await GET(request, { params: { id: '123' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.cvUrl).toBe('https://example.com/cv.pdf')
    expect(data.idUrl).toBe('https://example.com/id.jpg')
  })
})

