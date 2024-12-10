import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import './Assets.css';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// API Configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// API Functions
const getAssets = () => api.get('/assets');
const getTypes = () => api.get('/types');
const getSubCategoriesByTypeId = (typeId) => api.get(`/subcategories/${typeId}`);
const getUsernames = () => api.get('/usernames');
const deleteAsset = (id) => api.delete(`/assets/${id}`);

function Assets() {
  const initialAssetState = {
    id: '',
    image: null,
    name: '',
    type: '',
    subCategory: '',
    userName: '',
    unitPrice: '',
    dueDate: null,
    assignedDate: null,
    dateOfPurchase: null,
    description: '',
  };

  const [assets, setAssets] = useState([]);
  const [types, setTypes] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [usernames, setUsernames] = useState([]);
  const [newAsset, setNewAsset] = useState(initialAssetState);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [totalUnitPrice, setTotalUnitPrice] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchAssets();
    fetchTypes();
    fetchUsernames();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await getAssets();
      setAssets(response.data);
      setTotalUnitPrice(
        response.data.reduce(
          (total, asset) => total + parseFloat(asset.unitPrice),
          0
        )
      );
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
      const response = await getSubCategoriesByTypeId(typeId);
      setSubCategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchUsernames = async () => {
    try {
      const response = await getUsernames();
      setUsernames(response.data);
    } catch (error) {
      console.error('Error fetching usernames:', error);
    }
  };

  const handleAddAsset = () => {
    setIsDialogVisible(true);
  };

  const formatDateForMySQL = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split('T')[0]; // 'YYYY-MM-DD'
  };

  const handleSaveAsset = async () => {
    const formData = new FormData();
    formData.append('image', newAsset.image);
    formData.append('name', newAsset.name);
    formData.append('typeId', newAsset.type);
    formData.append('subCategoryId', newAsset.subCategory);
    formData.append('userName', newAsset.userName);
    formData.append('unitPrice', newAsset.unitPrice);
    formData.append('dueDate', formatDateForMySQL(newAsset.dueDate));
    formData.append('assignedDate', formatDateForMySQL(newAsset.assignedDate));
    formData.append('dateOfPurchase', formatDateForMySQL(newAsset.dateOfPurchase));
    formData.append('description', newAsset.description);

    try {
      const response = await api.post('/assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setAssets([...assets, response.data]);
        setTotalUnitPrice(totalUnitPrice + parseFloat(newAsset.unitPrice));
        setIsDialogVisible(false);
        resetNewAsset();
      } else {
        console.error('Failed to save asset:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating asset:', error);
    }
  };

  const handleDeleteAsset = async (id) => {
    try {
      await deleteAsset(id);
      const assetToDelete = assets.find((asset) => asset.id === id);
      setAssets(assets.filter((asset) => asset.id !== id));
      setTotalUnitPrice(totalUnitPrice - parseFloat(assetToDelete.unitPrice));
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const handleInputChange = (e, name) => {
    const value = e.target.value;
    setNewAsset({ ...newAsset, [name]: value });
    if (name === 'type') {
      fetchSubCategories(value);
    }
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    setNewAsset({ ...newAsset, image: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCloseDialog = () => {
    setIsDialogVisible(false);
    resetNewAsset();
  };

  const resetNewAsset = () => {
    setNewAsset(initialAssetState);
    setImagePreview(null);
  };

  const header = (
    <div className="table-header">
      <input
        type="search"
        onInput={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search..."
        style={{
          width: '100%',
          maxWidth: '350px',
          padding: '10px',
          border: '1px solid #b2b1b1',
          borderRadius: '4px',
          boxSizing: 'border-box',
          fontSize: '16px',
        }}
      />
      <button className="add-button" onClick={handleAddAsset}>
        <span className="icon">
          <i className="fas fa-plus"></i>Add
        </span>
      </button>
    </div>
  );

  const actionBodyTemplate = (rowData) => (
    <Button
      icon="pi pi-trash"
      className="p-button-rounded p-button-danger"
      onClick={() => handleDeleteAsset(rowData.id)}
    />
  );

  return (
    <div className="assets-page">
      <div className="my-asset-card">
        <div className="card-content">
          <DataTable
            value={assets}
            paginator
            rows={10}
            header={header}
            globalFilter={globalFilter}
            responsiveLayout="scroll"
            className="p-datatable-gridlines"
          >
            <Column field="id" header="ID" />
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
            <Column field="name" header="Asset Name" />
            <Column field="typeName" header="Type" />
            <Column field="subCategoryName" header="Sub Category" />
            <Column field="userName" header="User Name" />
            <Column field="unitPrice" header="Unit Price" />
            {/* <Column field="dueDate" header="Due Date" />
            <Column field="assignedDate" header="Assigned Date" />
            <Column field="dateOfPurchase" header="Date of Purchase" /> */}
            <Column 
  field="dueDate" 
  header="Due Date" 
  body={(rowData) => rowData.dueDate.split('T')[0]} // Extract only the date part
/>

<Column 
  field="assignedDate" 
  header="Assigned Date" 
  body={(rowData) => rowData.assignedDate.split('T')[0]} // Extract only the date part
/>

<Column 
  field="dateOfPurchase" 
  header="Date of Purchase" 
  body={(rowData) => rowData.dateOfPurchase.split('T')[0]} // Extract only the date part
/>

            <Column field="description" header="Description" />
            <Column header="Action" body={actionBodyTemplate} />
          </DataTable>
        </div>
        <div className="total-unit-price">
          Total Price: {totalUnitPrice.toFixed(2)}
        </div>
      </div>

      {isDialogVisible && (
  <div className="new-asset-dialog">
    <div className="new-asset-form">
      <h3>Add New Asset</h3>
      {/* <div className="p-field">
        <label htmlFor="id">ID</label>
        <InputText
          id="id"
          value={newAsset.id}
          onChange={(e) => handleInputChange(e, 'id')}
          className="standard-input"
        />
      </div> */}
      <div className="p-field">
        <label htmlFor="name">Asset Name</label>
        <InputText
          id="name"
          value={newAsset.name}
          onChange={(e) => handleInputChange(e, 'name')}
          className="standard-input"
        />
      </div>
      <div className="p-field">
        <label htmlFor="image">Asset Image</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="standard-input"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="image-preview"
          />
        )}
      </div>
      <div className="p-field">
        <label htmlFor="type">Asset Type</label>
        <select
          id="type"
          value={newAsset.type}
          onChange={(e) => handleInputChange(e, 'type')}
          className="standard-input"
        >
          <option value="" disabled>
            Select Asset Type
          </option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>
      <div className="p-field">
        <label htmlFor="subCategory">Sub Category</label>
        <select
          id="subCategory"
          value={newAsset.subCategory}
          onChange={(e) => handleInputChange(e, 'subCategory')}
          className="standard-input"
        >
          <option value="" disabled>
            Select Sub Category
          </option>
          {subCategories.map((subCategory) => (
            <option key={subCategory.id} value={subCategory.id}>
              {subCategory.name}
            </option>
          ))}
        </select>
      </div>
      <div className="p-field">
        <label htmlFor="userName">User Name</label>
        <select
          id="userName"
          value={newAsset.userName}
          onChange={(e) => handleInputChange(e, 'userName')}
          className="standard-input"
        >
          <option value="" disabled>
            Select User Name
          </option>
          {usernames.map((username) => (
            <option key={username} value={username}>
              {username}
            </option>
          ))}
        </select>
      </div>
      <div className="p-field">
        <label htmlFor="unitPrice">Unit Price</label>
        <InputText
          id="unitPrice"
          type="number"
          value={newAsset.unitPrice}
          onChange={(e) => handleInputChange(e, 'unitPrice')}
          className="standard-input"
        />
      </div>
      <div className="p-field">
        <label htmlFor="dueDate">Due Date</label>
        <DatePicker
          id="dueDate"
          selected={newAsset.dueDate}
          onChange={(date) => setNewAsset({ ...newAsset, dueDate: date })}
          dateFormat="yyyy-MM-dd"
          className="standard-input"
          placeholderText="YYYY-MM-DD"
        />
      </div>
      <div className="p-field">
        <label htmlFor="assignedDate">Assigned Date</label>
        <DatePicker
          id="assignedDate"
          selected={newAsset.assignedDate}
          onChange={(date) => setNewAsset({ ...newAsset, assignedDate: date })}
          dateFormat="yyyy-MM-dd"
          className="standard-input"
          placeholderText="YYYY-MM-DD"
        />
      </div>
      <div className="p-field">
        <label htmlFor="dateOfPurchase">Date of Purchase</label>
        <DatePicker
          id="dateOfPurchase"
          selected={newAsset.dateOfPurchase}
          onChange={(date) => setNewAsset({ ...newAsset, dateOfPurchase: date })}
          dateFormat="yyyy-MM-dd"
          className="standard-input"
          placeholderText="YYYY-MM-DD"
        />
      </div>
      <div className="p-field">
        <label htmlFor="description">Description</label>
        <InputText
          id="description"
          value={newAsset.description}
          onChange={(e) => handleInputChange(e, 'description')}
          className="standard-input"
        />
      </div>
      <div className="dialog-buttons">
        <Button
          label="Save"
          icon="pi pi-check"
          className="p-button-rounded save-button"
          onClick={handleSaveAsset}
        />
        <Button
          label="Cancel"
          icon="pi pi-times"
          className="p-button-rounded cancel-button"
          onClick={handleCloseDialog}
        />
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Assets;