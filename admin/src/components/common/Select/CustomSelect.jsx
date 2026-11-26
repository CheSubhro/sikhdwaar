
import { Select as MantineSelect } from "@mantine/core";

function CustomSelect({
    label,
    placeholder = "Select an option",
    data = [],
    value,
    onChange,
    error,
    description,
    required = false,
    disabled = false,
    searchable = false,
    clearable = false,
    size = "md",
    ...props
}) {
    return (
        <MantineSelect
            label={label}
            placeholder={placeholder}
            data={data}
            value={value}
            onChange={onChange}
            error={error}
            description={description}
            required={required}
            disabled={disabled}
            searchable={searchable}
            clearable={clearable}
            size={size}
            radius="md"
            withAsterisk={required}
            nothingFoundMessage="No options found"
            styles={{
                label: {
                    fontFamily: "Geom, sans-serif",
                    fontWeight: 600,
                    marginBottom: 6,
                },
                input: {
                    fontFamily: "Geom, sans-serif",
                    borderColor: "#dce1e7",
                },
                dropdown: {
                    fontFamily: "Geom, sans-serif",
                },
                option: {
                    fontFamily: "Geom, sans-serif",
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

export default CustomSelect;
