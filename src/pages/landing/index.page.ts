// getStaticProps precisa ser re-exportado a partir do modulo da pagina para o
// Next reconhece-lo e resolver o meta no servidor (build time).
export { default, getStaticProps } from './Landing';
