import React, { useState } from "react";
import { Button, Tooltip } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';


const Download = (props: any) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
        console.log(props.product.historical_values[props.kind])
        // const response = await fetch(props.product.historical_values[props.kind]);

        const response = await fetch(props.product.historical_values[props.kind])
        .then(response => response.json())
        console.log('response', response);

        const newProps = [];
        for (var key in response.results) {
          var item = response.results[key];
          newProps.push({
            id: item.id,
            key: item.key,
            name: item.name,
            history: item.history
          });
        }
        console.log('newProps', newProps);

        const startDate = new Date(props.startDate);
        const endDate = new Date(props.endDate);
        const filteredResults = response.results.map(item => {
            item.history = item.history.filter(historyItem => {
                const historyDate = new Date(historyItem.created_at);
                return historyDate >= startDate && historyDate <= endDate;
            });
            return item;
        });
        console.log('filtro', filteredResults);
        const json = JSON.stringify(filteredResults);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = props.kind + 'Historical.json';
        a.click();
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
