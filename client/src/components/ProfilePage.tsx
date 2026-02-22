import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface Profile {
    id: string;
    email: string;
    createdAt: string;
}

interface ProfilePageProps {
    onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
    const { logout } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        api.getProfile()
            .then(setProfile)
            .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'));
    }, []);

    const handleExport = async () => {
        try {
            const data = await api.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my-data-export.json';
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
        }
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteModal(false);
        setDeleting(true);
        try {
            await api.deleteProfile();
            logout();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Deletion failed');
            setDeleting(false);
        }
    };

    if (!profile && !error) return <p>Loading profile...</p>;

    return (
        <div className="mt-4">
            <Button variant="outline-secondary" size="sm" onClick={onBack} className="mb-3">
                Back to Todos
            </Button>
            <h2 className="mb-4">Profile</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {profile && (
                <Card className="mb-3">
                    <Card.Body>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Member since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                    </Card.Body>
                </Card>
            )}
            <h4 className="mt-4">GDPR / Data Privacy</h4>
            <div className="d-flex gap-2 mt-3">
                <Button variant="outline-primary" onClick={handleExport}>
                    Export My Data
                </Button>
                <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={deleting}>
                    {deleting ? 'Deleting...' : 'Delete My Account'}
                </Button>
            </div>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Account Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure? This will permanently delete your account and all your data.
                    This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>
                        Delete My Account
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
