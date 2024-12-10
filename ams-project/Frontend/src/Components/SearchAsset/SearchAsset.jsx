import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import './SearchAsset.css';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

const getAssets = () => api.get('/assets');
const getTypes = () => api.get('/types');
const getSubCategoriesByType = (typeId) => api.get(`/subcategories/${typeId}`);

function SearchAsset() {
  const [assets, setAssets] = useState([]);
  const [types, setTypes] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssetName, setFilterAssetName] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSubCategory, setFilterSubCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [requestedAssets, setRequestedAssets] = useState([]);

  useEffect(() => {
    fetchAssets();
    fetchTypes();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await getAssets();
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await getTypes();
      setTypes(response.data);
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };

  const fetchSubCategories = async (typeId) => {
    try {
      const response = await getSubCategoriesByType(typeId);
      setSubCategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleAssetNameFilterChange = (event) => {
    setFilterAssetName(event.target.value);
  };

  const handleRequest = async (row) => {
    // Retrieve the currently logged-in user's username from localStorage
    const loggedInUserName = localStorage.getItem('username'); 

    if (!requestedAssets.includes(row.name)) {
      setRequestedAssets([...requestedAssets, row.name]);

      try {
        // Send a request for the asset along with the logged-in username
        await api.post('/requests', {
          id: row.id,
          userName: loggedInUserName, // Use the correct logged-in user's username
          dueDate: row.dueDate,
        });
      } catch (error) {
        console.error('Error requesting asset:', error);
      }
    }
  };

  const handleFilterTypeChange = (event) => {
    const selectedType = event.target.value;
    setFilterType(selectedType);
    setFilterSubCategory(''); // Reset subcategory filter when type changes

    if (selectedType) {
      fetchSubCategories(selectedType);
    } else {
      setSubCategories([]);
    }
  };

  const handleFilterSubCategoryChange = (event) => {
    setFilterSubCategory(event.target.value);
  };

  const handleResetFilters = () => {
    setFilterAssetName('');
    setFilterType('');
    setFilterSubCategory('');
    setSubCategories([]);
  };

  const filteredData = assets.filter(({ name, typeName, subCategoryName }) => {
    const matchesSearch = name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesAssetName = filterAssetName === '' || name?.toLowerCase().includes(filterAssetName.toLowerCase());
    const matchesType = filterType === '' || typeName === filterType;
    const matchesSubCategory = filterSubCategory === '' || subCategoryName === filterSubCategory;

    return matchesSearch && matchesAssetName && matchesType && matchesSubCategory;
  });

  return (
    <section className="card">
      <div className="search-container">
        <InputText
          type="search"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by Asset Name"
          className="search-input"
        />
        <Button
          icon="pi pi-filter"
          className="filter-icon p-button-text"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Filter Options"
        />
      </div>

      {showFilters && (
        <div className="filter-options">
          <label>
            Filter by Asset Name:
            <InputText
              type="text"
              value={filterAssetName}
              onChange={handleAssetNameFilterChange}
              placeholder="Filter by Asset Name"
              className="filter-input"
            />
          </label>
          <label>
            Filter by Type:
            <select value={filterType} onChange={handleFilterTypeChange}>
              <option value="">All</option>
              {types.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Filter by Sub Category:
            <select value={filterSubCategory} onChange={handleFilterSubCategoryChange}>
              <option value="">All</option>
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            label="Reset Filters"
            className="p-button-secondary"
            onClick={handleResetFilters}
            aria-label="Reset Filters"
          />
        </div>
      )}

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Image</th>
              <th>Asset Name</th>
              <th>Type</th>
              <th>Sub Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={`http://localhost:5000${row.image}`}
                    alt={row.name}
                    width="50"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=No+Image'; }}
                    className="asset-image"
                  />
                </td>
                <td>{row.name}</td>
                <td>{row.typeName}</td>
                <td>{row.subCategoryName}</td>
                <td>
                  <button
                    className={`request-button ${requestedAssets.includes(row.name) ? 'requested' : ''}`}
                    aria-label={`Request for ${row.name}`}
                    onClick={() => handleRequest(row)}
                    disabled={requestedAssets.includes(row.name)}
                  >
                    {requestedAssets.includes(row.name) ? 'Requested' : 'Request'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default SearchAsset;
