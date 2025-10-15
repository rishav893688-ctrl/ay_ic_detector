import { supabase } from './supabase';

export interface Inspection {
  id: string;
  timestamp: string;
  camera_id: string;
  image_url: string;
  status: string;
  created_at: string;
}

export interface Detection {
  id: string;
  inspection_id: string;
  bbox_x1: number;
  bbox_y1: number;
  bbox_x2: number;
  bbox_y2: number;
  crop_url: string;
  ocr_text: string;
  ocr_confidence: number;
  match_score: number;
  verdict: string;
  datasheet_id: string | null;
  datasheet_excerpt: string | null;
  override_by: string | null;
  override_verdict: string | null;
  override_notes: string | null;
  created_at: string;
}

export interface Datasheet {
  id: string;
  vendor: string;
  part_number: string;
  datasheet_url: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  thresholds: {
    genuine: number;
    suspicious: number;
  };
  camera_config: {
    cameras: string[];
  };
}

// Inspections API
export async function getInspections() {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data as Inspection[];
}

export async function getInspectionById(id: string) {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Inspection | null;
}

export async function createInspection(inspection: Omit<Inspection, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('inspections')
    .insert(inspection)
    .select()
    .single();

  if (error) throw error;
  return data as Inspection;
}

// Detections API
export async function getDetectionsByInspectionId(inspectionId: string) {
  const { data, error } = await supabase
    .from('detections')
    .select('*')
    .eq('inspection_id', inspectionId);

  if (error) throw error;
  return data as Detection[];
}

export async function getSuspiciousDetections() {
  const { data, error } = await supabase
    .from('detections')
    .select('*')
    .eq('verdict', 'Suspicious')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Detection[];
}

export async function createDetection(detection: Omit<Detection, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('detections')
    .insert(detection)
    .select()
    .single();

  if (error) throw error;
  return data as Detection;
}

export async function updateDetection(id: string, updates: Partial<Detection>) {
  const { data, error } = await supabase
    .from('detections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Detection;
}

export async function overrideDetectionVerdict(
  id: string,
  overrideBy: string,
  overrideVerdict: string,
  overrideNotes: string
) {
  return updateDetection(id, {
    override_by: overrideBy,
    override_verdict: overrideVerdict,
    override_notes: overrideNotes,
  });
}

// Datasheets API
export async function getDatasheets() {
  const { data, error } = await supabase
    .from('datasheets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Datasheet[];
}

export async function getDatasheetById(id: string) {
  const { data, error } = await supabase
    .from('datasheets')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Datasheet | null;
}

export async function searchDatasheets(query: string) {
  const { data, error } = await supabase
    .from('datasheets')
    .select('*')
    .or(`vendor.ilike.%${query}%,part_number.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Datasheet[];
}

export async function createDatasheet(datasheet: Omit<Datasheet, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('datasheets')
    .insert(datasheet)
    .select()
    .single();

  if (error) throw error;
  return data as Datasheet;
}

export async function updateDatasheet(id: string, updates: Partial<Omit<Datasheet, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('datasheets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Datasheet;
}

export async function deleteDatasheet(id: string) {
  const { error } = await supabase
    .from('datasheets')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Settings API
export async function getSettings(): Promise<Settings> {
  const { data: thresholdsData, error: thresholdsError } = await supabase
    .from('system_settings')
    .select('setting_value')
    .eq('setting_key', 'thresholds')
    .maybeSingle();

  const { data: cameraData, error: cameraError } = await supabase
    .from('system_settings')
    .select('setting_value')
    .eq('setting_key', 'camera_config')
    .maybeSingle();

  if (thresholdsError || cameraError) {
    throw thresholdsError || cameraError;
  }

  return {
    thresholds: thresholdsData?.setting_value || { genuine: 0.85, suspicious: 0.6 },
    camera_config: cameraData?.setting_value || { cameras: ['CAM-01', 'CAM-02', 'CAM-03'] },
  };
}

export async function updateThresholds(thresholds: { genuine: number; suspicious: number }) {
  const { error } = await supabase
    .from('system_settings')
    .update({ setting_value: thresholds, updated_at: new Date().toISOString() })
    .eq('setting_key', 'thresholds');

  if (error) throw error;
}

export async function updateCameraConfig(cameras: string[]) {
  const { error } = await supabase
    .from('system_settings')
    .update({
      setting_value: { cameras },
      updated_at: new Date().toISOString()
    })
    .eq('setting_key', 'camera_config');

  if (error) throw error;
}
