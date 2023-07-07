import React from "react";

import Link from "next/link";

import { Box, Typography, Card, Button, CardMedia, CardContent } from "@mui/material";

import { InfoData } from "@customTypes/home";

interface Props {
  cardData: InfoData,
}

const CardInfo: React.FC<Props> = ({ cardData }) => (
  <Card
    id={cardData?.id}
    sx={{
      overflow: "visible",
      borderShadow: "none",
      borderRadius: "5px",
      display: "flex",
      flexDirection: "column",
      flex: "1"
    }}
  >
    {cardData?.title &&
      <Box
        display="flex"
        justifyContent="center"
        marginTop="1rem"
      >
        <Typography
          variant="h5"
        >
          {cardData?.title}
        </Typography>
      </Box>
    }
    {cardData.elements.map(data => (
      <CardContent
        key={data.title}
        sx={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          gap="1rem"
          flexDirection="row"
          sx={{
            '@media screen and (max-device-width:1170px), screen and (max-width:1170px)': {
              flexDirection: 'column',
              '#images': {
                width: '100%',
                '> img:hover': {
                    zIndex: "10",
                    transform: "translateY(3vw) scale(1.5)!important"
                }
              },
              '#texts': {
                maxWidth: '100%'
              }
            }
          }}
        >
          <Box
            id="images"
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="50%"
          >
            { typeof data.imageSrc === 'string'
              ?
                <CardMedia
                  component="img"
                  image={data.imageSrc}
                  alt="green iguana"
                  sx={{
                    margin: "1rem 1rem 1rem 1rem",
                    maxWidth: "150px",
                    height: "auto",
                    maxHeight: "150px",
                    overflow: "hidden",
                    borderRadius: "5px",
                    transition: "transform .5s ease",

                  }}
                />
              :
                <Box
                  sx={{
                    maxWidth: "400px",
                    margin: "1rem 1rem 1rem 1rem",
                    height: "auto",
                    maxHeight: "200px",
                    '> svg': {
                      fontSize: '150px'
                    }
                  }}
                >
                  { data.imageSrc }
                </Box>
            }
          </Box>
          <Box
            id="texts"
            display="flex"
            margin="1rem 1rem 1rem 0"
            flexDirection="column"
            maxWidth="50%"
            alignItems="center"
            alignContent="center"
            width="100%"
          >
            <Typography
              gutterBottom
              variant="h5"
              component="div"
              align="center"
              color= "#33568E"
              fontWeight= "bold"
            >
              {data.title}
            </Typography>
            <Typography
              variant="body1"
              textAlign="justify"
            >
              {data.description}
            </Typography>
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
        >
          {data?.routeTo
            ? <Box
                display="flex"
                margin="1rem"
                justifyContent="start"
                width="300px"
              >
                <Link href="/products">
                  <Button variant="contained" fullWidth>
                    Ir para
                  </Button>
                </Link>
              </Box>
            : ''}
        </Box>
      </CardContent>
    ))}
  </Card>
);

export default CardInfo;
