import { TiempoPlan } from "../util/enums/tiempoPlan";

export interface PaqueteData {
  idPaquete: number;
  nombre: string;
  precio: number;
  tiempo: TiempoPlan;
  costoInscripcion: number;
}

