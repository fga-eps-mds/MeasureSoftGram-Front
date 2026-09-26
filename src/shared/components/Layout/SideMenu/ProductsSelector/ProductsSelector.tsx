import React, { useEffect } from 'react';
import { FiBox } from 'react-icons/fi';
import LetterAvatar from '@components/LetterAvatar';
import { useProductContext } from '@contexts/ProductProvider';
import { useRouter } from 'next/router';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useSideMenuContext } from '@contexts/SidebarProvider/SideMenuProvider';
import { useTranslation } from 'react-i18next';
import { Product } from '@customTypes/product';
import SideMenuItem from '../SideMenuItem';
import MSGSelectBox from '../../../../../components/idv/inputs/MSGSelectBox';

function ProductSelector() {
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct, setCurrentProduct, productsList } = useProductContext();
  const { toggleCollapse, isCollapsed } = useSideMenuContext();
  const router = useRouter();

  const onChange = (value: Product) => {
    if (productsList) {
      const selectedProduct = productsList.find(product => product.id === value.id) || null;
      setCurrentProduct(selectedProduct);
      router.push(`/products/${currentOrganization?.id}-${selectedProduct?.id}-${selectedProduct?.name}`);
    }
  };


  const { t } = useTranslation('sidebar');

  return (
    <>
      {!isCollapsed ?
        currentOrganization && (
          <MSGSelectBox
            label={t('product.placeholder')}
            width="98%"
            options={productsList}
            onChange={onChange}
            value={currentProduct?.id}
          />
        ) :
        <SideMenuItem
          startIcon={<LetterAvatar name={currentProduct?.name ?? '?'} icon={<FiBox color="#ffffff" />} />}
          text={currentProduct?.name ?? t("product.placeholder")}
          tooltip={t("tooltip.product-selection")}
          onClick={() => toggleCollapse()}
          selected={false}
        />
      }
    </>
  );
}

export default ProductSelector;
