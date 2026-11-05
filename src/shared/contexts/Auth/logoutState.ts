// `router.push` não espera mais a navegação terminar: o logout limpa a sessão enquanto a página antiga ainda está
// montada, e o `useRequireAuth` dela leria a sessão vazia como "usuário não autenticado". Esta marca avisa que a saída
// é intencional, até a rota chegar em "/".
let loggingOut = false;

export const startLogout = () => {
  loggingOut = true;
};

export const finishLogout = () => {
  loggingOut = false;
};

export const isLoggingOut = () => loggingOut;
