'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  getLibrarySettings, 
  updateLibrarySettings, 
  resetLibrarySettings, 
  getSystemStatistics,
  type LibrarySettingsData 
} from '@/app/actions/systemConfigActions'
import { Settings, RotateCcw, Save, BookOpen, Users, Clock, AlertTriangle, DollarSign } from 'lucide-react'

interface LibrarySettings {
  librarySettingsId: number
  borrowingLimit: number
  loanPeriodDays: number
  finePerDay: number
  updatedAt: Date
  updatedBy?: {
    adminFirstName: string
    adminLastName: string
    adminEmail: string
  }
}

interface SystemStats {
  totalPatrons: number
  totalItems: number
  totalBorrowedItems: number
  totalOverdueItems: number
  totalFinesCollected: number
}

export default function SystemConfigClient() {
  const [settings, setSettings] = useState<LibrarySettings | null>(null)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState<LibrarySettingsData>({
    borrowingLimit: 5,
    loanPeriodDays: 14,
    finePerDay: 1.0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [settingsResult, statsResult] = await Promise.all([
        getLibrarySettings(),
        getSystemStatistics()
      ])

      if (settingsResult.success && settingsResult.data) {
        setSettings(settingsResult.data)
        setFormData({
          borrowingLimit: settingsResult.data.borrowingLimit,
          loanPeriodDays: settingsResult.data.loanPeriodDays,
          finePerDay: settingsResult.data.finePerDay
        })
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setMessage({ type: 'error', text: 'Failed to load system data' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof LibrarySettingsData, value: string) => {
    const numericValue = parseFloat(value) || 0
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }))
  }

  const handleUpdateSettings = async () => {
    setIsUpdating(true)
    setMessage(null)
    
    try {
      const result = await updateLibrarySettings(formData)
      
      if (result.success && result.data) {
        setSettings(result.data)
        setMessage({ type: 'success', text: 'Settings updated successfully!' })
        // Refresh stats as well
        const statsResult = await getSystemStatistics()
        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data)
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update settings' })
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleResetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to default values?')) {
      return
    }

    setIsUpdating(true)
    setMessage(null)
    
    try {
      const result = await resetLibrarySettings()
      
      if (result.success && result.data) {
        setSettings(result.data)
        setFormData({
          borrowingLimit: result.data.borrowingLimit,
          loanPeriodDays: result.data.loanPeriodDays,
          finePerDay: result.data.finePerDay
        })
        setMessage({ type: 'success', text: 'Settings reset to defaults successfully!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reset settings' })
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-lg">Loading system configuration...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">System Configuration</h1>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            System Overview
          </h2>
          
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Total Patrons</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.totalPatrons}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Total Items</p>
                    <p className="text-2xl font-bold text-green-800">{stats.totalItems}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">Items Borrowed</p>
                    <p className="text-2xl font-bold text-yellow-800">{stats.totalBorrowedItems}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Overdue Items</p>
                    <p className="text-2xl font-bold text-red-800">{stats.totalOverdueItems}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600">Total Fines Collected</p>
                    <p className="text-2xl font-bold text-purple-800">${stats.totalFinesCollected.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Library Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Library Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="borrowingLimit" className="block text-sm font-medium text-gray-700 mb-1">
                Borrowing Limit (per patron)
              </label>
              <Input
                id="borrowingLimit"
                type="number"
                min="1"
                max="50"
                value={formData.borrowingLimit}
                onChange={(e) => handleInputChange('borrowingLimit', e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum number of items a patron can borrow (1-50)</p>
            </div>

            <div>
              <label htmlFor="loanPeriodDays" className="block text-sm font-medium text-gray-700 mb-1">
                Loan Period (days)
              </label>
              <Input
                id="loanPeriodDays"
                type="number"
                min="1"
                max="365"
                value={formData.loanPeriodDays}
                onChange={(e) => handleInputChange('loanPeriodDays', e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Default loan period in days (1-365)</p>
            </div>

            <div>
              <label htmlFor="finePerDay" className="block text-sm font-medium text-gray-700 mb-1">
                Fine per Day ($)
              </label>
              <Input
                id="finePerDay"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.finePerDay}
                onChange={(e) => handleInputChange('finePerDay', e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Fine amount per day for overdue items ($0-$100)</p>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button 
              onClick={handleUpdateSettings} 
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isUpdating ? 'Saving...' : 'Save Settings'}
            </Button>
            
            <Button 
              onClick={handleResetSettings} 
              disabled={isUpdating}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>

          {settings && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Last updated: {new Date(settings.updatedAt).toLocaleDateString()} at {new Date(settings.updatedAt).toLocaleTimeString()}
              </p>
              {settings.updatedBy && (
                <p className="text-sm text-gray-600">
                  By: {settings.updatedBy.adminFirstName} {settings.updatedBy.adminLastName}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
