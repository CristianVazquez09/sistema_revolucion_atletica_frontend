import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SocioService } from '../../services/socio-service';
import { MembresiaService } from '../../services/membresia-service';
import { NotificacionService } from '../../services/notificacion-service';
import { AsistenciaStore } from './asistencia-store';

import { SocioData } from '../../model/socio-data';
import { MembresiaData } from '../../model/membresia-data';
import { TiempoPlanLabelPipe } from '../../util/tiempo-plan-label';
import { hoyISO } from '../../util/fechas-precios';


type EstadoSemaforo = 'verde' | 'amarillo' | 'rojo';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TiempoPlanLabelPipe],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.css'
})
export class Asistencia implements OnInit {

  // ── Inyección
  private fb           = inject(FormBuilder);
  private socioSrv     = inject(SocioService);
  private membresiaSrv = inject(MembresiaService);
  private notify       = inject(NotificacionService);
  private store        = inject(AsistenciaStore);

  // ── Formulario
  formulario = this.fb.nonNullable.group({
    idSocio: this.fb.nonNullable.control<string>('', [
      Validators.required,
      Validators.pattern(/^\d+$/)
    ])
  });

  // ── Estado de vista (derivado del store)
  cargando = false;
  error: string | null = null;

  socio = this.store.socio;                 // signal<SocioData|null>
  membresias = this.store.membresias;       // signal<MembresiaData[]>

  hoy = hoyISO();
  get fechaHoyBonita(): string {
    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    const s = new Date().toLocaleDateString('es-MX', opts);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ── Derivados
  tarjetas = computed(() =>
    (this.membresias() ?? []).map(m => ({
      ...m,
      estado: this.calcularSemaforo(m.fechaFin) as EstadoSemaforo
    }))
  );

  autorizado = computed(() => this.tarjetas().some(t => t.estado !== 'rojo'));

  proximaFechaPago = computed(() => {
    const fechas = this.tarjetas()
      .filter(t => t.estado !== 'rojo')
      .map(t => t.fechaFin!)
      .filter(Boolean)
      .sort();
    return fechas[0] ?? null;
  });

  // ── Ciclo de vida
  ngOnInit(): void {
    // Rehidrata el formulario con el último id buscado (si existía)
    const ultimoId = this.store.idSocio();
    if (ultimoId != null) {
      this.formulario.controls.idSocio.setValue(String(ultimoId));
    }
  }

  // ── Acciones
  buscar(): void {
    if (this.formulario.invalid) {
      this.notify.aviso('Escribe un ID de socio válido.');
      this.formulario.markAllAsTouched();
      return;
    }
    const id = Number(this.formulario.controls.idSocio.value);
    this.cargando = true;
    this.error = null;

    // Ejecutamos ambas consultas en paralelo
    this.socioSrv.buscarPorId(id).subscribe({
      next: s => {
        // guardamos parcial; completamos al terminar membresías
        this.store.guardarEstado(id, s ?? null, this.membresias());
      },
      error: () => { this.error = 'No se pudo cargar el socio.'; this.cargando = false; }
    });

    this.membresiaSrv.buscarMembresiasVigentesPorSocio(id).subscribe({
      next: (lista: MembresiaData[]) => {
        this.store.guardarEstado(id, this.socio(), lista ?? []);
        this.cargando = false;
      },
      error: () => { this.error = 'No se pudieron cargar las membresías.'; this.cargando = false; }
    });
  }

  limpiar(): void {
    this.formulario.reset({ idSocio: '' });
    this.store.limpiar();
    this.error = null;
  }

  // ── Utilidades de UI
  private calcularSemaforo(fechaFinISO?: string | null): EstadoSemaforo {
    if (!fechaFinISO) return 'rojo';
    const hoy = new Date(this.hoy + 'T00:00:00');
    const fin = new Date(fechaFinISO + 'T00:00:00');
    const dias = Math.floor((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (dias > 3) return 'verde';
    if (dias > 0) return 'amarillo';  // 1–3 días
    return 'rojo';                    // hoy o vencido
  }

  idBonito(id?: number | null): string {
    const n = Number(id ?? 0);
    return n.toString().padStart(3, '0');
  }
}
