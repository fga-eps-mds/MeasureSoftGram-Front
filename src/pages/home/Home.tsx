import React from "react";

import { NextPageWithLayout } from "@pages/_app.next";

import getLayout from "@components/Layout";

import Head from "next/head";

import { InfoData } from "@customTypes/home";

import { Container, Box, Typography } from "@mui/material";

import useRequireAuth from "@hooks/useRequireAuth";

import CardInfo from "./components/CardInfo/CardInfo";

import ListNavCard from "./components/ListNavCard/ListNavCard";

const Home: NextPageWithLayout = () => {
  useRequireAuth();

  const cardsData: Array<InfoData> = [
    {
      id: "Organizações e Produtos",
      elements: [
        {
          imageSrc: "/images/png/structure.png",
          title: "Organizações",
          description: "Na página de organizações, você pode encontrar uma lista de todas as organizações que estão utilizando o MeasureSoftGram, além de encontrar também todos os seus produtos cadastrados.",
          routeTo: 'products'
        },
        {
          imageSrc: "/images/png/development.png",
          title: "Produtos",
          description: "Os produtos são softwares que pertencem à alguma organização e que possuem algum cliente. Por conta de sua natureza, um mesmo produto pode possuir vários repositórios associados à ele, o que permite uma implementação continua em mais de uma frente de trabalho.",
          routeTo: 'products/create'
        }
      ]
    },
    {
      id: "Repositórios e Releases",
      elements: [
        {
          imageSrc: "/images/png/folders.png",
          title: "Repositórios",
          description: "Repositórios são espaços de armazenamento de pacotes de software. Esses pacotes podem ser acessados e instalados por qualquer um que tenha aceso à eles, porém, o repositório armazena apenas modificações de quem é autorizado para isso. Tal característica permite que um único produto possua diversos repositórios, sendo que cada um possui as próprias modificações, permitindo o desenvolvimento simultâneo de funcionalidades diferentes."
        },
        {
          imageSrc: "/images/png/new-offer.png",
          title: "Releases",
          description: "Releases representam as versões de lançamentos de um produto. Um produto, sistema computacional e seus subsistemas pode ter seu código-fonte centralizado em um repositório ou distribuído em múltiplos. No caso de múltiplos repositórios cada um possui suas respectivas releases. Além disso, existem dois tipos de releases, as majors e minors. O MeasureSoftGram atua no planejamento das releases majors utilizando a pré-configuração e suas subsequentes configurações."
        }
      ]
    },
    // {
    //   id: "Visualização",
    //   title: "Visualização",
    //   elements: [
    //     {
    //       imageSrc: "/images/png/chart_behavior.png",
    //       title: "Gráfico Comportamento do Produto",
    //       description: `Gráfico de linha que apresenta no eixo X a linha do tempo e no eixo Y escala de valores de qualidade entre 0 e 1. Cada linha representa o desempenho de um repositório quanto ao indíce de qualidade gerado pelo modelo a cada release através do tempo.`
    //     },
    //     {
    //       imageSrc: "/images/png/chart_caracteristics.png",
    //       title: "Gráfico Características do Repositório",
    //       description: "Gráfico de linha que apresenta no eixo X a linha do tempo e no eixo Y escala de valores de qualidade entre 0 e 1. Cada linha representa o desempenho de uma característica quanto ao indíce de qualidade gerado pelo modelo a cada release através do tempo.",
    //     }
    //   ]
    // },
    {
      id: "Pré-configuração",
      elements: [
        {
          imageSrc: "/images/png/setting.png",
          title: "Pré-configuração",
          description: " A Pré-configuração representa o setup do modelo. Ela traz habilitada todas as métricas, medidas e seus valores de referência, subcaracterísticas, características, calculadas pelo modelo. Também há uma pré-definição dos pesos relativos para as medidas, subcaracterísticas e características, que são distribuídos de forma proporcional às respectivas quantidades.  Ao planejar a primeira release do produto, a  pré-configuração “deixa de existir” e passam haver as configurações. É definida no arquivo msgram.json."
        }
      ]
    },
    {
      id: "Configuração",
      elements: [
        {
          imageSrc: "/images/png/web-management.png",
          title: "Configuração",
          description: "Uma configuração representa o resultado do planejamento dos objetivos de medição da qualidade de um release. Esse planejamento envolve a definição de qual(ais) características da qualidade que serão observadas durante o período de desenvolvimento de um release. Assim, é possível escolher e configurar os parâmetros das métricas, medidas e indicadores, em  todos os níveis do modelo. É possível definir valores de pesos, matriz da relação das características, valores de referência das medidas e escolha de características, sub-características, métricas e medidas a a serem observadas."
        }
      ]
    }
  ];

  const navListData: Array<string> = cardsData.map(cardData => cardData.id);

  return (
    <>
      <Head>
        <title> Tela inicial MeasureSoftGram </title>
      </Head>

      <Container>
        <Box
          display="flex"
          flexDirection="row"
          >
          <Box
            display="flex"
            flexDirection="column"
            rowGap="1rem"
            alignItems="flex-start"
            width="26%"
            padding="1rem"
            position="sticky"
            top="0"
            maxHeight="72vh"
            >
            <Box display="flex">
              <Typography variant="h4" style={{color: "#33568E", fontWeight: "bold"}}>
                Página inicial
              </Typography>
            </Box>
            <Box>
              <Typography style={{fontSize: "16px"}}>
                Aqui você poderá obter algumas informações sobre nosso produto.
              </Typography>
            </Box>

            <Box
              display="flex"
              flex="1"
              flexDirection="column"
              minWidth="20%"
            >
              <ListNavCard navListData={navListData} />
            </Box>
          </Box>

          <Box
            display="flex"
            columnGap="1rem"
            justifyContent="space-between"
            width="74%"
            marginTop="5%"
            marginBottom="5%"
          >
            <Box
              display="flex"
              flex="1"
              minWidth="78%"
              flexDirection="column"
              gap="2rem"
              sx={{
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0, 0, 0, 0.87)",
                '::-webkit-scrollbar': {
                  width: "5px",
                },
                '::-webkit-scrollbar-track': {
                  background: "transparent",
                },
                '::-webkit-scrollbar-thumb': {
                  backgroundColor: "#C5C5C5",
                  borderRadius: "5px",
                }
              }}
            >
              {
                cardsData.map(cardData => (
                  <CardInfo
                    key={cardData?.id}
                    cardData={cardData}
                  />
                ))
              }
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

Home.getLayout = getLayout;
Home.disableBreadcrumb = true;

export default Home;
