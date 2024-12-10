import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
    // State to hold data for charts
    const [subcategoryData, setSubcategoryData] = useState({
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            },
        ],
    });

    const [userData, setUserData] = useState({
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: ['#4BC0C0', '#FF9F40', '#9966FF', '#FF6384', '#36A2EB'],
                hoverBackgroundColor: ['#4BC0C0', '#FF9F40', '#9966FF', '#FF6384', '#36A2EB'],
            },
        ],
    });

    const [assignedDateData, setAssignedDateData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Assets by Assigned Date',
                backgroundColor: '#42A5F5',
                borderColor: '#1E88E5',
                data: [],
            },
        ],
    });

    // Fetch data from the backend
    useEffect(() => {
        fetchSubcategoryData();
        fetchUserData();
        fetchAssignedDateData();  // Fetch assigned date data for the bar chart
    }, []);

    // Fetch subcategory-based data
    const fetchSubcategoryData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/assets/subcategories');
            const subcategories = response.data.map(item => item.name);
            const counts = response.data.map(item => item.count);
            setSubcategoryData({
                labels: subcategories,
                datasets: [
                    {
                        data: counts,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching subcategory data:', error);
        }
    };

    // Fetch user-based data
    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/assets/users');
            const users = response.data.map(item => item.name);
            const counts = response.data.map(item => item.count);
            setUserData({
                labels: users,
                datasets: [
                    {
                        data: counts,
                        backgroundColor: ['#4BC0C0', '#FF9F40', '#9966FF', '#FF6384', '#36A2EB'],
                        hoverBackgroundColor: ['#4BC0C0', '#FF9F40', '#9966FF', '#FF6384', '#36A2EB'],
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    // Fetch assigned date-based data (grouped by month)
    const fetchAssignedDateData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/assets/assignedDate');
            const months = response.data.map(item => item.month);
            const counts = response.data.map(item => item.count);
            setAssignedDateData({
                labels: months,
                datasets: [
                    {
                        label: 'Assets by Assigned Date',
                        backgroundColor: '#42A5F5',
                        borderColor: '#1E88E5',
                        data: counts,
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching assigned date data:', error);
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="dashboard">
            {/* Subcategory Based Pie Chart */}
            <div className="chart-card">
                <h3>Assets by Subcategory</h3>
                <Chart type="pie" data={subcategoryData} options={pieOptions} />
            </div>

            {/* User Based Pie Chart */}
            <div className="chart-card">
                <h3>Assets by User</h3>
                <Chart type="pie" data={userData} options={pieOptions} />
            </div>

            {/* Assigned Date Based Bar Chart */}
            <div className="chart-card">
                <h3>Assets by Assigned Date (Monthly)</h3>
                <Chart type="bar" data={assignedDateData} options={barOptions} />
            </div>
        </div>
    );
}

export default Dashboard;
