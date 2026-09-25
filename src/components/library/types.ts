export type LibraryCategoryId = 
  | 'magias' 
  | 'classes' 
  | 'racas' 
  | 'origens' 
  | 'poderes' 
  | 'equipamentos' 
  | 'divindades' 
  | 'monstros';

export interface LibraryCategoryDef {
  id: LibraryCategoryId;
  label: string;
  singular: string;
  searchPlaceholder: string;
  description: string;
  iconName: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export interface UnifiedLibraryItem {
  id: string;
  categoryId: LibraryCategoryId;
  name: string;
  subtitle: string;
  description: string;
  badge?: string;
  secondaryBadge?: string;
  iconName?: string;
  tags?: string[];
  rawItem: any; // Reference to original data
}
