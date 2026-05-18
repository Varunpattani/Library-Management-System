'use client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react';
import { deleteItem } from '../actions/itemActions';
import { useState } from 'react';

function DeleteItemButton({ id }: { id: number }) {
    const [isDeleting, setIsDeleting] = useState(false);
    
    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return;
        }
        
        setIsDeleting(true);
        try {
            await deleteItem({ id });
        } catch (error) {
            console.error('Failed to delete item:', error);
            alert('Failed to delete item. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };
    
    return (
        <form action={deleteItem.bind(null, { id })}>
            <Button 
                type="submit" 
                variant="destructive" 
                size="sm" 
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600" 
                disabled={isDeleting}
                onClick={(e) => {
                    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                        e.preventDefault();
                    }
                }}
            >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
        </form>
    );
}

export {DeleteItemButton}
