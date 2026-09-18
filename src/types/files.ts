export type FileCategory = 'map' | 'monster' | 'character' | 'avatar' | 'document' | 'other';

export interface UserFileMetadata {
  id: string;
  userId: string;
  name: string;
  originalName: string;
  storagePath: string;
  url: string;
  mimeType: string;
  size: number;
  category: FileCategory;
  relatedEntityId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface UploadOptions {
  category: FileCategory;
  name?: string;
  relatedEntityId?: string;
  folder?: string;
  userId?: string;
}
