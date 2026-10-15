"use strict";

const formulario = document.getElementById("formulario");
const entradaNombre = document.getElementById("nombre");
const selectorModulo = document.getElementById("modulo");
const contenedorQR = document.getElementById("contenedorQR");
const estado = document.getElementById("estado");
const botonDescarga = document.getElementById("btn-download");
const modulos = {
  "servicios-bibliotecarios": {
    nombre: "Servicios bibliotecarios",
    url: "https://www.unemi.edu.ec/index.php/crai/servicios-bibliotecarios/",
  },
  koha: {
    nombre: "KOHA - Catálogo bibliográfico",
    url: "http://koha.unemi.edu.ec/",
  },
  uteca: {
    nombre: "UTECA - Biblioteca digital",
    url: "https://uteca.unemi.edu.ec/",
  },
  repositorio: {
    nombre: "Repositorio institucional",
    url: "https://repositorio.unemi.edu.ec/",
  },
  "recursos-electronicos": {
    nombre: "Recursos electrónicos",
    url: "https://login.proxy.unemi.edu.ec/login",
  },
};
let paseGenerado;

function limpiarCodigo() {
  contenedorQR.replaceChildren();
  botonDescarga.disabled = true;
  paseGenerado = null;
}

function generarCodigoQR() {
  limpiarCodigo();
  const nombre = entradaNombre.value.trim();
  const modulo = modulos[selectorModulo.value];

  if (!nombre || !modulo) {
    estado.textContent = "Escribe tu nombre y selecciona un módulo.";
    return;
  }

  if (typeof QRCode === "undefined") {
    estado.textContent =
      "No se pudo cargar el generador. Comprueba tu conexión e inténtalo de nuevo.";
    return;
  }

  paseGenerado = {
    nombre,
    modulo: { id: selectorModulo.value },
  };

  try {
    new QRCode(contenedorQR, {
      text: `UNEMI1|${paseGenerado.modulo.id}|${encodeURIComponent(paseGenerado.nombre)}`,
      width: 240,
      height: 240,
      colorDark: "#172a45",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M,
    });
    estado.textContent = `Pase generado para ${nombre}: ${modulo.nombre}. Escanéalo con el lector QR.`;
    botonDescarga.disabled = false;
  } catch (error) {
    limpiarCodigo();
    estado.textContent =
      "No se pudo generar el pase QR. Revisa el nombre e inténtalo de nuevo.";
  }
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  generarCodigoQR();
});

entradaNombre.addEventListener("input", limpiarCodigo);
selectorModulo.addEventListener("change", limpiarCodigo);

const moduloSolicitado = new URLSearchParams(window.location.search).get(
  "modulo",
);
if (moduloSolicitado && Object.hasOwn(modulos, moduloSolicitado)) {
  selectorModulo.value = moduloSolicitado;
}

botonDescarga.addEventListener("click", () => {
  if (!paseGenerado) {
    return;
  }

  const canvas = contenedorQR.querySelector("canvas");
  const imagen = contenedorQR.querySelector("img");
  const imagenQR = canvas ? canvas.toDataURL("image/png") : imagen?.src;

  if (!imagenQR) {
    estado.textContent = "No se encontró el código QR para descargar.";
    return;
  }

  const enlaceDescarga = document.createElement("a");
  enlaceDescarga.href = imagenQR;
  enlaceDescarga.download = `pase-${paseGenerado.modulo.id}.png`;
  document.body.append(enlaceDescarga);
  enlaceDescarga.click();
  enlaceDescarga.remove();
});
