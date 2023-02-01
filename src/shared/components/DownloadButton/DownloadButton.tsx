import React, { useState } from "react";
import { Button, Tooltip } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { parse } from 'date-fns'


interface DownloadProps {
  product: any;
  kind: string;
  startDate: string;
  endDate: string;
}

const Download = ({ product, kind, startDate, endDate }: DownloadProps) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
        const response = await fetch(product.historical_values[kind])
          .then(response => response.json())

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

        const parsedStartDate = parse(startDate, 'dd/MM/yyyy', new Date());
        const parsedEndDate = parse(endDate, 'dd/MM/yyyy', new Date());
        parsedStartDate.setHours(0, 0, 0, 0);
        parsedEndDate.setHours(0, 0, 0, 0);

        const filteredResults = response.results.map((item: any) => {
          item.history = item.history.filter((historyItem: any) => {
            const historyDate = new Date(historyItem.created_at);
            historyDate.setHours(0, 0, 0, 0);
            return (historyDate >= parsedStartDate) && (historyDate <= parsedEndDate);
          });
          return item;
        });
        const json = JSON.stringify(filteredResults);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = kind + 'Historical.json';
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
