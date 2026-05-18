'use client'

import { addItem } from "@/app/actions/itemActions";
import { useState } from "react";
import Link from 'next/link';
import {
  BookOpen,
  User,
  Hash,
  Tag,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Building2,
  Calendar,
  Globe,
  Copy,
  Eye,
  Plus,
  Loader2,
  Check,
  ArrowLeft
} from 'lucide-react';
import SafeImage from '@/components/ui/safe-image';

export default function AddItemPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImagePreview(e.target.value);
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await addItem(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemTypes = [
    { value: 'BOOK', label: 'Book', icon: BookOpen },
    { value: 'JOURNAL', label: 'Journal', icon: FileText },
    { value: 'MULTIMEDIA', label: 'Multimedia', icon: Tag },
    { value: 'MAGAZINE', label: 'Magazine', icon: FileText },
    { value: 'DVD', label: 'DVD', icon: Tag },
    { value: 'CD', label: 'CD', icon: Tag },
    { value: 'EBOOK', label: 'E-Book', icon: Globe },
    { value: 'AUDIOBOOK', label: 'Audiobook', icon: Globe },
  ];

  const statusOptions = [
    { value: 'AVAILABLE', label: 'Available', color: 'text-green-600' },
    { value: 'BORROWED', label: 'Borrowed', color: 'text-orange-600' },
    { value: 'RESERVED', label: 'Reserved', color: 'text-blue-600' },
    { value: 'LOST', label: 'Lost', color: 'text-red-600' },
    { value: 'DAMAGED', label: 'Damaged', color: 'text-red-600' },
    { value: 'MAINTENANCE', label: 'Maintenance', color: 'text-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/librarian/catalog"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Item</h1>
                <p className="text-gray-600">Create a new item in the library catalog</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Basic Information
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Title *
                  </span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  placeholder="Enter book title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Author *
                  </span>
                </label>
                <input
                  type="text"
                  name="author"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  placeholder="Enter author name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    ISBN
                  </span>
                </label>
                <input
                  type="text"
                  name="isbn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter ISBN (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Subject
                  </span>
                </label>
                <input
                  type="text"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter subject (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Keywords
                  </span>
                </label>
                <input
                  type="text"
                  name="keywords"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter keywords (comma separated)"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description
                  </span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter book description (optional)"
                />
              </div>
            </div>
          </div>

          {/* Publication Details Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Publication Details
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Publisher
                  </span>
                </label>
                <input
                  type="text"
                  name="publisher"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Enter publisher"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Publication Year
                  </span>
                </label>
                <input
                  type="number"
                  name="publicationYear"
                  min="1800"
                  max="2030"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Language
                  </span>
                </label>
                <input
                  type="text"
                  name="language"
                  defaultValue="English"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="English"
                />
              </div>
            </div>
          </div>

          {/* Item Management Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Copy className="w-5 h-5" />
                Item Management
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Type *
                </label>
                <select
                  name="itemType"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                >
                  {itemTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  defaultValue="AVAILABLE"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price *
                  </span>
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-500" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isVisible"
                      defaultChecked
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Visible to Patrons</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Management Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Copy className="w-5 h-5" />
                Inventory Management
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Total Copies *
                  </span>
                </label>
                <input
                  type="number"
                  name="totalCopies"
                  min="1"
                  defaultValue={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Available Copies *
                  </span>
                </label>
                <input
                  type="number"
                  name="availableCopies"
                  min="0"
                  defaultValue={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Book Cover
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Image URL
                    </span>
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    onChange={handleImageUrlChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter a valid image URL for the book cover</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                  <div className="h-32 w-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                    {imagePreview ? (
                      <SafeImage
                        src={imagePreview}
                        alt="Book cover preview"
                        className="w-full h-full object-cover"
                        fill
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end items-center gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding Item...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
