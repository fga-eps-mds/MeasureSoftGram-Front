import React from "react";

import { NextPageWithLayout } from "@pages/_app.next";

import getLayout from "@components/Layout";

import { useAuth } from '@contexts/Auth';
import Head from "next/head";

import { InfoData } from "@customTypes/home";

import { Container, Box, Typography } from "@mui/material";

import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import TerminalIcon from '@mui/icons-material/Terminal';
import InventoryIcon from '@mui/icons-material/Inventory';
import SendTimeExtensionIcon from '@mui/icons-material/SendTimeExtension';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import TuneIcon from '@mui/icons-material/Tune';

import CardInfo from "./components/CardInfo/CardInfo";

import ListNavCard from "./components/ListNavCard/ListNavCard";

const Home: NextPageWithLayout = () => {
  const { session } = useAuth();

  const cardsData: Array<InfoData> = [
    {
      id: "Organizações e Produtos",
      elements: [
        {
          imageSrc: <CorporateFareIcon/>,
          title: "Organizações",
          description: `Organizações são entidades ou empresas que se dedicam à criação, desenvolvimento e manutenção de produtos de software. Elas geralmente têm equipes compostas por engenheiros de software, designers, testadores e outros profissionais envolvidos no ciclo de vida do desenvolvimento de software.`,
        },
        {
          imageSrc: <TerminalIcon/>,
          title: "Produtos",
          description: `Produtos de software são soluções de software desenvolvidas para atender a necessidades específicas dos usuários. Eles são criados por meio da codificação de um conjunto de instruções lógicas, conhecidas como código-fonte, que define o comportamento do software. Os produtos de software podem variar desde aplicativos simples para dispositivos móveis até sistemas complexos para empresas. Eles são projetados para serem usados em computadores, servidores, dispositivos móveis ou outros dispositivos eletrônicos.`,
          routeTo: 'products',
        }
      ]
    },
    {
      id: "Repositórios e Releases",
      elements: [
        {
          imageSrc: <InventoryIcon/>,
          title: "Repositórios",
          description: `Repositórios de código são ambientes onde o código-fonte de um software é armazenado, versionado e gerenciado. Eles permitem que desenvolvedores e equipes colaborem no desenvolvimento de software, controlando as alterações feitas no código ao longo do tempo. Um produto pode ser composto por um ou mais repositórios.`,
        },
        {
          imageSrc: <SendTimeExtensionIcon/>,
          title: "Releases",
          description: `Releases são versões específicas de um software que são disponibilizadas para os usuários. Uma release pode conter novos recursos, melhorias de desempenho, correções de bugs ou atualizações de segurança. Cada repositório possui suas próprias releases. Existem dois tipos de releases, minor e major, o MeasureSoftGram atua na criação de releases major permitindo pré-configuração, configurações, balanceamento e alteração de pesos e métricas.`
        }
      ]
    },
    {
      id: "Visualização",
      title: "Visualização",
      elements: [
        {
          imageSrc: "/images/png/chart_behavior.png",
          title: "Gráfico Comportamento do Produto",
          description: `Gráfico de linha que apresenta no eixo X a linha do tempo e no eixo Y escala de valores de qualidade entre 0 e 1. Cada linha representa o desempenho de um repositório quanto ao indíce de qualidade gerado pelo modelo a cada release através do tempo.`
        },
        {
          imageSrc: "/images/png/chart_caracteristics.png",
          title: "Gráfico Características do Repositório",
          description: "Gráfico de linha que apresenta no eixo X a linha do tempo e no eixo Y escala de valores de qualidade entre 0 e 1. Cada linha representa o desempenho de uma característica quanto ao indíce de qualidade gerado pelo modelo a cada release através do tempo.",
        }
      ]
    },
    {
      id: "Pré-configuração",
      elements: [
        {
          imageSrc: <TuneIcon/>,
          title: "Pré-configuração",
          description: `Pré-configuração de release de cada produto. Por meio da pré-configuração (arquivo msgram.json) que são definidas características, subcaracterísticas e medidas padrões que serão consideradas para mensurar a qualidade do software analisado. Na pré-configuração também é definido os pesos de cada uma das entidades definidas.`
        }
      ]
    },
    {
      id: "Configuração",
      elements: [
        {
          imageSrc: <PermDataSettingIcon/>,
          title: "Configuração",
          description: `Permite a configuração de uma release estabelecendo valores que serão usados no modelo matemático de qualidade MSGRAM, valores estes: peso de referência para medidas; escolha de características e/ou subcaracterísticas e seus devidos pesos; métricas a serem avaliadas.`
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
          flexDirection="column"
        >
          <Box
            display="flex"
            flexDirection="column"
            rowGap="1rem"
            marginY="1rem"
            alignItems="flex-start"
          >
            <Box display="flex">
              <Typography variant="h4">
                Bem vindo
              </Typography>
              <Typography variant="h4">
                {session?.username ? `, ${session.username}` : ""}
              </Typography>
              <Typography
                variant="h4"
                marginLeft=".4rem">
                :)
              </Typography>
            </Box>
            <Typography variant="h5">
              Aqui você irá entender como funciona nosso produto!
            </Typography>
          </Box>

          <Box
            display="flex"
            columnGap="1rem"
            marginTop="3rem"
            flexWrap="wrap"
            justifyContent="space-between"
          >
            <Box
              display="flex"
              flex="1"
              flexDirection="column"
              minWidth="20%"
            >
              <ListNavCard navListData={navListData} />
            </Box>

            <Box
              display="flex"
              flex="1"
              minWidth="78%"
              flexDirection="column"
              maxHeight="74.7vh"
              gap="2rem"
              sx={{
                overflowY: "auto",
                scrollbarWidth: "thin",
                paddingRight: ".5rem",
                scrollbarColor: "rgba(0, 0, 0, 0.87)",
                '::-webkit-scrollbar': {
                  width: "5px",
                },
                '::-webkit-scrollbar-track': {
                  background: "transparent",
                  padding: "2px",
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

export default Home;
