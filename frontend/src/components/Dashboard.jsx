import { useState, useEffect } from 'react'
import axios from 'axios'
import './Dashboard.css'

const API_URL = 'http://localhost:8000/api'

function Dashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/requests`)
      setRequests(response.data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (requestId, newStatus) => {
    setUpdatingStatus(true)
    try {
      await axios.patch(`${API_URL}/requests/${requestId}/status`, {
        new_status: newStatus,
        notes: `Status changed to ${newStatus}`
      })
      await fetchRequests()
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const filteredRequests = filter === 'All'
    ? requests
    : requests.filter(req => req.status === filter)

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(' ', '-')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  if (loading) {
    return <div className="loading">Loading requests...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Procurement Requests Overview</h2>
        <div className="filter-buttons">
          <button
            className={filter === 'All' ? 'active' : ''}
            onClick={() => setFilter('All')}
          >
            All ({requests.length})
          </button>
          <button
            className={filter === 'Open' ? 'active' : ''}
            onClick={() => setFilter('Open')}
          >
            Open ({requests.filter(r => r.status === 'Open').length})
          </button>
          <button
            className={filter === 'In Progress' ? 'active' : ''}
            onClick={() => setFilter('In Progress')}
          >
            In Progress ({requests.filter(r => r.status === 'In Progress').length})
          </button>
          <button
            className={filter === 'Closed' ? 'active' : ''}
            onClick={() => setFilter('Closed')}
          >
            Closed ({requests.filter(r => r.status === 'Closed').length})
          </button>
        </div>
      </div>

      <div className="requests-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Requestor</th>
              <th>Department</th>
              <th>Vendor</th>
              <th>Total Cost</th>
              <th>Commodity Group</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center' }}>
                  No requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map(request => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.title}</td>
                  <td>{request.requestor_name}</td>
                  <td>{request.department}</td>
                  <td>{request.vendor_name}</td>
                  <td>€{request.total_cost.toFixed(2)}</td>
                  <td>{request.commodity_group || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{formatDate(request.created_at)}</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => setSelectedRequest(request)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <div className="modal" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedRequest(null)}>
              ×
            </button>

            <h2>Request Details</h2>

            <div className="detail-section">
              <h3>Request Information</h3>
              <p><strong>ID:</strong> {selectedRequest.id}</p>
              <p><strong>Title:</strong> {selectedRequest.title}</p>
              <p><strong>Requestor:</strong> {selectedRequest.requestor_name}</p>
              <p><strong>Department:</strong> {selectedRequest.department}</p>
              <p><strong>Status:</strong>
                <span className={`status-badge ${getStatusClass(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </p>
            </div>

            <div className="detail-section">
              <h3>Vendor Information</h3>
              <p><strong>Vendor Name:</strong> {selectedRequest.vendor_name}</p>
              <p><strong>VAT ID:</strong> {selectedRequest.vat_id}</p>
            </div>

            <div className="detail-section">
              <h3>Classification</h3>
              <p><strong>Commodity Group:</strong> {selectedRequest.commodity_group || 'Not classified'}</p>
              <p><strong>Commodity Group ID:</strong> {selectedRequest.commodity_group_id || 'N/A'}</p>
            </div>

            <div className="detail-section">
              <h3>Order Lines</h3>
              <table className="order-lines-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Unit Price</th>
                    <th>Amount</th>
                    <th>Unit</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRequest.order_lines.map(line => (
                    <tr key={line.id}>
                      <td>{line.position_description}</td>
                      <td>€{line.unit_price.toFixed(2)}</td>
                      <td>{line.amount}</td>
                      <td>{line.unit}</td>
                      <td>€{line.total_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="total"><strong>Total Cost:</strong> €{selectedRequest.total_cost.toFixed(2)}</p>
            </div>

            <div className="detail-section">
              <h3>Update Status</h3>
              <div className="status-buttons">
                <button
                  className="btn-status open"
                  onClick={() => updateStatus(selectedRequest.id, 'Open')}
                  disabled={updatingStatus || selectedRequest.status === 'Open'}
                >
                  Open
                </button>
                <button
                  className="btn-status in-progress"
                  onClick={() => updateStatus(selectedRequest.id, 'In Progress')}
                  disabled={updatingStatus || selectedRequest.status === 'In Progress'}
                >
                  In Progress
                </button>
                <button
                  className="btn-status closed"
                  onClick={() => updateStatus(selectedRequest.id, 'Closed')}
                  disabled={updatingStatus || selectedRequest.status === 'Closed'}
                >
                  Closed
                </button>
              </div>
            </div>

            <div className="detail-section">
              <p><strong>Created:</strong> {formatDate(selectedRequest.created_at)}</p>
              <p><strong>Last Updated:</strong> {formatDate(selectedRequest.updated_at)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
