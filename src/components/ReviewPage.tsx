import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Save } from 'lucide-react';
import { getSuspiciousDetections, overrideDetectionVerdict, type Detection } from '../lib/api';

export function ReviewPage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [overriding, setOverriding] = useState<string | null>(null);
  const [overrideData, setOverrideData] = useState({
    verdict: '',
    notes: '',
    reviewer: '',
  });

  useEffect(() => {
    loadSuspiciousDetections();
  }, []);

  async function loadSuspiciousDetections() {
    try {
      const data = await getSuspiciousDetections();
      setDetections(data);
    } catch (error) {
      console.error('Failed to load suspicious detections:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleOverride(detectionId: string) {
    if (!overrideData.verdict || !overrideData.reviewer) {
      alert('Please select a verdict and enter your name');
      return;
    }

    try {
      await overrideDetectionVerdict(
        detectionId,
        overrideData.reviewer,
        overrideData.verdict,
        overrideData.notes
      );
      setOverriding(null);
      setOverrideData({ verdict: '', notes: '', reviewer: '' });
      loadSuspiciousDetections();
    } catch (error) {
      console.error('Failed to override verdict:', error);
      alert('Failed to override verdict. Please try again.');
    }
  }

  function startOverride(detectionId: string) {
    setOverriding(detectionId);
    setOverrideData({ verdict: '', notes: '', reviewer: '' });
  }

  function cancelOverride() {
    setOverriding(null);
    setOverrideData({ verdict: '', notes: '', reviewer: '' });
  }

  function getVerdictColor(verdict: string) {
    switch (verdict) {
      case 'Genuine':
        return 'text-green-600';
      case 'Suspicious':
        return 'text-yellow-600';
      case 'Counterfeit':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  function getVerdictIcon(verdict: string) {
    switch (verdict) {
      case 'Genuine':
        return <CheckCircle className="w-5 h-5" />;
      case 'Suspicious':
        return <AlertCircle className="w-5 h-5" />;
      case 'Counterfeit':
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading suspicious detections...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Review Suspicious Items</h1>
        <p className="text-gray-600">Review and override verdicts for suspicious IC markings detected by the system.</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-6">
          {detections.map((detection) => (
            <div key={detection.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={detection.crop_url}
                    alt="IC Crop"
                    className="w-48 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`flex items-center gap-2 text-lg font-semibold ${getVerdictColor(detection.verdict)}`}>
                      {getVerdictIcon(detection.verdict)}
                      Current Verdict: {detection.verdict}
                    </span>
                    {detection.override_verdict && (
                      <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        Previously Overridden
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">OCR Text</div>
                      <div className="font-mono font-semibold text-gray-900">{detection.ocr_text}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">OCR Confidence</div>
                      <div className="font-semibold text-gray-900">{(detection.ocr_confidence * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Match Score</div>
                      <div className="font-semibold text-gray-900">{(detection.match_score * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  {detection.datasheet_excerpt && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Datasheet Excerpt</div>
                      <div className="text-sm text-gray-800 italic">{detection.datasheet_excerpt}</div>
                    </div>
                  )}

                  {detection.override_verdict && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-semibold text-blue-900 mb-1">
                        Previous Override by {detection.override_by}
                      </div>
                      <div className="text-sm text-blue-800">
                        New Verdict: <span className="font-semibold">{detection.override_verdict}</span>
                      </div>
                      {detection.override_notes && (
                        <div className="text-sm text-blue-800 mt-1">Notes: {detection.override_notes}</div>
                      )}
                    </div>
                  )}

                  {overriding === detection.id ? (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold text-gray-800 mb-3">Override Verdict</h3>
                      <div className="grid gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={overrideData.reviewer}
                            onChange={(e) => setOverrideData({ ...overrideData, reviewer: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Verdict <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-3">
                            {['Genuine', 'Suspicious', 'Counterfeit'].map((verdict) => (
                              <button
                                key={verdict}
                                onClick={() => setOverrideData({ ...overrideData, verdict })}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                                  overrideData.verdict === verdict
                                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                {verdict}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                          <textarea
                            value={overrideData.notes}
                            onChange={(e) => setOverrideData({ ...overrideData, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Explain your reasoning for the override..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOverride(detection.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Override</span>
                          </button>
                          <button
                            onClick={cancelOverride}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startOverride(detection.id)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Override Verdict
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {detections.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">All Clear!</h3>
              <p className="text-gray-600">No suspicious detections requiring review at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
