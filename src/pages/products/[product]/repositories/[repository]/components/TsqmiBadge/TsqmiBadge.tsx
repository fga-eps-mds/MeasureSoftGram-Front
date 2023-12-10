import { Box, Tooltip } from '@mui/material';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { TsqmiValue } from '@customTypes/product';

const oneStarBadge = '/images/svg/badges/1stars.svg';
const twoStarBadge = '/images/svg/badges/2stars.svg';
const threeStarBadge = '/images/svg/badges/3stars.svg';
const fourStarBadge = '/images/svg/badges/4stars.svg';
const fiveStarBadge = '/images/svg/badges/5stars.svg';
const zeroStarBadge = '/images/svg/badges/0stars.svg';

interface TsqmiBadgeProps {
  latestTSQMI: TsqmiValue;
  latestTSQMIBadgeUrl: string;
}

function TsqmiBadge({ latestTSQMI, latestTSQMIBadgeUrl }: TsqmiBadgeProps) {
  const [showBadge, setShowBadge] = useState<boolean>(false);
  const [badgePath, setBadgePath] = useState<any>('');

  useEffect(() => {
    setStars();
  }, [latestTSQMI])

  const setStars = () => {
    let star: any;

    if (latestTSQMI) {
      const value = latestTSQMI.value;

      switch (true) {
        case value == 0:
          star = zeroStarBadge;
          break;
        case 0 < value && value < 0.2:
          star = oneStarBadge;
          break;
        case 0.2 <= value && value < 0.4:
          star = twoStarBadge;
          break;
        case 0.4 <= value && value < 0.6:
          star = threeStarBadge;
          break;
        case 0.6 <= value && value < 0.8:
          star = fourStarBadge;
          break;
        case 0.8 <= value && value <= 1.0:
          star = fiveStarBadge;
          break;
        default:
          star = null;
      }
    }

    if (star) {
      setBadgePath(star)
      setShowBadge(true);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`![TSQMI Rating](${latestTSQMIBadgeUrl})`);
    toast.success('Copiado com sucesso!');
  }
  return (
    <>
      {showBadge &&
        <Tooltip title="Copiar para área de transferência" placement="bottom">
          <Box
            display="flex"
            justifyContent="center"
            sx={{
              ':hover': {
                cursor: 'pointer',
              }
            }}
            onClick={copyToClipboard}
          >
            <img src={badgePath} alt="Exemplo SVG" style={{ width: '120px', height: '25px' }} />
          </Box>
        </Tooltip>
      }
    </>
  );
}

export default TsqmiBadge;
