# SonarQube Cloud — Guía y checklist

Objetivo: que cada cambio pase el **Quality Gate default de SonarQube Cloud** sin issues nuevos. Esta guía traduce ese gate a reglas concretas con ejemplos del propio proyecto.

El Quality Gate default evalúa **código nuevo**:
- 0 bugs nuevos
- 0 vulnerabilidades nuevas
- Todos los security hotspots nuevos revisados
- Deuda técnica (code smells) baja
- **≥ 80 % de cobertura** en código nuevo
- **≤ 3 % de duplicación** en código nuevo

---

## 1. Reliability (Bugs)

### Referencias nulas — siempre con guard
El backend manda campos opcionales (`updated_at?`, `photo_url?`). Las queries devuelven `undefined` mientras cargan.

```ts
// ❌ MAL — peta si data aún no llegó
const total = data.pagination.total;

// ✅ BIEN — patrón usado en todo el repo
const total = data?.pagination.total ?? 0;
const pubs = publicationsData?.publications ?? [];
const businessName =
  user?.business_name ??
  `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
```

### Igualdad estricta
```ts
if (activeFilter === "ALL") { }   // ✅ siempre ===
```

### Fechas y orden — no mutar
```ts
return [...filtered].sort((a, b) => /* ... */);   // ✅ copia antes de sort
```

### Promises — manejar el error
Las mutations ya tienen manejo global de error (ver §2). Para promises sueltas, `try/catch` o `.catch`. Nunca dejar una promise sin manejar.

---

## 2. Security (Vulnerabilities + Hotspots)

- **Sin secrets hardcodeados.** Tokens, API keys y URLs sensibles van en `config/env.ts` (validado) vía variables de entorno. Nunca un literal en el código.
- **Tokens solo en SecureStore.** Se persisten con `persistSession` → `expo-secure-store`. Jamás en AsyncStorage ni en estado plano logueado.
- **Sin `eval` / `new Function`** con strings dinámicos.
- **Sin logs sensibles.** No loguear tokens, passwords ni PII. El lint ya bloquea `console.log` (`no-console: warn`, solo `console.error` permitido) — no dejar ningún `console.log` de debug.
- **El error global no expone datos del usuario:** `QueryProvider` muestra `error.message` (mensaje del backend), no el objeto completo.

---

## 3. Maintainability (Code Smells)

| Regla | Límite | Cómo cumplir |
|-------|--------|--------------|
| Complejidad cognitiva por función | **≤ 15** | Extraer sub-funciones / helpers puros a `utils` o `lib` |
| Líneas por función | **≤ 75** | La lógica va al hook; el JSX se parte en sub-componentes |
| Líneas por archivo | **≤ 400** | Partir componentes grandes en `components/{Feature}/` |
| Duplicación | **≤ 3 %** | Bloques repetidos (>10 líneas) → función compartida en `utils/` |
| `any` | **0** | Tipar explícito; `unknown` + type guard; genéricos (`FilterOption<T>`) |
| Variables/imports sin usar | **0** | El lint los marca; correr `npm run lint` |
| `TODO`/`FIXME`/`HACK` | **0** en commit | Resolver o abrir issue, no dejar en código |
| Shadowing de variables | **0** | No redeclarar un nombre que ya existe en scope padre |

### Complejidad: extraer en vez de anidar
```ts
// ❌ MAL — todo el armado de params inline con ternarios anidados
const params = activeFilter !== "all"
  ? dateFilter !== "all"
    ? { status: activeFilter, ...getDateRange(dateFilter) }
    : { status: activeFilter }
  : dateFilter !== "all" ? getDateRange(dateFilter) : {};

// ✅ BIEN — helper puro en lib/{rol}/{feature}/utils.ts
export const buildOrderFilterParams = (
  activeFilter: ConsumerOrderFilter,
  dateFilter: DateRangeFilter,
) => ({
  ...(activeFilter !== "all" ? { status: activeFilter } : {}),
  ...getDateRange(dateFilter),
});
```

### Duplicación: subir a `utils/`
`sortAndSearchOrders` vive en `utils/orders.ts` y tanto consumer como commerce lo reutilizan (con un wrapper tipado en `lib/`). No copiar el mismo sort en dos hooks.

### Sin `any`: genéricos
```ts
// ❌ const FILTERS: any[]
// ✅
export const FILTERS: FilterOption<ConsumerOrderFilter>[] = [ /* ... */ ];
```

---

## 4. Coverage (≥ 80 % en código nuevo)

`collectCoverageFrom` (en `package.json`) cubre `app`, `api`, `components`, `hooks`, `stores`, `utils`, `providers`, `config`. Excluidos: `__tests__`, `*.types.ts`, `__test-utils__`, `types/`.

Qué testear sí o sí al agregar código:
- **Service nuevo** → `api/{domain}/__tests__/{domain}.service.test.ts` (un `describe` por método, casos éxito + error + cada status).
- **Hook de dominio nuevo** → `hooks/__tests__/useDomain.test.ts` con `createWrapper()`.
- **Hook de screen** → `__tests__/useXxxScreen.test.ts` (estado inicial, cada handler, derivados, `default export` retorna null).
- **Componente** → render + interacción (`fireEvent.press`) + cada variante/estado.
- **Util** → `utils/__tests__/` con casos borde (`undefined`, vacío, límites).

Para ver qué líneas faltan: `npm run test:coverage` (hay además `scripts/show-uncovered.js`).

Estrategia que mantiene la cobertura alta **sin esfuerzo extra**: como la lógica vive en hooks/utils puros, se cubre con tests baratos; el `.tsx` queda casi sin ramas que cubrir.

---

## 5. Antes de dar una tarea por terminada — checklist

1. `npm run lint` sin errores (incluye Prettier y no-unused).
2. `npm run test:coverage` — verde y sin bajar cobertura del código tocado (objetivo ≥ 80 %).
3. Ningún `console.log` de debug, ningún import/variable sin usar.
4. Ninguna función supera complejidad 15 ni 75 líneas; ningún archivo supera 400.
5. Sin `any`; tipos de retorno explícitos en funciones exportadas.
6. Sin bloques duplicados (>10 líneas) — extraídos a `utils/`.
7. Sin secrets ni datos sensibles en el código.

---

## Config relacionada

- **ESLint** (`eslint.config.js`): `prettier/prettier: error`, `no-console: ["warn", { allow: ["error"] }]`. Tests relajan `no-require-imports`.
- **Prettier** (`.prettierrc`): orden de imports con `@ianvs/prettier-plugin-sort-imports`. Ante la duda, `npm run format`.
- **Jest** (`package.json`): `jest-expo`, `TZ=UTC`, reporters `text/html/lcov` (`lcov` es el que sube a SonarCloud).
</content>
