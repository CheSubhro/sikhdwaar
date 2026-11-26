
import { Button as MantineButton } from "@mantine/core";
import { Loader } from "@mantine/core";

function Button({
    children,
    variant = "primary",
    size = "md",
    leftIcon,
    rightIcon,
    loading = false,
    disabled = false,
    fullWidth = false,
    type = "button",
    onClick,
    className,
    ...props
}) {
    const variantStyles = {
        primary: {
            variant: "filled",
            color: "brand",
        },
        secondary: {
            variant: "filled",
            color: "gray",
        },
        outline: {
            variant: "outline",
            color: "brand",
        },
        danger: {
            variant: "filled",
            color: "red",
        },
        ghost: {
            variant: "subtle",
            color: "brand",
        },
    };

    const selectedVariant =
        variantStyles[variant] || variantStyles.primary;

    return (
        <MantineButton
            type={type}
            size={size}
            variant={selectedVariant.variant}
            color={selectedVariant.color}
            fullWidth={fullWidth}
            loading={loading}
            disabled={disabled || loading}
            leftSection={!loading ? leftIcon : undefined}
            rightSection={!loading ? rightIcon : undefined}
            loaderProps={{ type: "dots" }}
            onClick={onClick}
            className={className}
            styles={{
                root: {
                    fontFamily: "Geom, sans-serif",
                    fontWeight: 600,
                    transition: "all 180ms ease",
                },
            }}
            {...props}
        >
            {children}
        </MantineButton>
    );
}

export default Button;
