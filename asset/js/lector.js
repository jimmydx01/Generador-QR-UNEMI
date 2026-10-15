"use strict";

const video = document.getElementById("video");
const canvas = document.getElementById("qr-canvas");
const contexto = canvas.getContext("2d");
const botonCamara = document.getElementById("btn-camara");
const entradaArchivo = document.getElementById("archivo-qr");
const estadoLector = document.getElementById("estado-lector");
const resultadoAcceso = document.getElementById("resultado-acceso");
const bienvenida = document.getElementById("bienvenida");
const moduloBienvenida = document.getElementById("modulo-bienvenida");
const enlaceContinuar = document.getElementById("continuar-modulo");
const modulosPermitidos = {
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
let flujoVideo;
let escaneando = false;
let urlImagen;

function detenerCamara() {
  escaneando = false;
  if (flujoVideo) {
    flujoVideo.getTracks().forEach((pista) => pista.stop());
    flujoVideo = null;
  }
  video.pause();
  video.srcObject = null;
  video.hidden = true;
  botonCamara.disabled = false;
  botonCamara.textContent = "Activar cámara";
}

function mostrarPase(contenido) {
  if (urlImagen) {
    URL.revokeObjectURL(urlImagen);
    urlImagen = null;
  }

  if (contenido instanceof Error || typeof contenido !== "string") {
    estadoLector.textContent =
      "No se pudo leer la imagen. Prueba con otra captura más nítida.";
    return;
  }

  const [marca, idModulo, ...partesNombre] = contenido.split("|");
  let nombre;
  try {
    nombre = decodeURIComponent(partesNombre.join("|")).trim();
  } catch (error) {
    estadoLector.textContent = "El nombre del pase no tiene un formato válido.";
    return;
  }
  const modulo = marca === "UNEMI1" ? modulosPermitidos[idModulo] : null;

  if (!modulo || !nombre) {
    estadoLector.textContent =
      "Este código no es un pase de acceso personalizado de UNEMI.";
    return;
  }

  detenerCamara();
  bienvenida.textContent = `Bienvenido, ${nombre}.`;
  moduloBienvenida.textContent = `Estás ingresando al módulo: ${modulo.nombre}.`;
  enlaceContinuar.href = modulo.url;
  resultadoAcceso.hidden = false;
  estadoLector.textContent =
    "Pase reconocido. Confirma para continuar al módulo.";
}

function escanearFotograma() {
  if (!escaneando) {
    return;
  }

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    contexto.drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
      qrcode.decode();
    } catch (error) {}
  }

  window.setTimeout(escanearFotograma, 300);
}

if (typeof qrcode !== "undefined") {
  qrcode.callback = mostrarPase;
} else {
  estadoLector.textContent =
    "No se pudo cargar el lector QR. Recarga la página e inténtalo de nuevo.";
}

botonCamara.addEventListener("click", async () => {
  if (typeof qrcode === "undefined") {
    estadoLector.textContent = "El lector QR no está disponible.";
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    estadoLector.textContent =
      "La cámara requiere HTTPS o localhost. Puedes cargar una captura del QR.";
    return;
  }

  botonCamara.disabled = true;
  estadoLector.textContent = "Solicitando permiso para usar la cámara...";
  try {
    flujoVideo = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "environment" } },
    });
    video.srcObject = flujoVideo;
    video.hidden = false;
    await video.play();
    escaneando = true;
    botonCamara.textContent = "Cámara activa";
    estadoLector.textContent = "Apunta la cámara al pase QR.";
    escanearFotograma();
  } catch (error) {
    detenerCamara();
    estadoLector.textContent =
      "No se pudo acceder a la cámara. Revisa el permiso o carga una captura del QR.";
  }
});

entradaArchivo.addEventListener("change", () => {
  const archivo = entradaArchivo.files?.[0];
  if (!archivo || typeof qrcode === "undefined") {
    return;
  }

  detenerCamara();
  resultadoAcceso.hidden = true;
  if (urlImagen) {
    URL.revokeObjectURL(urlImagen);
  }
  urlImagen = URL.createObjectURL(archivo);
  estadoLector.textContent = "Leyendo el código QR de la imagen...";
  try {
    qrcode.decode(urlImagen);
  } catch (error) {
    estadoLector.textContent = "No se detectó un código QR en esa imagen.";
  }
});
