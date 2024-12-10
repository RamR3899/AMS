import React, { useState, useEffect } from 'react';
import './Settings.css';

function Settings() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

    // Re-fetch users when there is a change in the users state
    useEffect(() => {
      fetchUsers();
    }, [users]);

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  const fetchUsers = () => {
    fetch('http://localhost:5000/api/users')
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
        setFilteredUsers(data);
      })
      .catch((error) => console.error('Error fetching users:', error));
  };

  const fetchRoles = () => {
    fetch('http://localhost:5000/api/roles')
      .then((response) => response.json())
      .then((data) => setRoles(data))
      .catch((error) => console.error('Error fetching roles:', error));
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
    setIsEditMode(false);
    setEditUser(null);
  };

  const handleDeleteClick = (userId) => {
    fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'DELETE',
    })
      .then(() => {
        const updatedUsers = users.filter((user) => user.id !== userId);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
      })
      .catch((error) => console.error('Error deleting user:', error));
  };

  const handleEditClick = (user) => {
    setEditUser(user);
    setIsEditMode(true);
    setIsPopupOpen(true);
  };

  const handleSaveUser = (newUser) => {
    if (isEditMode) {
      fetch(`http://localhost:5000/api/users/${editUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })
        .then((response) => response.json())
        .then((updatedUser) => {
          const updatedUsers = users.map((user) =>
            user.id === updatedUser.id ? updatedUser : user
          );
          setUsers(updatedUsers);
          setFilteredUsers(updatedUsers);
          setIsPopupOpen(false);
        })
        .catch((error) => console.error('Error updating user:', error));
    } else {
      fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })
        .then((response) => response.json())
        .then((savedUser) => {
          const updatedUsers = [...users, savedUser];
          setUsers(updatedUsers);
          setFilteredUsers(updatedUsers);
          setIsPopupOpen(false);
        })
        .catch((error) => console.error('Error saving user:', error));
    }
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    if (term) {
      const results = users.filter((user) =>
        user.username.toLowerCase().includes(term)
      );
      setFilteredUsers(results);
    } else {
      setFilteredUsers(users);
    }
  };

  return (
    <main>
      <div className="card">
        <div className="user-list-header">
          <h2>User Lists</h2>
          <button className="add-user" onClick={togglePopup}>
            <span className="icon">
              <i className="fas fa-plus"></i>Add
            </span>
          </button>
        </div>
        <input
          type="text"
          className="search-bar"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <table className="user-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Created Date</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.createdDate}</td>
                  <td>
                    <select value={user.role_id} disabled>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditClick(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteClick(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>{isEditMode ? 'Edit User' : 'Add New User'}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveUser({
                  username: e.target.username.value,
                  email: e.target.email.value,
                  phoneNumber: e.target.phoneNumber.value,
                  password: e.target.password?.value || 'Password123',
                  createdDate: isEditMode
                    ? editUser.createdDate
                    : new Date().toISOString().split('T')[0],
                  role_id: e.target.role.value,
                });
              }}
            >
              <div className="formGroup">
                <label className="label">Username:</label>
                <input
                  type="text"
                  className="input"
                  name="username"
                  defaultValue={isEditMode ? editUser.username : ''}
                  required
                />
              </div>
              <div className="formGroup">
                <label className="label">Email:</label>
                <input
                  type="email"
                  className="input"
                  name="email"
                  defaultValue={isEditMode ? editUser.email : ''}
                  required
                />
              </div>
              <div className="formGroup">
                <label className="label">Phone Number:</label>
                <input
                  type="text"
                  className="input"
                  name="phoneNumber"
                  defaultValue={isEditMode ? editUser.phoneNumber : ''}
                  required
                />
              </div>
              {!isEditMode && (
                <>
                  <div className="formGroup">
                    <label className="label">Password:</label>
                    <input type="password" className="input" name="password" />
                  </div>
                  <div className="formGroup">
                    <label className="label">Confirm Password:</label>
                    <input
                      type="password"
                      className="input"
                      name="confirmPassword"
                    />
                  </div>
                </>
              )}
              <div className="formGroup">
                <label className="label">Role:</label>
                <select
                  className="input"
                  name="role"
                  defaultValue={isEditMode ? editUser.role_id : ''}
                  required
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="buttonGroup">
                <button type="submit" className="saveButton">
                  {isEditMode ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  className="closeButton"
                  onClick={togglePopup}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Settings;