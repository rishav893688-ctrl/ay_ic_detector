import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Save, X, ExternalLink } from 'lucide-react';
import { getDatasheets, searchDatasheets, createDatasheet, updateDatasheet, deleteDatasheet, type Datasheet } from '../lib/api';

export function AdminPage() {
  const [datasheets, setDatasheets] = useState<Datasheet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vendor: '',
    part_number: '',
    datasheet_url: '',
    notes: '',
  });

  useEffect(() => {
    loadDatasheets();
  }, []);

  async function loadDatasheets() {
    try {
      const data = await getDatasheets();
      setDatasheets(data);
    } catch (error) {
      console.error('Failed to load datasheets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.trim() === '') {
      loadDatasheets();
    } else {
      try {
        const data = await searchDatasheets(query);
        setDatasheets(data);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  }

  async function handleAdd() {
    if (!formData.vendor || !formData.part_number || !formData.datasheet_url) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await createDatasheet(formData);
      setFormData({ vendor: '', part_number: '', datasheet_url: '', notes: '' });
      setShowAddForm(false);
      loadDatasheets();
    } catch (error) {
      console.error('Failed to create datasheet:', error);
      alert('Failed to create datasheet. Please try again.');
    }
  }

  async function handleUpdate(id: string) {
    try {
      await updateDatasheet(id, formData);
      setEditingId(null);
      setFormData({ vendor: '', part_number: '', datasheet_url: '', notes: '' });
      loadDatasheets();
    } catch (error) {
      console.error('Failed to update datasheet:', error);
      alert('Failed to update datasheet. Please try again.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this datasheet?')) return;

    try {
      await deleteDatasheet(id);
      loadDatasheets();
    } catch (error) {
      console.error('Failed to delete datasheet:', error);
      alert('Failed to delete datasheet. Please try again.');
    }
  }

  function startEdit(datasheet: Datasheet) {
    setEditingId(datasheet.id);
    setFormData({
      vendor: datasheet.vendor,
      part_number: datasheet.part_number,
      datasheet_url: datasheet.datasheet_url,
      notes: datasheet.notes,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ vendor: '', part_number: '', datasheet_url: '', notes: '' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading datasheets...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Datasheet Management</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Datasheet</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by vendor or part number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Add New Datasheet</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AcmeSemicon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.part_number}
                onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., SN12345AB"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datasheet URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.datasheet_url}
                onChange={(e) => setFormData({ ...formData, datasheet_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/datasheet.pdf"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Additional notes about marking specifications..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto h-full">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datasheet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {datasheets.map((datasheet) => (
                <tr key={datasheet.id} className="hover:bg-gray-50">
                  {editingId === datasheet.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.vendor}
                          onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.part_number}
                          onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="url"
                          value={formData.datasheet_url}
                          onChange={(e) => setFormData({ ...formData, datasheet_url: e.target.value })}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(datasheet.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-800"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{datasheet.vendor}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">{datasheet.part_number}</td>
                      <td className="px-6 py-4 text-sm">
                        <a
                          href={datasheet.datasheet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View</span>
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{datasheet.notes}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(datasheet)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(datasheet.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {datasheets.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              {searchQuery ? 'No datasheets found matching your search.' : 'No datasheets added yet.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
