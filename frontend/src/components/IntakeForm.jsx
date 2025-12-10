import { useState } from 'react'
import axios from 'axios'
import './IntakeForm.css'

const API_URL = 'http://localhost:8000/api'

function IntakeForm() {
  const [formData, setFormData] = useState({
    requestor_name: '',
    title: '',
    vendor_name: '',
    vat_id: '',
    department: '',
    total_cost: 0
  })

  const [orderLines, setOrderLines] = useState([{
    position_description: '',
    unit_price: 0,
    amount: 1,
    unit: '',
    total_price: 0
  }])

  const [pdfFile, setPdfFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOrderLineChange = (index, field, value) => {
    const newOrderLines = [...orderLines]
    newOrderLines[index][field] = value

    // Auto-calculate total_price
    if (field === 'unit_price' || field === 'amount') {
      const unitPrice = parseFloat(newOrderLines[index].unit_price) || 0
      const amount = parseInt(newOrderLines[index].amount) || 0
      newOrderLines[index].total_price = unitPrice * amount
    }

    setOrderLines(newOrderLines)

    // Update total cost
    const totalCost = newOrderLines.reduce((sum, line) => sum + (line.total_price || 0), 0)
    setFormData(prev => ({ ...prev, total_cost: totalCost }))
  }

  const addOrderLine = () => {
    setOrderLines([...orderLines, {
      position_description: '',
      unit_price: 0,
      amount: 1,
      unit: '',
      total_price: 0
    }])
  }

  const removeOrderLine = (index) => {
    if (orderLines.length > 1) {
      const newOrderLines = orderLines.filter((_, i) => i !== index)
      setOrderLines(newOrderLines)
      const totalCost = newOrderLines.reduce((sum, line) => sum + (line.total_price || 0), 0)
      setFormData(prev => ({ ...prev, total_cost: totalCost }))
    }
  }

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setPdfFile(file)
    setLoading(true)
    setMessage({ type: '', text: '' })

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const response = await axios.post(`${API_URL}/upload-pdf`, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const data = response.data
      console.log('Extracted PDF data:', data)

      // Auto-fill form with extracted data
      setFormData(prev => ({
        ...prev,
        vendor_name: data.vendor_name || prev.vendor_name,
        vat_id: data.vat_id || prev.vat_id,
        department: data.department || prev.department,
        total_cost: data.total_cost || prev.total_cost
      }))

      if (data.order_lines && data.order_lines.length > 0) {
        setOrderLines(data.order_lines)
      }

      setMessage({ type: 'success', text: 'PDF data extracted successfully!' })
    } catch (error) {
      console.error('Error uploading PDF:', error)
      setMessage({ type: 'error', text: 'Error extracting PDF data. Please fill in manually.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    // Validation
    if (!formData.requestor_name || !formData.title || !formData.vendor_name || !formData.vat_id || !formData.department) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      setLoading(false)
      return
    }

    if (orderLines.length === 0 || !orderLines[0].position_description) {
      setMessage({ type: 'error', text: 'Please add at least one order line' })
      setLoading(false)
      return
    }

    const requestData = {
      ...formData,
      order_lines: orderLines
    }

    try {
      const response = await axios.post(`${API_URL}/requests`, requestData)
      setMessage({ type: 'success', text: 'Procurement request submitted successfully!' })

      // Reset form
      setFormData({
        requestor_name: '',
        title: '',
        vendor_name: '',
        vat_id: '',
        department: '',
        total_cost: 0
      })
      setOrderLines([{
        position_description: '',
        unit_price: 0,
        amount: 1,
        unit: '',
        total_price: 0
      }])
      setPdfFile(null)
    } catch (error) {
      console.error('Error submitting request:', error)
      setMessage({ type: 'error', text: 'Error submitting request. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="intake-form">
      <h2>New Procurement Request</h2>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="pdf-upload-section">
        <h3>Upload Vendor Offer</h3>
        <p>Automatically extract vendor information from PDF documents</p>
        <input
          type="file"
          id="pdf-upload"
          accept=".pdf"
          onChange={handlePdfUpload}
          disabled={loading}
        />
        <label htmlFor="pdf-upload" className="pdf-upload-label">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Choose PDF File
        </label>
        {pdfFile && !loading && (
          <span className="file-name">📄 {pdfFile.name}</span>
        )}
        {loading && <span className="loading">Extracting data from PDF...</span>}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Request Information</h3>

          <div className="form-group">
            <label>Requestor Name *</label>
            <input
              type="text"
              name="requestor_name"
              value={formData.requestor_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Title / Short Description *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Department *</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Vendor Information</h3>

          <div className="form-group">
            <label>Vendor Name *</label>
            <input
              type="text"
              name="vendor_name"
              value={formData.vendor_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>VAT ID *</label>
            <input
              type="text"
              name="vat_id"
              value={formData.vat_id}
              onChange={handleInputChange}
              placeholder="DE123456789"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Order Lines</h3>

          {orderLines.map((line, index) => (
            <div key={index} className="order-line">
              <h4>Item {index + 1}</h4>

              <div className="form-group">
                <label>Position Description *</label>
                <input
                  type="text"
                  value={line.position_description}
                  onChange={(e) => handleOrderLineChange(index, 'position_description', e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Unit Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={line.unit_price}
                    onChange={(e) => handleOrderLineChange(index, 'unit_price', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    value={line.amount}
                    onChange={(e) => handleOrderLineChange(index, 'amount', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Unit *</label>
                  <input
                    type="text"
                    value={line.unit}
                    onChange={(e) => handleOrderLineChange(index, 'unit', e.target.value)}
                    placeholder="e.g., licenses, pieces"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Total Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={line.total_price}
                    readOnly
                  />
                </div>
              </div>

              {orderLines.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeOrderLine(index)}
                >
                  Remove Item
                </button>
              )}
            </div>
          ))}

          <button type="button" className="btn-add" onClick={addOrderLine}>
            + Add Order Line
          </button>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Total Cost</label>
            <input
              type="number"
              step="0.01"
              value={formData.total_cost}
              readOnly
              className="total-cost"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default IntakeForm
