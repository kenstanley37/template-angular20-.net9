
export interface Image {
  id: string;
  name: string;
  category: string;
  contentType: string;
  data: string;
  createdAt: string;
  updatedAt?: string;
  base64: string;
}

// ImageResponse is correct
export interface ImageResponse<T> {
  items: T[],
  page: number,
  pageSize: number,
  totalCount: number,
  totalPages: number,
}

export interface ImageCategories {
  category: string;
}