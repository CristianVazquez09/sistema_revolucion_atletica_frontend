import { Component, OnInit, signal, inject, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ResumenCompra } from '../resumen-compra/resumen-compra';

import { PaqueteService } from '../../services/paquete-service';
import { MembresiaService } from '../../services/membresia-service';

import { PaqueteData } from '../../model/paquete-data';
import { SocioData } from '../../model/socio-data';
import { MembresiaData } from '../../model/membresia-data';

import { TiempoPlan } from '../../util/enums/tiempoPlan';
import { TipoMovimiento } from '../../util/enums/TipoMovimiento';
import { TipoPago } from '../../util/enums/TipoPago  ';

// Socio nuevo: sin idSocio
type SocioRequest = Omit<SocioData, 'idSocio'> & { idSocio?: number };

@Component({
  selector: 'app-inscripcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ResumenCompra],
  templateUrl: './inscripcion.html',
  styleUrl: './inscripcion.css'
})
export class Inscripcion implements OnInit {

  // Inyección
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  // Catálogos / UI
  listaPaquetes: PaqueteData[] = [];
  cargandoPaquetes = true;

  mostrarModalResumen = signal(false);
  mensajeError: string | null = null;
  guardandoMembresia = false;

  paqueteSeleccionado = signal<PaqueteData | null>(null);

  // Formulario
  formularioInscripcion = this.fb.group({
    nombre:           this.fb.nonNullable.control('', [Validators.required]),
    apellido:         this.fb.nonNullable.control('', [Validators.required]),
    telefono:         this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
    email:            this.fb.control<string | null>(null, [Validators.email]),
    fechaNacimiento:  this.fb.control<string | null>(null), // valida backend
    direccion:        this.fb.nonNullable.control('', [Validators.required]),
    genero:           this.fb.nonNullable.control<'MASCULINO'|'FEMENINO'>('MASCULINO', [Validators.required]),
    comentarios:      this.fb.control<string | null>(null),

    paqueteId:        this.fb.nonNullable.control(0, [Validators.min(1)]),
    fechaInicio:      this.fb.nonNullable.control(this.hoyEnISO()),
    descuento:        this.fb.nonNullable.control(0, [Validators.min(0)]),
    movimiento:       this.fb.nonNullable.control<TipoMovimiento>('INSCRIPCION'),
  });

  // Descuento como signal para refrescar total en UI
  private descuento$ = this.formularioInscripcion.controls.descuento.valueChanges;
  descuentoSig = toSignal(this.descuento$, { initialValue: this.formularioInscripcion.controls.descuento.value });

  // Totales (UI vs payload)
  precioPaquete     = computed(() => this.paqueteSeleccionado()?.precio ?? 0);
  costoInscripcion  = computed(() => this.paqueteSeleccionado()?.costoInscripcion ?? 0);
  totalVista        = computed(() => {
    const d = Number(this.descuentoSig() ?? 0);
    return Math.max(0, this.precioPaquete() + this.costoInscripcion() - d);
  });
  totalSinDescuento = computed(() => this.prezioMasInscripcion());

  // Fecha de pago visible (solo lectura): fin calculado según paquete
  fechaPagoVista = computed(() => {
    const paquete = this.paqueteSeleccionado();
    const inicioISO = this.formularioInscripcion.controls.fechaInicio.value; // hoy por defecto
    if (!paquete) return inicioISO;
    return this.calcularFechaFin(inicioISO, paquete.tiempo);
  });

  // Foto (solo local)
  fotoArchivo: File | null = null;
  fotoPreviewUrl: string | null = null;

  constructor(
    private paqueteSrv: PaqueteService,
    private membresiaSrv: MembresiaService
  ) {}

  ngOnInit(): void {
    this.cargarPaquetes();

    // Mantener en sync paqueteSeleccionado con paqueteId
    this.formularioInscripcion.controls.paqueteId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(id => this.sincronizarPaqueteSeleccionado(id ?? 0));
  }

  // —— Foto local (preview) ——
  onFotoSeleccionada(evt: Event): void {
    const file = (evt.target as HTMLInputElement).files?.[0] || null;
    if (!file) { return; }
    this.fotoArchivo = file;
    const reader = new FileReader();
    reader.onload = () => this.fotoPreviewUrl = reader.result as string;
    reader.readAsDataURL(file);
  }
  quitarFoto(): void {
    this.fotoArchivo = null;
    this.fotoPreviewUrl = null;
  }

  // —— Catálogo Paquetes ——
  private cargarPaquetes(): void {
    this.cargandoPaquetes = true;
    this.paqueteSrv.buscarTodos().subscribe({
      next: lista => {
        this.listaPaquetes = lista ?? [];
        this.cargandoPaquetes = false;
        this.sincronizarPaqueteSeleccionado(this.formularioInscripcion.controls.paqueteId.value ?? 0);
      },
      error: err => {
        console.error(err);
        this.cargandoPaquetes = false;
        this.mensajeError = 'No se pudieron cargar los paquetes.';
      }
    });
  }

  private sincronizarPaqueteSeleccionado(idPaquete: number): void {
    if (!idPaquete || idPaquete <= 0) {
      this.paqueteSeleccionado.set(null);
      return;
    }
    const encontrado = this.listaPaquetes.find(p => p.idPaquete === idPaquete) ?? null;
    this.paqueteSeleccionado.set(encontrado);
  }

  // —— Modal ——
  abrirModalResumen(): void {
    const faltantes = this.camposFaltantes();
    if (faltantes.length) {
      this.formularioInscripcion.markAllAsTouched();
      this.mensajeError = 'Completa o corrige: ' + faltantes.join(', ') + '.';
      return;
    }
    this.mensajeError = null;
    this.mostrarModalResumen.set(true);
  }
  cerrarModalResumen(): void { this.mostrarModalResumen.set(false); }

  private camposFaltantes(): string[] {
    const c = this.formularioInscripcion.controls;
    const f: string[] = [];
    if (c.nombre.invalid)     f.push('Nombre');
    if (c.apellido.invalid)   f.push('Apellidos');
    if (c.telefono.invalid)   f.push('Teléfono (10 dígitos)');
    if (c.direccion.invalid)  f.push('Dirección');
    if (!c.paqueteId.value || c.paqueteId.value <= 0) f.push('Paquete');
    if (c.genero.invalid)     f.push('Sexo');
    return f;
  }

  // —— Guardar ——
  confirmarPagoYGuardar(tipoPago: TipoPago): void {
    let paquete = this.paqueteSeleccionado();
    const paqueteId = this.formularioInscripcion.controls.paqueteId.value ?? 0;

    if (!paquete && paqueteId > 0) {
      paquete = this.listaPaquetes.find(p => p.idPaquete === paqueteId) ?? null;
      this.paqueteSeleccionado.set(paquete);
    }
    if (!paquete) {
      alert('Selecciona un paquete antes de confirmar.');
      return;
    }

    const fechaInicio = this.formularioInscripcion.controls.fechaInicio.value!;
    const fechaFin = this.calcularFechaFin(fechaInicio, paquete.tiempo);

    const socioNuevo: SocioRequest = {
      nombre:          this.formularioInscripcion.controls.nombre.value!,
      apellido:        this.formularioInscripcion.controls.apellido.value!,
      direccion:       this.formularioInscripcion.controls.direccion.value!,
      telefono:        this.formularioInscripcion.controls.telefono.value!,
      email:           this.formularioInscripcion.controls.email.value ?? '',
      fechaNacimiento: this.formularioInscripcion.controls.fechaNacimiento.value ?? '',
      genero:          this.formularioInscripcion.controls.genero.value!,
      comentarios:     this.formularioInscripcion.controls.comentarios.value ?? ''
    };

    const cuerpo: MembresiaData = {
      socio:   socioNuevo as unknown as SocioData, // respeta tu interfaz actual
      paquete: paquete,                             // paquete completo
      fechaInicio,
      fechaFin,
      movimiento: this.formularioInscripcion.controls.movimiento.value!,
      tipoPago,
      descuento: this.formularioInscripcion.controls.descuento.value!, // se envía normal
      total: this.totalSinDescuento()                                   // sin restar aquí
    };

    this.guardandoMembresia = true;
    this.membresiaSrv.guardar(cuerpo).subscribe({
      next: () => {
        this.guardandoMembresia = false;
        this.cerrarModalResumen();
        const hoy = this.hoyEnISO();
        this.formularioInscripcion.reset({
          genero: 'MASCULINO',
          movimiento: 'INSCRIPCION',
          fechaInicio: hoy,
          descuento: 0,
          paqueteId: 0
        });
        this.paqueteSeleccionado.set(null);
        this.quitarFoto();
        alert('Membresía guardada con éxito.');
      },
      error: err => {
        console.error(err);
        this.guardandoMembresia = false;
        alert('No se pudo guardar la membresía.');
      }
    });
  }

  // Utilidades
  private hoyEnISO(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private prezioMasInscripcion(): number {
    return this.precioPaquete() + this.costoInscripcion();
  }

  private calcularFechaFin(inicioISO: string, tiempo: TiempoPlan): string {
    const d = new Date(inicioISO + 'T00:00:00');
    // Ajusta estos cases a TU enum real:
    // Si tu enum es: export enum TiempoPlan { SEMANAL='UNA_SEMANA', MENSUAL='UN_MES', ANUAL='ANUAL' }
    switch (tiempo) {
      case TiempoPlan.UNA_SEMANA: d.setDate(d.getDate() + 7); break;
      case TiempoPlan.MENSUAL: d.setMonth(d.getMonth() + 1); break;
      case TiempoPlan.ANUAL:   d.setFullYear(d.getFullYear() + 1); break;
      default:                 d.setMonth(d.getMonth() + 1); break;
    }
    return d.toISOString().slice(0, 10);
  }
}
