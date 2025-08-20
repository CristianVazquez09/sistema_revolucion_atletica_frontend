import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { PaqueteService } from '../../services/paquete-service';
import { PaqueteData } from '../../model/paquete-data';
import { PaqueteModal } from './paquete-modal/paquete-modal';

@Component({
  selector: 'app-paquete-componet',
  standalone: true,
  imports: [CommonModule, PaqueteModal],
  templateUrl: './paquete.html',
  styleUrl: './paquete.css',
})
export class Paquete implements OnInit {

  // Estado de pantalla
  listaPaquetes: PaqueteData[] = [];
  estaCargando = true;
  mensajeError: string | null = null;

  // Estado de modal
  mostrarModalPaquete = signal(false);
  paqueteEnEdicion: PaqueteData | null = null;

  constructor(private servicioPaquetes: PaqueteService) {}

  // Ciclo de vida
  ngOnInit(): void {
    this.cargarPaquetes();

    
  }

  // Acciones
  cargarPaquetes(): void {
    this.estaCargando = true;
    this.mensajeError = null;

    this.servicioPaquetes
      .buscarTodos()
      .pipe(finalize(() => (this.estaCargando = false)))
      .subscribe({
        next: (data) => { this.listaPaquetes = data ?? []; },
        error: () => { this.mensajeError = 'No se pudo cargar la lista de paquetes.'; },
      });
  }

  abrirModalParaCrear(): void {
    this.paqueteEnEdicion = null;
    this.mostrarModalPaquete.set(true);
  }

  abrirModalParaEditar(paquete: PaqueteData): void {
    this.paqueteEnEdicion = paquete;
    this.mostrarModalPaquete.set(true);
  }

  cerrarModalPaquete(): void {
    this.mostrarModalPaquete.set(false);
  }

  despuesDeGuardar(): void {
    this.cerrarModalPaquete();
    this.cargarPaquetes();
  }

  eliminarPaquete(paquete: PaqueteData): void {
    if (!confirm(`¿Eliminar paquete "${paquete.nombre}"?`)) return;
    this.servicioPaquetes.eliminar(paquete.idPaquete).subscribe({
      next: () => this.cargarPaquetes(),
      error: () => alert('No se pudo eliminar.'),
    });
  }

}
