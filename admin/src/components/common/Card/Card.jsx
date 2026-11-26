

import { Card as MantineCard } from "@mantine/core";

function Card({
    children,
    title,
    subtitle,
    action,
    padding = "lg",
    shadow = "xs",
    ...props
}) {
    return (
        <MantineCard
            padding={padding}
            radius="lg"
            shadow={shadow}
            withBorder
            styles={{
                root: {
                    fontFamily: "Geom, sans-serif",
                    borderColor: "#e5e7eb",
                    backgroundColor: "#ffffff",
                },
            }}
            {...props}
        >
            {(title || subtitle || action) && (
                <MantineCard.Section
                    inheritPadding
                    py="md"
                    withBorder
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <div>
                            {title && (
                                <div
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: "#1f2937",
                                    }}
                                >
                                    {title}
                                </div>
                            )}

                            {subtitle && (
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: "#6b7280",
                                        marginTop: 4,
                                    }}
                                >
                                    {subtitle}
                                </div>
                            )}
                        </div>

                        {action}
                    </div>
                </MantineCard.Section>
            )}

            {children}
        </MantineCard>
    );
}

export default Card;
