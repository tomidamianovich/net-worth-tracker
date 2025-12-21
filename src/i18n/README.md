# Sistema de Internacionalización (i18n)

Sistema de traducciones para la aplicación. Actualmente solo soporta español, pero está diseñado para facilitar la adición de más idiomas en el futuro.

## Estructura

```
src/i18n/
├── translations/
│   └── es.ts          # Traducciones en español
├── hooks.ts           # Hook de React para usar traducciones
├── index.ts           # Funciones principales de i18n
└── README.md          # Esta documentación
```

## Uso Básico

### En Componentes React

```tsx
import { useTranslation } from "../../i18n/hooks";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("portfolio.title")}</h1>
      <p>{t("portfolio.subtitle")}</p>
    </div>
  );
}
```

### Fuera de Componentes React

```ts
import { t } from "./i18n";

const message = t("common.loading");
```

## Traducciones con Parámetros

Para traducciones que incluyen valores dinámicos:

```tsx
const { t } = useTranslation();

// En el archivo de traducciones:
// dataExported: "Datos exportados exitosamente a {path}"

// Uso:
t("messages.dataExported", { path: "/ruta/al/archivo" })
// Resultado: "Datos exportados exitosamente a /ruta/al/archivo"
```

### Pluralización Simple

Para casos simples de pluralización:

```tsx
// En el archivo de traducciones:
// cannotDelete: "No se puede eliminar: tiene {count} activo{plural} asociado{plural}"

// Uso:
t("categories.cannotDelete", { count: 1, plural: 1 })
// Resultado: "No se puede eliminar: tiene 1 activo asociado"

t("categories.cannotDelete", { count: 5, plural: 5 })
// Resultado: "No se puede eliminar: tiene 5 activos asociados"
```

## Estructura de Claves

Las claves de traducción están organizadas por sección:

- `common.*` - Textos comunes (botones, acciones, etc.)
- `nav.*` - Navegación
- `portfolio.*` - Vista de portfolio
- `analysis.*` - Vista de análisis
- `categories.*` - Gestión de categorías
- `evolution.*` - Evolución patrimonial
- `assetModal.*` - Modal de activos
- `stockModal.*` - Modal de stocks
- `movementModal.*` - Modal de movimientos
- `messages.*` - Mensajes del sistema

## Agregar Nuevas Traducciones

1. Abre `/src/i18n/translations/es.ts`
2. Agrega la nueva clave en la sección correspondiente:

```ts
export const es = {
  // ... otras traducciones
  portfolio: {
    // ... otras claves
    newKey: "Nuevo texto en español",
  },
};
```

3. Usa la nueva clave en tu componente:

```tsx
const { t } = useTranslation();
<p>{t("portfolio.newKey")}</p>
```

## Agregar un Nuevo Idioma

Para agregar soporte para otro idioma (por ejemplo, inglés):

1. Crea un nuevo archivo `/src/i18n/translations/en.ts`:

```ts
export const en = {
  common: {
    loading: "Loading...",
    // ... resto de traducciones
  },
  // ... resto de secciones
};
```

2. Actualiza `/src/i18n/index.ts`:

```ts
import { es } from "./translations/es";
import { en } from "./translations/en";

const translations = {
  es,
  en,
};

export type Language = "es" | "en";
```

3. Usa `setLanguage("en")` para cambiar el idioma:

```tsx
import { setLanguage } from "./i18n";

setLanguage("en"); // Cambia a inglés
```

## Mejores Prácticas

1. **Usa claves descriptivas**: `portfolio.title` es mejor que `title1`
2. **Agrupa por contexto**: Mantén las traducciones relacionadas juntas
3. **Evita texto hardcodeado**: Siempre usa `t()` para texto visible al usuario
4. **Documenta parámetros**: Si una traducción usa parámetros, documenta cuáles son
5. **Mantén consistencia**: Usa las mismas traducciones para conceptos similares

## Ejemplos Completos

### Botón con traducción

```tsx
<button onClick={handleSave}>
  {t("common.save")}
</button>
```

### Mensaje con parámetros

```tsx
alert(t("messages.dataExported", { path: filePath }));
```

### Confirmación

```tsx
if (confirm(t("portfolio.asset.deleteConfirm"))) {
  handleDelete();
}
```

### Título y subtítulo

```tsx
<div>
  <h1>{t("portfolio.title")}</h1>
  <p>{t("portfolio.subtitle")}</p>
</div>
```

