import { useCallback, useEffect, useState } from 'react';
import { AddItemForm } from './AddNewItemForm';
import { ItemDisplay } from './ItemDisplay';
import { api } from '../services/api';
import { TodoItem } from '../types/todo';

export function TodoListCard() {
    const [items, setItems] = useState<TodoItem[] | null>(null);

    useEffect(() => {
        api.getItems().then(setItems);
    }, []);

    const onNewItem = useCallback(
        (newItem: TodoItem) => {
            setItems((prev) => (prev ? [...prev, newItem] : [newItem]));
        },
        [],
    );

    const onItemUpdate = useCallback(
        (item: TodoItem) => {
            setItems((prev) => {
                if (!prev) return prev;
                const index = prev.findIndex((i) => i.id === item.id);
                return [
                    ...prev.slice(0, index),
                    item,
                    ...prev.slice(index + 1),
                ];
            });
        },
        [],
    );

    const onItemRemoval = useCallback(
        (item: TodoItem) => {
            setItems((prev) => {
                if (!prev) return prev;
                const index = prev.findIndex((i) => i.id === item.id);
                return [...prev.slice(0, index), ...prev.slice(index + 1)];
            });
        },
        [],
    );

    if (items === null) return <p>Loading...</p>;

    return (
        <>
            <AddItemForm onNewItem={onNewItem} />
            {items.length === 0 && (
                <p className="text-center">No items yet! Add one above!</p>
            )}
            {items.map((item) => (
                <ItemDisplay
                    key={item.id}
                    item={item}
                    onItemUpdate={onItemUpdate}
                    onItemRemoval={onItemRemoval}
                />
            ))}
        </>
    );
}
