// pages/punto-venta/punto-venta.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, finalize } from 'rxjs';

import { CategoriaService } from '../../services/categoria-service';
import { ProductoService } from '../../services/producto-service';
import { CategoriaData } from '../../model/categoria-data';
import { ProductoData } from '../../model/producto-data';

type CarritoItem = {
  idProducto: number;
  nombre: string;
  cantidad: number;
  precioUnit: number;
};

@Component({
  selector: 'app-punto-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './punto-venta.html',
  styleUrl: './punto-venta.css'
})
export class PuntoVenta implements OnInit {
  // inyección
  private categoriaSrv = inject(CategoriaService);
  private productoSrv = inject(ProductoService);

  // UI principal (categorías o productos)
  modo: 'categorias' | 'productos' = 'categorias';

  // categorías
  categorias: CategoriaData[] = [];
  paginaCategorias = 0;
  tamanoPaginaCategorias = 6; // 3x2
  get totalPagCats(): number {
    return Math.max(1, Math.ceil(this.categorias.length / this.tamanoPaginaCategorias));
  }
  get categoriasVisibles(): CategoriaData[] {
    const ini = this.paginaCategorias * this.tamanoPaginaCategorias;
    return this.categorias.slice(ini, ini + this.tamanoPaginaCategorias);
  }
  categoriaActivaId: number | null = null;
  categoriaHoverId: number | null = null;

  // productos
  productos: ProductoData[] = [];
  productosFiltrados: ProductoData[] = [];
  productoSeleccionado: ProductoData | null = null;

  // búsqueda (backend en ≥ 2 letras)
  terminoBusqueda = '';
  private search$ = new Subject<string>();

  // carrito
  carrito: CarritoItem[] = [];
  indiceCarritoSeleccionado: number | null = null;
  cantidadParaAgregar = 1;

  // estado
  cargandoCategorias = true;
  cargandoProductos = false;
  error: string | null = null;

  ngOnInit(): void {
    this.cargarCategorias();

    // Buscador con debounce y llamado al backend en ≥ 2 caracteres
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(q => {
          const t = (q ?? '').trim();
          if (t.length >= 2) {
            this.modo = 'productos';
            this.categoriaActivaId = null; // búsqueda libre
            this.cargandoProductos = true;
            this.productoSeleccionado = null;
            // Asegúrate de tener este método en tu ProductoService:
            // buscarPorNombre(nombre: string)
            return this.productoSrv.buscarPorNombre(t)
              .pipe(finalize(() => (this.cargandoProductos = false)));
          }
          if (t.length === 0) {
            // Si no hay categoría activa, volvemos a categorías
            if (this.categoriaActivaId == null) {
              this.modo = 'categorias';
              this.productos = [];
              this.productosFiltrados = [];
              this.productoSeleccionado = null;
            } else {
              // Si había una categoría activa, recargamos su lista
              this.cargarProductosPorCategoria(this.categoriaActivaId);
            }
          }
          return of(null);
        })
      )
      .subscribe({
        next: (lista) => {
          if (!lista) return;
          this.productos = lista ?? [];
          this.productosFiltrados = [...this.productos];
        },
        error: (err) => {
          console.error(err);
          this.error = 'No se pudo ejecutar la búsqueda.';
          this.cargandoProductos = false;
        }
      });
  }

  // ───────────── Categorías ─────────────
  private cargarCategorias(): void {
    this.cargandoCategorias = true;
    this.error = null;

    this.categoriaSrv.buscarTodos().subscribe({
      next: (lista) => {
        this.categorias = lista ?? [];
        this.cargandoCategorias = false;
        this.modo = 'categorias';
      },
      error: (err) => {
        console.error(err);
        this.cargandoCategorias = false;
        this.error = 'No se pudieron cargar las categorías.';
      }
    });
  }

  seleccionarCategoria(c: CategoriaData): void {
    if (!c?.idCategoria) return;
    this.categoriaActivaId = Number(c.idCategoria); // marca activa
    this.terminoBusqueda = '';
    this.productoSeleccionado = null;
    this.cargarProductosPorCategoria(this.categoriaActivaId);
    this.modo = 'productos';
  }

  onCategoriaHover(c?: CategoriaData): void {
    this.categoriaHoverId = c?.idCategoria ?? null;
  }

  anteriorPaginaCategorias(): void {
    if (this.paginaCategorias > 0) this.paginaCategorias--;
  }
  siguientePaginaCategorias(): void {
    if (this.paginaCategorias + 1 < this.totalPagCats) this.paginaCategorias++;
  }

  volverACategorias(): void {
    this.modo = 'categorias';
    this.categoriaActivaId = null;
    this.productos = [];
    this.productosFiltrados = [];
    this.productoSeleccionado = null;
    this.terminoBusqueda = '';
  }

  // ───────────── Productos ─────────────
  private cargarProductosPorCategoria(idCategoria: number): void {
    this.cargandoProductos = true;
    this.error = null;
    this.productos = [];
    this.productosFiltrados = [];

    // Asegúrate de tener este método en tu ProductoService:
    // buscarPoCategoria(idCategoria: number)
    this.productoSrv.buscarPorCategoria(idCategoria).subscribe({
      next: (lista) => {
        this.productos = lista ?? [];
        this.productosFiltrados = [...this.productos];
        this.cargandoProductos = false;
      },
      error: (err) => {
        console.error(err);
        this.cargandoProductos = false;
        this.error = 'No se pudieron cargar los productos.';
      }
    });
  }

  onBuscarChange(valor: string): void {
    this.terminoBusqueda = valor;
    this.search$.next(valor);
  }

  seleccionarProducto(p: ProductoData): void {
    if (this.toNumber(p.cantidad) <= 0) return; // protección extra
    this.productoSeleccionado = p;
  }

  // ───────────── Stock helpers ─────────────
  stockOriginal(p: ProductoData): number {
    return this.toNumber(p.cantidad);
  }
  stockYaEnCarrito(idProd: number): number {
    return this.carrito
      .filter(x => x.idProducto === idProd)
      .reduce((acc, it) => acc + it.cantidad, 0);
  }
  stockDisponible(p: ProductoData): number {
    const id = Number((p.idProducto as any) ?? 0);
    return Math.max(0, this.stockOriginal(p) - this.stockYaEnCarrito(id));
  }

  // ───────────── Carrito ─────────────
  agregarAlCarrito(): void {
    const p = this.productoSeleccionado;
    if (!p || this.cantidadParaAgregar <= 0) return;

    const disponible = this.stockDisponible(p);
    if (this.cantidadParaAgregar > disponible) {
      alert(`Solo hay ${disponible} en stock para "${String(p.nombre ?? '')}".`);
      return;
    }

    const id = Number((p.idProducto as any) ?? 0);
    const ya = this.carrito.findIndex((x) => x.idProducto === id);
    const precio = this.toNumber(p.precioVenta);

    if (ya >= 0) {
      this.carrito[ya].cantidad += this.cantidadParaAgregar;
      this.indiceCarritoSeleccionado = ya;
    } else {
      this.carrito.push({
        idProducto: id,
        nombre: String(p.nombre ?? ''),
        cantidad: this.cantidadParaAgregar,
        precioUnit: precio
      });
      this.indiceCarritoSeleccionado = this.carrito.length - 1;
    }
    this.cantidadParaAgregar = 1;
  }

  seleccionarLineaCarrito(idx: number): void {
    this.indiceCarritoSeleccionado = idx;
  }

  sumar(): void {
    if (this.indiceCarritoSeleccionado == null) return;
    const item = this.carrito[this.indiceCarritoSeleccionado];

    // Busca el producto para respetar stock
    const prod = this.productos.find(p => Number(p.idProducto as any ?? 0) === item.idProducto);
    const stockTotal = prod ? this.stockOriginal(prod) : Infinity;
    const enCarrito = this.stockYaEnCarrito(item.idProducto);

    if (enCarrito < stockTotal) {
      item.cantidad++;
    } else {
      alert('No hay más stock disponible.');
    }
  }

  restar(): void {
    if (this.indiceCarritoSeleccionado == null) return;
    const item = this.carrito[this.indiceCarritoSeleccionado];
    item.cantidad = Math.max(1, item.cantidad - 1);
  }

  eliminarSeleccionado(): void {
    if (this.indiceCarritoSeleccionado == null) return;
    this.carrito.splice(this.indiceCarritoSeleccionado, 1);
    this.indiceCarritoSeleccionado = null;
  }

  get total(): number {
    return this.carrito.reduce((acc, it) => acc + it.cantidad * it.precioUnit, 0);
  }

  cancelar(): void {
    this.carrito = [];
    this.indiceCarritoSeleccionado = null;
    this.productoSeleccionado = null;
    this.cantidadParaAgregar = 1;
    // si estabas en búsqueda sin categoría activa, vuelve a categorías
    if (!this.categoriaActivaId && this.terminoBusqueda.length < 2) {
      this.modo = 'categorias';
    }
  }

  // helper Number -> number
  toNumber(v: any): number {
    return typeof v === 'number' ? v : Number(v ?? 0);
  }
}
