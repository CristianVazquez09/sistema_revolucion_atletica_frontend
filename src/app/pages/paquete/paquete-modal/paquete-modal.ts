import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { PaqueteData } from '../../../model/paquete-data';
import { PaqueteService } from '../../../services/paquete-service';
import { TiempoPlan } from '../../../util/enums/tiempoPlan';
import { TiempoPlanLabelPipe } from '../../../util/tiempo-plan-label';

@Component({
  selector: 'app-paquete-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TiempoPlanLabelPipe],
  templateUrl: './paquete-modal.html'
})
export class PaqueteModal implements OnInit, OnDestroy {


  @Input() paquete: PaqueteData | null = null;
  @Output() cancelar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  fb: FormGroup = new FormGroup({
    idPaquete: new FormControl(0),
    nombre: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    tiempo: new FormControl(null as TiempoPlan | null, [Validators.required]),
    precio: new FormControl(0, [Validators.required, Validators.min(0)]),
    costoInscripcion: new FormControl(0, [Validators.required, Validators.min(0)]),
  })

  


  constructor(
    private paqueteService :PaqueteService
  ){}

  // Si tu enum es numérico, este filter evita valores duplicados invertidos
  tiempos = (Object.values(TiempoPlan).filter(v => typeof v === 'string') as string[]) as unknown as TiempoPlan[];

  titulo = computed(() => this.paquete ? 'Editar paquete' : 'Agregar paquete');



  guardando = false;
  error: string | null = null;

  ngOnInit(): void {
    if (this.paquete) {
      this.paqueteService.buscarPorId(this.paquete.idPaquete).subscribe(paquete => {
        this.fb = new FormGroup({
          idPaquete: new FormControl(paquete.idPaquete),
          nombre: new FormControl(paquete.nombre, [Validators.required, Validators.maxLength(100)]),
          tiempo: new FormControl(paquete.tiempo, [Validators.required]),
          precio: new FormControl(paquete.precio, [Validators.required, Validators.min(0)]),
          costoInscripcion: new FormControl(paquete.costoInscripcion, [Validators.required, Validators.min(0)]),
        })
      })
    }
    window.addEventListener('keydown', this.handleEsc);
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.handleEsc);
  }

  private handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.cancelar.emit();
  };

  guardar(): void {
    if (this.fb.invalid) {
      this.fb.markAllAsTouched();
      return;
    }

    this.error = null;
    this.guardando = true;

    const f = this.fb.getRawValue();

    let obs;

    if (this.paquete) {
      // UPDATE -> payload completo con id
      const payloadUpdate: PaqueteData = {
        idPaquete: this.paquete.idPaquete,
        nombre: f.nombre,
        tiempo: f.tiempo,
        precio: Number(f.precio),
        costoInscripcion: Number(f.costoInscripcion),
      };
      obs = this.paqueteService.actualizar(this.paquete.idPaquete, payloadUpdate);
    } else {
      // CREATE -> cuerpo SIN id, casteado solo en la llamada
      const bodyCrearSinId = {
        nombre: f.nombre,
        tiempo: f.tiempo,
        precio: Number(f.precio),
        costoInscripcion: Number(f.costoInscripcion),
      } as unknown as PaqueteData;

      obs = this.paqueteService.guardar(bodyCrearSinId);
    }

    obs.subscribe({
      next: () => {
        this.guardando = false;
        this.guardado.emit();
      },
      error: (err: any) => {
        console.error(err);
        this.guardando = false;
        this.error = 'No se pudo guardar el paquete.';
      }
    });
  }
}
