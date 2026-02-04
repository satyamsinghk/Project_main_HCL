import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [students, setStudents] = useState([]);
    const [newBook, setNewBook] = useState({ title: '', author: '', totalCopies: 1 });
    const [view, setView] = useState('books'); // 'books' or 'students'

    const fetchBooks = async () => {
        try {
            const res = await api.get('/admin/books');
            setBooks(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await api.get('/admin/students');
            setStudents(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (view === 'books') fetchBooks();
        if (view === 'students') fetchStudents();
    }, [view]);

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/books', newBook);
            setNewBook({ title: '', author: '', totalCopies: 1 });
            fetchBooks();
        } catch (error) {
            alert('Error adding book: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Admin Dashboard - {user?.name}</h1>
                <button onClick={handleLogout} style={{ padding: '5px 10px', background: 'red', color: 'white' }}>Logout</button>
            </header>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setView('books')} style={{ marginRight: '10px' }}>Manage Books</button>
                <button onClick={() => setView('students')}>View Students</button>
            </div>

            {view === 'books' && (
                <div>
                    <h3>Add New Book</h3>
                    <form onSubmit={handleAddBook} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                        <input placeholder="Title" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} required />
                        <input placeholder="Author" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} required />
                        <input type="number" placeholder="Total Copies" value={newBook.totalCopies} onChange={e => setNewBook({...newBook, totalCopies: parseInt(e.target.value)})} min="1" required />
                        <button type="submit">Add Book</button>
                    </form>

                    <h3>Book List</h3>
                    <ul>
                        {books.map(book => (
                            <li key={book._id}>
                                <strong>{book.title}</strong> by {book.author} (Available: {book.availableCopies}/{book.totalCopies})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {view === 'students' && (
                <div>
                    <h3>Registered Students</h3>
                    <ul>
                        {students.map(student => (
                            <li key={student._id}>
                                {student.name} ({student.email})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
