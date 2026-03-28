interface ThemeConfig {
  primary: string;
  ring: string;
  secondary?: string;
  accent?: string;
  background?: string;
  foreground?: string;
  saturationRange?: [number, number];
  lightnessRange?: [number, number];
  customColors?: Record<string, string>;
}

interface CompanyTheme extends ThemeConfig {
  initials: string;
  gradient?: string;
  contrast?: string;
}

const DEFAULT_THEME: ThemeConfig = {
  primary: "221.2 50% 50%",
  ring: "221.2 50% 50%",
  secondary: "217.2 32.6% 17.5%",
  accent: "210 40% 96.1%",
  saturationRange: [40, 60],
  lightnessRange: [45, 65],
};

const generateConsistentHash = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 7) - hash + id.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

const generateThemeFromId = (
  id: string,
  config: Partial<ThemeConfig> = {},
): ThemeConfig => {
  const hash = generateConsistentHash(id);

  const saturationRange =
    config.saturationRange || DEFAULT_THEME.saturationRange!;
  const lightnessRange = config.lightnessRange || DEFAULT_THEME.lightnessRange!;

  const baseHue = hash % 360;

  const secondaryHue = (baseHue + (hash % 60) - 30) % 360;
  const accentHue = (baseHue + (hash % 90) + 180) % 360;

  const saturation =
    saturationRange[0] + (hash % (saturationRange[1] - saturationRange[0]));
  const lightness =
    lightnessRange[0] + ((hash >> 8) % (lightnessRange[1] - lightnessRange[0]));

  return {
    primary: `${baseHue} ${saturation}% ${lightness}%`,
    secondary:
      config.secondary ||
      `${secondaryHue} ${saturation - 10}% ${lightness - 8}%`,
    accent:
      config.accent || `${accentHue} ${saturation - 15}% ${lightness + 5}%`,
    ring: config.ring || `${baseHue} ${saturation}% ${lightness}%`,
    background: config.background || `${baseHue} ${saturation - 30}%`,
    foreground: config.foreground || `${baseHue} ${saturation - 20}%`,
    saturationRange,
    lightnessRange,
    customColors: {
      muted: `${baseHue} ${saturation - 20}% ${lightness - 10}%`,
      popover: `${baseHue} ${saturation - 25}% ${lightness - 5}%`,
      card: `${baseHue} ${saturation - 25}% ${lightness - 5}%`,
      border: `${baseHue} ${saturation - 35}% ${lightness - 8}%`,
      input: `${baseHue} ${saturation - 35}% ${lightness - 8}%`,
      destructive: "0 72% 51%",
      success: "142 72% 45%",
      warning: "38 92% 50%",
      info: "200 98% 45%",
      ...config.customColors,
    },
  };
};

export const getCompanyTheme = (
  companyId: string | undefined,
  defaultName: string = "",
  customConfig?: Partial<ThemeConfig>,
): CompanyTheme => {
  const generatedTheme = companyId
    ? generateThemeFromId(companyId, customConfig)
    : { ...DEFAULT_THEME, ...customConfig };

  const initials =
    defaultName
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "CO";

  const gradient = `linear-gradient(135deg, hsl(${generatedTheme.primary}), hsl(${generatedTheme.secondary || generatedTheme.primary}))`;

  const contrast = "0 0% 0%";

  return {
    initials,
    ...generatedTheme,
    gradient,
    contrast,
  };
};

export const getThemeCSSVariables = (
  theme: CompanyTheme,
): Record<string, string> => {
  return {
    "--primary": theme.primary,
    "--secondary": theme.secondary || theme.primary,
    "--accent": theme.accent || theme.primary,
    "--ring": theme.ring,
    "--background": theme.background,
    "--foreground": theme.foreground,
    "--primary-foreground": theme.contrast,
    "--secondary-foreground": theme.contrast,
    "--accent-foreground": theme.contrast,
    "--destructive": theme.customColors?.destructive || "0 72% 51%",
    "--success": theme.customColors?.success || "142 72% 45%",
    "--warning": theme.customColors?.warning || "38 92% 50%",
    "--info": theme.customColors?.info || "200 98% 45%",
    "--border":
      theme.customColors?.border ||
      `${theme.primary.split(" ")[0]} 32.6% 17.5%`,
    "--input":
      theme.customColors?.input || `${theme.primary.split(" ")[0]} 32.6% 17.5%`,
    "--muted":
      theme.customColors?.muted || `${theme.primary.split(" ")[0]} 32.6% 17.5%`,
    "--muted-foreground": theme.contrast,
  };
};

export const applyCompanyTheme = (theme: CompanyTheme): void => {
  const root = document.documentElement;
  const cssVariables = getThemeCSSVariables(theme);

  Object.entries(cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};
