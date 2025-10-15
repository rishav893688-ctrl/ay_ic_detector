import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Camera, Sliders } from 'lucide-react';
import { getSettings, updateThresholds, updateCameraConfig, type Settings } from '../lib/api';

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    thresholds: { genuine: 0.85, suspicious: 0.6 },
    camera_config: { cameras: [] },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCamera, setNewCamera] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveThresholds() {
    setSaving(true);
    try {
      await updateThresholds(settings.thresholds);
      alert('Thresholds saved successfully');
    } catch (error) {
      console.error('Failed to save thresholds:', error);
      alert('Failed to save thresholds. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveCameras() {
    setSaving(true);
    try {
      await updateCameraConfig(settings.camera_config.cameras);
      alert('Camera configuration saved successfully');
    } catch (error) {
      console.error('Failed to save camera config:', error);
      alert('Failed to save camera configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleAddCamera() {
    if (!newCamera.trim()) return;
    if (settings.camera_config.cameras.includes(newCamera)) {
      alert('Camera already exists');
      return;
    }
    setSettings({
      ...settings,
      camera_config: {
        cameras: [...settings.camera_config.cameras, newCamera],
      },
    });
    setNewCamera('');
  }

  function handleRemoveCamera(camera: string) {
    setSettings({
      ...settings,
      camera_config: {
        cameras: settings.camera_config.cameras.filter((c) => c !== camera),
      },
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">System Settings</h1>
        <p className="text-gray-600">Configure detection thresholds and camera settings.</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Sliders className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Detection Thresholds</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genuine Threshold
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.thresholds.genuine}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      thresholds: { ...settings.thresholds, genuine: parseFloat(e.target.value) },
                    })
                  }
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.thresholds.genuine}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      thresholds: { ...settings.thresholds, genuine: parseFloat(e.target.value) },
                    })
                  }
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Match scores above this threshold are classified as <span className="font-semibold text-green-600">Genuine</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suspicious Threshold
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.thresholds.suspicious}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      thresholds: { ...settings.thresholds, suspicious: parseFloat(e.target.value) },
                    })
                  }
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.thresholds.suspicious}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      thresholds: { ...settings.thresholds, suspicious: parseFloat(e.target.value) },
                    })
                  }
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Match scores between suspicious and genuine thresholds are classified as <span className="font-semibold text-yellow-600">Suspicious</span>
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Threshold Logic</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>
                    <span className="font-semibold text-green-600">Genuine:</span> Match score ≥{' '}
                    {settings.thresholds.genuine.toFixed(2)}
                  </li>
                  <li>
                    <span className="font-semibold text-yellow-600">Suspicious:</span> Match score between{' '}
                    {settings.thresholds.suspicious.toFixed(2)} and {settings.thresholds.genuine.toFixed(2)}
                  </li>
                  <li>
                    <span className="font-semibold text-red-600">Counterfeit:</span> Match score &lt;{' '}
                    {settings.thresholds.suspicious.toFixed(2)}
                  </li>
                </ul>
              </div>

              <button
                onClick={handleSaveThresholds}
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                  saving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Thresholds'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Camera className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Camera Configuration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Camera</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCamera}
                  onChange={(e) => setNewCamera(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCamera()}
                  placeholder="e.g., CAM-04"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddCamera}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Active Cameras</label>
              <div className="space-y-2">
                {settings.camera_config.cameras.map((camera) => (
                  <div
                    key={camera}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{camera}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveCamera(camera)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {settings.camera_config.cameras.length === 0 && (
                  <div className="text-center text-gray-500 py-8">No cameras configured</div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={handleSaveCameras}
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                  saving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Camera Config'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">System Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Version:</span>
              <span className="ml-2 font-medium">1.0.0</span>
            </div>
            <div>
              <span className="text-gray-600">Database:</span>
              <span className="ml-2 font-medium">Connected</span>
            </div>
            <div>
              <span className="text-gray-600">Active Cameras:</span>
              <span className="ml-2 font-medium">{settings.camera_config.cameras.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Detection Mode:</span>
              <span className="ml-2 font-medium">Automatic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
