import React from 'react';
import Measure from './components/Measure';

interface Props {
  layer: string;
}
const SwitchLayer: React.FC<Props> = ({ layer }) => {
  if (layer === 'measure') {
    return <Measure />;
  }
  return <>oi</>;
};

export default SwitchLayer;
