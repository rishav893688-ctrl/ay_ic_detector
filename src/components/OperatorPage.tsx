import React, { useState, useEffect } from 'react';
import { Upload, Camera, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { getInspections, getDetectionsByInspectionId, createInspection, createDetection, type Inspection, type Detection } from '../lib/api';

export function OperatorPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspections();
  }, []);

  useEffect(() => {
    if (selectedInspection) {
      loadDetections(selectedInspection.id);
    }
  }, [selectedInspection]);

  async function loadInspections() {
    try {
      const data = await getInspections();
      setInspections(data);
      if (data.length > 0 && !selectedInspection) {
        setSelectedInspection(data[0]);
      }
    } catch (error) {
      console.error('Failed to load inspections:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadDetections(inspectionId: string) {
    try {
      const data = await getDetectionsByInspectionId(inspectionId);
      setDetections(data);
    } catch (error) {
      console.error('Failed to load detections:', error);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // INTEGRATE HERE: Upload image to storage and get URL
      // For demo, using placeholder image
      const imageUrl = `https://placehold.co/600x400?text=AOI+Image+${Date.now()}`;

      // Create mock detection data
      const mockOcrText = `IC${Math.floor(Math.random() * 100000)}`;
      const mockConfidence = 0.5 + Math.random() * 0.5;
      const mockMatchScore = 0.4 + Math.random() * 0.6;

      let verdict = 'Genuine';
      if (mockMatchScore < 0.6) verdict = 'Suspicious';
      if (mockMatchScore < 0.4) verdict = 'Counterfeit';

      // Create inspection
      const newInspection = await createInspection({
        timestamp: new Date().toISOString(),
        camera_id: 'CAM-01',
        image_url: imageUrl,
        status: 'completed',
      });

      // Create detection
      await createDetection({
        inspection_id: newInspection.id,
        bbox_x1: 100,
        bbox_y1: 80,
        bbox_x2: 300,
        bbox_y2: 180,
        crop_url: `https://placehold.co/200x100?text=IC+Crop`,
        ocr_text: mockOcrText,
        ocr_confidence: mockConfidence,
        match_score: mockMatchScore,
        verdict,
        datasheet_id: null,
        datasheet_excerpt: 'Marking analysis performed',
        override_by: null,
        override_verdict: null,
        override_notes: null,
      });

      // Reload data
      await loadInspections();
      setSelectedInspection(newInspection);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setUploading(false);
    }
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
        <div className="text-gray-500">Loading inspections...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Operator Console</h1>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}>
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload Image</span>
              </>
            )}
          </div>
        </label>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        <div className="col-span-1 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Recent Inspections</h2>
          <div className="space-y-2">
            {inspections.map((inspection) => (
              <div
                key={inspection.id}
                onClick={() => setSelectedInspection(inspection)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedInspection?.id === inspection.id
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Camera className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{inspection.camera_id}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(inspection.timestamp).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Status: <span className="font-medium">{inspection.status}</span>
                </div>
              </div>
            ))}
            {inspections.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No inspections yet. Upload an image to start.
              </div>
            )}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-lg shadow-md p-6 overflow-y-auto">
          {selectedInspection ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Inspection Details</h2>
                <div className="bg-gray-100 rounded-lg p-4">
                  <img
                    src={selectedInspection.image_url}
                    alt="AOI Inspection"
                    className="w-full rounded-lg mb-4"
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Camera:</span>
                      <span className="ml-2 font-medium">{selectedInspection.camera_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedInspection.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Detections</h2>
                <div className="space-y-4">
                  {detections.map((detection) => (
                    <div key={detection.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        <img
                          src={detection.crop_url}
                          alt="IC Crop"
                          className="w-32 h-20 object-cover rounded border"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`flex items-center gap-1 font-semibold ${getVerdictColor(detection.verdict)}`}>
                              {getVerdictIcon(detection.verdict)}
                              {detection.override_verdict || detection.verdict}
                            </span>
                            {detection.override_verdict && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Overridden
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">OCR Text:</span>
                              <span className="ml-2 font-mono font-medium">{detection.ocr_text}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">OCR Confidence:</span>
                              <span className="ml-2 font-medium">{(detection.ocr_confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Match Score:</span>
                              <span className="ml-2 font-medium">{(detection.match_score * 100).toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Bounding Box:</span>
                              <span className="ml-2 font-mono text-xs">
                                [{detection.bbox_x1}, {detection.bbox_y1}, {detection.bbox_x2}, {detection.bbox_y2}]
                              </span>
                            </div>
                          </div>
                          {detection.datasheet_excerpt && (
                            <div className="mt-2 text-xs text-gray-600 italic">
                              {detection.datasheet_excerpt}
                            </div>
                          )}
                          {detection.override_notes && (
                            <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                              <span className="font-semibold">Override Note:</span> {detection.override_notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {detections.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No detections found for this inspection.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select an inspection to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
