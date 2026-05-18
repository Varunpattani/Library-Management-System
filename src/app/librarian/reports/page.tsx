import React from 'react';
import { requireLibrarianAuth } from '@/lib/session';
import { redirect } from 'next/navigation';
import {
  getCirculationStats,
  getOverdueItems,
  getPopularItems,
  getDashboardStats
} from '@/app/actions/reportActions';
import { BookOpen, Clock, TrendingUp, Users, Activity, FileText } from 'lucide-react';
import { ExportButton } from '@/app/client components/ExportButton';

// Statistics card component for librarian reports
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

// Library overview component
function LibraryOverview({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Library Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Books"
          value={stats.totalItems}
          subtitle="In catalog"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Active Members"
          value={stats.totalUsers}
          subtitle="Registered patrons"
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Books on Loan"
          value={stats.totalActiveTransactions}
          subtitle="Currently borrowed"
          icon={Activity}
          color="orange"
        />
        <StatsCard
          title="Overdue Books"
          value={stats.totalOverdueTransactions}
          subtitle="Need attention"
          icon={Clock}
          color="red"
        />
      </div>
    </div>
  );
}

// Circulation summary component
function CirculationSummary({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Circulation Summary</h2>
        <ExportButton
          data={[
            { metric: 'Total Borrows', value: stats.totalBorrows },
            { metric: 'Total Returns', value: stats.totalReturns },
            { metric: 'Active Loans', value: stats.activeLoans },
            { metric: 'Overdue Loans', value: stats.overdueLoans },
            { metric: 'Pending Requests', value: stats.pendingRequests }
          ]}
          filename="librarian_circulation_report"
          headers={['metric', 'value']}
          title="Circulation Summary Report"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Borrows"
          value={stats.totalBorrows}
          subtitle="All time transactions"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Active Loans"
          value={stats.activeLoans}
          subtitle="Currently out"
          icon={Activity}
          color="orange"
        />
        <StatsCard
          title="Pending Requests"
          value={stats.pendingRequests}
          subtitle="Need approval"
          icon={Clock}
          color="purple"
        />
      </div>
    </div>
  );
}

// Overdue items summary component
function OverdueSummary({ items }: { items: any[] }) {
  const recentOverdueItems = items.slice(0, 10); // Show only first 10 items

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Overdue Items ({items.length})</h2>
        {items.length > 0 && (
          <ExportButton
            data={items.map((transaction: any) => ({
              title: transaction.item.title,
              author: transaction.item.author,
              borrowerName: `${transaction.patron.patronFirstName} ${transaction.patron.patronLastName}`,
              borrowerEmail: transaction.patron.patronEmail,
              dueDate: new Date(transaction.dueDate).toLocaleDateString(),
              daysOverdue: Math.ceil((new Date().getTime() - new Date(transaction.dueDate).getTime()) / (1000 * 60 * 60 * 24))
            }))}
            filename="librarian_overdue_items"
            headers={['title', 'author', 'borrowerName', 'borrowerEmail', 'dueDate', 'daysOverdue']}
            title="Overdue Items Report"
          />
        )}
      </div>
      
      {items.length > 0 ? (
        <div className="bg-white rounded-lg shadow border overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
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
              {recentOverdueItems.map((transaction: any) => {
                const daysOverdue = Math.ceil((new Date().getTime() - new Date(transaction.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={transaction.transactionId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.item.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        by {transaction.item.author}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.patron.patronFirstName} {transaction.patron.patronLastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.patron.patronEmail}
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
          {items.length > 10 && (
            <div className="px-6 py-4 bg-gray-50 text-sm text-gray-600">
              Showing first 10 of {items.length} overdue items. Export to see all items.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border p-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Overdue Items</h3>
          <p className="text-gray-500">All borrowed books are returned on time!</p>
        </div>
      )}
    </div>
  );
}

// Popular items summary component
function PopularItemsSummary({ items }: { items: any[] }) {
  const topItems = items.slice(0, 5); // Show only top 5 items

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Most Popular Books</h2>
        {items.length > 0 && (
          <ExportButton
            data={items.map((item: any, index: number) => ({
              rank: index + 1,
              title: item.title,
              author: item.author,
              borrowCount: item._count.transactions,
              totalActivity: item._count.transactions + item._count.reservations
            }))}
            filename="librarian_popular_items"
            headers={['rank', 'title', 'author', 'borrowCount', 'totalActivity']}
            title="Popular Items Report"
          />
        )}
      </div>
      
      {items.length > 0 ? (
        <div className="bg-white rounded-lg shadow border overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Times Borrowed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topItems.map((item: any, index: number) => (
                <tr key={item.itemId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      by {item.author}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {item._count.transactions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length > 5 && (
            <div className="px-6 py-4 bg-gray-50 text-sm text-gray-600">
              Showing top 5 of {items.length} popular items. Export to see all items.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border p-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">No borrowing activity to show popular items yet.</p>
        </div>
      )}
    </div>
  );
}

// Main librarian reports page
export default async function LibrarianReportsPage() {
  // Authentication check
  let session;
  try {
    session = await requireLibrarianAuth();
  } catch (error) {
    redirect('/login');
  }

  // Fetch report data
  const [
    dashboardStats,
    circulationStats,
    overdueItems,
    popularItems
  ] = await Promise.all([
    getDashboardStats(),
    getCirculationStats(),
    getOverdueItems(),
    getPopularItems()
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Library Reports</h1>
          <p className="text-gray-600">Overview and key statistics for library operations</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileText className="h-4 w-4" />
          Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Library Overview */}
      <LibraryOverview stats={dashboardStats} />

      {/* Circulation Summary */}
      <CirculationSummary stats={circulationStats} />

      {/* Overdue Items */}
      <OverdueSummary items={overdueItems} />

      {/* Popular Items */}
      <PopularItemsSummary items={popularItems} />
    </div>
  );
}
