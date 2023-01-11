import React, { useState } from "react";
import { Button } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';

const file = "/src/test2.py";

export default function Download() {
  const [download, setDownload] = useState("");
  const [count, setCount] = useState(0);
  return (
    <div className="Download">
      <p>
        <Button
          onClick={() => {
            setDownload(file);
            setCount((old) => old + 1);
          }}variant="outlined" startIcon={<DownloadIcon />}
        >
          Download
        </Button>
      </p>
      <p>{download}</p>
    </div>
  );
}
