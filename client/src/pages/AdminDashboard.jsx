import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // Data States
    const [books, setBooks] = useState([]);
    const [students, setStudents] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // View State
    const [view, setView] = useState('books'); // 'books', 'students', 'borrowed'
    const [editMode, setEditMode] = useState(false);
    const [currentBookId, setCurrentBookId] = useState(null);

    // Form State
    const [bookForm, setBookForm] = useState({ title: '', author: '', totalCopies: 1 });

    // Fetch Books
    const fetchBooks = async () => {
        try {
            const res = await api.get(`/admin/books?page=${page}&limit=5`);
            setBooks(res.data.books);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error(error);
        }
    };

    // Fetch Students
    const fetchStudents = async () => {
         try {
            const res = await api.get('/admin/students');
            setStudents(res.data);
        } catch (error) {
            console.error(error);
        }
    }

    // Fetch Borrowed Books
    const fetchBorrowed = async () => {
        try {
            const res = await api.get('/admin/borrowed-books');
            setBorrowedBooks(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (view === 'books') fetchBooks();
        if (view === 'students') fetchStudents();
        if (view === 'borrowed') fetchBorrowed();
    }, [view, page]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...bookForm, totalCopies: Number(bookForm.totalCopies) || 1 };
            if (editMode) {
                await api.put(`/admin/books/${currentBookId}`, payload);
                alert('Book updated!');
            } else {
                await api.post('/admin/books', payload);
                alert('Book added!');
            }
            setBookForm({ title: '', author: '', totalCopies: 1 });
            setEditMode(false);
            fetchBooks();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    const handleEdit = (book) => {
        setBookForm({ title: book.title, author: book.author, totalCopies: book.totalCopies });
        setCurrentBookId(book._id);
        setEditMode(true);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/admin/books/${id}`);
            fetchBooks();
        } catch (error) {
            alert('Delete failed');
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/approve/${id}`);
            alert('Student Approved');
            fetchStudents();
        } catch (error) {
            alert('Approval failed');
        }
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const styles = {
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
        th: { border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' },
        td: { border: '1px solid #ddd', padding: '8px' },
        btn: { padding: '5px 10px', cursor: 'pointer', marginRight: '5px' }
    };

    return (
        <div style={{ padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Admin Dashboard - {user?.name}</h1>
                <button onClick={handleLogout} style={{...styles.btn, background: 'red', color: 'white'}}>Logout</button>
            </header>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => { setView('books'); setPage(1); }} style={{...styles.btn, background: view==='books'?'#ddd':'#fff'}}>Manage Books</button>
                <button onClick={() => setView('students')} style={{...styles.btn, background: view==='students'?'#ddd':'#fff'}}>Manage Students</button>
                <button onClick={() => setView('borrowed')} style={{...styles.btn, background: view==='borrowed'?'#ddd':'#fff'}}>View Borrowed Books</button>
            </div>

            {view === 'books' && (
                <div>
                    <h3>{editMode ? 'Edit Book' : 'Add New Book'}</h3>
                    <form onSubmit={handleFormSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input placeholder="Title" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} required style={{padding: '5px'}} />
                        <input placeholder="Author" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} required style={{padding: '5px'}} />
                        <input type="number" placeholder="Total Copies" value={bookForm.totalCopies} onChange={e => setBookForm({...bookForm, totalCopies: e.target.value === '' ? '' : parseInt(e.target.value)})} min="1" required style={{padding: '5px'}} />
                        <button type="submit" style={{...styles.btn, background: 'blue', color: 'white'}}>{editMode ? 'Update' : 'Add'}</button>
                        {editMode && <button type="button" onClick={() => { setEditMode(false); setBookForm({ title: '', author: '', totalCopies: 1 }); }} style={styles.btn}>Cancel</button>}
                    </form>

                    <h3>Book List</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Title</th>
                                <th style={styles.th}>Author</th>
                                <th style={styles.th}>Total</th>
                                <th style={styles.th}>Available</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map(book => (
                                <tr key={book._id}>
                                    <td style={styles.td}>{book.title}</td>
                                    <td style={styles.td}>{book.author}</td>
                                    <td style={styles.td}>{book.totalCopies}</td>
                                    <td style={styles.td}>{book.availableCopies}</td>
                                    <td style={styles.td}>
                                        <button onClick={() => handleEdit(book)} style={{...styles.btn, background: 'orange'}}>Edit</button>
                                        <button onClick={() => handleDelete(book._id)} style={{...styles.btn, background: 'red', color: 'white'}}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '10px' }}>
                        <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={styles.btn}>Prev</button>
                        <span> Page {page} of {totalPages} </span>
                        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={styles.btn}>Next</button>
                    </div>
                </div>
            )}

            {view === 'students' && (
                <div>
                    <h3>Student List</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student._id}>
                                    <td style={styles.td}>{student.name}</td>
                                    <td style={styles.td}>{student.email}</td>
                                    <td style={styles.td}>
                                        {student.isApproved ? 
                                            <span style={{color:'green'}}>Approved</span> : 
                                            <span style={{color:'orange'}}>Pending</span>
                                        }
                                    </td>
                                    <td style={styles.td}>
                                        {!student.isApproved && (
                                            <button onClick={() => handleApprove(student._id)} style={{...styles.btn, background: 'green', color: 'white'}}>Approve</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {view === 'borrowed' && (
                <div>
                    <h3>Borrowed Books List</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Student Name</th>
                                <th style={styles.th}>Book Title</th>
                                <th style={styles.th}>Issue Date</th>
                                <th style={styles.th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {borrowedBooks.map(record => (
                                <tr key={record._id}>
                                    <td style={styles.td}>{record.studentId?.name || 'Unknown'}</td>
                                    <td style={styles.td}>{record.bookId?.title || 'Unknown'}</td>
                                    <td style={styles.td}>{new Date(record.issueDate).toLocaleDateString()}</td>
                                    <td style={styles.td}>{record.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
