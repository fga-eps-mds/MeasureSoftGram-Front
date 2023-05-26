import React from "react";

import Link from "next/link";

import { Box, Typography, Card, Button, CardMedia, CardContent } from "@mui/material";

import { InfoDataType } from "@customTypes/home";

interface Props {
  cardData: Array<InfoDataType>,
}

const CardInfo: React.FC<Props> = ({ cardData }) => (
  <Card id={cardData.at(0)?.title} sx={{ overflow: "visible", borderShadow: "none", borderRadius: "30px", display: "flex", flexDirection: "column", height: "100%", flex: "1" }}>
    {cardData.map(data => (
      <CardContent sx={{ display: "flex", height: "100%", flexDirection: "column", }}>
        <Box display="flex" justifyContent="space-between" gap="2rem">
          <CardMedia
            component="img"
            image={data.imageSrc}
            alt="green iguana"
            sx={{ width: "50%", padding: "0 1rem 1rem 1rem", maxWidth: "400px", height: "auto", maxHeight: "200px", borderRadius: "30px" }}
          />
          <Box display="flex" flexDirection="column" maxWidth="50%">
            <Typography gutterBottom variant="h5" component="div" align="center">
              {data.title}
            </Typography>
            <Typography variant="body1" textAlign="center">
              {data.description}
            </Typography>
          </Box>
        </Box>
        {data?.routeTo
          ? <Box display="flex" marginTop="2rem" justifyContent="start" maxWidth="50%" padding="0 4rem 0 2rem">
            <Link href="/products">
              <Button variant="contained" fullWidth>
                Ir para
              </Button>
            </Link>
          </Box>
          : ''}
      </CardContent>
    ))}
  </Card>
);

export default CardInfo;
