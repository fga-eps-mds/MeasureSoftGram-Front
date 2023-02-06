import React, { useState } from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { parse } from 'date-fns';

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
      const res = await fetch(product.historical_values[kind]).then((response) => response.json());
      const { results } = res;

      let d_start = parse(startDate, 'dd/MM/yyyy', new Date());
      let d_end = parse(endDate, 'dd/MM/yyyy', new Date());
      const parsedStartDate = (d_start) instanceof Date && !isNaN(d_start)
      ? parse(startDate, 'dd/MM/yyyy', new Date())
      : parse(res.results[0].history[0].created_at, "yyyy-MM-dd'T'HH:mm:ssxxx", new Date());
      const parsedEndDate = (d_end) instanceof Date && !isNaN(d_end)
      ? parse(endDate, 'dd/MM/yyyy', new Date())
      : parse(res.results[0].history[res.results[0].history.length-1].created_at, "yyyy-MM-dd'T'HH:mm:ssxxx", new Date());

      parsedStartDate.setHours(0, 0, 0, 0);
      parsedEndDate.setHours(0, 0, 0, 0);
      
      const filteredResults = results.map((item: any) => {
        const history = item.history.filter((historyItem: any) => {
          const historyDate = new Date(historyItem.created_at);
          historyDate.setHours(0, 0, 0, 0);
          return historyDate >= parsedStartDate && historyDate <= parsedEndDate;
        });
        return { ...item, history };
      });
      
      const json = JSON.stringify(filteredResults);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${kind}Historical.json`;
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
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload} disabled={loading}>
          {loading ? 'Downloading...' : 'Download'}
        </Button>
      </p>
    </div>
  );
};

export default Download;
