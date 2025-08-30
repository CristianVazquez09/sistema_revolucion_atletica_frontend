import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { MembresiaData } from '../../../model/membresia-data';
import { MembresiaService } from '../../../services/membresia-service';
import { FormsModule } from '@angular/forms';
import { PagedResponse } from '../../../model/paged-response';

@Component({
  selector: 'app-socio-informacion',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './socio-informacion.html',
  styleUrl: './socio-informacion.css' // puedes dejarlo vacío; no es necesario
})
export class SocioInformacion implements OnInit {

  // Ruta /pages/socio/:id/historial
  idSocio!: number;

  // Encabezado
  socioNombre: string | null = null;
  socioTelefono: string | null = null;

  // Datos tabla
  movimientos: MembresiaData[] = [];
  cargando = true;
  error: string | null = null;

  // Paginación
  pagina = 0;             // 0-based
  tamanio = 10;
  totalPaginas = 0;
  totalElementos = 0;
  tamaniosDisponibles = [5, 10, 20, 50];

  constructor(
    private route: ActivatedRoute,
    private membresiaSrv: MembresiaService
  ) {}

  ngOnInit(): void {
    this.idSocio = Number(this.route.snapshot.paramMap.get('idSocio'));
    this.cargar();
  }

  // Helpers mostrador X–Y de Z (si los quieres usar)
  get rangoDesde(): number {
    if (this.totalElementos === 0) return 0;
    return this.pagina * this.tamanio + 1;
  }
  get rangoHasta(): number {
    const hasta = (this.pagina + 1) * this.tamanio;
    return Math.min(hasta, this.totalElementos);
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;

    this.membresiaSrv.buscarMemebresiaPorSocio(this.idSocio, this.pagina, this.tamanio)
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: (resp: PagedResponse<MembresiaData>) => {
          this.movimientos = resp.content ?? [];
          this.totalPaginas = resp.page?.totalPages ?? 0;
          this.totalElementos = resp.page?.totalElements ?? 0;
          this.tamanio = resp.page?.size ?? this.tamanio;
          this.pagina = resp.page?.number ?? this.pagina;

          // Rellena encabezado con el primer registro (si existe)
          const s = this.movimientos[0]?.socio as any;
          this.socioNombre = s ? `${s.nombre} ${s.apellido}` : null;
          this.socioTelefono = s?.telefono ?? null;

          // Si la página quedó vacía y no es la primera, retrocede
          if (this.movimientos.length === 0 && this.pagina > 0) {
            this.pagina = this.pagina - 1;
            this.cargar();
          }
        },
        error: (err) => {
          console.error(err);
          this.error = 'No se pudo cargar el historial.';
        }
      });
  }

  // Paginación
  cambiarTamanioPagina(nuevo: any): void {
    this.tamanio = Number(nuevo);
    this.pagina = 0;
    this.cargar();
  }
  irPrimera(): void {
    if (this.pagina === 0) return;
    this.pagina = 0;
    this.cargar();
  }
  irAnterior(): void {
    if (this.pagina === 0) return;
    this.pagina--;
    this.cargar();
  }
  irSiguiente(): void {
    if (this.pagina + 1 >= this.totalPaginas) return;
    this.pagina++;
    this.cargar();
  }
  irUltima(): void {
    if (this.totalPaginas === 0) return;
    if (this.pagina === this.totalPaginas - 1) return;
    this.pagina = this.totalPaginas - 1;
    this.cargar();
  }
}
