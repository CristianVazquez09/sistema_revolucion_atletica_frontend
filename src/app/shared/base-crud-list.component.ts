import { signal } from '@angular/core';
import { GenericService } from '../services/generic-service';
import { NotificacionService } from '../services/notificacion-service';

/**
 * Clase base con la lógica común de los listados que utilizan
 * un modal para crear y editar elementos.
 */
export abstract class BaseCrudListComponent<T> {
  /** Lista de elementos cargados desde el backend. */
  items: T[] = [];

  /** Indicador de carga en proceso. */
  loading = true;

  /** Mensaje de error si la carga falla. */
  error: string | null = null;

  /** Controla la visibilidad del modal. */
  mostrarModal = signal(false);

  /** Elemento que se está editando actualmente. */
  itemEditando: T | null = null;

  constructor(
    protected service: GenericService<T>,
    protected notify?: NotificacionService
  ) {}

  /** Carga la lista de elementos desde el servicio. */
  cargar(): void {
    this.loading = true;
    this.error = null;
    this.service.buscarTodos().subscribe({
      next: (data) => {
        this.items = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo cargar la lista.';
      },
    });
  }

  /** Abre el modal en modo creación. */
  abrirCrear(): void {
    this.itemEditando = null;
    this.mostrarModal.set(true);
  }

  /** Abre el modal para editar el elemento indicado. */
  abrirEditar(item: T): void {
    this.itemEditando = item;
    this.mostrarModal.set(true);
  }

  /** Cierra el modal. */
  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  /**
   * Se debe llamar después de guardar para recargar la lista y cerrar el modal.
   */
  despuesDeGuardar(): void {
    this.cerrarModal();
    this.cargar();
  }

  /** Elimina el elemento indicado tras confirmar. */
  eliminar(item: T): void {
    const id = this.getId(item);
    if (id == null) return;
    if (!confirm(this.getMensajeConfirmacion(item))) return;
    this.service.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: () => this.notify?.error('No se pudo eliminar.'),
    });
  }

  /** Obtiene el identificador del elemento. */
  protected abstract getId(item: T): number | undefined;

  /** Mensaje mostrado al confirmar eliminación. */
  protected getMensajeConfirmacion(_item: T): string {
    return '¿Eliminar elemento?';
  }
}

