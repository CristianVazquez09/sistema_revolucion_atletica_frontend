import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductoData } from '../../../model/producto-data';
import { ProductoService } from '../../../services/producto-service';
import { CategoriaService } from '../../../services/categoria-service';
import { CategoriaData } from '../../../model/categoria-data';
;

@Component({
  selector: 'app-producto-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-modal.html',
  styleUrl: './producto-modal.css'
})
export class ProductoModal implements OnInit, OnDestroy {

  @Input() producto: ProductoData | null = null;
  @Output() cancelar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private productoSrv = inject(ProductoService);
  private categoriaSrv = inject(CategoriaService);

  categorias: CategoriaData[] = [];
  cargandoCategorias = true;

  titulo = computed(() => this.producto ? 'Editar producto' : 'Agregar producto');

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    codigo: ['', [Validators.required, Validators.maxLength(60)]],
    precioCompra: [0, [Validators.required, Validators.min(0)]],
    precioVenta: [0, [Validators.required, Validators.min(0)]],
    cantidad: [0, [Validators.required, Validators.min(0)]],
    idCategoria: [null as number | null, [Validators.required]]
  });

  guardando = false;
  error: string | null = null;

  ngOnInit(): void {
    this.cargarCategorias();

    if (this.producto) {
      this.form.patchValue({
        nombre: String(this.producto.nombre ?? ''),
        codigo: String(this.producto.codigo ?? ''),
        precioCompra: Number(this.producto.precioCompra ?? 0),
        precioVenta: Number(this.producto.precioVenta ?? 0),
        cantidad: Number(this.producto.cantidad ?? 0),
        idCategoria: this.producto.categoria?.idCategoria ?? null
      });
    }

    window.addEventListener('keydown', this.handleEsc);
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.handleEsc);
  }

  private handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') this.cancelar.emit(); };

  private cargarCategorias(): void {
    this.cargandoCategorias = true;
    this.categoriaSrv.buscarTodos().subscribe({
      next: data => { this.categorias = data ?? []; this.cargandoCategorias = false; },
      error: err => { console.error(err); this.cargandoCategorias = false; this.error = 'No se pudieron cargar categorías.'; }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.error = null;
    this.guardando = true;
    const f = this.form.getRawValue();

    const payload: ProductoData = {
      // id solo para update
      ...(this.producto?.idProducto ? { idProducto: this.producto.idProducto } : {}),
      nombre: f.nombre as any,
      codigo: f.codigo as any,
      precioCompra: Number(f.precioCompra) as any,
      precioVenta: Number(f.precioVenta) as any,
      cantidad: Number(f.cantidad) as any,
      categoria: { idCategoria: f.idCategoria! } as CategoriaData
    };

    const obs = this.producto?.idProducto
      ? this.productoSrv.actualizar(this.producto.idProducto!, payload)
      : this.productoSrv.guardar(payload);

    obs.subscribe({
      next: () => { this.guardando = false; this.guardado.emit(); },
      error: err => { console.error(err); this.guardando = false; this.error = 'No se pudo guardar el producto.'; }
    });
  }
}
