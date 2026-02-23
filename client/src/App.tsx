import { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TodoListCard } from './components/TodoListCard';
import { Greeting } from './components/Greeting';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ProfilePage } from './components/ProfilePage';

type Page = 'login' | 'register' | 'todos' | 'profile';

function AppContent() {
    const { isAuthenticated, email, logout } = useAuth();
    const [page, setPage] = useState<Page>('login');

    if (!isAuthenticated) {
        return page === 'register' ? (
            <RegisterPage onSwitchToLogin={() => setPage('login')} />
        ) : (
            <LoginPage onSwitchToRegister={() => setPage('register')} />
        );
    }

    if (page === 'profile') {
        return <ProfilePage onBack={() => setPage('todos')} />;
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3 mt-3">
                <span className="text-muted">{email}</span>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setPage('profile')}
                    >
                        Profile
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={logout}>
                        Logout
                    </Button>
                </div>
            </div>
            <Greeting />
            <TodoListCard />
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <Container>
                <Row>
                    <Col md={{ offset: 3, span: 6 }}>
                        <AppContent />
                    </Col>
                </Row>
            </Container>
        </AuthProvider>
    );
}

export default App;
