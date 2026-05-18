import React from 'react';
import { Suspense } from 'react';
import { requireAdminAuth } from '@/lib/session';
import { redirect } from 'next/navigation';
import {
  getDashboardStats,
  getCirculationStats,
  getItemStats,
  getOverdueItems,
  getPopularItems,
  getFinancialReport,
  getRecentTransactions,
  getActiveUsers
} from '@/app/actions/reportActions';
import { Download, Users, BookOpen, Clock, TrendingUp, DollarSign, Activity, Archive } from 'lucide-react';
import { ExportButton } from '@/app/client components/ExportButton';

// Statistics card component
function StatsCard({ title, value, subtitle, icon: Icon, color = 'blue' }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color?: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Icon className={`h-6 w-6 ${colorClasses[color as keyof typeof colorClasses]}`} />
      </div>
      <p className={`text-3xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

// Dashboard overview component
function DashboardOverview({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle="Registered patrons"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Total Items"
          value={stats.totalItems}
          subtitle="In catalog"
          icon={BookOpen}
          color="green"
        />
        <StatsCard
          title="Active Loans"
          value={stats.totalActiveTransactions}
          subtitle="Currently borrowed"
          icon={Activity}
          color="orange"
        />
        <StatsCard
          title="Overdue Items"
          value={stats.totalOverdueTransactions}
          subtitle="Need attention"
          icon={Clock}
          color="red"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Students"
          value={stats.totalStudents}
          subtitle="Student accounts"
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Faculty"
          value={stats.totalFaculty}
          subtitle="Faculty accounts"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Librarians"
          value={stats.totalLibrarians}
          subtitle="Staff members"
          icon={Users}
          color="green"
        />
      </div>
    </div>
  );
}

// Circulation report component
function CirculationReport({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Circulation Report</h2>
        <ExportButton
          data={[
            { metric: 'Total Borrows', value: stats.totalBorrows },
            { metric: 'Total Returns', value: stats.totalReturns },
            { metric: 'Active Loans', value: stats.activeLoans },
            { metric: 'Overdue Loans', value: stats.overdueLoans },
            { metric: 'Reservations', value: stats.totalReservations },
            { metric: 'Pending Requests', value: stats.pendingRequests }
          ]}
          filename="circulation_report"
          headers={['metric', 'value']}
          title="Circulation Report"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Borrows"
          value={stats.totalBorrows}
          subtitle="All time transactions"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Total Returns"
          value={stats.totalReturns}
          subtitle="Completed transactions"
          icon={Archive}
          color="green"
        />
        <StatsCard
          title="Active Loans"
          value={stats.activeLoans}
          subtitle="Currently borrowed"
          icon={Activity}
          color="orange"
        />
        <StatsCard
          title="Overdue Loans"
          value={stats.overdueLoans}
          subtitle="Past due date"
          icon={Clock}
          color="red"
        />
        <StatsCard
          title="Reservations"
          value={stats.totalReservations}
          subtitle="Items on hold"
          icon={BookOpen}
          color="purple"
        />
        <StatsCard
          title="Pending Requests"
          value={stats.pendingRequests}
          subtitle="Awaiting approval"
          icon={Clock}
          color="orange"
        />
      </div>
    </div>
  );
}

// Item statistics report
function ItemReport({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Item Statistics</h2>
        <ExportButton
          data={[
            { metric: 'Total Items', value: stats.totalItems },
            { metric: 'Available Items', value: stats.availableItems },
            { metric: 'Borrowed Items', value: stats.borrowedItems },
            ...stats.itemsByType.map((item: any) => ({ 
              metric: `${item.itemType} Items`, 
              value: item._count 
            })),
            ...stats.itemsByStatus.map((item: any) => ({ 
              metric: `${item.status} Items`, 
              value: item._count 
            }))
          ]}
          filename="item_statistics"
          headers={['metric', 'value']}
          title="Item Statistics Report"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Items"
          value={stats.totalItems}
          subtitle="In catalog"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Available Items"
          value={stats.availableItems}
          subtitle="Ready for borrowing"
          icon={BookOpen}
          color="green"
        />
        <StatsCard
          title="Borrowed Items"
          value={stats.borrowedItems}
          subtitle="Currently out"
          icon={BookOpen}
          color="orange"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Items by Type</h3>
          <div className="space-y-2">
            {stats.itemsByType.map((item: any) => (
              <div key={item.itemType} className="flex justify-between items-center">
                <span className="capitalize">{item.itemType.toLowerCase().replace('_', ' ')}</span>
                <span className="font-semibold">{item._count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Items by Status</h3>
          <div className="space-y-2">
            {stats.itemsByStatus.map((item: any) => (
              <div key={item.status} className="flex justify-between items-center">
                <span className="capitalize">{item.status.toLowerCase()}</span>
                <span className="font-semibold">{item._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Overdue items report
function OverdueReport({ items }: { items: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Overdue Items Report</h2>
        <ExportButton
          data={items.map((transaction: any) => ({
            title: transaction.item.title,
            author: transaction.item.author,
            isbn: transaction.item.isbn,
            borrowerName: `${transaction.patron.patronFirstName} ${transaction.patron.patronLastName}`,
            borrowerEmail: transaction.patron.patronEmail,
            enrollmentNumber: transaction.patron.studentProfile?.studentEnrollmentNumber || '',
            dueDate: new Date(transaction.dueDate).toLocaleDateString(),
            daysOverdue: Math.ceil((new Date().getTime() - new Date(transaction.dueDate).getTime()) / (1000 * 60 * 60 * 24))
          }))}
          filename="overdue_items"
          headers={['title', 'author', 'isbn', 'borrowerName', 'borrowerEmail', 'enrollmentNumber', 'dueDate', 'daysOverdue']}
          title="Overdue Items Report"
        />
      </div>
      
      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Borrower
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days Overdue
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((transaction: any) => {
              const daysOverdue = Math.ceil((new Date().getTime() - new Date(transaction.dueDate).getTime()) / (1000 * 60 * 60 * 24));
              return (
                <tr key={transaction.transactionId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.item.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        by {transaction.item.author}
                      </div>
                      {transaction.item.isbn && (
                        <div className="text-xs text-gray-400">
                          ISBN: {transaction.item.isbn}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.patron.patronFirstName} {transaction.patron.patronLastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.patron.patronEmail}
                      </div>
                      {transaction.patron.studentProfile?.studentEnrollmentNumber && (
                        <div className="text-xs text-gray-400">
                          Enrollment: {transaction.patron.studentProfile.studentEnrollmentNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {daysOverdue} days
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="px-6 py-4 text-center text-gray-500">
            No overdue items found.
          </div>
        )}
      </div>
    </div>
  );
}

// Popular items report
function PopularItemsReport({ items }: { items: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Popular Items Report</h2>
        <ExportButton
          data={items.map((item: any, index: number) => ({
            rank: index + 1,
            title: item.title,
            author: item.author,
            isbn: item.isbn,
            itemType: item.itemType,
            borrowCount: item._count.transactions,
            reservationCount: item._count.reservations,
            totalActivity: item._count.transactions + item._count.reservations
          }))}
          filename="popular_items"
          headers={['rank', 'title', 'author', 'isbn', 'itemType', 'borrowCount', 'reservationCount', 'totalActivity']}
          title="Popular Items Report"
        />
      </div>
      
      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Borrow Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reservations
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item: any, index: number) => (
              <tr key={item.itemId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                    {index + 1}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      by {item.author}
                    </div>
                    {item.isbn && (
                      <div className="text-xs text-gray-400">
                        ISBN: {item.isbn}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {item._count.transactions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item._count.reservations}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                    {item.itemType.toLowerCase().replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Financial report component
function FinancialReport({ report }: { report: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Report</h2>
        <ExportButton
          data={[
            { metric: 'Total Fines Collected', value: `$${report.totalFinesCollected.toFixed(2)}` },
            { metric: 'Total Inventory Value', value: `$${report.totalBookValue.toFixed(2)}` },
            ...report.transactions.map((transaction: any) => ({
              patronName: `${transaction.patron.patronFirstName} ${transaction.patron.patronLastName}`,
              patronEmail: transaction.patron.patronEmail,
              itemTitle: transaction.item.title,
              fineAmount: `$${transaction.finePaid?.toFixed(2)}`,
              dateBorrowed: new Date(transaction.borrowedAt).toLocaleDateString()
            }))
          ]}
          filename="financial_report"
          headers={report.transactions.length > 0 ? 
            ['metric', 'value', 'patronName', 'patronEmail', 'itemTitle', 'fineAmount', 'dateBorrowed'] : 
            ['metric', 'value']
          }
          title="Financial Report"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="Total Fines Collected"
          value={`$${report.totalFinesCollected.toFixed(2)}`}
          subtitle="From overdue returns"
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Total Inventory Value"
          value={`$${report.totalBookValue.toFixed(2)}`}
          subtitle="Current catalog value"
          icon={TrendingUp}
          color="blue"
        />
      </div>
      
      {report.transactions.length > 0 && (
        <div className="bg-white rounded-lg shadow border overflow-x-auto">
          <h3 className="text-lg font-semibold p-6 border-b">Recent Fine Collections</h3>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patron
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fine Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Borrowed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.transactions.map((transaction: any) => (
                <tr key={transaction.transactionId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.patron.patronFirstName} {transaction.patron.patronLastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.patron.patronEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.item.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    ${transaction.finePaid?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.borrowedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Main reports page
export default async function ReportsPage() {
  // Authentication check
  let session;
  try {
    session = await requireAdminAuth();
  } catch (error) {
    redirect('/login');
  }

  // Fetch all report data
  const [
    dashboardStats,
    circulationStats,
    itemStats,
    overdueItems,
    popularItems,
    financialReport
  ] = await Promise.all([
    getDashboardStats(),
    getCirculationStats(),
    getItemStats(),
    getOverdueItems(),
    getPopularItems(),
    getFinancialReport()
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics and reporting for library management</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Tabbed interface */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {/* Tab navigation - simple implementation without client-side state */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <div className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
              Dashboard
            </div>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="p-6">
          {/* Dashboard Overview - Always shown for now */}
          <DashboardOverview stats={dashboardStats} />
          
          <div className="mt-12">
            <CirculationReport stats={circulationStats} />
          </div>
          
          <div className="mt-12">
            <ItemReport stats={itemStats} />
          </div>
          
          <div className="mt-12">
            <OverdueReport items={overdueItems} />
          </div>
          
          <div className="mt-12">
            <PopularItemsReport items={popularItems} />
          </div>
          
          <div className="mt-12">
            <FinancialReport report={financialReport} />
          </div>
        </div>
      </div>
    </div>
  );
}
