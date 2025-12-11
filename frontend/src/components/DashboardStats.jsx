import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import axios from 'axios'
import './DashboardStats.css'

const COLORS = {
  'Open': '#f59e0b',
  'In Progress': '#3b82f6',
  'Closed': '#10b981'
}

export default function DashboardStats({ refreshTrigger }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [refreshTrigger])

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/statistics')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-stats">
        <div className="stats-loading">Loading statistics...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="dashboard-stats">
        <div className="stats-error">Failed to load statistics</div>
      </div>
    )
  }

  // Prepare status distribution data for pie chart
  const statusData = Object.entries(stats.status_distribution || {}).map(([status, count]) => ({
    name: status,
    value: count
  }))

  // Get top commodity groups
  const topCommodities = (stats.commodity_breakdown || [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="dashboard-stats">
      <h2>Overview</h2>

      {/* General Stats */}
      <div className="stat-card">
        <div className="stat-label">Total Requests</div>
        <div className="stat-value">{stats.total_requests}</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Total Value</div>
        <div className="stat-value">
          €{stats.price_stats.total_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Average Request</div>
        <div className="stat-value">
          €{stats.price_stats.average_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Status Distribution Pie Chart */}
      {statusData.length > 0 && (
        <div className="chart-section">
          <h3>Request Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Commodity Groups */}
      {topCommodities.length > 0 && (
        <div className="commodity-section">
          <h3>Top Commodity Groups</h3>
          <div className="commodity-list">
            {topCommodities.map((commodity, index) => (
              <div key={index} className="commodity-item">
                <div className="commodity-info">
                  <div className="commodity-name">{commodity.commodity_group}</div>
                  <div className="commodity-stats">
                    <span className="commodity-count">{commodity.count} request{commodity.count !== 1 ? 's' : ''}</span>
                    <span className="commodity-value">
                      €{commodity.total_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
