import { getItemById } from '@/app/actions/itemActions';
import { notFound } from 'next/navigation';
import SafeImage from '@/components/ui/safe-image';
import Link from 'next/link';
import { 
    BookOpen, 
    Calendar, 
    Tag, 
    Hash, 
    Globe, 
    DollarSign, 
    ArrowLeft,
    Copy,
    Building2,
    FileText,
    User,
    Heart,
    Share2,
    Clock
} from 'lucide-react';
import { requirePatronAuth } from '@/lib/session';
import { redirect } from 'next/navigation';
import BorrowRequestButton from '@/app/client components/BorrowRequestButton';

function getStatusColor(status: string) {
    switch (status) {
        case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200';
        case 'BORROWED': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'RESERVED': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'LOST': return 'bg-red-100 text-red-800 border-red-200';
        case 'DAMAGED': return 'bg-red-100 text-red-800 border-red-200';
        case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

function getItemTypeIcon(itemType: string) {
    switch (itemType) {
        case 'BOOK': return <BookOpen className="w-4 h-4" />;
        case 'JOURNAL': return <FileText className="w-4 h-4" />;
        case 'MAGAZINE': return <FileText className="w-4 h-4" />;
        case 'DVD': case 'CD': case 'MULTIMEDIA': return <Tag className="w-4 h-4" />;
        case 'EBOOK': case 'AUDIOBOOK': return <Globe className="w-4 h-4" />;
        default: return <BookOpen className="w-4 h-4" />;
    }
}

export default async function PatronItemDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;
    const itemId = Number(resolvedParams.id);
    
    let session
    try {
        session = await requirePatronAuth()
    } catch (error) {
        redirect('/login')
    }
    
    const item = await getItemById(itemId);
    if (!item || !item.isVisible) {
        notFound();
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 to-white overflow-hidden">
            <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <Link 
                        href="/patron/dashboard" 
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Catalog</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            <Heart className="w-4 h-4" />
                            <span>Add to Wishlist</span>
                        </button>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 min-h-0">
                    {/* Left Column - Hero Card */}
                    <div className="lg:col-span-2 xl:col-span-2">
                        <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                            <div className="h-full flex flex-col">
                                {/* Image Section */}
                                <div className="relative h-48 sm:h-56 lg:h-64 w-full flex-shrink-0 bg-gray-100">
                                    <SafeImage
                                        src={item.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'}
                                        alt={item.title}
                                        fill
                                        className="object-cover w-full h-full"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                            {getItemTypeIcon(item.itemType)}
                                            {item.itemType}
                                        </span>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Content Section */}
                                <div className="flex-1 p-6 flex flex-col space-y-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h1>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <User className="w-4 h-4" />
                                            <span className="text-sm">by {item.author}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Availability Status */}
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div className="flex items-center gap-2">
                                                <Copy className="w-5 h-5 text-blue-600" />
                                                <span className="font-medium text-gray-900">Availability</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <span className="font-bold text-green-600">{item.availableCopies}</span> of {item.totalCopies} copies available
                                                </p>
                                                <BorrowRequestButton 
                                                    itemId={item.itemId}
                                                    patronId={session.patronId!}
                                                    availableCopies={item.availableCopies}
                                                    itemTitle={item.title}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {item.description && (
                                        <div className="flex-1 min-h-0">
                                            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                                Description
                                            </h3>
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-40 overflow-y-auto">
                                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-1 xl:col-span-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
                        {/* Publication Details */}
                        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Publication Details</h3>
                            <div className="space-y-3">
                                {item.isbn && (
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-gray-500" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-500">ISBN</p>
                                            <p className="text-sm text-gray-900 font-mono truncate">{item.isbn}</p>
                                        </div>
                                    </div>
                                )}
                                {item.publisher && (
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-gray-500" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-500">Publisher</p>
                                            <p className="text-sm text-gray-900 truncate">{item.publisher}</p>
                                        </div>
                                    </div>
                                )}
                                {item.publicationYear && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500">Year</p>
                                            <p className="text-sm text-gray-900">{item.publicationYear}</p>
                                        </div>
                                    </div>
                                )}
                                {item.language && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500">Language</p>
                                            <p className="text-sm text-gray-900">{item.language}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Categorization */}
                        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
                            <div className="space-y-3">
                                {item.subject && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">Subject</p>
                                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            {item.subject}
                                        </span>
                                    </div>
                                )}
                                {item.keywords && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">Keywords</p>
                                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                                            {item.keywords.split(',').slice(0, 8).map((keyword, index) => (
                                                <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                    {keyword.trim()}
                                                </span>
                                            ))}
                                            {item.keywords.split(',').length > 8 && (
                                                <span className="inline-block px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                                    +{item.keywords.split(',').length - 8} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Book Information</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Added to Library:</span>
                                    <span className="text-gray-900 text-xs">{formatDate(item.createdAt)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Last Updated:</span>
                                    <span className="text-gray-900 text-xs">{formatDate(item.updatedAt)}</span>
                                </div>
                                {item.price && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Book Value:</span>
                                        <span className="text-gray-900 font-semibold">${item.price.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
