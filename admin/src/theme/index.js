
import { createTheme, rem } from "@mantine/core";

export const theme = createTheme({
    primaryColor: "brand",
    primaryShade: 6,

    fontFamily: "Geom, sans-serif",

    headings: {
        fontFamily: "Geom, sans-serif",
        fontWeight: "600",
    },

    defaultRadius: "md",

    spacing: {
        xs: rem(8),
        sm: rem(12),
        md: rem(16),
        lg: rem(24),
        xl: rem(32),
    },

    colors: {
        brand: [
            "#fff1eb",
            "#ffe0d4",
            "#ffc1a9",
            "#ffa17e",
            "#f7835a",
            "#e97549",
            "#e06538",
            "#c65329",
            "#a94320",
            "#8c351b",
        ],
    },
});
