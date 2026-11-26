

import { Tooltip as MantineTooltip } from "@mantine/core";

function Tooltip({
    children,
    label,
    position = "top",
    withArrow = true,
    openDelay = 300,
    disabled = false,
    ...props
}) {
    return (
        <MantineTooltip
            label={label}
            position={position}
            withArrow={withArrow}
            openDelay={openDelay}
            disabled={disabled}
            color="dark"
            styles={{
                tooltip: {
                    fontFamily: "Geom, sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                },
            }}
            {...props}
        >
            {children}
        </MantineTooltip>
    );
}

export default Tooltip;
