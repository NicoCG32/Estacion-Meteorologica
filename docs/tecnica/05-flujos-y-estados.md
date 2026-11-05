# 05 · Flujos, secuencias y estados

Los diagramas siguen la adquisición, la escritura y la consulta. El firmware realiza un intento de envío por lote aceptado y carece de cola durable de reintentos.

## Secuencia: de la muestra a `201`

```mermaid
sequenceDiagram
  participant S as Sensores
  participant E as ESP32-S3
  participant A as Express
  participant V as Validación y anomalías
  participant J as JSONL
  participant B as Navegador
  loop Cada ~2 s (según loop)
    E->>S: Leer sensores y GPS
    S-->>E: Valores / faltantes
  end
  E->>E: Agregar ~20 s y fusionar
  alt Salto sospechoso según firmware
    E->>E: Descartar lote (sin POST)
  else Lote no descartado
    E->>A: POST /api/mediciones (HTTP JSON)
    A->>V: Validar entrada y comparar con anterior
    V-->>A: Registro con ID, fecha y marca
    A->>J: Append en cola y cerrar archivo
    alt Escritura confirmada
      J-->>A: OK
      A->>A: Publicar en memoria
      A-->>E: 201 con registro
    else Error de escritura
      J-->>A: Error
      A-->>E: 500 o 503
    end
  end
  B->>A: GET /api/status y /api/mediciones?limit=60
  A-->>B: Estado y ventana reciente
  B->>B: Mostrar datos y vigencia
```

## Máquina de estados: un intento de ingreso (backend)

```mermaid
stateDiagram-v2
  [*] --> Recibida
  Recibida --> Rechazada: Contrato inválido
  Recibida --> EnCola: Validación OK
  EnCola --> Escribiendo: Turno de append
  Escribiendo --> Confirmada: Cierre de archivo correcto
  Escribiendo --> Recuperable: Fallo, rollback correcto
  Escribiendo --> Bloqueada: Fallo y rollback fallido
  Recuperable --> [*]: Error HTTP
  Rechazada --> [*]: 4xx
  Confirmada --> [*]: Publicar memoria y responder 201
  Bloqueada --> [*]: 503 y revisión manual
```

`Bloqueada` corresponde a la variable interna `writeBlocked` del proceso. No hay una tabla persistente con esos estados ni un sistema de reintentos automáticos.

## Máquina de estados: lo que ve el dashboard

```mermaid
stateDiagram-v2
  [*] --> Cargando
  Cargando --> SinDatos: GET OK y último nulo
  Cargando --> Vigente: GET OK y muestra reciente
  Cargando --> Antiguo: GET OK y más de 90 s
  Cargando --> FechaIncierta: Fecha inválida o más de 10 s en el futuro
  Cargando --> Error: Error HTTP o de red
  SinDatos --> Vigente: Llega muestra
  Vigente --> Antiguo: Supera 90 s
  Antiguo --> Vigente: Llega muestra nueva
  Vigente --> Error: Falla consulta
  Antiguo --> Error: Falla consulta
  Error --> Vigente: Recuperación con muestra reciente
  Error --> Antiguo: Recuperación con muestra antigua
  Error --> SinDatos: Recuperación sin registros
```

El frontend conserva los valores previos cuando la consulta falla, **sin presentarlos como datos actuales**. DHT22 no se verifica individualmente desde el backend. Fuente: [`state.mjs`](../../backend/frontend/assets/js/state.mjs) y [`render.mjs`](../../backend/frontend/assets/js/render.mjs).

## Flujo de exportación

```mermaid
flowchart LR
  U["Usuario fija rango y formato"] --> API["GET /api/mediciones/export"]
  API --> F["Abrir historial JSONL"]
  F --> P["Parsear y filtrar fecha"]
  P --> C{"¿CSV o JSONL?"}
  C -->|CSV| CSV["Escapar celdas y enviar CSV"]
  C -->|JSONL| JSONL["Enviar JSONL"]
  CSV --> D["Descarga en navegador"]
  JSONL --> D
```

No hay filtrado ni paginación por base SQL. La lectura de exportación es secuencial y omite líneas que no contienen objetos JSON válidos.
