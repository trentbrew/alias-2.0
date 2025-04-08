export interface MenuItem {
  icon: string;
  label: string;
  action?: () => void;
  active?: boolean;
}

export interface Alias {
  id?: string;
  name: string;
  url: string;
  createdAt?: Date;
  updatedAt?: Date;
  count?: number;
}
