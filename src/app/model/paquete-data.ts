import { TiempoPlan } from "../util/enums/tiempo-plan";

export interface PaqueteData {
  idPaquete: number;
  nombre: string;
  precio: number;
  tiempo: TiempoPlan;
  costoInscripcion: number;
}

