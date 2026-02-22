import { useCallback, useEffect, useState } from 'react';
import { AddItemForm } from './AddNewItemForm';
import { ItemDisplay } from './ItemDisplay';

interface TodoItem {
    id: string;
    name: string;
    completed: boolean;
}

export function TodoListCard() {
    const [items, setItems] = useState<TodoItem[] | null>(null);

    useEffect(() => {
        fetch('/api/items')
            .then((r) => r.json())
            .then((data: TodoItem[]) => setItems(data));
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

    if (items === null) return 'Loading...';

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
