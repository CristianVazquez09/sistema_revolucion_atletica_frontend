import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { ProductoModal } from './producto-modal/producto-modal';
import { ProductoService } from '../../services/producto-service';
import { ProductoData } from '../../model/producto-data';
import { NotificacionService } from '../../services/notificacion-service';
import { BaseCrudListComponent } from '../../shared/base-crud-list.component';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductoModal, RouterLink],
  templateUrl: './producto.html',
  styleUrl: './producto.css'
})
export class Producto extends BaseCrudListComponent<ProductoData> implements OnInit {

  constructor(
    productoSrv: ProductoService,
    notificacion: NotificacionService
  ) {
    super(productoSrv, notificacion);
  }

  ngOnInit(): void {
    this.cargar();
  }

  protected override getId(item: ProductoData): number | undefined {
    return item.idProducto;
  }

  protected override getMensajeConfirmacion(item: ProductoData): string {
    return `¿Eliminar producto "${item.nombre}"?`;
  }
}
