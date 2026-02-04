import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [myBooks, setMyBooks] = useState([]);
    const [view, setView] = useState('books');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Fetch Available Books
    const fetchBooks = async () => {
        try {
            const res = await api.get(`/student/books?page=${page}&limit=5`);
            if (res.data.success) {
                setBooks(res.data.data.books);
                setTotalPages(res.data.data.totalPages);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Fetch My Borrowed Books
    const fetchMyBooks = async () => {
        try {
            const res = await api.get('/student/mybooks'); // Updated route
            if (res.data.success) {
                setMyBooks(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (view === 'books') fetchBooks();
        if (view === 'mybooks') fetchMyBooks();
    }, [view, page]);

    const handleBorrow = async (bookId) => {
        try {
            await api.post('/student/borrow', { bookId });
            alert('Book borrowed successfully!');
            fetchBooks();
        } catch (error) {
            alert('Borrow failed: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    const handleReturn = async (registrationId) => {
        try {
            await api.post('/student/return', { registrationId });
            alert('Book returned successfully!');
            fetchMyBooks();
        } catch (error) {
             alert('Return failed: ' + (error.response?.data?.message || 'Server Error'));
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
                <h1>Student Dashboard - {user?.name}</h1>
                <button onClick={handleLogout} style={{...styles.btn, background: 'red', color: 'white'}}>Logout</button>
            </header>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => { setView('books'); setPage(1); }} style={{...styles.btn, background: view==='books'?'#ddd':'#fff'}}>Available Books</button>
                <button onClick={() => setView('mybooks')} style={{...styles.btn, background: view==='mybooks'?'#ddd':'#fff'}}>My Borrowed Books</button>
            </div>

            {view === 'books' && (
                <div>
                    <h3>Available Books</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Title</th>
                                <th style={styles.th}>Author</th>
                                <th style={styles.th}>Available</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map(book => (
                                <tr key={book._id}>
                                    <td style={styles.td}>{book.title}</td>
                                    <td style={styles.td}>{book.author}</td>
                                    <td style={styles.td}>{book.availableCopies}</td>
                                    <td style={styles.td}>
                                        <button 
                                            onClick={() => handleBorrow(book._id)} 
                                            disabled={book.availableCopies < 1}
                                            style={styles.btn}
                                        >
                                            {book.availableCopies > 0 ? 'Borrow' : 'Out of Stock'}
                                        </button>
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
                    {books.length === 0 && <p style={{textAlign: 'center', marginTop: '20px'}}>No books found in the library.</p>}
                </div>
            )}

            {view === 'mybooks' && (
                <div>
                    <h3>My Borrowed Books</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Book Title</th>
                                <th style={styles.th}>Issue Date</th>
                                <th style={styles.th}>Default Return Date (Due)</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Due Amount</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myBooks.map(record => {
                                // Calculate simple due date (14 days from issue) if not stored or valid
                                const dueDate = new Date(record.issueDate);
                                dueDate.setDate(dueDate.getDate() + 14);

                                return (
                                    <tr key={record._id}>
                                        <td style={styles.td}>{record.bookId?.title}</td>
                                        <td style={styles.td}>{new Date(record.issueDate).toLocaleDateString()}</td>
                                        <td style={styles.td}>{dueDate.toLocaleDateString()}</td> 
                                        <td style={styles.td}>{record.status} ({record.returnDate ? 'Returned' : 'Active'})</td>
                                        <td style={styles.td}>${record.dueAmount}</td>
                                        <td style={styles.td}>
                                            {record.status === 'borrowed' && (
                                                <button onClick={() => handleReturn(record._id)} style={styles.btn}>Return</button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
