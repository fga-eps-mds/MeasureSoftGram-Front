import React, { useState, useEffect } from 'react';
import {
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { parse } from 'date-fns';
import convertToCsv from '@utils/convertToCsv';

interface OptionCheckedProps {
  [key: string]: boolean;
}

interface DownloadProps {
  product: any;
  kind: string;
  startDate: string;
  endDate: string;
  checkedOptions: OptionCheckedProps;
}

const Download = ({ product, kind, startDate, endDate, checkedOptions }: DownloadProps) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('json');

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(product.historical_values[kind]).then((response) => response.json());
      const { results } = res;

      const d_start = parse(startDate, 'dd/MM/yyyy', new Date());
      const d_end = parse(endDate, 'dd/MM/yyyy', new Date());
      const parsedStartDate =
        d_start instanceof Date && !isNaN(d_start)
          ? parse(startDate, 'dd/MM/yyyy', new Date())
          : parse(res.results[0].history[0].created_at, "yyyy-MM-dd'T'HH:mm:ssxxx", new Date());
      const parsedEndDate =
        d_end instanceof Date && !isNaN(d_end)
          ? parse(endDate, 'dd/MM/yyyy', new Date())
          : parse(
            res.results[0].history[res.results[0].history.length - 1].created_at,
            "yyyy-MM-dd'T'HH:mm:ssxxx",
            new Date()
          );

      parsedStartDate.setHours(0, 0, 0, 0);
      parsedEndDate.setHours(0, 0, 0, 0);

      const filteredResults = results
        .filter((item: any) => checkedOptions[item.key])
        .map((item: any) => {
          const history = item.history.filter((historyItem: any) => {
            const historyDate = new Date(historyItem.created_at);
            historyDate.setHours(0, 0, 0, 0);
            return historyDate >= parsedStartDate && historyDate <= parsedEndDate;
          });
          return { ...item, history };
        });

      if (downloadFormat === 'json') {
        const json = JSON.stringify(filteredResults);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${kind}Historical.json`;
        a.click();
      } else if (downloadFormat === 'csv') {
        const csv = convertToCsv(filteredResults);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${kind}Historical.csv`;
        a.click();
      }
    } catch (error) {

    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDownloadFormat(event.target.value);
  };
  return (
    <div className="Download">
      <p>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleClickOpen} disabled={loading}>
          {loading ? 'Downloading...' : 'Download'}
        </Button>
      </p>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Escolha um formato para o download</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="download-format"
              name="download-format"
              value={downloadFormat}
              onChange={handleFormatChange}
            >
              <FormControlLabel value="json" control={<Radio />} label="JSON" />
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDownload} color="primary" disabled={loading}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Download;
