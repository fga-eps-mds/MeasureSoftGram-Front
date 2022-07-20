import { ParsedUrlQuery } from 'querystring';
import React from 'react';

import Measures from '../Measures';
import ProjectContent from '../ProjectContent';

const TabSwitch = ({ layer }: ParsedUrlQuery) => {
  switch (layer) {
    case "measures":
      return <Measures />

    case "metrics":
      return <ProjectContent />

    default:
      return <ProjectContent />
  }
}

export default TabSwitch;
