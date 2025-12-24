# Net Worth Tracker

Aplicación Electron para gestionar y hacer seguimiento de tu patrimonio neto, activos y portfolio.

## Características

- **Portfolio de Activos**: Visualiza todos tus activos en una tabla con cálculos automáticos de variaciones y porcentajes del portfolio
- **Gestión de Stocks**: Añade y gestiona stocks con sus movimientos (compras/ventas)
- **Base de datos local**: Almacenamiento seguro con SQLite y encriptación
- **Exportar/Importar**: Guarda y restaura tus datos

# Imagenes

![Uploading Captura desde 2025-12-24 17-19-19.png…]()

![Uploading Captura desde 2025-12-24 17-19-46.png…]()

<img width="1920" height="1017" alt="Captura desde 2025-12-24 17-20-01" src="https://github.com/user-attachments/assets/5e5be689-0dc9-4b3f-9d21-9baf7dfa2fec" />



## Instalación

```bash
pnpm install
```

## Desarrollo

```bash
pnpm dev
```

Esto iniciará:

- Vite dev server en http://localhost:5173
- Electron app

## Build

```bash
pnpm build
```

Esto compilará:

- El código del renderer (React) en `dist/`
- El código del main process (Electron) en `dist/main/`

## Estructura del Proyecto

```
├── electron/          # Código del main process
│   ├── main.ts       # Punto de entrada de Electron
│   ├── preload.ts    # Preload script
│   ├── database.ts   # Lógica de base de datos
│   └── services/    # Servicios de negocio
├── src/              # Código del renderer (React)
│   ├── components/  # Componentes React
│   ├── App.tsx      # Componente principal
│   └── main.tsx     # Punto de entrada de React
└── dist/             # Archivos compilados
```

## Tecnologías

- **Electron**: Framework para aplicaciones de escritorio
- **React**: Biblioteca UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **better-sqlite3**: Base de datos SQLite
- **SQLite**: Base de datos local

## Licencia

MIT
