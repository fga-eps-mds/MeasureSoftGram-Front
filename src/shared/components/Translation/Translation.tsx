import React from 'react';
import { Box, Button } from '@mui/material';
import Image from "next/image";

interface TranslationProps {
  t: any,
  i18n: any,
}

const changeLanguage = (i18n: any, language: string) => {
  window.localStorage.setItem('locale_lang', language);
  i18n.changeLanguage(language);
}

const languages = [
  { code: 'en', translateKey: 'en' },
  { code: 'pt', translateKey: 'pt' },
]

function getImageSrc(key: string) {
  return `/images/png/${key}.png`
}

const Translation = ({ t, i18n }: TranslationProps) => (
    <Box sx={{ display: 'flex' }}>
        {languages.map((language) => (
          <Button
            type='button'
            data-id={`${language.code}-button`}
            sx={{ minWidth: '0' }}
            className={i18n.language === language.code ? 'active' : undefined}
            onClick={() => changeLanguage(i18n, language.code)}
            key={language.code}
          >
            <Image src={getImageSrc(t(language.translateKey))} alt="flag" height={30} width={30} />
          </Button>
        ))}
      </Box>
  );

export default Translation;
