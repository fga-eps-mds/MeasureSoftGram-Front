import React from 'react';

const ImageMock = (props) => {
  return <img {...props} alt={props.alt || ''} />;
};

export default ImageMock;
