import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import getLayout from '@components/Layout';
import { toast } from 'react-toastify';
import { TextField, MenuItem } from '@mui/material';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { Botoes, Container, Description, Form, Header, Wrapper } from '@pages/organizations/styles';
import { useTranslation } from 'react-i18next';
import MSGButton from '../../../components/idv/buttons/MSGButton';
import { useProductQuery } from '../hooks/useProductQuery';

interface OrganizationsType extends React.FC {
  getLayout?: () => React.ReactNode;
}

const ProductsCreation: OrganizationsType = () => {
  const router = useRouter();
  const [nome, setName] = useState('');
  const [descricao, setDescription] = useState('');
  const [organizationId, setOrganizationId] = useState<number>();
  const { organizationList, setCurrentOrganizations } = useOrganizationContext();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { createProduct, getProductById, updateProduct } = useProductQuery();
  const currentOrganizationId = router.query.id_organization;
  const currentProductId = router.query.id_product;
  const { setCurrentProduct, loadAllProducts } = useProductContext();
  const { t } = useTranslation('product');

  useEffect(() => {
    const editMode = router.query.id_product;
    if (editMode) {
      setIsEditMode(true);
      const fetchProductData = async () => {
        try {
          const result = await getProductById(currentOrganizationId as string, currentProductId as string);

          if (result.type === 'success') {
            setName(result.value.name);
            setDescription(result.value.description || '');
            setOrganizationId(result.value.organizationId || 0);
          }
        }
        catch (e) {
          console.log(e)
        }
      };
      fetchProductData();
    }
  }, [router.query.id_product]);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const novoProduto = {
      name: nome,
      description: descricao,
      organizationId,
    }

    let result;

    if (!novoProduto.organizationId && currentOrganizationId) {
      const orgIdStr = Array.isArray(currentOrganizationId) ? currentOrganizationId[0] : currentOrganizationId;
      novoProduto.organizationId = parseInt(orgIdStr, 10);
    }

    const nameExist = t('toast.name-exists')

    if (isEditMode) {
      result = await updateProduct(currentProductId as string, novoProduto);
      if (result.type === 'success') {
        toast.success(t('toast.success-edit'));
        router.push('/products');
      } else if (result.error.message === nameExist) {
        toast.error(nameExist);
      } else {
        toast.error(t('toast.error-edit'));
      }
    } else {

      try {
        result = await createProduct(novoProduto);
        if (result.type === 'success') {
          toast.success(t('toast.sucess'));
          const createdProduct = result.value as any;
          if (createdProduct && createdProduct.id) {
            localStorage.setItem('selectedProductId', JSON.stringify(createdProduct.id.toString()));
            setCurrentProduct(createdProduct);
          }
          if (organizationId || currentOrganizationId) {
            const finalOrgId = organizationId || (currentOrganizationId ? parseInt(currentOrganizationId as string, 10) : null);
            if (finalOrgId) {
              localStorage.setItem('selectedOrgId', JSON.stringify(finalOrgId.toString()));
              const selectedOrg = organizationList?.find(org => org.id === finalOrgId);
              if (selectedOrg) {
                setCurrentOrganizations([selectedOrg]);
              }
            }
          }
          await loadAllProducts();
          router.push('/products');
        } else if (result.error.message === nameExist) {
          toast.error(nameExist);
        } else {
          toast.error(t('toast.error-create'));
        }
      }
      catch (e) {
        console.log(e)
      }
    }
  };

  return (
    <Container>
      <Header>{isEditMode ? t('title-edit') : t('title-create')}</Header>
      <Wrapper>
        <Description>
          {t('description')}
        </Description>

        <form onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Form>
            <TextField
              select
              required
              fullWidth
              label={t('label-input')}
              variant="outlined"
              value={organizationId || currentOrganizationId}
              onChange={(e) => setOrganizationId(+e.target.value)}
              multiline
              rows={4}
              sx={{ mb: 2 }}
              data-testid="org-input"
            >
              {
                organizationList?.map((organization) => (
                  <MenuItem key={organization.id} value={organization.id}>{organization.name}</MenuItem>
                ))
              }
            </TextField>

            <TextField
              fullWidth
              label={t('name-input')}
              variant="outlined"
              value={nome}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 2 }}
              data-testid="name-input"
            />

            <TextField
              fullWidth
              label={t('description-input')}
              variant="outlined"
              value={descricao}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              sx={{ mb: 2 }}
              data-testid="description-input"
            />
            <Botoes>
              <MSGButton width="200px" variant='secondary' onClick={() => router.push('/products')}  >{t('back')}</MSGButton>

              <MSGButton width="200px" type='submit' >{isEditMode ? t('save') : t('create')}</MSGButton>
            </Botoes>
          </Form>
        </form>
      </Wrapper>
    </Container >
  );
};

ProductsCreation.getLayout = getLayout;

export default ProductsCreation;
