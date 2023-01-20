import React, { useState } from "react";
import { Button, Tooltip } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';


const Download = (props: any) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
        console.log(props.product.historical_values[props.kind])
        const response = await fetch(props.product.historical_values[props.kind]);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = props.kind + 'Historical.json';
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
