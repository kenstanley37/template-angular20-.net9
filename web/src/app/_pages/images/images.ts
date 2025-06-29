import { Component } from '@angular/core';
import { PictureViewer } from "../../_components/picture/picture-viewer/picture-viewer";

@Component({
  selector: 'app-images',
  imports: [PictureViewer],
  templateUrl: './images.html',
  styleUrl: './images.scss'
})
export class Images {

}
