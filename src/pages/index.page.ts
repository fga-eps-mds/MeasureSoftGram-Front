// A rota raiz serve a landing. Re-exporta tambem getStaticProps para que o meta
// (Open Graph / Twitter) seja resolvido no servidor tambem em "/".
export { default, getStaticProps } from './landing/index.page';
