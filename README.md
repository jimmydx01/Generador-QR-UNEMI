# Pases QR de acceso a módulos CRAI - UNEMI

Aplicación web estática para generar pases QR con un nombre y un módulo CRAI, y leerlos desde la cámara o desde una imagen.

## Requisitos

- Un navegador web moderno.
- Conexión a internet para cargar QRCode.js desde cdnjs al generar los pases.
- Permiso de cámara si se desea escanear en vivo. Los navegadores requieren HTTPS o `localhost` para habilitar la cámara.
- No requiere Node.js, npm ni un proceso de compilación.

## Ejecución local

Desde la carpeta del proyecto, inicia un servidor local:

```powershell
py -m http.server 5502
```

Abre estas direcciones en el navegador:

- Generador: <http://localhost:5502/generar.html>
- Módulos CRAI: <http://localhost:5502/modulos.html>
- Lector: <http://localhost:5502/lector.html>

También se puede usar la extensión Live Server de VS Code. La configuración local establece el puerto `5502`.

## Uso

1. En **Módulos CRAI**, elige **Generar pase de acceso** junto al módulo deseado. También puedes abrir directamente el generador.
2. Escribe el nombre que aparecerá en la bienvenida y selecciona el módulo.
3. Pulsa **Generar pase QR**. El módulo queda preseleccionado si llegaste desde su tarjeta.
4. Descarga el PNG o deja el código visible en pantalla.
5. En **Lector QR**, activa la cámara y apunta al código. Si no puedes usar la cámara, carga una imagen del QR.
6. Cuando se reconozca el pase, el lector muestra el nombre, el módulo y el botón **Continuar al módulo**.

## Módulos incluidos

- Servicios bibliotecarios: <https://www.unemi.edu.ec/index.php/crai/servicios-bibliotecarios/>
- KOHA, catálogo bibliográfico: <http://koha.unemi.edu.ec/>
- UTECA, biblioteca digital: <https://uteca.unemi.edu.ec/>
- Repositorio institucional: <https://repositorio.unemi.edu.ec/>
- Recursos electrónicos: <https://login.proxy.unemi.edu.ec/login>

Algunos servicios pueden solicitar credenciales institucionales.

## Archivos principales

- `generar.html`: formulario y vista previa del pase.
- `modulos.html`: lista de servicios CRAI y enlaces para generar pases.
- `lector.html`: lector de cámara e imágenes y resultado de bienvenida.
- `estilos.css`: estilos compartidos.
- `asset/js/index.js`: creación y descarga del pase.
- `asset/js/lector.js`: lectura y validación del formato del pase.
- `asset/plugin/qrCode.min.js`: librería local de decodificación QR.

## Límite de seguridad

El nombre se escribe en el formulario y se guarda en el QR. El lector comprueba el formato y el módulo, pero **no verifica la identidad de la persona ni autoriza el acceso**. El código puede copiarse o generarse fuera de la aplicación. Para controlar el ingreso real a una biblioteca o plataforma se necesita autenticación y validación en un servidor institucional.
