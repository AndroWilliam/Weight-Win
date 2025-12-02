import { NextRequest, NextResponse } from 'next/server'
import { userIsAdmin } from '@/lib/admin/guard'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'
import ExcelJS from 'exceljs'

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  logger.info('[Users Export] Request started', { requestId })

  // 1. Verify user is admin
  const isAdmin = await userIsAdmin()
  if (!isAdmin) {
    logger.info('[Users Export] Unauthorized access attempt', { requestId })
    return NextResponse.json(
      { success: false, error: 'Admin access required' },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()
    const { userIds } = body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'userIds array is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceSupabaseClient()

    logger.info('[Users Export] Fetching user data', { requestId, count: userIds.length })

    // 2. Fetch user data for each user ID
    const usersData = await Promise.all(
      userIds.map(async (userId) => {
        // Get user email and name from auth.users
        const { data: userData } = await supabase.auth.admin.getUserById(userId)

        // Get phone number from user_settings
        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('phone_number')
          .eq('user_id', userId)
          .maybeSingle()

        // Get days completed from user_milestones
        const { data: milestoneData } = await supabase
          .from('user_milestones')
          .select('total_days_completed')
          .eq('user_id', userId)
          .maybeSingle()

        const daysCompleted = milestoneData?.total_days_completed ?? 0
        const phoneNumber = settingsData?.phone_number || ''
        const isBoldEligible = daysCompleted >= 7 && phoneNumber !== ''

        return {
          name: userData?.user?.user_metadata?.full_name || userData?.user?.email?.split('@')[0] || 'Unknown',
          email: userData?.user?.email || 'Unknown',
          phoneNumber,
          daysCompleted,
          boldStatus: isBoldEligible ? 'Eligible' : 'Not Eligible',
          isBoldEligible,
        }
      })
    )

    logger.info('[Users Export] Data fetched, generating Excel', {
      requestId,
      users: usersData.length,
      boldEligible: usersData.filter(u => u.isBoldEligible).length,
    })

    // 3. Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Users Export')

    // 4. Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Phone Number', key: 'phoneNumber', width: 20 },
      { header: 'Days Completed', key: 'daysCompleted', width: 18 },
      { header: 'BOLD Status', key: 'boldStatus', width: 18 },
    ]

    // 5. Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }, // Indigo-600
    }
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getRow(1).height = 25

    // 6. Add data rows with conditional formatting
    usersData.forEach((user) => {
      const row = worksheet.addRow({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || 'Not provided',
        daysCompleted: user.daysCompleted,
        boldStatus: user.boldStatus,
      })

      // Highlight BOLD eligible users with green background
      if (user.isBoldEligible) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF86EFAC' }, // Green-300
          }
          cell.font = { bold: true, color: { argb: 'FF166534' } } // Green-800
        })
      }

      // Center align Days Completed and BOLD Status columns
      row.getCell('daysCompleted').alignment = { horizontal: 'center' }
      row.getCell('boldStatus').alignment = { horizontal: 'center' }
    })

    // 7. Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })
    })

    // 8. Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer()

    logger.info('[Users Export] Excel generated successfully', { requestId })

    // 9. Return Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  } catch (error: any) {
    logger.error('[Users Export] Export failed', error, { requestId })
    return NextResponse.json(
      { success: false, error: 'Export failed', details: error.message },
      { status: 500 }
    )
  }
}
