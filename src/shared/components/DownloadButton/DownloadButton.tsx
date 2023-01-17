import React, { useState } from "react";
import { Button, Tooltip } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';

const Download = () => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
        const response = await fetch('http://localhost:8080/api/v1/organizations/1/products/1/repositories/1/historical-values/sqc/');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'relatorio_de_qualidade.json';
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.log(error);
    } finally {
        setLoading(false);
    }
  };
  return (
          <div className="Download">
            <p>
              <Button variant="outlined" startIcon={<DownloadIcon />}
                onClick={handleDownload} disabled={loading}>
                {loading ? 'Downloading...' : 'Download'}
              </Button>
            </p>
          </div>
        );
};

export default Download;
