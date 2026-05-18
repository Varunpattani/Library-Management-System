'use server'

import { PrismaClient } from "@/generated/prisma"; 
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

async function addItem(formData:FormData) {
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const isbn = formData.get('isbn') as string;
    const subject = formData.get('subject') as string;
    const keywords = formData.get('keywords') as string;
    const description = formData.get('description') as string;
    const itemType = formData.get('itemType') as
        | 'BOOK'
        | 'JOURNAL'
        | 'MULTIMEDIA'
        | 'MAGAZINE'
        | 'DVD'
        | 'CD'
        | 'EBOOK'
        | 'AUDIOBOOK';
    const status = formData.get('status') as
        | 'AVAILABLE'
        | 'BORROWED'
        | 'RESERVED'
        | 'LOST'
        | 'DAMAGED'
        | 'MAINTENANCE';
    const price = parseFloat(formData.get('price') as string);
    const imageUrl = formData.get('imageUrl') as string;
    const publisher = formData.get('publisher') as string;
    const publicationYear = formData.get('publicationYear')
        ? parseInt(formData.get('publicationYear') as string)
        : undefined;
    const language = formData.get('language') as string;
    const totalCopies = parseInt(formData.get('totalCopies') as string);
    const availableCopies = parseInt(formData.get('availableCopies') as string);
    const isVisible = formData.get('isVisible') === 'on';

    await prisma.item.create({
        data: {
            title,
            author,
            isbn,
            subject,
            keywords,
            description,
            itemType,
            status,
            price,
            imageUrl,
            publisher,
            publicationYear,
            language,
            totalCopies,
            availableCopies,
            isVisible
        }
    })
    revalidatePath("/librarian/catalog");
    redirect("/librarian/catalog");
}

async function deleteItem(params: any) {
    try {
        const itemId = params.id;
        
        // Check for existing related records
        const [transactions, reservations, borrowRequests] = await Promise.all([
            prisma.transaction.findMany({ where: { itemId } }),
            prisma.reservation.findMany({ where: { itemId } }),
            prisma.borrowRequest.findMany({ where: { itemId } })
        ]);
        
        // Check if there are active transactions (borrowed items not returned)
        const activeTransactions = transactions.filter(t => !t.isReturned);
        if (activeTransactions.length > 0) {
            throw new Error(`Cannot delete item: There are ${activeTransactions.length} active borrowing transactions. Please ensure all copies are returned before deleting.`);
        }
        
        // Delete all related records first (cascade delete)
        await prisma.$transaction(async (tx) => {
            // Delete borrow requests
            if (borrowRequests.length > 0) {
                await tx.borrowRequest.deleteMany({ where: { itemId } });
            }
            
            // Delete reservations
            if (reservations.length > 0) {
                await tx.reservation.deleteMany({ where: { itemId } });
            }
            
            // Delete completed transactions (historical records)
            if (transactions.length > 0) {
                await tx.transaction.deleteMany({ where: { itemId } });
            }
            
            // Finally delete the item
            await tx.item.delete({ where: { itemId } });
        });
        
    } catch (error) {
        console.error('Error deleting item:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete item due to database constraints');
    }
    
    revalidatePath("/librarian/catalog");
    redirect("/librarian/catalog");
}

async function updateItem(itemId: number, formData: FormData) {

    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const isbn = formData.get('isbn') as string;
    const subject = formData.get('subject') as string;
    const keywords = formData.get('keywords') as string;
    const description = formData.get('description') as string;
    const itemType = formData.get('itemType') as
        | 'BOOK'
        | 'JOURNAL'
        | 'MULTIMEDIA'
        | 'MAGAZINE'
        | 'DVD'
        | 'CD'
        | 'EBOOK'
        | 'AUDIOBOOK';
    const status = formData.get('status') as
        | 'AVAILABLE'
        | 'BORROWED'
        | 'RESERVED'
        | 'LOST'
        | 'DAMAGED'
        | 'MAINTENANCE';
    const price = parseFloat(formData.get('price') as string);
    const imageUrl = formData.get('imageUrl') as string;
    const publisher = formData.get('publisher') as string;
    const publicationYear = formData.get('publicationYear')
        ? parseInt(formData.get('publicationYear') as string)
        : undefined;
    const language = formData.get('language') as string;
    const totalCopies = parseInt(formData.get('totalCopies') as string);
    const availableCopies = parseInt(formData.get('availableCopies') as string);
    const isVisible = formData.get('isVisible') === 'on';



    await prisma.item.update({
        where: {
            itemId: itemId
        },
        data: {
            title,
            author,
            isbn,
            subject,
            keywords,
            description,
            itemType,
            status,
            price,
            imageUrl,
            publisher,
            publicationYear,
            language,
            totalCopies,
            availableCopies,
            isVisible
        }
    });

    revalidatePath("/librarian/catalog");
    redirect("/librarian/catalog");
}

async function getItemById(id: number) {
    const item = await prisma.item.findUnique({
        where: {
            itemId: id
        }
    });
    return item;
}

export { deleteItem, updateItem, addItem, getItemById }
