import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Inbox.css';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

function Inbox() {
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRequestedAssets();
  }, []);

  const fetchRequestedAssets = async () => {
    try {
      const response = await api.get('/inbox');
      setTableData(response.data);
    } catch (error) {
      console.error('Error fetching requested assets:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/inbox/${id}`, { status: newStatus });
      const updatedData = tableData.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      );
      setTableData(updatedData);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAvailabilityChange = async (id, newAvailability) => {
    try {
      await api.put(`/inbox/${id}`, { availability: newAvailability });
      const updatedData = tableData.map(item =>
        item.id === id ? { ...item, availability: newAvailability } : item
      );
      setTableData(updatedData);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = tableData.filter(item =>
    item.assetName && item.assetName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="card">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Asset Name"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      <table className="inbox-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Image</th>
            <th>Asset Name</th>
            <th>Asset Type</th>
            <th>Sub Category</th>
            <th>User Name</th>
            <th>Due Date</th>
            <th>Availability</th>
            <th>Asset Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>
                {item.image && <img src={`http://localhost:5000${item.image}`} alt={`Asset ${item.id}`} />}
              </td>
              <td>{item.assetName}</td>
              <td>{item.assetType}</td>
              <td>{item.subCategory}</td>
              <td>{item.userName}</td>
              <td>{formatDate(item.dueDate)}</td>
              <td>
                <select
                  value={item.availability || 'Available'}
                  onChange={(e) => handleAvailabilityChange(item.id, e.target.value)}
                  className="availability-select"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="In Use">In Use</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </td>
              <td>
                <button 
                  className="status-button approved" 
                  onClick={() => handleStatusChange(item.id, 'Approved')}
                >
                  Approved
                </button>
                <button 
                  className="status-button denied" 
                  onClick={() => handleStatusChange(item.id, 'Denied')}
                >
                  Denied
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inbox;
