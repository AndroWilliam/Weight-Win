'use client'

import { useState } from 'react'
import { Search, Eye, Bell, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface UserProgress {
  user_id: string
  email: string
  current_streak: number | null
  longest_streak: number | null
  last_check_in: string | null
  challenge_start_date: string | null
  challenge_status: string | null
  total_weigh_ins: number
  last_weigh_in_at: string | null
  days_to_reward: number
  progress_percent: number
}

interface UsersTableProps {
  rows: UserProgress[]
}

export function UsersTable({ rows }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState('all')

  // Client-side search filter
  const filteredRows = rows.filter(row => 
    row.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProgressBarSegments = (totalWeighIns: number) => {
    const segments = []
    const maxDays = 7
    
    for (let i = 0; i < maxDays; i++) {
      const isComplete = i < totalWeighIns
      const isPartial = i === totalWeighIns && totalWeighIns < maxDays
      
      let bgColor = 'bg-slate-200'
      if (isComplete) {
        if (totalWeighIns >= 7) bgColor = 'bg-indigo-500'
        else if (totalWeighIns >= 5) bgColor = 'bg-indigo-500'
        else bgColor = 'bg-indigo-500'
      }
      if (isPartial) bgColor = 'bg-orange-400'
      
      segments.push(
        <div
          key={i}
          className={`h-2 flex-1 ${bgColor} ${i === 0 ? 'rounded-l-full' : ''} ${i === maxDays - 1 ? 'rounded-r-full' : ''}`}
        />
      )
    }
    
    return segments
  }

  const getStreakChips = (totalWeighIns: number) => {
    const chips = []
    for (let day = 1; day <= 7; day++) {
      const isComplete = day <= totalWeighIns
      chips.push(
        <span
          key={day}
          className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded ${
            isComplete 
              ? 'bg-green-100 text-green-700' 
              : 'bg-slate-100 text-slate-400'
          }`}
        >
          {day}
        </span>
      )
    }
    return chips
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-600">No users found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Users</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  {userFilter === 'all' ? 'All Users' : userFilter.charAt(0).toUpperCase() + userFilter.slice(1)}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={userFilter} onValueChange={setUserFilter}>
                  <DropdownMenuRadioItem value="all">All Users</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[200px]">Progress</TableHead>
              <TableHead className="w-[240px]">Streak</TableHead>
              <TableHead>Last Weigh-in</TableHead>
              <TableHead>Days to Reward</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => {
              const userName = row.email.split('@')[0].split('.').map(part => 
                part.charAt(0).toUpperCase() + part.slice(1)
              ).join(' ')
              
              return (
                <TableRow key={row.user_id}>
                  <TableCell className="font-medium">{userName}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={row.progress_percent} className="w-24 h-1.5" />
                      <span className="text-xs font-medium text-slate-600">{row.progress_percent}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {getStreakChips(row.total_weigh_ins)}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(row.last_weigh_in_at)}</TableCell>
                  <TableCell>
                    {row.days_to_reward === 0 || row.total_weigh_ins >= 7 ? (
                      <span className="font-semibold text-green-600">Completed</span>
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {row.days_to_reward} {row.days_to_reward === 1 ? 'day' : 'days'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" disabled>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" disabled>
                        <Bell className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {filteredRows.length === 0 && searchTerm && (
          <div className="p-8 text-center text-slate-600">
            No results found for "{searchTerm}"
          </div>
        )}
      </CardContent>
    </Card>
  )
}

