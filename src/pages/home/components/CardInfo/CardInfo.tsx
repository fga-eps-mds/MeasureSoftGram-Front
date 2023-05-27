import React from "react";

import Link from "next/link";

import { Box, Typography, Card, Button, CardMedia, CardContent } from "@mui/material";

import { InfoData } from "@customTypes/home";

interface Props {
  cardData: InfoData,
}

const CardInfo: React.FC<Props> = ({ cardData }) => (
  <Card id={cardData?.id} sx={{ overflow: "visible", borderShadow: "none", borderRadius: "30px", display: "flex", flexDirection: "column", flex: "1", border: "1px solid #113D4C" }}>
    {cardData.elements.map(data => (
      <CardContent key={data.title} sx={{ display: "flex", height: "100%", flexDirection: "column", }}>
        <Box display="flex" justifyContent="space-between" gap="1rem" flexDirection="row">
          <CardMedia
            component="img"
            image={data.imageSrc}
            alt="green iguana"
            sx={{ width: "50%", margin: "1rem 1rem 1rem 1rem", maxWidth: "400px", height: "auto", maxHeight: "200px", borderRadius: "30px" }}
          />
          <Box display="flex" margin="1rem 1rem 1rem 0" flexDirection="column" maxWidth="50%" alignItems="center" alignContent="center" width="100%">
            <Typography gutterBottom variant="h5" component="div" align="center">
              {data.title}
            </Typography>
            <Typography variant="body1" textAlign="center">
              {data.description}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" flexDirection="row" justifyContent="center">
          {data?.routeTo
            ? <Box display="flex" margin="1rem" justifyContent="start" width="300px">
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
