import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CategoriaService } from '../../services/categoria-service';
import { CategoriaData } from '../../model/categoria-data';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './categoria.html',
  styleUrl: './categoria.css'
})
export class Categoria implements OnInit {

  // Inyección
  private fb = inject(FormBuilder);
  private categoriaSrv = inject(CategoriaService);

  // Estado
  categorias: CategoriaData[] = [];
  loading = true;
  error: string | null = null;

  // Modo edición (null = crear)
  private categoriaEditando: CategoriaData | null = null;

  // Form
  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(80)]]
  });

  guardando = false;

  ngOnInit(): void {
    this.cargar();
  }

  // Carga de categorías
  cargar(): void {
    this.loading = true;
    this.error = null;
    this.categoriaSrv.buscarTodos().subscribe({
      next: data => { this.categorias = data ?? []; this.loading = false; },
      error: err => { console.error(err); this.loading = false; this.error = 'No se pudieron cargar las categorías.'; }
    });
  }

  // Guardar (crear o actualizar según modo)
  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.guardando = true;
    const payload: CategoriaData = {
      nombre: String(this.form.controls.nombre.value ?? '').trim() as any
    };

    const obs = this.categoriaEditando?.idCategoria
      ? this.categoriaSrv.actualizar(this.categoriaEditando.idCategoria, payload)
      : this.categoriaSrv.guardar(payload);

    obs.subscribe({
      next: () => {
        this.guardando = false;
        this.cancelarEdicion(); // limpia form y modo
        this.cargar();
      },
      error: err => {
        console.error(err);
        this.guardando = false;
        alert('No se pudo guardar la categoría.');
      }
    });
  }

  // Entrar a modo edición
  editar(c: CategoriaData): void {
    this.categoriaEditando = c;
    this.form.reset({
      nombre: String(c.nombre ?? '')
    });
  }

  // Cancelar edición y volver a modo crear
  cancelarEdicion(): void {
    this.categoriaEditando = null;
    this.form.reset({ nombre: '' });
  }

  // Eliminar
  eliminar(c: CategoriaData) {
    if (!c.idCategoria) return;
    if (!confirm(`¿Eliminar categoría "${c.nombre}"?`)) return;

    this.categoriaSrv.eliminar(c.idCategoria).subscribe({
      next: () => this.cargar(),
      error: () => alert('No se pudo eliminar la categoría.')
    });
  }

  // Helpers de template
  get esEdicion(): boolean { return !!this.categoriaEditando; }
  get idEditando(): number | null { return this.categoriaEditando?.idCategoria ?? null; }
}
