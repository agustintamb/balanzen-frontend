/** Email: formato estándar user@domain.tld */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Nombre / apellido: solo letras, espacios, guiones y apóstrofes */
export const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;

/** CUIT argentino: formato XX-XXXXXXXX-X */
export const CUIT_REGEX = /^\d{2}-\d{8}-\d$/;

/** Solo dígitos (teléfono, DNI) */
export const DIGITS_REGEX = /^\d+$/;
