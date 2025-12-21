export const es = {
  // Common
  common: {
    loading: "Cargando...",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Añadir",
    update: "Actualizar",
    create: "Crear",
    close: "Cerrar",
    confirm: "Confirmar",
    yes: "Sí",
    no: "No",
    optional: "Opcional",
    required: "Requerido",
    actions: "Acciones",
  },

  // Navigation
  nav: {
    portfolio: "Portfolio",
    analysis: "Análisis",
    categories: "Categorías",
    evolution: "Evolución",
    import: "Importar",
    export: "Exportar",
  },

  // Portfolio
  portfolio: {
    title: "Portfolio de Acciones",
    subtitle: "Resumen general de tu cartera",
    totalValue: "VALOR TOTAL",
    variation: "Variación €",
    portfolioPercentage: "% Cartera",
    empty: "No hay activos en esta categoría",
    filters: {
      all: "Todos",
    },
    asset: {
      variation: "VARIACIÓN",
      portfolioPercentage: "% CARTERA",
      cost: "COSTE",
      purchaseValue: "VALOR COMPRA",
      currentValue: "VALOR ACTUAL",
      edit: "Editar",
      delete: "Eliminar",
      deleteConfirm: "¿Estás seguro de que quieres eliminar este activo?",
    },
  },

  // Analysis
  analysis: {
    title: "Análisis de Portfolio",
    subtitle: "Distribución por tipo de activo",
    totalPortfolio: "Total Portfolio",
    distribution: "Distribución",
    empty: "No hay activos para analizar",
    loading: "Cargando análisis...",
  },

  // Categories
  categories: {
    title: "Gestión de Categorías",
    addNew: "Nueva Categoría",
    edit: "Editar Categoría",
    empty: "No hay categorías. Crea una nueva para comenzar.",
    loading: "Cargando categorías...",
    code: "Código (Tipo)",
    codePlaceholder: "Ej: ACCION, ETF",
    codeMaxLength: "Máximo 20 caracteres, se convertirá a mayúsculas",
    codeReadonly: "El código no se puede modificar después de crear la categoría",
    name: "Nombre",
    namePlaceholder: "Ej: Acciones, ETFs",
    color: "Color",
    colorPlaceholder: "#808080",
    deleteConfirm: "¿Estás seguro de que quieres eliminar esta categoría? Los activos que usen esta categoría no se verán afectados.",
    cannotDelete: "No se puede eliminar: tiene {count} activo{plural} asociado{plural}",
    errorLoading: "Error al cargar categorías. Por favor, inténtalo de nuevo.",
    errorSaving: "Error al guardar categoría",
    errorDeleting: "Error al eliminar categoría",
  },

  // Evolution
  evolution: {
    title: "Evolución Patrimonial",
    addNew: "Nuevo Registro",
    edit: "Editar Registro",
    empty: "No hay registros. Crea un nuevo registro para comenzar.",
    loading: "Cargando evolución patrimonial...",
    year: "Año",
    month: "Mes",
    day: "Día",
    patrimony: "Patrimonio",
    detail: "Detalle",
    variation: "Variación",
    avgMonthlyVariation: "Promedio Mensual Variación",
    totalAccumulated: "Total Acumulado",
    actions: "Acciones",
    link: "LINK",
    patrimonyPositive: "El patrimonio debe ser un número positivo",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este registro?",
    errorSaving: "Error al guardar registro",
    errorDeleting: "Error al eliminar registro",
    chartTitle: "Evolución Acumulada",
    placeholder: "0.00",
    months: {
      january: "Enero",
      february: "Febrero",
      march: "Marzo",
      april: "Abril",
      may: "Mayo",
      june: "Junio",
      july: "Julio",
      august: "Agosto",
      september: "Septiembre",
      october: "Octubre",
      november: "Noviembre",
      december: "Diciembre",
    },
  },

  // Asset Modal
  assetModal: {
    add: "Añadir Activo",
    edit: "Editar Activo",
    concept: "Concepto",
    conceptPlaceholder: "Ej: BTC, GOLD, Metalico EURO",
    quantity: "Cantidad",
    value: "Valor (Precio de compra por unidad)",
    unitValue: "Valor Unitario (Precio actual por unidad)",
    type: "Tipo",
    placeholderCrypto: "0.00000",
    placeholderDefault: "0.00",
    validation: {
      conceptRequired: "El concepto es obligatorio",
      quantityPositive: "La cantidad debe ser un número positivo",
      valuePositive: "El valor debe ser un número positivo o cero",
      unitValuePositive: "El valor unitario debe ser un número positivo o cero",
      allFieldsRequired: "Por favor completa todos los campos correctamente",
    },
    errorSaving: "Error al guardar el activo",
    errorDeleting: "Error al eliminar el activo. Por favor, inténtalo de nuevo.",
    assetTypes: {
      action: "Acción",
      etf: "ETF",
      crypto: "Cripto",
      fiat: "Fiat",
      deposit: "Depósito",
    },
  },

  // Stock Modal
  stockModal: {
    add: "Añadir Stock",
    symbol: "Símbolo",
    name: "Nombre",
    exchange: "Exchange",
    notes: "Notas",
  },

  // Stock List
  stockList: {
    empty: "No hay stocks",
  },

  // Stock Detail
  stockDetail: {
    addMovement: "Añadir Movimiento",
    movements: "Movimientos",
    empty: "No hay movimientos",
    date: "Fecha",
    type: "Tipo",
    quantity: "Cantidad",
    price: "Precio",
    fees: "Comisiones",
    actions: "Acciones",
  },

  // Movement Modal
  movementModal: {
    add: "Añadir Movimiento",
    addWithSymbol: "Añadir Movimiento - {symbol}",
    type: "Tipo",
    typeBuy: "Compra",
    typeSell: "Venta",
    quantity: "Cantidad",
    price: "Precio",
    date: "Fecha",
    fees: "Comisiones",
    notes: "Notas",
  },

  // Messages
  messages: {
    electronNotAvailable: "Error: La aplicación no está ejecutándose en Electron.",
    dataExported: "Datos exportados exitosamente a {path}",
    dataImported: "¡Datos importados exitosamente!",
    importConfirm: "Esto reemplazará todos los datos existentes. ¿Estás seguro?",
    exportFailed: "Error al exportar datos. Por favor, inténtalo de nuevo.",
    importFailed: "Error al importar datos. Por favor, inténtalo de nuevo.",
    errorLoading: "Error al cargar datos",
    errorGeneric: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
  },
};

export type TranslationKey = keyof typeof es;

