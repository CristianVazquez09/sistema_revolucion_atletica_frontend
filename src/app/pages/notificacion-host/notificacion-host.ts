import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../services/notificacion-service';

@Component({
  selector: 'app-notificacion-host',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion-host.html',
  styleUrl: './notificacion-host.css'
})
export class NotificacionHost {
  private srv = inject(NotificacionService);
  notificaciones = this.srv.notificaciones;

  cerrar(id: number) { this.srv.cerrar(id); }
}
