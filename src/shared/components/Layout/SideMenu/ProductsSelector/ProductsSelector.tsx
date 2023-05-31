import React from 'react';

import { FiBox, FiRepeat } from 'react-icons/fi';
import LetterAvatar from '@components/LetterAvatar';
import { useProductContext } from '@contexts/ProductProvider';
import useBoolean from '@hooks/useBoolean';
import SideList from '../SideList';
import SideMenuItem from '../SideMenuItem';

function ProductSelector() {
  const { currentProduct, setCurrentProduct, productsList } = useProductContext();
  const { value: isOpen, setTrue: onClick, setFalse: onClose } = useBoolean(false);

  return (
    <>
      <SideMenuItem
        startIcon={<LetterAvatar name={currentProduct?.name || '?'} icon={<FiBox />} />}
        text={currentProduct?.name || 'Selecione o Produto'}
        endIcon={<FiRepeat />}
        tooltip="Seleção de Produto"
        onClick={onClick}
      />
      <SideList values={[...productsList]} open={isOpen} onClose={onClose} onClickItem={setCurrentProduct} />
    </>
  );
}

export default ProductSelector;
