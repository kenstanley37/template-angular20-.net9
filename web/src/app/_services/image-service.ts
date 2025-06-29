import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Image, ImageCategories, ImageResponse } from '../_models/image-model';
import { environment } from '../../environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private readonly apiUrl = environment.apiUrl + '/image';

  private http = inject(HttpClient);

  constructor() { }

  getImages(page: number, pageSize: number): Observable<ImageResponse<Image>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ImageResponse<Image>>(this.apiUrl, { params });
  }

  getImagesByCategory(category: string, page: number, pageSize: number): Observable<ImageResponse<Image>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ImageResponse<Image>>(`${this.apiUrl}/category/${category}`, { params });
  }

  getImageContent(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}`, { responseType: 'blob' });
  }

  getCategories(): Observable<ImageCategories[]> {
    return this.http.get<ImageCategories[]>(`${this.apiUrl}/categories `);
    // Since the API doesn't have a dedicated endpoint for categories, we'll fetch all images and extract unique categories
    /*
    return this.http.get<ImageResponse<Image>>(this.apiUrl).pipe(
      map(response => [...new Set(response.items.map(image => image.category))])
    );
    */
  }
}
