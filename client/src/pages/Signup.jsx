import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await signup(name, email, password, role);
        if (result.success) {
            // Note: Updated authController returns success message but no token for unapproved users
            // So we shouldn't necessarily redirect.
            setMsg("Registration successful! Please wait for Admin approval before logging in.");
            setError('');
        } else {
            setError(result.message);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Signup</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            {msg && <p style={{color: 'green', textAlign: 'center'}}>{msg}</p>}
            
            {!msg && (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input 
                        type="text" 
                        placeholder="Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        style={styles.input}
                        required
                    />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        style={styles.input}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={styles.input}
                        required
                    />
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button type="submit" style={styles.button}>Signup</button>
                </form>
            )}
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '50px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        width: '300px',
        gap: '10px'
    },
    input: {
        padding: '10px',
        fontSize: '16px'
    },
    button: {
        padding: '10px',
        fontSize: '16px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        cursor: 'pointer'
    }
};

export default Signup;
