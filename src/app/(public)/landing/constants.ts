// Links externos publicos exibidos na landing.
// Centralizados aqui para facilitar a manutencao caso as URLs publicas mudem.

export const EXTERNAL_LINKS = {
  // Documentacao publica (GitHub Pages do repositorio central de documentacao
  // do projeto, MeasureSoftGram-Docs, onde vivem as paginas de comunidade).
  docs: 'https://fga-eps-mds.github.io/MeasureSoftGram-Docs/',
  // Organizacao no GitHub que reune os repositorios do projeto.
  repositories: 'https://github.com/fga-eps-mds',
};

// Rota interna de acesso ao sistema. Usuario logado e redirecionado ao
// dashboard pelo proprio fluxo de autenticacao; deslogado cai no login.
export const APP_ENTRY_ROUTE = '/auth';

// URL publica canonica da landing, usada nas tags Open Graph / Twitter Card
// para que o preview do link (WhatsApp, Slack, redes sociais) aponte sempre
// para o dominio de producao.
export const SITE_URL = 'https://msgram.lappis.rocks/';

// Imagem usada no preview do link. Aponta para um asset PNG existente do
// projeto (logo) para garantir que o crawler de OpenGraph encontre algo valido.
export const OG_IMAGE_PATH = '/images/png/logo.png';

// Publicacoes cientificas que fundamentam o MeasureSoftGram. Os dados de
// citacao (titulo, autores, veiculo) sao neutros de idioma e ficam aqui; a
// i18n cuida apenas do chrome da secao (titulo, subtitulo, rotulo do CTA).
// `url` aponta para o DOI resolvido pelo ACM/doi.org.
export const PUBLICATIONS = [
  {
    key: 'measuresoftgram',
    title: 'MeasureSoftGram: a future vision of software product quality',
    authors: 'Hilmer Rodrigues Neri, Guilherme Horta Travassos',
    venue: 'ACM/IEEE International Symposium on Empirical Software Engineering and Measurement (ESEM)',
    year: 2018,
    url: 'https://doi.org/10.1145/3239235.3267438',
  },
  {
    key: 'multidimensional',
    title: "Software Quality is Multidimensional: Let's play with Tensors",
    authors: 'Hilmer Rodrigues Neri, Guilherme Horta Travassos',
    venue: 'Brazilian Symposium on Software Engineering (SBES)',
    year: 2020,
    url: 'https://doi.org/10.1145/3422392.3422450',
  },
] as const;
