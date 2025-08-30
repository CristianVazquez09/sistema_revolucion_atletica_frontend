import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaqueteService } from '../../services/paquete-service';
import { PaqueteData } from '../../model/paquete-data';
import { PaqueteModal } from './paquete-modal/paquete-modal';
import { NotificacionService } from '../../services/notificacion-service';
import { TiempoPlanLabelPipe } from '../../util/tiempo-plan-label';
import { BaseCrudListComponent } from '../../shared/base-crud-list.component';

@Component({
  selector: 'app-paquete-componet',
  standalone: true,
  imports: [CommonModule, PaqueteModal, TiempoPlanLabelPipe],
  templateUrl: './paquete.html',
  styleUrl: './paquete.css',
})
export class Paquete extends BaseCrudListComponent<PaqueteData> implements OnInit {

  constructor(
    servicioPaquetes: PaqueteService,
    notificacion: NotificacionService
  ) {
    super(servicioPaquetes, notificacion);
  }

  ngOnInit(): void {
    this.cargar();
  }

  protected override getId(item: PaqueteData): number | undefined {
    return item.idPaquete;
  }

  protected override getMensajeConfirmacion(item: PaqueteData): string {
    return `¿Eliminar paquete "${item.nombre}"?`;
  }
}
