import React from "react";

import { NextPageWithLayout } from "@pages/_app.next";

import getLayout from "@components/Layout";

import { useAuth } from '@contexts/Auth';
import Head from "next/head";

import { InfoData } from "@customTypes/home";

import { Container, Box, Typography } from "@mui/material";

import CardInfo from "./components/CardInfo/CardInfo";

import ListNavCard from "./components/ListNavCard/ListNavCard";

const Home: NextPageWithLayout = () => {
  const { session } = useAuth();

  const cardsData: Array<InfoData> = [
    {
      id: "Organizações e Produtos",
      elements: [
        {
          imageSrc: "/images/png/organizations.png",
          title: "Organizações",
          description: `Organização é uma palavra originada do grego "organon", que significa instrumento, utensílio. Em Administração, o termo "organização" pode ter três sentidos: Associação de pessoas que combinam esforços individuais e em equipe com a finalidade de realizar propósitos colectivos`,
        },
        {
          imageSrc: "/images/png/products.png",
          title: "Produtos",
          description: `Um projeto em "negócio" e ciência é normalmente definido como um empreendimento, frequentemente envolvendo pesquisa ou desenho, que tem como objetivo alcançar um resultado exclusivo`,
          routeTo: 'products',
        }
      ]
    },
    {
      id: "Repositórios e Releases",
      elements: [
        {
          imageSrc: "/images/png/repository.png",
          title: "Repositórios",
          description: `Uma breve explicação sobre os reposotórios.`,
        },
        {
          imageSrc: "/images/png/release.png",
          title: "Releases",
          description: `Uma breve explicação sobre as releases.`
        }
      ]
    },
    {
      id: "Gráficos",
      elements: [
        {
          imageSrc: "/images/png/chart_example.png",
          title: "Gráficos",
          description: `Uma breve explicação sobre os gráficos apresentados no site.`
        }
      ]
    },
    {
      id: "Configuração e Pré-configuração",
      elements: [
        {
          imageSrc: "/images/png/config.png",
          title: "Configuração",
          description: `Uma breve explicação sobre as configurações basicas e a seleção de caracteristicas.`
        },
        {
          imageSrc: "/images/png/pre-config.png",
          title: "Pré-configuração",
          description: `Por meio da pré-configuração que é definido quais características, subcaracterísticas e medidas serão consideradas para mensurar a qualidade do software analisado. Na pré-configuração também é definido os pesos de cada uma das entidades definidas.`
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
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column" rowGap="1rem" marginY="1rem" alignItems="flex-start">
            <Box display="flex">
              <Typography variant="h4">
                Bem vindo
              </Typography>
              <Typography variant="h4">
                {session?.username ? `, ${session.username}` : ""}
              </Typography>
              <Typography variant="h4" marginLeft=".4rem">
                :)
              </Typography>
            </Box>
            <Typography variant="h5">
              Aqui você irá entender como funciona nosso produto!
            </Typography>
          </Box>

          <Box display="flex" columnGap="1rem" marginTop="3rem" flexWrap="wrap" justifyContent="space-between">
            <Box display="flex" flex="1" flexDirection="column" minWidth="20%">
              <ListNavCard navListData={navListData} />
            </Box>

            <Box display="flex" flex="1" minWidth="78%" flexDirection="column" maxHeight="78vh" gap="2rem" sx={{
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
            }}>
              {
                cardsData.map(cardData => (
                  <CardInfo key={cardData?.id} cardData={cardData} />
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
