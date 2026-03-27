import {useTranslation} from "react-i18next";
import {AlIcon, ChromeIcon, ExcelIcon, MonitorIcon} from "@/shared/icons";

import {
    StyledBox,
    StyledDescription,
    StyledHeader,
    StyledAIIcon,
    StyledChromeIcon,
    StyledExcelIcon,
    StyledMonitorIcon,
    StyledAccentLink,
    StyledTitle,
} from './styled-components.ts'

export const FeaturesBox = () => {

    const { t, i18n } = useTranslation();
    const locale = (i18n.resolvedLanguage ?? i18n.language ?? 'en').split('-')[0];

    const features = [
        {
            title: t('landing.features.contextAI.title'),
            text: `${t('landing.features.contextAI.subtitle')}\n\n${t('landing.features.contextAI.item1')}\n${t('landing.features.contextAI.item2')}\n${t('landing.features.contextAI.item3')}\n\n${t('landing.features.contextAI.accent')}`,
        },
        {
            title: t('landing.features.chrome.title'),
            text: `${t('landing.features.chrome.subtitle')}\n\n${t('landing.features.chrome.description')}\n${t('landing.features.chrome.item1')}\n${t('landing.features.chrome.item2')}\n${t('landing.features.chrome.item3')}\n\n`,
        },
        {
            title: t('landing.features.importExport.title'),
            text: `${t('landing.features.importExport.subtitle')} ${t('landing.features.importExport.description')}\n\n${t('landing.features.importExport.item1')}\n${t('landing.features.importExport.item2')}\n${t('landing.features.importExport.item3')}\n\n${t('landing.features.importExport.accent')}`,
        },
        {
            title: t('landing.features.adaptive.title'),
            text: `${t('landing.features.adaptive.subtitle')}\n${t('landing.features.adaptive.description')}\n\n${t('landing.features.adaptive.item1')}\n${t('landing.features.adaptive.item2')}\n${t('landing.features.adaptive.item3')}\n\n${t('landing.features.adaptive.accent')}`,
        },
    ];

    return (
        <>
            <StyledBox
                key={0}
            >
                <StyledHeader>
                    <StyledAIIcon>
                        <AlIcon color={'#fff'} />
                    </StyledAIIcon>
                    <StyledTitle>{features[0].title}</StyledTitle>
                </StyledHeader>
                <StyledDescription>
                    {features[0].text}
                </StyledDescription>
            </StyledBox>
            <StyledBox
                key={1}
            >
                <StyledHeader>
                    <StyledChromeIcon>
                        <ChromeIcon color={'#fff'} />
                    </StyledChromeIcon>
                    <StyledTitle>{features[1].title}</StyledTitle>
                </StyledHeader>
                <StyledDescription>
                    {features[1].text}
                    <StyledAccentLink href={`/ecosystem/${locale}/chrome_extension`}>
                        {t('landing.features.chrome.accent')}
                    </StyledAccentLink>
                </StyledDescription>
            </StyledBox>
            <StyledBox
                key={2}
            >
                <StyledHeader>
                    <StyledExcelIcon>
                        <ExcelIcon color={'#fff'} />
                    </StyledExcelIcon>
                    <StyledTitle>{features[2].title}</StyledTitle>
                </StyledHeader>
                <StyledDescription>
                    {features[2].text}
                </StyledDescription>
            </StyledBox>
            <StyledBox
                key={3}
            >
                <StyledHeader>
                    <StyledMonitorIcon>
                        <MonitorIcon color={'#fff'} />
                    </StyledMonitorIcon>
                    <StyledTitle>{features[3].title}</StyledTitle>
                </StyledHeader>
                <StyledDescription>
                    {features[3].text}
                </StyledDescription>
            </StyledBox>
        </>
    )
}