export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  image_url?: string;
  is_favorite: boolean;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface CreateBookmarkInput {
  url: string;
  title: string;
  description?: string;
  tag_ids?: string[];
}
