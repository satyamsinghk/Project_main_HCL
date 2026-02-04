import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [myRecords, setMyRecords] = useState([]);
    const [view, setView] = useState('books');

    const fetchBooks = async () => {
        try {
            const res = await api.get('/student/books');
            setBooks(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRecords = async () => {
        try {
            const res = await api.get('/student/my-records');
            setMyRecords(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (view === 'books') fetchBooks();
        if (view === 'records') fetchRecords();
    }, [view]);

    const handleBorrow = async (bookId) => {
        try {
            await api.post('/student/borrow', { bookId });
            alert('Book borrowed successfully!');
            fetchBooks(); // Refresh availability
        } catch (error) {
            alert('Borrow failed: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Student Dashboard - {user?.name}</h1>
                <button onClick={handleLogout} style={{ padding: '5px 10px', background: 'red', color: 'white' }}>Logout</button>
            </header>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setView('books')} style={{ marginRight: '10px' }}>Available Books</button>
                <button onClick={() => setView('records')}>My Borrow Records</button>
            </div>

            {view === 'books' && (
                <div>
                    <h3>Available Books</h3>
                    <ul>
                        {books.map(book => (
                            <li key={book._id} style={{ marginBottom: '10px' }}>
                                <strong>{book.title}</strong> by {book.author} 
                                <br />
                                Copies: {book.availableCopies} 
                                <button onClick={() => handleBorrow(book._id)} disabled={book.availableCopies < 1} style={{ marginLeft: '10px' }}>
                                    {book.availableCopies > 0 ? 'Borrow' : 'Out of Stock'}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {view === 'records' && (
                <div>
                    <h3>My Borrow History</h3>
                    <ul>
                        {myRecords.map(record => (
                            <li key={record._id}>
                                <strong>{record.bookId?.title}</strong> - Status: {record.status} - Due: {new Date(record.dueDate).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
