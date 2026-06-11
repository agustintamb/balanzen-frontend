import { router } from "expo-router";

let _navigating = false;

// Evita que se hagan múltiples pushes al mismo tiempo, lo que puede causar errores de navegación. El timeout de 600ms es un valor arbitrario que debería ser suficiente para
export const safePush = (href: Parameters<typeof router.push>[0]) => {
  if (_navigating) return;
  _navigating = true;
  router.push(href);
  setTimeout(() => {
    _navigating = false;
  }, 600);
};
