import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PaqueteService } from './services/paquete-service';
import { NotificacionHost } from './pages/notificacion-host/notificacion-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NotificacionHost],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  

}
