
import { PasswordInput as MantinePasswordInput } from "@mantine/core";

function PasswordInput({
    label = "Password",
    placeholder = "Enter password",
    value,
    onChange,
    error,
    description,
    required = false,
    disabled = false,
    size = "md",
    ...props
}) {
    return (
        <MantinePasswordInput
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            error={error}
            description={description}
            required={required}
            disabled={disabled}
            size={size}
            radius="md"
            withAsterisk={required}
            styles={{
                label: {
                    fontFamily: "Geom, sans-serif",
                    fontWeight: 600,
                    marginBottom: 6,
                },
                input: {
                    fontFamily: "Geom, sans-serif",
                    borderColor: "#dce1e7",
                    transition: "all 180ms ease",
                },
                innerInput: {
                    fontFamily: "Geom, sans-serif",
                },
                visibilityToggle: {
                    color: "#e06538",
                },
                description: {
                    fontFamily: "Geom, sans-serif",
                },
                error: {
                    fontFamily: "Geom, sans-serif",
                },
            }}
            {...props}
        />
    );
}

export default PasswordInput;
