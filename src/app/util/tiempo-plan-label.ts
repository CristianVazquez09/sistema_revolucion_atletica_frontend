// src/app/shared/pipes/tiempo-plan-label.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { TiempoPlan } from '../util/enums/tiempoPlan';

@Pipe({
  name: 'tiempoPlan',
  standalone: true
})
export class TiempoPlanLabelPipe implements PipeTransform {
  private MAP: Record<string, string> = {
    // claves y valores del enum (y algunos alias “bonitos”)
    'VISTA': 'Visita',
    'VISITA': 'Visita',

    'DIEZ_DIAS': '10 días',
    'QUINCE_DIAS': 'Quincenal',

    'UNA_SEMANA': '1 semana',
    'DOS_SEMANAS': '2 semanas',

    'MENSUAL': 'Mensual',
    'UN_MES': 'Mensual',

    'TRIMESTRAL': 'Trimestral',
    'TRES_MESES': 'Trimestral',

    'SEMESTRAL': 'Semestral',
    'SEIS_MESES': 'Semestral',

    'ANUAL': 'Anual',
    'UN_ANIO': 'Anual'
  };

  transform(v: TiempoPlan | string | null | undefined): string {
    if (v == null) return '';
    const key = String(v).toUpperCase();
    return this.MAP[key] ?? key; // fallback: devuelve tal cual si no está mapeado
  }
}
