"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { AppLocale } from "@app/lib/i18n";
import { localePath } from "@app/lib/i18n/server";

const languages: { code: AppLocale; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

type Props = {
  locale: AppLocale;
};

export function LanguageSwitcherNext({ locale }: Props) {
  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newLocale = event.target.value as AppLocale;
    window.location.assign(localePath(newLocale));
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={locale}
          onChange={handleLanguageChange}
          sx={{
            color: "white",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.3)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.5)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "white",
            },
            "& .MuiSelect-icon": {
              color: "white",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: "background.paper",
                "& .MuiMenuItem-root": {
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                },
              },
            },
          }}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <Typography component="span" sx={{ mr: 1 }}>
                {lang.flag}
              </Typography>
              <Typography component="span">{lang.name}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
