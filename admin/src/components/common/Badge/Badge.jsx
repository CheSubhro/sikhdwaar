

import { Badge as MantineBadge } from "@mantine/core";

const statusColors = {
    active: "green",
    approved: "green",
    published: "green",
    pending: "yellow",
    draft: "gray",
    rejected: "red",
    inactive: "gray",
    suspended: "red",
    featured: "brand",
};

function Badge({
    children,
    status,
    color,
    variant = "light",
    size = "md",
    ...props
}) {
    const badgeColor =
        color || statusColors[String(status || "").toLowerCase()] || "gray";

    return (
        <MantineBadge
            color={badgeColor}
            variant={variant}
            size={size}
            radius="sm"
            styles={{
                root: {
                    fontFamily: "Geom, sans-serif",
                    fontWeight: 600,
                    textTransform: "capitalize",
                },
            }}
            {...props}
        >
            {children || status}
        </MantineBadge>
    );
}

export default Badge;
