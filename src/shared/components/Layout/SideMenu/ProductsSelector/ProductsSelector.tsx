import React from 'react';

import { FiBox, FiRepeat } from 'react-icons/fi';
import LetterAvatar from '@components/LetterAvatar';
import { useProductContext } from '@contexts/ProductProvider';
import useBoolean from '@hooks/useBoolean';
import { useRouter } from 'next/router';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import SideList from '../SideList';
import SideMenuItem from '../SideMenuItem';

function ProductSelector() {
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct, setCurrentProduct, productsList } = useProductContext();
  const { value: isOpen, setTrue: onClick, setFalse: onClose } = useBoolean(false);
  const router = useRouter();

  const onClickItem = (value: any) => {
    setCurrentProduct(value);
    onClose();
    void router.push(`/products/${currentOrganization?.id}-${value.id}-${value.name}`);
  };

  return (
    <>
      <SideMenuItem
        startIcon={<LetterAvatar name={currentProduct?.name ?? '?'} icon={<FiBox />} />}
        text={currentProduct?.name ?? 'Selecione o Produto'}
        endIcon={<FiRepeat />}
        tooltip="Seleção de Produto"
        onClick={onClick}
        selected={false}
      />
      <SideList
        itemType='product'
        seeMorePath="/products"
        values={productsList ?? []}
        open={isOpen}
        onClose={onClose}
        onClickItem={onClickItem}
      />
    </>
  );
}

export default ProductSelector;
