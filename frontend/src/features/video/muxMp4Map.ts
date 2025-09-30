// Placeholder mapping. Tests will mock this module with real values.
export type Mp4Entry = {
  poster?: string;
  sources: Array<{ src: string; type?: string }>;
};
export const MUX_MP4_MAP: Record<string, Mp4Entry> = {};
