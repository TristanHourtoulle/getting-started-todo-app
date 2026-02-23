import { FormEvent, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { api } from '../services/api';
import { TodoItem } from '../types/todo';

interface AddItemFormProps {
    onNewItem: (item: TodoItem) => void;
}

export function AddItemForm({ onNewItem }: AddItemFormProps) {
    const [newItem, setNewItem] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submitNewItem = (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        api.addItem(newItem).then((item) => {
            onNewItem(item);
            setSubmitting(false);
            setNewItem('');
        });
    };

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-3">
                <Form.Control
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    type="text"
                    placeholder="New Item"
                    aria-label="New item"
                />
                <Button
                    type="submit"
                    variant="success"
                    disabled={!newItem.length}
                    className={submitting ? 'disabled' : ''}
                >
                    {submitting ? 'Adding...' : 'Add Item'}
                </Button>
            </InputGroup>
        </Form>
    );
}
