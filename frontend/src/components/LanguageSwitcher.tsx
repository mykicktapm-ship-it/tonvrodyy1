import React from 'react';
import { Menu, MenuButton, MenuItem, MenuList, Button } from '@chakra-ui/react';
import { Locale } from '../i18n';
import { useTranslation } from '../LanguageContext';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const handleChange = (lng: Locale) => setLocale(lng);
  const label = locale === 'ru' ? 'RU' : 'EN';
  return (
    <Menu>
      <MenuButton as={Button} size="sm" variant="outline" colorScheme="blue">
        {label}
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => handleChange('en')}>English</MenuItem>
        <MenuItem onClick={() => handleChange('ru')}>Русский</MenuItem>
      </MenuList>
    </Menu>
  );
}

