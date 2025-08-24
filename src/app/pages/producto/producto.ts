import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ProductoModal } from './producto-modal/producto-modal';
import { ProductoService } from '../../services/producto-service';
import { ProductoData } from '../../model/producto-data';
import { NotificacionService } from '../../services/notificacion-service';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductoModal, RouterLink],
  templateUrl: './producto.html',
  styleUrl: './producto.css'
})
export class Producto implements OnInit {

  private productoSrv = inject(ProductoService);
  private router = inject(Router);
  private notificacion = inject(NotificacionService);

  productos: ProductoData[] = [];
  loading = true;
  error: string | null = null;

  // Modal
  mostrarModal = signal(false);
  productoEditando: ProductoData | null = null;

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.error = null;
    this.productoSrv.buscarTodos().subscribe({
      next: data => { this.productos = data ?? []; this.loading = false; },
      error: err => { console.error(err); this.error = 'No se pudieron cargar los productos.'; this.loading = false; }
    });
  }

  abrirCrear(): void {
    this.productoEditando = null;
    this.mostrarModal.set(true);
  }

  editar(p: ProductoData): void {
    this.productoEditando = p;
    this.mostrarModal.set(true);
  }

  cerrarModal(): void { this.mostrarModal.set(false); }

  onGuardado(): void { this.cerrarModal(); this.cargar(); }

  eliminar(p: ProductoData) {
    if (!p.idProducto) return;
    if (!confirm(`¿Eliminar producto "${p.nombre}"?`)) return;
    this.productoSrv.eliminar(p.idProducto).subscribe({
      next: () => this.cargar(),
      error: () => this.notificacion.error('No se pudo eliminar el producto.')
    });
  }
}
