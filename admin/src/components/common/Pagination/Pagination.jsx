

import { Pagination as MantinePagination, Group, Text } from "@mantine/core";

function Pagination({
    total = 1,
    value = 1,
    onChange,
    siblings = 1,
    boundaries = 1,
    size = "md",
    showInfo = false,
    totalRecords,
    pageSize,
    ...props
}) {
    const startRecord =
        totalRecords > 0 && pageSize
            ? (value - 1) * pageSize + 1
            : 0;

    const endRecord =
        totalRecords > 0 && pageSize
            ? Math.min(value * pageSize, totalRecords)
            : 0;

    return (
        <Group
            justify="space-between"
            align="center"
            gap="md"
            wrap="wrap"
        >
            {showInfo && (
                <Text
                    size="sm"
                    c="dimmed"
                    style={{ fontFamily: "Geom, sans-serif" }}
                >
                    Showing {startRecord}–{endRecord} of {totalRecords || 0}
                </Text>
            )}

            <MantinePagination
                total={Math.max(1, total)}
                value={value}
                onChange={onChange}
                siblings={siblings}
                boundaries={boundaries}
                size={size}
                radius="md"
                color="brand"
                withEdges
                styles={{
                    control: {
                        fontFamily: "Geom, sans-serif",
                        fontWeight: 600,
                    },
                }}
                {...props}
            />
        </Group>
    );
}

export default Pagination;
