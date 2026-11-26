

import { TextInput } from "@mantine/core";

function Input({
    label,
    placeholder,
    value,
    onChange,
    type = "text",
    error,
    description,
    required = false,
    disabled = false,
    size = "md",
    ...props
}) {
    return (
        <TextInput
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            type={type}
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

export default Input;
