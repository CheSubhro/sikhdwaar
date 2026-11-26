
import { Textarea as MantineTextarea } from "@mantine/core";

function Textarea({
    label,
    placeholder,
    value,
    onChange,
    error,
    description,
    required = false,
    disabled = false,
    minRows = 3,
    maxRows = 8,
    autosize = true,
    size = "md",
    ...props
}) {
    return (
        <MantineTextarea
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            error={error}
            description={description}
            required={required}
            disabled={disabled}
            minRows={minRows}
            maxRows={maxRows}
            autosize={autosize}
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

export default Textarea;
