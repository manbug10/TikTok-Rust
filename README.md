# 🔑 TikTok Rust — Generador de Clave de Stream TikTok

[![Build Windows](https://github.com/manbug10/TikTok-Rust/actions/workflows/build-windows.yml/badge.svg)](https://github.com/manbug10/TikTok-Rust/actions/workflows/build-windows.yml)

Reconstrucción nativa en **Rust + Tauri v2 + React + Tailwind CSS** del generador de
**TikTok Live Stream Key para OBS Studio** (proyecto original en Python/PySide6 de
[Loukious](https://github.com/Loukious/StreamlabsTikTokStreamKeyGenerator)).

Obtiene la clave de stream de TikTok Live a través de la API de Streamlabs y la entrega
lista para pegar en OBS Studio.

## ✨ Funciones

| Función | Descripción |
|---|---|
| 🔐 Token local | Escanea el token de Streamlabs Desktop desde el almacenamiento local (Windows/macOS) |
| 🌐 Login web | Inicio de sesión OAuth con Streamlabs (PKCE) sin instalar nada |
| 👤 Info de cuenta | Usuario, estado y si puede transmitir |
| 🎮 Categorías | Búsqueda de categorías de juego de TikTok Live |
| 📡 Iniciar Live | Obtiene URL RTMP + clave de stream con audiencia normal o adulta (18+) |
| 🛑 Finalizar Live | Cierra la sesión de transmisión |
| 📋 Copiar | URL RTMP y clave al portapapeles con un clic |
| 💾 Configuración persistente | Título, categoría y audiencia se guardan localmente |
| 🔄 Actualizaciones | Comprueba nuevas versiones en GitHub |
| 🇪🇸 Interfaz en español | Tema oscuro moderno con acentos TikTok (cian/rosa) |

## 📦 Descargar (Windows)

Ve a la sección [**Releases**](https://github.com/manbug10/TikTok-Rust/releases) y descarga:

- `TikTok Stream Key Generator_<versión>_x64-setup.exe` — instalador NSIS (recomendado)
- `TikTok Stream Key Generator_<versión>_x64_en-US.msi` — instalador MSI

Los instaladores se generan automáticamente con **GitHub Actions** en cada push a `main`.

> ⚠️ Binarios sin firmar: Windows SmartScreen puede mostrar una advertencia.
> Elige **Más información → Ejecutar de todas formas**.

## 🛠️ Compilar desde cero (Windows)

Requisitos previos: **Node.js 20+**, **Rust stable (MSVC)** y **WebView2**.

```bash
npm install
npm run tauri build
# Instaladores en: src-tauri/target/release/bundle/
```

## 🚀 CI/CD

El workflow [`.github/workflows/build-windows.yml`](.github/workflows/build-windows.yml)
compila la app en `windows-latest`, publica los artefactos (NSIS + MSI) y crea un
**GitHub Release** con la versión de `package.json` (etiqueta `v*.*.*`).

## 📋 Uso

1. **Cargar token**: desde el PC (con Streamlabs Desktop instalado) o desde la Web
   (inicio de sesión con Streamlabs, 2 pasos).
2. Escribir el **título** de la transmisión y buscar la **categoría** del juego.
3. Elegir la **audiencia** (normal o 18+).
4. **Iniciar Live** → copiar la **clave de stream** y pegarla en OBS Studio
   (Ajustes → Transmitir → Servidor: URL RTMP, Clave de stream).
5. Cuando termines, **Finalizar Live** desde la app.

## 🏗️ Arquitectura

```
src/                    Frontend React 18 + Tailwind CSS 4 (TypeScript estricto)
src-tauri/src/          Backend Rust (Tauri v2)
  ├─ stream.rs          API de Streamlabs (info, categorías, start/end)
  ├─ token_retriever.rs Escaneo de token en LevelDB de Streamlabs Desktop
  ├─ local_token.rs     Servidor local OAuth PKCE + intercambio de código
  ├─ updater.rs         Comprobador de versiones (GitHub Releases)
  ├─ config.rs          Configuración persistente (JSON en app_data)
  └─ commands.rs        Los 10 comandos Tauri expuestos al frontend
```

## ⚠️ Aviso

Herramienta no oficial. No está afiliada a TikTok ni a Streamlabs. Úsala bajo tu
propia responsabilidad y respetando los términos de servicio de ambas plataformas.

## 🙏 Créditos

- **Proyecto original (Python/PySide6)**: [Loukious](https://github.com/Loukious/StreamlabsTikTokStreamKeyGenerator)
- **Rebuild en Rust/Tauri**: [@manbug10](https://github.com/manbug10)

## 📄 Licencia

[MIT](LICENSE)
