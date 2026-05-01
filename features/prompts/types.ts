export interface Prompt {
  id: string;
  name: string;
  slug: string;
  content: string;
  version: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPrompts {
  items: Prompt[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
