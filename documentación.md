# Documentacion de la pagina web

## 1. Instrucciones de inicio de la pagina web

La pagina web principal se encuentra en el archivo `index.html`. Para iniciarla en local basta con abrir directamente el archivo `index.html` en el navegador.

La pagina principal carga los estilos desde `style.css` y la logica interactiva desde `script.js`:

```html
<link rel="stylesheet" href="style.css">
<script src="script.js"></script>
```

La parte de compra y gestion de pedidos funciona como frontend estatico conectado a Firebase Firestore mediante `firebase-config.js`. Ademas, los pedidos pueden reflejarse en VS Code mediante `pedidos-vscode.json`, que se genera desde un script local de sincronizacion.

## 2. Enumeracion de funcionalidades

1. Pasar los personajes de normal a zombie.
2. Fondo de la pagina web.
3. Cambio de la palabra `Caracteristicas` a `Zombies` y `Etapas`.
4. Zombies en 3D mediante secuencia animada de imagenes.
5. Recuadro que cambia de color al pulsarlo o interactuar con el.
6. Caja fuerte de acceso. (CONTRASEÃ‘A 11 10 95)
7. Flecha lateral para volver al panel superior de la pagina.

## 3. Funcionalidades

## Pasar los personajes de normal a zombie

### 3.1 Descripcion del comportamiento

Esta funcionalidad permite que las tarjetas de los personajes muestren su version normal y, al pasar el raton por encima de la imagen, aparezca una zona circular donde se ve la version zombie. El efecto sigue la posicion del cursor, de forma que parece una linterna o mascara que revela la transformacion infectada del personaje.

### 3.2 Explicacion del funcionamiento

Cada personaje tiene una imagen base normal y encima una capa con la imagen zombie. La capa zombie esta oculta inicialmente con `opacity: 0`. Cuando el usuario entra con el raton en la imagen, JavaScript cambia la opacidad a `1`. Mientras mueve el raton, se actualizan dos variables CSS (`--mx` y `--my`) con la posicion exacta del cursor dentro del contenedor.

CSS usa esas variables para crear una mascara radial. Esa mascara solo deja visible una zona circular de la imagen zombie, ocultando el resto.

### 3.3 Fragmentos de codigo relevantes

Fragmento HTML de una tarjeta:

```html
<div class="img-wrapper" data-wrapper="joel">
  <img src="JoelMiller.png" alt="Joel Miller" class="img-base">
  <div class="zombie-mask" data-mask="joel">
    <img src="JoelMillerZombie.png" alt="Joel Zombie" class="img-zombie">
  </div>
</div>
```

Este bloque crea dos capas: `img-base` muestra el personaje normal y `zombie-mask` contiene la version zombie. Los atributos `data-wrapper` y `data-mask` sirven para que JavaScript pueda encontrar cada pareja de elementos.

Fragmento CSS de la mascara:

```css
.zombie-mask {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(circle 80px at var(--mx, -200px) var(--my, -200px), black 40%, transparent 70%);
  mask-image: radial-gradient(circle 80px at var(--mx, -200px) var(--my, -200px), black 40%, transparent 70%);
}
```

La propiedad `mask-image` crea un circulo visible de 80px en la posicion indicada por `--mx` y `--my`. Fuera de ese circulo, la capa zombie queda transparente.

Fragmento JavaScript:

```js
function setupZombieMask(wrapperId, maskId) {
  const wrapper = document.querySelector(`[data-wrapper="${wrapperId}"]`);
  const mask = document.querySelector(`[data-mask="${maskId}"]`);
  if (!wrapper || !mask) return;

  wrapper.addEventListener('mouseenter', () => {
    mask.style.opacity = '1';
  });

  wrapper.addEventListener('mouseleave', () => {
    mask.style.opacity = '0';
    mask.style.setProperty('--mx', '-200px');
    mask.style.setProperty('--my', '-200px');
  });

  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    mask.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    mask.style.setProperty('--my', (e.clientY - rect.top) + 'px');
  });
}
```

Este metodo conecta los eventos del raton con la mascara. `mouseenter` muestra la imagen zombie, `mouseleave` la oculta y `mousemove` calcula la posicion relativa del cursor dentro de la tarjeta.

## 4. Fondo de la pagina web

### 4.1 Descripcion del comportamiento

El fondo de la pagina crea una atmosfera oscura, infectada y relacionada con The Last of Us. Tiene tonos verdes, marrones, sombras, ruido visual y una sensacion de contaminacion por Cordyceps.

### 4.2 Explicacion del funcionamiento

El fondo se construye combinando varias capas CSS. Primero, `body` define el color general mediante la variable `--bg`. Despues, `#mainPage` aplica gradientes radiales para dar profundidad. Encima se coloca `.main-noise`, una capa absoluta con una textura SVG de ruido y opacidad baja.

### 4.3 Fragmentos de codigo relevantes

Variables generales de color:

```css
:root {
  --green-spore: #51e37d;
  --green-glow:  #6dbf7e;
  --green-dark:  #1a2e1f;
  --yellow-spore:#c9a84c;
  --orange-spore:#b5602a;
  --bg:          #0a0d08;
  --text:        #c4b89a;
  --mold-brown:  #3d2b1f;
}
```

Estas variables centralizan los colores principales de la pagina. `--bg` es el color de fondo oscuro y el resto define la paleta de esporas, brillo verde y tonos envejecidos.

Fondo principal:

```css
#mainPage {
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 60% at 20% 80%, #0d1f0f 0%, transparent 60%),
    radial-gradient(ellipse 60% 70% at 80% 20%, #1a1408 0%, transparent 55%);
  overflow: hidden;
}
```

Los `radial-gradient` crean manchas de luz y color en distintas zonas de la pantalla. El primer gradiente aporta tonos verdes oscuros y el segundo tonos marrones.

Capa de ruido:

```css
.main-noise {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
}
```

Esta capa cubre toda la pagina y usa un SVG con `feTurbulence` para generar ruido. La opacidad `0.04` hace que sea sutil y no dificulte la lectura.

## 5 Cambio de la palabra Caracteristicas a Zombies y Etapas

### 5.1 Descripcion del comportamiento

La pagina incluye un recuadro interactivo que cambia el texto mostrado cuando el usuario pasa el raton por encima. El texto va rotando entre `Tipos de zombies`, `Caracteristicas` y `Etapas`.

### 5.2 Explicacion del funcionamiento

El elemento tiene el identificador `zombieSwitcher`. JavaScript guarda un array con las tres etiquetas posibles. Cada vez que se produce el evento `mouseenter`, aumenta el indice y actualiza el texto del elemento. Antes de cambiarlo, se aplica la clase `is-changing` para crear un pequeno efecto visual de desenfoque.

### 5.3 Fragmentos de codigo relevantes

Elemento HTML:

```html
<div class="zombie-switcher-wrap" id="zombies">
  <div class="zombie-switcher" id="zombieSwitcher">Tipos de zombies</div>
</div>
```

Este bloque define el recuadro que muestra la palabra inicial. El `id="zombieSwitcher"` es imprescindible para que el script lo pueda seleccionar.

Logica JavaScript:

```js
const zombieSwitcher = document.getElementById('zombieSwitcher');
if (zombieSwitcher) {
  const switcherLabels = ['Tipos de zombies', 'Caracteristicas', 'Etapas'];
  let switcherIndex = 0;

  zombieSwitcher.addEventListener('mouseenter', () => {
    switcherIndex = (switcherIndex + 1) % switcherLabels.length;
    zombieSwitcher.classList.add('is-changing');

    setTimeout(() => {
      zombieSwitcher.textContent = switcherLabels[switcherIndex];
      zombieSwitcher.classList.remove('is-changing');
    }, 170);
  });
}
```

`switcherLabels` contiene todos los textos posibles. La operacion `% switcherLabels.length` hace que, al llegar al ultimo texto, vuelva al primero. `setTimeout` retrasa el cambio 170 milisegundos para que se vea la transicion.

Estilo del cambio:

```css
.zombie-switcher.is-changing {
  filter: blur(6px);
  opacity: 0.45;
}
```

Cuando se anade la clase `is-changing`, el recuadro se desenfoca y baja su opacidad. Al quitar la clase, vuelve a verse nitido con el nuevo texto.

## 6 Zombies en 3D

### 6.1 Descripcion del comportamiento

En la seccion de infectados aparecen zombies animados, como el gordinflon y el chasqueador. Al pasar el raton por la zona de la imagen, el infectado se anima mediante una secuencia de fotogramas, dando sensacion de movimiento y volumen.

### 6.2 Explicacion del funcionamiento

La funcionalidad no usa un modelo 3D real, sino una simulacion visual mediante muchas imagenes consecutivas. JavaScript crea dinamicamente varios elementos `img`, uno por cada fotograma. Solo un fotograma tiene la clase `is-visible` en cada momento. Cuando el raton entra en la tarjeta y todos los fotogramas estan cargados, un `setInterval` va cambiando el fotograma visible cada 90 milisegundos.

Este metodo genera una animacion tipo sprite o flipbook, que visualmente puede parecer un zombie en 3D porque las imagenes ya representan distintas posiciones del personaje.

### 6.3 Fragmentos de codigo relevantes

HTML de los contenedores:

```html
<div class="race-photo race-photo-bloater" data-bloater-sequence aria-label="Animacion de gordinflon">
</div>

<div class="race-photo race-photo-clicker" data-clicker-sequence aria-label="Animacion de chasqueador">
</div>
```

Estos contenedores estan vacios al principio. Los atributos `data-bloater-sequence` y `data-clicker-sequence` indican al script donde debe insertar los fotogramas.

Funcion JavaScript principal:

```js
function setupFrameSequence(hostSelector, frameTotal, framePathFactory) {
  const sequenceHost = document.querySelector(hostSelector);
  if (!sequenceHost) return;

  const frameStack = document.createElement('div');
  const frames = [];
  const fragment = document.createDocumentFragment();
  let loadedFrames = 0;
  let isSequenceLoaded = false;
  let isPointerInside = false;

  frameStack.className = 'clicker-frame-stack';
}
```

La funcion recibe el selector del contenedor, el numero total de fotogramas y una funcion que genera la ruta de cada imagen. `frames` guarda todas las imagenes creadas y `isSequenceLoaded` controla si la animacion esta preparada.

Creacion de fotogramas:

```js
for (let index = 0; index < frameTotal; index++) {
  const currentFrame = String(index).padStart(4, '0');
  const nextFrame = String(index + 1).padStart(4, '0');
  const frame = document.createElement('img');
  const frameSrc = framePathFactory(currentFrame, nextFrame);

  frame.className = 'clicker-frame';
  frame.alt = '';
  frame.loading = index === 0 ? 'eager' : 'lazy';

  if (index === 0) {
    frame.src = frameSrc;
    frame.classList.add('is-visible');
  } else {
    frame.dataset.src = frameSrc;
  }

  frames.push(frame);
  fragment.appendChild(frame);
}
```

Este bucle crea todas las imagenes. `padStart(4, '0')` convierte numeros como `1` en `0001`, que coincide con el formato de los archivos. El primer fotograma se carga inmediatamente y los demas se preparan para carga diferida.

Arranque de las dos animaciones:

```js
setupFrameSequence(
  '[data-bloater-sequence]',
  48,
  (currentFrame, nextFrame) => `Gordinflon sin fondo/gordinflon_${currentFrame}_${nextFrame}.png.png`
);

setupFrameSequence(
  '[data-clicker-sequence], .race-photo-clicker',
  47,
  (currentFrame, nextFrame) => `Chasqueador sin fondo/Keyframes_${currentFrame}_${nextFrame}.png.png`
);
```

Aqui se configura cada zombie. El gordinflon usa 48 imagenes y el chasqueador 47. La funcion final construye la ruta exacta de cada archivo.

Estilo de visibilidad de fotogramas:

```css
.clicker-frame {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.28s ease, transform 0.45s ease, filter 0.45s ease;
}

.clicker-frame.is-visible {
  opacity: 1;
}
```

Todos los fotogramas estan superpuestos en la misma posicion. Solo el que tiene `is-visible` se muestra, porque cambia su opacidad a `1`.

## 7 Recuadro que cambia de color al pulsarlo o interactuar con el

### 7.1 Descripcion del comportamiento

Al interactuar con ciertos recuadros de la pagina, estos cambian visualmente para indicar un estado. Por ejemplo, las tarjetas de infectados cambian de color al pasar el raton por encima, y el panel de la caja fuerte cambia segun si la combinacion introducida es correcta o incorrecta.

### 7.2 Explicacion del funcionamiento

El cambio de color se consigue combinando CSS y JavaScript. En las tarjetas de infectados, el estado `:hover` cambia el borde, el fondo y la sombra. En la caja fuerte, JavaScript anade clases como `safe-success` o `safe-error` al panel. Despues, CSS aplica colores distintos a esas clases para mostrar si la accion ha tenido exito o ha fallado.

### 7.3 Fragmentos de codigo relevantes

Cambio de color por hover en tarjetas:

```css
.race-card {
  border: 1px solid #4a7c5944;
  background: linear-gradient(90deg, rgba(15, 20, 15, 0.92), rgba(11, 16, 10, 0.86));
  transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease, background 0.35s ease;
}

.race-card:hover {
  border-color: #c9a84c;
  background: linear-gradient(90deg, rgba(42, 33, 12, 0.96), rgba(20, 28, 16, 0.94));
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.3);
  transform: translateY(-4px);
}
```

El selector `.race-card:hover` se activa cuando el usuario coloca el raton encima. Cambia el borde a dorado, modifica el fondo y eleva visualmente la tarjeta con `transform`.

Validacion de la caja fuerte:

```js
const safeCode = ['11', '10', '95'];

safeLockForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const enteredCode = safeInputs.map((input) => (input?.value || '').padStart(2, '0'));
  const isCorrect = enteredCode.every((value, index) => value === safeCode[index]);

  safeLockPanel.classList.remove('safe-error', 'safe-success');

  if (isCorrect) {
    safeLockPanel.classList.add('safe-success');
    safeLockStatus.textContent = 'ESTADO: DESBLOQUEADO';
    safeLockFeedback.textContent = 'Combinacion correcta. Acceso concedido al sector abandonado.';
    lockedContent.hidden = false;
    return;
  }

  safeLockPanel.classList.add('safe-error');
  safeLockStatus.textContent = 'ESTADO: INTENTO FALLIDO';
  safeLockFeedback.textContent = 'Combinacion incorrecta. Ajusta los diales y vuelve a intentarlo.';
});
```

Este codigo comprueba la combinacion introducida. Si coincide con `11-10-95`, anade la clase `safe-success`. Si no coincide, anade `safe-error`. Esas clases son las que permiten cambiar el aspecto del recuadro.

Funcionamiento tecnico:

- `event.preventDefault()` evita que el formulario recargue la pagina.
- `padStart(2, '0')` asegura que cada numero tenga dos cifras.
- `every()` comprueba que los tres valores coinciden con la clave.
- `classList.add()` aplica el estado visual correspondiente.

## 8 Caja fuerte de acceso

### 8.1 Descripcion del comportamiento

La caja fuerte es una funcionalidad de seguridad que bloquea parte del contenido de la pagina. El usuario debe introducir una combinacion de tres numeros y pulsar el boton `Probar combinacion`. Si la combinacion es correcta, se desbloquea el contenido oculto del sector abandonado. Si la combinacion es incorrecta, la pagina muestra mensajes de aviso y cambia el estado visual del panel.

La combinacion correcta es `11-10-95`. Si el usuario falla varias veces, se activa un bloqueo de cuarentena: los campos se deshabilitan, la pagina se oscurece visualmente y aparece una pantalla de acceso restringido.

### 8.2 Explicacion del funcionamiento

La funcionalidad se construye con tres partes:

1. En `index.html` se crea el formulario de la caja fuerte con tres campos numericos (`safeFirst`, `safeSecond` y `safeThird`), un boton de envio y un texto de estado.
2. En `script.js` se seleccionan esos elementos, se valida la combinacion introducida y se actualiza la interfaz segun el resultado.
3. En `style.css` se definen los estilos visuales para los estados de exito (`safe-success`), error (`safe-error`) y bloqueo de cuarentena (`locked-screen` e `is-active`).

Cuando se envia el formulario, JavaScript evita que la pagina se recargue, recoge los tres valores escritos, los formatea a dos cifras y los compara con el codigo correcto. Si todos los valores coinciden, se muestra el contenido protegido. Si no coinciden, aumenta el contador de intentos fallidos.

### 8.3 Fragmentos de codigo relevantes

Estructura HTML de la caja fuerte:

```html
<section class="safe-lock-section">
  <div class="safe-lock-copy">
    <span class="safe-lock-tag">PROTOCOLO SELLADO</span>
    <h2>Caja Fuerte de Acceso</h2>
    <p>
      Ajusta la combinacion correcta para abrir el compartimento seguro antes de entrar al sector abandonado.
    </p>
  </div>

  <div class="safe-lock-panel" id="safeLockPanel">
    <div class="safe-lock-door">
      <div class="safe-lock-wheel" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="safe-lock-status" id="safeLockStatus">ESTADO: BLOQUEADO</div>
    </div>

    <form class="safe-lock-controls" id="safeLockForm">
      <label class="safe-lock-group">
        <span>Primer codigo</span>
        <input type="number" id="safeFirst" min="0" max="99" value="0" inputmode="numeric">
      </label>

      <label class="safe-lock-group">
        <span>Segundo codigo</span>
        <input type="number" id="safeSecond" min="0" max="99" value="0" inputmode="numeric">
      </label>

      <label class="safe-lock-group">
        <span>Tercer codigo</span>
        <input type="number" id="safeThird" min="0" max="99" value="0" inputmode="numeric">
      </label>

      <button type="submit" class="safe-lock-button">Probar combinacion</button>
      <p class="safe-lock-feedback" id="safeLockFeedback">Introduce tres bloques numericos en formato XX-XX-XX.</p>
    </form>
  </div>
</section>
```

Este fragmento define la parte visible de la caja fuerte. `safeLockPanel` es el contenedor que cambia de estado visual. `safeLockForm` es el formulario que captura el intento del usuario. Los tres `input` guardan cada bloque de la combinacion.

Contenido protegido:

```html
<div class="locked-content" id="lockedContent" aria-hidden="true" hidden>
  <div class="locked-content-inner">
    <section class="city-scene-section">
      <div class="scene-heading">
        <span class="scene-code">SECTOR ABANDONADO</span>
        <h2>Ciudades Devoradas Por El Cordyceps</h2>
      </div>
    </section>
  </div>
</div>
```

El atributo `hidden` hace que este bloque no se vea al cargar la pagina. `aria-hidden="true"` tambien indica que el contenido esta oculto para tecnologias de accesibilidad. JavaScript elimina ese bloqueo cuando la clave es correcta.

Seleccion de elementos y codigo correcto:

```js
const safeLockForm = document.getElementById('safeLockForm');
const safeLockPanel = document.getElementById('safeLockPanel');
const safeLockStatus = document.getElementById('safeLockStatus');
const safeLockFeedback = document.getElementById('safeLockFeedback');
const quarantineLockout = document.getElementById('quarantineLockout');
const lockedContent = document.getElementById('lockedContent');

const safeInputs = [
  document.getElementById('safeFirst'),
  document.getElementById('safeSecond'),
  document.getElementById('safeThird'),
];
const safeCode = ['11', '10', '95'];
let failedAttempts = 0;
let isLockedOut = false;
```

Este bloque prepara las referencias necesarias. `safeInputs` agrupa los tres campos para tratarlos como una lista. `safeCode` contiene la combinacion correcta. `failedAttempts` cuenta los errores y `isLockedOut` impide seguir probando cuando se activa el bloqueo.

Control de escritura en los campos:

```js
safeInputs.forEach((input) => {
  if (!input) return;

  input.addEventListener('input', () => {
    if (isLockedOut) return;
    const numericValue = input.value.replace(/\D/g, '').slice(0, 2);
    input.value = numericValue;
    safeLockPanel.classList.remove('safe-error', 'safe-success');
    safeLockStatus.textContent = 'ESTADO: BLOQUEADO';
    safeLockFeedback.textContent = 'Introduce tres bloques numericos en formato XX-XX-XX.';
  });

  input.addEventListener('blur', () => {
    if (input.value === '') return;
    input.value = input.value.padStart(2, '0');
  });
});
```

Este fragmento controla la entrada del usuario. `replace(/\D/g, '')` elimina cualquier caracter que no sea numero. `slice(0, 2)` limita cada campo a dos cifras. Al salir del campo, `padStart(2, '0')` completa valores como `5` y los convierte en `05`.

Validacion de la combinacion:

```js
safeLockForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (isLockedOut) return;

  const enteredCode = safeInputs.map((input) => (input?.value || '').padStart(2, '0'));
  const isCorrect = enteredCode.every((value, index) => value === safeCode[index]);

  safeLockPanel.classList.remove('safe-error', 'safe-success');
  void safeLockPanel.offsetWidth;

  if (isCorrect) {
    failedAttempts = 0;
    safeLockPanel.classList.add('safe-success');
    safeLockStatus.textContent = 'ESTADO: DESBLOQUEADO';
    safeLockFeedback.textContent = 'Combinacion correcta. Acceso concedido al sector abandonado.';
    lockedContent.setAttribute('aria-hidden', 'false');
    lockedContent.hidden = false;
    requestAnimationFrame(() => {
      lockedContent.classList.add('is-revealed');
    });
    setTimeout(() => {
      lockedContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 220);
    return;
  }

  failedAttempts += 1;
  safeLockPanel.classList.add('safe-error');
  safeLockStatus.textContent = 'ESTADO: INTENTO FALLIDO';
  safeLockFeedback.textContent = 'Combinacion incorrecta. Ajusta los diales y vuelve a intentarlo.';
});
```

Este es el metodo principal. `event.preventDefault()` evita la recarga de la pagina. `map()` obtiene los tres numeros introducidos. `every()` comprueba que cada posicion coincida con el codigo correcto. Si la clave es correcta, se anade `safe-success`, se cambia el estado a desbloqueado y se muestra `lockedContent`. Si falla, se suma un intento y se aplica `safe-error`.

Activacion del bloqueo de cuarentena:

```js
function activateLockout() {
  isLockedOut = true;
  clearTimeout(safeAlertTimeout);
  safeAlert.classList.remove('is-visible');
  safeLockPanel.classList.remove('safe-success');
  safeLockPanel.classList.add('safe-error');
  safeLockStatus.textContent = 'ESTADO: ACCESO DENEGADO';
  safeLockFeedback.textContent = 'La zona de cuarentena te ha expulsado.';
  safeInputs.forEach((input) => {
    if (!input) return;
    input.disabled = true;
  });
  const submitButton = safeLockForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
  }
  document.body.classList.add('locked-screen');
  quarantineLockout.scrollTop = 0;
  quarantineLockout.classList.add('is-active');
}
```

Esta funcion se ejecuta cuando se superan los intentos permitidos. Cambia `isLockedOut` a `true`, desactiva los campos y el boton, marca el panel como error y anade clases al `body` y a la pantalla de cuarentena para bloquear visualmente la pagina.

Estilos de exito y error:

```css
.safe-lock-panel.safe-success {
  border-color: rgba(109, 191, 126, 0.6);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.28), 0 0 32px rgba(109, 191, 126, 0.14);
}

.safe-lock-panel.safe-success .safe-lock-wheel {
  transform: rotate(180deg);
  border-color: rgba(109, 191, 126, 0.72);
}

.safe-lock-panel.safe-success .safe-lock-status,
.safe-lock-panel.safe-success .safe-lock-feedback {
  color: #7fd39f;
}

.safe-lock-panel.safe-error {
  animation: safeShake 0.35s ease;
}
```

Cuando la caja fuerte se desbloquea, `safe-success` cambia el borde, el brillo y el color de los textos a verde. Tambien gira la rueda con `transform: rotate(180deg)`. Cuando hay error, `safe-error` ejecuta una animacion de sacudida.

Animacion de error:

```css
@keyframes safeShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  50% { transform: translateX(6px); }
  75% { transform: translateX(-4px); }
}
```

Esta animacion mueve el panel horizontalmente para comunicar que la combinacion es incorrecta.

Estilos del bloqueo:

```css
body.locked-screen {
  overflow: hidden;
}

body.locked-screen #mainPage,
body.locked-screen nav {
  filter: grayscale(0.88) contrast(1.05) blur(2px);
}

.quarantine-lockout.is-active {
  opacity: 1;
  visibility: visible;
}
```

`body.locked-screen` impide seguir desplazandose por la pagina. El filtro sobre `#mainPage` y `nav` desenfoca la web. La clase `is-active` hace visible la pantalla final de cuarentena.

## 9. Funcionalidad adicional: flecha para volver al panel superior

### 9.1. Descripcion por escrito del comportamiento de la funcionalidad adicional

La funcionalidad adicional consiste en una flecha situada en la parte inferior derecha de la pantalla. Su objetivo es permitir que el usuario vuelva rapidamente al panel superior de la pagina sin tener que desplazarse manualmente hacia arriba.

Cuando la pagina termina de cargar, la flecha aparece como un boton circular flotante. Al hacer clic sobre ella, la pagina se desplaza automaticamente hasta el inicio, donde se encuentra el panel principal con el titulo `GUIA DE SUPERVIVENCIA`, el menu de navegacion y la introduccion general.

Esta funcionalidad mejora la navegacion porque la pagina contiene varias secciones largas: personajes, infectados, caja fuerte, contenido desbloqueado, ciudades y compra. Gracias a la flecha, el usuario puede regresar al principio desde cualquier punto de la web.

### 9.2. Explicacion del funcionamiento de la funcionalidad adicional

La funcionalidad se construye con tres partes:

1. En `index.html` se crea un boton con el identificador `scrollTopButton`. Dentro del boton se coloca el simbolo de flecha hacia arriba.
2. En `style.css` se posiciona el boton de forma fija en la esquina inferior derecha mediante `position: fixed`, `right` y `bottom`. Tambien se le da forma circular, colores, transiciones y estados visuales.
3. En `script.js` se selecciona el boton con `getElementById()` y se le anade un evento `click`. Cuando el usuario pulsa la flecha, JavaScript ejecuta `window.scrollTo()` para mover la ventana hasta la coordenada superior de la pagina.

El desplazamiento se hace con `behavior: 'smooth'`, por lo que la vuelta al inicio no ocurre de golpe, sino con una animacion suave. Ademas, el codigo tambien asigna `0` a `document.documentElement.scrollTop` y a `document.body.scrollTop` para asegurar compatibilidad con distintos navegadores.

### 9.3. Fragmentos de codigo mas relevantes de la funcionalidad adicional

Fragmento HTML del boton:

```html
<button class="scroll-top-button" id="scrollTopButton" type="button" aria-label="Volver al inicio" title="Volver arriba">
  <span aria-hidden="true">&uarr;</span>
</button>
```

Este fragmento crea el boton de la flecha. La clase `scroll-top-button` permite aplicarle estilos desde CSS. El identificador `id="scrollTopButton"` permite que JavaScript lo encuentre de forma exacta. El atributo `type="button"` evita que el boton actue como envio de formulario. `aria-label="Volver al inicio"` describe la funcion del boton para lectores de pantalla, mientras que `title="Volver arriba"` muestra una ayuda al pasar el raton. El `span` contiene la flecha hacia arriba (`&uarr;`) y usa `aria-hidden="true"` porque la descripcion accesible ya esta en el boton.

Seleccion del boton en JavaScript:

```js
const scrollTopButton = document.getElementById('scrollTopButton');
```

Esta linea busca en el documento HTML el elemento que tiene el identificador `scrollTopButton` y guarda la referencia en una constante. Sin esta referencia, el script no podria anadir el comportamiento de clic a la flecha.

Evento de clic:

```js
if (scrollTopButton) {
  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}
```

Este es el metodo mas importante de la funcionalidad. Primero se comprueba `if (scrollTopButton)` para evitar errores si el boton no existe en el HTML. Despues, `addEventListener('click', ...)` indica que el codigo interior se ejecutara cuando el usuario pulse la flecha.

La instruccion principal es:

```js
window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
```

`window.scrollTo()` desplaza la ventana del navegador. `top: 0` significa que el destino vertical es la parte superior de la pagina. `left: 0` evita cualquier desplazamiento horizontal. `behavior: 'smooth'` activa una transicion suave en lugar de un salto instantaneo.

Las dos lineas finales refuerzan la compatibilidad:

```js
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;
```

Algunos navegadores guardan el desplazamiento de la pagina en `document.documentElement` y otros en `document.body`. Por eso se ponen ambos valores a `0`: asi se garantiza que la web vuelva al panel superior aunque el navegador gestione el scroll de una forma distinta.

Estilo principal de la flecha:

```css
.scroll-top-button {
  position: fixed;
  right: 22px;
  bottom: 22px;
  width: 58px;
  height: 58px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1200;
}
```

`position: fixed` hace que la flecha permanezca siempre en la misma posicion de la pantalla aunque el usuario haga scroll. `right: 22px` la separa del borde derecho y `bottom: 22px` la separa del borde inferior. `width` y `height` le dan el mismo tamano para que pueda ser circular. `display: inline-flex`, `align-items: center` y `justify-content: center` centran la flecha dentro del boton. `border-radius: 50%` convierte el boton en un circulo. `z-index: 1200` lo coloca por encima del contenido principal para que no quede tapado por otros elementos.

Estado visible del boton:

```css
.scroll-top-button.is-ready {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}
```

La clase `is-ready` muestra el boton cuando la pagina ya esta preparada. `opacity: 1` lo hace visible, `visibility: visible` permite que se vea en pantalla, `transform` lo coloca en su posicion final y `pointer-events: auto` permite que pueda recibir clics.

## 10. Funcionalidad Firebase / Firestore

### 10.1. Descripcion del comportamiento de la funcionalidad Firebase

La funcionalidad Firebase permite registrar, consultar, modificar y eliminar pedidos de compra de The Last of Us sin usar un servidor propio. La pagina de compra (`tlou-backend/public/indexxx.html`) guarda cada pedido directamente en Firebase Firestore, y la pagina de pedidos (`tlou-backend/public/pedidos.html`) lee esa misma coleccion para mostrar los registros, filtrarlos, cambiar su estado o eliminarlos.

Ademas de guardarse en Firestore, los pedidos tambien pueden verse reflejados dentro del proyecto en VS Code. Para ello se usa el script local `scripts/sync-pedidos-vscode.ps1`, que consulta la coleccion `pedidos` de Firebase y genera los archivos `pedidos-vscode.json` y `pedidos-vscode.md`. De esta forma, Firebase sigue siendo la base de datos principal, pero VS Code tambien muestra una copia local actualizada para consultar los pedidos sin entrar al panel web.

La funcionalidad hace principalmente lo siguiente:

1. Recibe pedidos nuevos desde el formulario de compra.
2. Valida en el navegador que los datos obligatorios sean correctos.
3. Genera un identificador de pedido con formato `TLU-XXXXXX`.
4. Guarda los pedidos en la coleccion `pedidos` de Firestore.
5. Sincroniza los pedidos con `pedidos-vscode.json` y `pedidos-vscode.md` cuando se ejecuta la tarea de VS Code.
6. Lista los pedidos guardados y permite filtrarlos por texto, plataforma, edicion y estado.
7. Cambia el estado de un pedido a `pendiente`, `completado` o `cancelado`.
8. Elimina pedidos desde el panel de gestion.
9. Protege la base de datos con reglas de Firestore definidas en `firestore.rules`.

### 10.2. Explicacion del funcionamiento de la funcionalidad Firebase

La conexion con Firebase se configura en `firebase-config.js`. Ese archivo guarda los datos del proyecto (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId` y `measurementId`) y tambien define el nombre de la coleccion usada por la aplicacion:

```js
window.TLOU_FIREBASE_COLLECTION = "pedidos";
```

Las paginas de compra y pedidos cargan Firebase desde los scripts oficiales del SDK web en modo `compat`:

```html
<script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js"></script>
<script src="../../firebase-config.js"></script>
```

Despues, JavaScript inicializa Firebase con `firebase.initializeApp()` y obtiene una referencia a Firestore con `firebase.firestore()`. A partir de ahi, las operaciones de la web se hacen directamente sobre la coleccion `pedidos`, sin rutas HTTP propias. El archivo `pedidos-vscode.json` no sustituye a Firebase ni recibe datos directamente desde el navegador: se crea despues mediante un script local que lee Firestore y vuelca los pedidos en el proyecto.

El proyecto tambien incluye `firebase.json`, que configura Firebase Hosting y enlaza las reglas de Firestore. El archivo `.firebaserc` indica el proyecto Firebase usado por defecto: `the-last-of-us-652da`.

Para ver los pedidos en VS Code se usa la tarea `Ver pedidos Firebase en VS Code`, definida en `.vscode/tasks.json`. Esa tarea ejecuta `scripts/sync-pedidos-vscode.ps1`, consulta Firebase cada pocos segundos y actualiza dos archivos:

1. `pedidos-vscode.json`: copia estructurada de los pedidos, util para revisar los datos como JSON.
2. `pedidos-vscode.md`: version legible en Markdown, util para ver los pedidos de forma mas clara dentro del editor.

El flujo completo queda asi:

1. El usuario rellena el formulario de compra.
2. La pagina crea el pedido en Firestore.
3. La tarea de VS Code consulta Firestore.
4. El script local actualiza `pedidos-vscode.json` y `pedidos-vscode.md`.
5. VS Code muestra esos archivos locales como reflejo de los datos que existen en Firebase.

### 10.3. Fragmentos de codigo relevantes de la funcionalidad Firebase

Configuracion de Firebase:

```js
window.TLOU_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCVNWdK6s-2w7IkTWr9Fv9z6Vs_qbzeoYI",
  authDomain: "the-last-of-us-652da.firebaseapp.com",
  projectId: "the-last-of-us-652da",
  storageBucket: "the-last-of-us-652da.firebasestorage.app",
  messagingSenderId: "1061817054660",
  appId: "1:1061817054660:web:1d38f2b83266ff6b10a091",
  measurementId: "G-EZE9D34XSH"
};

window.TLOU_FIREBASE_COLLECTION = "pedidos";
```

Este fragmento identifica el proyecto Firebase al que se conecta la pagina. `projectId` indica el proyecto concreto, y `TLOU_FIREBASE_COLLECTION` centraliza el nombre de la coleccion donde se guardan los pedidos.

Comprobacion e inicializacion de Firebase:

```js
function isFirebaseConfigured() {
  const config = window.TLOU_FIREBASE_CONFIG || {};
  return Boolean(config.apiKey && !String(config.apiKey).includes('PEGA_AQUI'));
}

function initFirebase() {
  if (!isFirebaseConfigured()) {
    document.getElementById('statusText').textContent = 'FIREBASE SIN CONFIGURAR';
    return null;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(window.TLOU_FIREBASE_CONFIG);
  }

  const db = firebase.firestore();
  return db.collection(window.TLOU_FIREBASE_COLLECTION || 'pedidos');
}

const pedidosCollection = initFirebase();
```

`isFirebaseConfigured()` evita intentar conectar si faltan los datos del proyecto. `firebase.initializeApp()` arranca Firebase una sola vez. `firebase.firestore()` obtiene la base de datos y `db.collection(...)` devuelve la coleccion que se usara para crear, leer, actualizar y borrar pedidos.

Generacion de identificador:

```js
function generateId() {
  return 'TLU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}
```

Esta funcion crea codigos como `TLU-A1B2C3`. `Math.random()` genera un valor aleatorio, `toString(36)` lo convierte a letras y numeros, `substring(2, 8)` recorta seis caracteres y `toUpperCase()` los pasa a mayusculas.

Creacion de un pedido en Firestore:

```js
let id = generateId();
let exists = await pedidosCollection.doc(id).get();

while (exists.exists) {
  id = generateId();
  exists = await pedidosCollection.doc(id).get();
}

const pedido = {
  id,
  nombre: document.getElementById('nombre').value.trim(),
  email: document.getElementById('email').value.trim().toLowerCase(),
  plataforma: document.getElementById('plataforma').value,
  edicion: document.getElementById('edicion').value,
  notas: document.getElementById('notas').value.trim() || null,
  fecha: new Date().toISOString(),
  estado: 'pendiente'
};

await pedidosCollection.doc(id).set(pedido);
```

Primero se genera un identificador y se comprueba con `.get()` que no exista ya un documento con ese ID. Si existiera, se genera otro. Despues se construye el objeto `pedido` con los valores del formulario. Finalmente, `.doc(id).set(pedido)` crea el documento en Firestore usando el identificador como nombre del documento.

Lectura y filtrado de pedidos:

```js
const snapshot = await pedidosCollection.get();
const pedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

const filteredPedidos = pedidos.filter(p => {
  if (plat && p.plataforma !== plat) return false;
  if (ed && p.edicion !== ed) return false;
  if (est && p.estado !== est) return false;
  return true;
}).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
```

`pedidosCollection.get()` lee todos los documentos de la coleccion. `snapshot.docs.map(...)` convierte cada documento de Firestore en un objeto JavaScript normal. Despues, `filter()` aplica los filtros seleccionados por el usuario y `sort()` ordena los pedidos por fecha.

Actualizacion del estado:

```js
await pedidosCollection.doc(id).update({
  estado,
  updatedAt: new Date().toISOString()
});
```

`update()` modifica solo los campos indicados. En este caso cambia el `estado` y guarda la fecha de actualizacion en `updatedAt`, sin tocar el resto de datos del pedido.

Eliminacion de un pedido:

```js
await pedidosCollection.doc(id).delete();
```

`delete()` elimina de Firestore el documento cuyo identificador coincide con el pedido seleccionado.

Sincronizacion local para VS Code:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\sync-pedidos-vscode.ps1
```

Este comando ejecuta el monitor local de pedidos. El script lee `firebase-config.js` para obtener `projectId`, `apiKey` y el nombre de la coleccion. Despues llama a la API REST de Firestore, convierte los documentos recibidos en objetos normales y genera `pedidos-vscode.json` con la lista de pedidos. Tambien genera `pedidos-vscode.md`, que contiene la misma informacion en un formato mas facil de leer.

La tarea de VS Code que lanza este script es:

```json
{
  "label": "Ver pedidos Firebase en VS Code",
  "type": "shell",
  "command": "powershell",
  "args": [
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    "${workspaceFolder}\\scripts\\sync-pedidos-vscode.ps1"
  ],
  "isBackground": true,
  "problemMatcher": []
}
```

Gracias a esta tarea, cuando se registra un pedido nuevo en Firebase, VS Code puede reflejarlo automaticamente en `pedidos-vscode.json` mientras el monitor este ejecutandose. Si la tarea no esta abierta, el pedido queda igualmente guardado en Firebase, pero el archivo local se actualizara la proxima vez que se ejecute el script.

Reglas de seguridad de Firestore:

```js
match /pedidos/{pedidoId} {
  allow read: if true;
  allow create: if isPedidoId(pedidoId) && isValidNewPedido();
  allow update: if isPedidoId(pedidoId) && isValidPedidoUpdate();
  allow delete: if isPedidoId(pedidoId);
}

match /{document=**} {
  allow read, write: if false;
}
```

Estas reglas permiten trabajar con la coleccion `pedidos`, pero bloquean cualquier otra coleccion. Las funciones `isPedidoId`, `isValidNewPedido` e `isValidPedidoUpdate` revisan que los IDs y los campos tengan la forma esperada antes de permitir escritura en la base de datos.

## 11. Responsividad

### 11.1. Descripcion del comportamiento de la responsividad

La responsividad permite que la pagina web se vea correctamente en ordenador, tablet y movil. Su objetivo es mantener la misma apariencia general de la version de escritorio, pero adaptando tamanos, separaciones y proporciones para que el contenido no se corte, no se superponga y no genere desplazamiento horizontal innecesario.

En esta pagina la responsividad mantiene la estructura visual principal:

1. El menu sigue apareciendo en horizontal.
2. Las tarjetas de personajes conservan su disposicion en columnas.
3. Las tarjetas de zombies mantienen la composicion en fila.
4. La caja fuerte conserva su estructura en dos bloques.
5. Las tarjetas de ciudades siguen organizadas en cuadricula.
6. Los textos, margenes, imagenes y paneles reducen su tamano de forma progresiva segun el ancho de pantalla.

### 11.2. Explicacion del funcionamiento de la responsividad

La responsividad se consigue principalmente con CSS. Se usan media queries, unidades flexibles y funciones modernas como `clamp()`, `minmax()` y `min()`.

Las media queries permiten aplicar reglas solo cuando la pantalla tiene un ancho determinado. En este caso se usan dos puntos importantes:

- `@media (max-width: 900px)`: aplica ajustes para tablet y pantallas medianas.
- `@media (max-width: 520px)`: aplica ajustes mas concretos para movil.

En lugar de cambiar completamente la estructura, el CSS mantiene la composicion original y reduce los tamanos. Por ejemplo, si en escritorio hay tres tarjetas de personajes en una fila, en movil se siguen manteniendo tres columnas, pero con menos espacio entre ellas, menos padding y fuentes mas pequenas.

La funcion `clamp(valor-minimo, valor-flexible, valor-maximo)` es clave porque permite que un tamano crezca o disminuya segun el ancho de la pantalla, pero sin pasar de unos limites. Asi se evita que los textos sean demasiado grandes en movil o demasiado pequenos en escritorio.

### 11.3. Fragmentos de codigo relevantes de la responsividad

Media query principal:

```css
@media (max-width: 900px) {
  #mainPage {
    align-items: flex-start;
    overflow-x: hidden;
  }

  .main-content {
    width: 100%;
    padding: clamp(86px, 11vw, 110px) clamp(14px, 3.2vw, 28px) 34px;
  }
}
```

`@media (max-width: 900px)` indica que estas reglas solo se aplican cuando la pantalla mide 900px o menos. `overflow-x: hidden` evita que aparezca desplazamiento horizontal. `width: 100%` hace que el contenido ocupe todo el ancho disponible. El `padding` usa `clamp()` para adaptarse: el margen superior puede variar entre `86px` y `110px`, usando `11vw` como valor flexible.

Menu responsive manteniendo la forma de escritorio:

```css
nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: clamp(10px, 2vw, 18px);
  padding: clamp(12px, 2vw, 16px) clamp(14px, 3vw, 28px);
}
```

`position: fixed` mantiene el menu fijado arriba. `top`, `left` y `right` lo colocan pegado a la parte superior y ocupando todo el ancho. `flex-direction: row` mantiene los elementos en horizontal, igual que en ordenador. `justify-content: space-between` separa el logo y los enlaces. `gap` y `padding` usan `clamp()` para reducirse en pantallas pequenas.

Enlaces del menu:

```css
.nav-links a {
  display: inline;
  width: auto;
  min-height: 0;
  padding: 0;
  border: 0;
  background: transparent;
  font-size: clamp(0.55rem, 1.8vw, 0.72rem);
  letter-spacing: clamp(0.08em, 0.35vw, 0.16em);
  line-height: 1.35;
  white-space: nowrap;
}
```

Este fragmento evita que los enlaces se conviertan en botones grandes en movil. `white-space: nowrap` impide que cada enlace se parta en varias lineas. `font-size` y `letter-spacing` se reducen con `clamp()` para que los enlaces quepan en pantallas pequenas.

Titulos y subtitulos adaptables:

```css
.main-title {
  font-size: clamp(1.65rem, 7.2vw, 3rem);
  letter-spacing: clamp(0.06em, 1.4vw, 0.16em);
  line-height: 1.16;
}

.main-subtitle,
.main-sub {
  font-size: clamp(0.72rem, 2.2vw, 0.9rem);
  letter-spacing: clamp(0.04em, 0.8vw, 0.1em);
}
```

Los titulos cambian de tamano segun el ancho de la pantalla. `1.65rem` es el tamano minimo, `7.2vw` es el valor que escala segun el viewport y `3rem` es el maximo. Esto mantiene la jerarquia visual, pero evita que el titulo ocupe demasiado en movil.

Personajes en columnas:

```css
.character-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(8px, 3vw, 34px);
}

.character-card {
  min-height: 0;
  aspect-ratio: 1 / 2;
  padding: clamp(8px, 1.8vw, 14px);
}
```

`grid-template-columns: repeat(3, minmax(0, 1fr))` mantiene tres columnas. `repeat(3, ...)` repite la misma columna tres veces. `minmax(0, 1fr)` significa que cada columna puede reducirse hasta `0` si es necesario, y crecer ocupando una fraccion igual del espacio disponible. `aspect-ratio: 1 / 2` mantiene la proporcion vertical de las tarjetas.

Tarjetas de zombies en fila:

```css
.race-card {
  display: flex;
  flex-direction: row;
  height: clamp(190px, 28vw, 250px);
  min-height: clamp(190px, 28vw, 250px);
}

.race-photo {
  width: clamp(112px, 24vw, 200px);
  min-width: clamp(112px, 24vw, 200px);
  height: auto;
}

.race-summary {
  width: clamp(130px, 28vw, 250px);
  min-width: clamp(130px, 28vw, 250px);
}
```

`display: flex` coloca los elementos de la tarjeta en una misma fila. `flex-direction: row` conserva la orientacion horizontal. La imagen (`race-photo`) y el resumen (`race-summary`) tienen anchuras flexibles con `clamp()`, por lo que se hacen mas pequenas en movil sin cambiar la composicion general.

Panel interno de las tarjetas de zombies:

```css
.race-panel,
.race-card:hover .race-panel,
.race-card-clicker:hover .race-panel {
  width: auto;
  min-width: 0;
  flex: 1 1 auto;
  opacity: 1;
  padding: clamp(12px, 2.6vw, 22px);
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: clamp(8px, 1.8vw, 14px);
}
```

`flex: 1 1 auto` permite que el panel ocupe el espacio restante de la fila. El primer `1` permite crecer, el segundo `1` permite encoger, y `auto` usa el tamano base automatico. `min-width: 0` es importante porque permite que el contenido pueda reducirse sin provocar desbordamiento horizontal. `flex-wrap: wrap` permite que los datos internos salten de linea si no caben en una sola fila.

Caja fuerte responsive:

```css
.safe-lock-section {
  width: 100%;
  grid-template-columns: minmax(120px, 0.9fr) minmax(170px, 1.1fr);
  gap: clamp(12px, 2.5vw, 24px);
}

.safe-lock-panel {
  grid-template-columns: minmax(112px, 0.72fr) minmax(150px, 1fr);
  gap: clamp(12px, 2.5vw, 22px);
}
```

La caja fuerte usa CSS Grid. `grid-template-columns` mantiene dos columnas: una para la informacion y otra para el panel. `minmax()` define un minimo y un maximo flexible para cada columna. Esto evita que una columna se haga demasiado pequena y permite que ambas se adapten proporcionalmente.

Rueda y textos de la caja fuerte:

```css
.safe-lock-wheel {
  width: clamp(84px, 18vw, 130px);
  height: clamp(84px, 18vw, 130px);
}

.safe-lock-copy h2 {
  font-size: clamp(1.15rem, 4vw, 2rem);
}

.safe-lock-copy p,
.safe-lock-feedback {
  font-size: clamp(0.66rem, 1.9vw, 0.82rem);
}
```

La rueda mantiene la misma anchura y altura para seguir siendo circular. Los textos de la caja fuerte reducen su tamano en pantallas pequenas para que no se salgan del panel.

Tarjetas de ciudades:

```css
.city-dossiers {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(12px, 2.5vw, 18px);
}

.city-dossier {
  grid-template-columns: clamp(34px, 6vw, 50px) minmax(0, 1.35fr) minmax(92px, 0.65fr);
  min-height: clamp(170px, 25vw, 210px);
}
```

`.city-dossiers` mantiene dos columnas de tarjetas. Dentro de cada tarjeta, `.city-dossier` conserva tres zonas: indice, texto principal y estadisticas. La primera columna usa `clamp()` porque es estrecha, mientras que las otras dos usan `minmax()` y fracciones (`fr`) para repartir el espacio disponible.

Ajustes especificos para movil:

```css
@media (max-width: 520px) {
  .main-content {
    padding-left: 10px;
    padding-right: 10px;
  }

  nav {
    gap: 8px;
    padding-left: 10px;
    padding-right: 10px;
  }

  .nav-logo {
    font-size: 0.72rem;
    letter-spacing: 1px;
  }

  .nav-links a {
    font-size: 0.5rem;
    letter-spacing: 0.06em;
  }
}
```

Esta segunda media query se aplica en pantallas de 520px o menos. No cambia la estructura, solo reduce aun mas los espacios y textos para que el diseno conserve la misma forma en moviles estrechos.

