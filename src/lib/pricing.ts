// Utilidad de precios de SaludGO
// Especialistas: $18 USD | Medicina General: $9 USD | Interpretación de exámenes: $7 USD
// Comisión del dueño: $2 en especialistas | $1 en medicina general | $1 en exámenes

export const PRECIO_ESPECIALISTA = 18;
export const PRECIO_GENERAL = 9;
export const PRECIO_EXAMEN = 7;

// Comisión de la plataforma (para el dueño/admin)
export const COMISION_ESPECIALISTA = 2;   // $2 por consulta con especialista
export const COMISION_GENERAL = 1;        // $1 por consulta general
export const COMISION_EXAMEN = 1;         // $1 por interpretación de exámenes

// Especialidades que cobran tarifa de especialista
const ESPECIALIDADES_ESPECIALISTA = [
  'internista',
  'ginecología',
  'ginecologia',
  'pediatría',
  'pediatria',
  'cirugía general',
  'cirugia general',
  'diabetología',
  'diabetologia',
];

/**
 * Devuelve el precio de consulta según la especialidad del médico.
 * @param specialty Especialidad del médico
 * @returns Precio en USD
 */
export function getPrecioConsulta(specialty: string | null | undefined): number {
  if (!specialty) return PRECIO_GENERAL;
  const norm = specialty.toLowerCase().trim();
  return ESPECIALIDADES_ESPECIALISTA.includes(norm)
    ? PRECIO_ESPECIALISTA
    : PRECIO_GENERAL;
}

/**
 * Devuelve la comisión de la plataforma para una consulta según especialidad.
 */
export function getComisionConsulta(specialty: string | null | undefined): number {
  if (!specialty) return COMISION_GENERAL;
  const norm = specialty.toLowerCase().trim();
  return ESPECIALIDADES_ESPECIALISTA.includes(norm)
    ? COMISION_ESPECIALISTA
    : COMISION_GENERAL;
}

/**
 * Devuelve el monto que recibe el médico (precio total - comisión plataforma).
 */
export function getMontoMedico(total: number, commission: number): number {
  return total - commission;
}

/**
 * Indica si una especialidad corresponde a un especialista ($18 USD).
 */
export function esEspecialista(specialty: string | null | undefined): boolean {
  if (!specialty) return false;
  return specialty.toLowerCase().trim() !== 'medicina general';
}

/**
 * Formatea el precio como string legible.
 */
export function formatPrecio(amount: number): string {
  return `$${amount} USD`;
}
