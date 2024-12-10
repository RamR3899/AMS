import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import './MyAssets.css';

// Utility function to format date as YYYY-MM-DD
const formatDateForMySQL = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');  // Add leading zero if needed
  const day = String(d.getDate()).padStart(2, '0');          // Add leading zero if needed
  return `${year}-${month}-${day}`;
};

function MyAsset() {
  const [assets, setAssets] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [error, setError] = useState('');

  // Fetch assets when component mounts
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const username = localStorage.getItem('username'); // Get username from localStorage
        const response = await fetch(`http://localhost:5000/api/assets/username/${username}`);
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }
        const data = await response.json();
        setAssets(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchAssets();  // Fetch assets on component mount
  }, []);

  const handleSearch = (e) => {
    setGlobalFilter(e.target.value);
  };

  const header = (
    <div className="search-container">
      <input
        type="text"
        className="custom-search-input"
        value={globalFilter}
        onChange={handleSearch}
        placeholder="Search assets..."
      />
      <Button
        label="Download"
        icon="pi pi-download"
        className="p-button-rounded p-button-info download-button"
      />
    </div>
  );

  const totalUnitPrice = assets.reduce((total, asset) => total + parseFloat(asset.unit_price), 0);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="my-asset-card">
      <div className="card-content">
        {assets.length === 0 ? (
          <p>No assets found.</p>
        ) : (
          <DataTable
            value={assets}
            paginator
            rows={10}
            header={header}
            globalFilter={globalFilter}
            responsiveLayout="scroll"
            className="p-datatable-gridlines"
          >
            <Column field="asset_id" header="ID" />
            <Column
              field="image"
              header="Image"
              body={(data) => (
                <img
                  src={`http://localhost:5000${data.image}`}
                  alt={data.name}
                  className="product-image"
                />
              )}
            />
            <Column field="asset_name" header="Asset Name" />
            <Column field="description" header="Description" />
            <Column field="unit_price" header="Unit Price" />
            
            {/* Apply the date format to the dueDate column */}
            <Column
              field="due_date"
              header="Due Date"
              body={(data) => formatDateForMySQL(data.due_date)}  // Format the dueDate
            />
          </DataTable>
        )}
        <div className="total-unit-price">Total Price: {totalUnitPrice}</div>
      </div>
    </div>
  );
}

export default MyAsset;
