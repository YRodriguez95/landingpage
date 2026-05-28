**Evaluación: YRodriguez95 / landingpage**

**Estado:** Evaluable

**Nota:** 93/100

**Desglose:**
- Ejecución y estabilidad: 18/20
- Front-end: 14/15
- Back-end: 11/15
- Funcionalidades: 18/20
- Responsive: 9/10
- Tipografías: 5/5
- Animación: 5/5
- Documentación: 9/10
- Repositorio: 5/5
**Funcionalidades indicadas:**
- Landing temática de The Last of Us.
- Fondo atmosférico con esporas/ruido/venas animadas.
- Máscara hover que transforma personajes en versión zombie.
- Cambio interactivo de textos tipo “Características / Zombies / Etapas”.
- Vídeos de infectados reproducidos al hover.
- Simulación de zombies en 3D mediante secuencias/animación visual.
- Caja fuerte con combinación `11-10-95`.
- Bloqueo por intentos fallidos.
- Contenido oculto desbloqueable.
- Botón lateral para volver arriba.
- Formulario de compra.
- Firebase Firestore para crear/listar/actualizar/eliminar pedidos.
- Panel de gestión de pedidos.
- Sincronización local de pedidos a `pedidos-vscode.json` y `.md`.
- Reglas de Firestore.

**Resumen técnico:**
La URL pública funciona: `https://yrodriguez95.github.io/landingpage/`. También levanté la web en local y comprobé la página principal, `tlou-backend/public/indexxx.html` y `tlou-backend/public/pedidos.html`. `script.js` pasa comprobación de sintaxis. No creé pedidos de prueba para no modificar una base de datos real de Firestore.

El frontend está muy trabajado: tiene identidad visual clara, buena atmósfera, efectos con canvas, máscaras, vídeos, caja fuerte y contenido desbloqueable. Enhorabuena, porque se nota bastante mimo en el acabado y en la temática.

El backend está bien planteado usando Firebase/Firestore: hay configuración, formulario de compra, panel de pedidos, actualización de estado, borrado, script de sincronización para VS Code y reglas de seguridad. No es un backend propio con servidor, pero sí hay persistencia real. Como mejora importante, las reglas permiten lectura y borrado de pedidos sin autenticación, lo cual sería delicado en producción.

**Puntos fuertes:**
Muy buen diseño temático, muchas interacciones y una integración real con Firestore.

**Aspectos a mejorar:**
Proteger mejor Firestore con autenticación/roles, limpiar assets pesados y corregir instrucciones que recomiendan `npm`.

**Retroalimentación:**
Muy buen trabajo. La entrega tiene personalidad, funcionalidad real y un backend bastante más sólido que la media. Con seguridad mejorada en Firebase quedaría muy redonda.
