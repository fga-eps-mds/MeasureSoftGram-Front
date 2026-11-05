import { Tooltip } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';


interface SectionTooltipProps {
  text: string;
  tooltip: string;
  id?: string
}

export default function SectionTooltip({ text, tooltip, id }: SectionTooltipProps) {
  return <h2 id={id} style={{ color: '#538BA3', fontWeight: '500', display: "flex", alignItems: "center" }}>
    {text}
    <Tooltip sx={{ marginLeft: 1 }} title={tooltip}>
      <InfoIcon />
    </Tooltip>
  </h2>
}
