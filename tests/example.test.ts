import { describe, it, expect } from 'vitest';

describe('Ejemplo básico de prueba', () => {
  it('debe sumar correctamente dos números', () => {
    const suma = 2 + 2;
    expect(suma).toBe(4);
  });

  it('debe verificar igualdad de cadenas', () => {
    expect('carmen-alerta').toBe('carmen-alerta');
  });
});
