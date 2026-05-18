# System Configuration Module

This document provides comprehensive documentation for the System Configuration module implementation in the Library Management System.

## Overview

The System Configuration module allows administrators to manage core library settings such as borrowing limits, loan periods, and fine rates. It also provides real-time system statistics and an intuitive interface for configuration management.

## Features

### 1. **Library Settings Management**
- **Borrowing Limit**: Configure maximum number of items a patron can borrow (1-50)
- **Loan Period**: Set default loan period in days (1-365 days)  
- **Fine Rate**: Configure daily fine amount for overdue items ($0-$100)

### 2. **System Statistics Dashboard**
- Real-time display of:
  - Total Patrons
  - Total Items in catalog
  - Currently borrowed items
  - Overdue items count
  - Total fines collected

### 3. **Admin Controls**
- Save/Update settings with validation
- Reset to default values with confirmation
- Track who last updated settings and when

## Implementation Details

### Files Created/Modified

#### Server Actions
- **`src/app/actions/systemConfigActions.ts`**
  - `getLibrarySettings()` - Fetch current settings
  - `updateLibrarySettings(data)` - Update settings with validation
  - `resetLibrarySettings(adminId)` - Reset to defaults
  - `getSystemStatistics()` - Get real-time system stats

#### Client Components
- **`src/app/client components/SystemConfigClient.tsx`**
  - Full-featured React component with forms and statistics
  - Real-time data loading and error handling
  - Responsive design with Tailwind CSS

#### Utility Functions
- **`src/lib/systemUtils.ts`**
  - `getCurrentSettings()` - Get settings with caching
  - `calculateDueDate(borrowDate)` - Calculate due dates based on settings
  - `calculateFine(dueDate, returnDate)` - Calculate overdue fines
  - `canPatronBorrow(patronId)` - Check borrowing eligibility
  - `getPatronBorrowingStats(patronId)` - Get patron statistics

#### Pages
- **`src/app/admin/system/page.tsx`** - Updated to use new component

#### Database
- **`prisma/seed.ts`** - Updated to include library settings seeding

### Database Schema

The existing `LibrarySettings` model in Prisma schema includes:
```prisma
model LibrarySettings {
  librarySettingsId   Int      @id @default(1)
  borrowingLimit      Int      @default(5)
  loanPeriodDays      Int      @default(14)
  finePerDay          Float    @default(1.0)
  updatedAt           DateTime @updatedAt
  updatedBy           Admin?   @relation(fields: [updatedByAdminId], references: [adminId])
  updatedByAdminId    Int?
}
```

### API Endpoints

#### Server Actions (Next.js 13+ App Router)
- **GET Settings**: `getLibrarySettings()`
- **UPDATE Settings**: `updateLibrarySettings(settingsData)`
- **RESET Settings**: `resetLibrarySettings(adminId)`
- **GET Statistics**: `getSystemStatistics()`

### Validation Rules

#### Borrowing Limit
- Range: 1-50 items
- Default: 5 items

#### Loan Period  
- Range: 1-365 days
- Default: 14 days

#### Fine Rate
- Range: $0.00-$100.00 per day
- Default: $1.00 per day

## Usage Examples

### Updating Settings
```typescript
import { updateLibrarySettings } from '@/app/actions/systemConfigActions'

const result = await updateLibrarySettings({
  borrowingLimit: 10,
  loanPeriodDays: 21,
  finePerDay: 1.50,
  updatedByAdminId: 1
})
```

### Getting Current Settings
```typescript
import { getCurrentSettings } from '@/lib/systemUtils'

const settings = await getCurrentSettings()
console.log(`Current borrowing limit: ${settings.borrowingLimit}`)
```

### Calculating Due Date
```typescript
import { calculateDueDate } from '@/lib/systemUtils'

const dueDate = await calculateDueDate(new Date())
console.log(`Due date: ${dueDate.toDateString()}`)
```

### Calculating Fines
```typescript
import { calculateFine } from '@/lib/systemUtils'

const fine = await calculateFine(
  new Date('2024-01-01'), // Due date
  new Date('2024-01-05')  // Return date
)
console.log(`Fine amount: $${fine.toFixed(2)}`)
```

## User Interface

### Admin Dashboard (/admin/system)
- **System Overview Cards**: Display key metrics with icons
- **Settings Form**: Intuitive form with validation
- **Action Buttons**: Save and Reset with confirmation
- **Audit Trail**: Shows last update information

### Responsive Design
- Desktop: Two-column layout (statistics + settings)
- Mobile: Stacked layout with full-width cards
- Tablet: Responsive grid adjustments

### Visual Elements
- Color-coded statistic cards
- Loading states and error messages
- Success/error feedback for operations
- Icons from Lucide React

## Error Handling

### Validation Errors
- Client-side validation prevents invalid submissions
- Server-side validation with detailed error messages
- User-friendly error display in UI

### Database Errors  
- Graceful fallback to default settings
- Error logging for debugging
- User notification of system issues

### Network Errors
- Retry mechanisms for failed requests
- Offline state handling
- Loading indicators during operations

## Security Considerations

### Access Control
- Only admin users can access system configuration
- Settings changes are logged with admin attribution
- Input validation prevents malicious data

### Data Integrity
- Database constraints ensure valid ranges
- Transaction-based updates for consistency
- Backup/restore capabilities for settings

## Performance Optimizations

### Caching Strategy
- Settings cached for quick access
- Statistics calculated on-demand
- Efficient database queries with proper indexes

### Real-time Updates
- Automatic page revalidation after changes
- Optimistic updates for better UX
- Minimal data fetching for statistics

## Testing Recommendations

### Unit Tests
- Test all utility functions with edge cases
- Validate calculation logic (fines, due dates)
- Test form validation rules

### Integration Tests  
- Test server actions with database
- Test UI component interactions
- Test admin access control

### End-to-End Tests
- Test complete settings update workflow
- Test statistics accuracy
- Test error handling scenarios

## Deployment Notes

### Environment Setup
1. Ensure database contains LibrarySettings table
2. Run seed script to populate default settings
3. Verify admin user access permissions

### Configuration
- No additional environment variables required
- Uses existing database connection
- Works with current Prisma setup

### Migration Considerations
- Settings table already exists in schema
- Seed script handles initial data setup
- Backward compatible with existing data

## Future Enhancements

### Planned Features
- **Advanced Settings**: Email notifications, holiday settings
- **Backup/Restore**: Settings export/import functionality  
- **Audit Logs**: Detailed change history tracking
- **Role-based Access**: Granular permission controls

### Scalability Improvements
- Settings caching with Redis
- Multi-tenant configuration support
- API versioning for settings updates
- Batch operations for bulk changes

## Support and Maintenance

### Monitoring
- Track settings change frequency
- Monitor system statistics accuracy
- Log configuration errors

### Backup Strategy
- Regular database backups include settings
- Export functionality for manual backups
- Version control for settings changes

### Documentation Updates
- Keep this README current with changes
- Document new utility functions
- Update API documentation as needed

---

## Quick Start

1. **Access the System Configuration**:
   - Navigate to `/admin/system`
   - Login as admin user

2. **Update Settings**:
   - Modify values in the settings form
   - Click "Save Settings"
   - Confirm success message

3. **Monitor Statistics**:
   - View real-time system overview
   - Statistics update automatically

4. **Reset if Needed**:
   - Click "Reset to Defaults"
   - Confirm the action
   - Settings revert to original values

For technical support or questions about implementation, refer to the source code comments and existing documentation.
