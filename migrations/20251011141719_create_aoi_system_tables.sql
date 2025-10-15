/*
  # AOI IC Marking Verification System Schema

  1. New Tables
    - `datasheets`
      - `id` (uuid, primary key)
      - `vendor` (text) - Manufacturer/vendor name
      - `part_number` (text) - Part number
      - `datasheet_url` (text) - URL to PDF/document
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `inspections`
      - `id` (uuid, primary key)
      - `timestamp` (timestamptz) - When inspection occurred
      - `camera_id` (text) - Camera that captured the image
      - `image_url` (text) - URL to the full AOI image
      - `status` (text) - Status: pending, completed, reviewed
      - `created_at` (timestamptz)
      
    - `detections`
      - `id` (uuid, primary key)
      - `inspection_id` (uuid, foreign key to inspections)
      - `bbox_x1` (integer) - Bounding box coordinates
      - `bbox_y1` (integer)
      - `bbox_x2` (integer)
      - `bbox_y2` (integer)
      - `crop_url` (text) - URL to cropped IC image
      - `ocr_text` (text) - OCR extracted text
      - `ocr_confidence` (real) - OCR confidence score (0-1)
      - `match_score` (real) - Datasheet match score (0-1)
      - `verdict` (text) - Genuine, Suspicious, Counterfeit
      - `datasheet_id` (uuid, nullable, foreign key to datasheets)
      - `datasheet_excerpt` (text) - Relevant excerpt from datasheet
      - `override_by` (text, nullable) - User who overrode the verdict
      - `override_verdict` (text, nullable) - Overridden verdict
      - `override_notes` (text, nullable)
      - `created_at` (timestamptz)
      
    - `system_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique) - Setting identifier
      - `setting_value` (jsonb) - Setting value as JSON
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to perform CRUD operations
    - This is an internal system, so authenticated users have full access
*/

-- Create datasheets table first (no dependencies)
CREATE TABLE IF NOT EXISTS datasheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor text NOT NULL,
  part_number text NOT NULL,
  datasheet_url text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  camera_id text NOT NULL,
  image_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create detections table (references both inspections and datasheets)
CREATE TABLE IF NOT EXISTS detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  bbox_x1 integer NOT NULL,
  bbox_y1 integer NOT NULL,
  bbox_x2 integer NOT NULL,
  bbox_y2 integer NOT NULL,
  crop_url text NOT NULL,
  ocr_text text NOT NULL,
  ocr_confidence real NOT NULL,
  match_score real NOT NULL,
  verdict text NOT NULL,
  datasheet_id uuid REFERENCES datasheets(id) ON DELETE SET NULL,
  datasheet_excerpt text,
  override_by text,
  override_verdict text,
  override_notes text,
  created_at timestamptz DEFAULT now()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inspections_timestamp ON inspections(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_detections_inspection_id ON detections(inspection_id);
CREATE INDEX IF NOT EXISTS idx_detections_verdict ON detections(verdict);
CREATE INDEX IF NOT EXISTS idx_datasheets_part_number ON datasheets(part_number);

-- Enable RLS
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inspections
CREATE POLICY "Authenticated users can view inspections"
  ON inspections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert inspections"
  ON inspections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update inspections"
  ON inspections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete inspections"
  ON inspections FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for detections
CREATE POLICY "Authenticated users can view detections"
  ON detections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert detections"
  ON detections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update detections"
  ON detections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete detections"
  ON detections FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for datasheets
CREATE POLICY "Authenticated users can view datasheets"
  ON datasheets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert datasheets"
  ON datasheets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update datasheets"
  ON datasheets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete datasheets"
  ON datasheets FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for system_settings
CREATE POLICY "Authenticated users can view settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value)
VALUES 
  ('thresholds', '{"genuine": 0.85, "suspicious": 0.6}'::jsonb),
  ('camera_config', '{"cameras": ["CAM-01", "CAM-02", "CAM-03"]}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample datasheets for demo purposes
INSERT INTO datasheets (vendor, part_number, datasheet_url, notes)
VALUES 
  ('AcmeSemicon', 'SN12345AB', 'https://example.com/ds-sn12345.pdf', 'Top marking table included'),
  ('OmniChips', 'SNCX9Z', 'https://example.com/ds-sncx9z.pdf', 'Package markings overlap multiple parts'),
  ('TechCorp', 'TC8840', 'https://example.com/ds-tc8840.pdf', 'Clear marking specifications')
ON CONFLICT DO NOTHING;