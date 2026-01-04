import { ContenantType } from '../types';

interface ContenantTypeInfo {
  key: ContenantType;
  icon: string;
  labelKey: string;
  canHaveChildren: boolean;  // Ce type peut contenir des sous-contenants
}

export const CONTENANT_TYPES: ContenantTypeInfo[] = [
  { key: 'furniture', icon: 'wardrobe-outline', labelKey: 'contenantTypes.furniture', canHaveChildren: true },
  { key: 'drawer', icon: 'inbox-arrow-down', labelKey: 'contenantTypes.drawer', canHaveChildren: true },
  { key: 'shelf', icon: 'bookshelf', labelKey: 'contenantTypes.shelf', canHaveChildren: true },
  { key: 'cabinet', icon: 'door', labelKey: 'contenantTypes.cabinet', canHaveChildren: true },
  { key: 'box', icon: 'package-variant', labelKey: 'contenantTypes.box', canHaveChildren: true },
  { key: 'bag', icon: 'bag-personal-outline', labelKey: 'contenantTypes.bag', canHaveChildren: true },
  { key: 'basket', icon: 'basket-outline', labelKey: 'contenantTypes.basket', canHaveChildren: false },
  { key: 'bin', icon: 'archive-outline', labelKey: 'contenantTypes.bin', canHaveChildren: true },
  { key: 'folder', icon: 'folder-outline', labelKey: 'contenantTypes.folder', canHaveChildren: false },
  { key: 'other', icon: 'dots-horizontal', labelKey: 'contenantTypes.other', canHaveChildren: true },
];

export const getContenantTypeByKey = (key: ContenantType): ContenantTypeInfo | undefined => {
  return CONTENANT_TYPES.find((type) => type.key === key);
};

export const getContenantTypeIcon = (key: ContenantType): string => {
  return getContenantTypeByKey(key)?.icon || 'package-variant';
};
