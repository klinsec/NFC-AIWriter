// Web NFC API Types (Experimental)
export type NDEFMessage = {
  records: NDEFRecord[];
};

export type NDEFRecord = {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: DataView;
  encoding?: string;
  lang?: string;
  toRecords?: () => NDEFRecord[];
};

// Added types for Writing
export type NDEFRecordInit = {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: any; // Allow string, BufferSource, etc.
  encoding?: string;
  lang?: string;
};

export type NDEFMessageInit = {
  records: NDEFRecordInit[];
};

// Interface for the NDEFReader class
export interface NDEFReader {
  scan: (options?: { signal: AbortSignal }) => Promise<void>;
  write: (message: NDEFMessageInit | string | BufferSource) => Promise<void>;
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
  signal?: AbortSignal;
}

export interface NDEFReadingEvent extends Event {
  message: NDEFMessage;
  serialNumber: string;
}

// App Types
export enum AppMode {
  READ = 'READ',
  WRITE = 'WRITE',
  AI_WIZARD = 'AI_WIZARD'
}

export enum WriteType {
  TEXT = 'TEXT',
  URL = 'URL',
  SOCIAL = 'SOCIAL',
  WIFI = 'WIFI',
  JSON = 'JSON'
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  urlPrefix: string;
  deepLinkPrefix: string;
  color: string;
}

export interface WifiConfig {
  ssid: string;
  password: string;
  authType: 'WPA' | 'WEP' | 'NONE';
}