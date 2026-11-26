

import { Stack, Text, ThemeIcon } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";

function EmptyState({
    icon,
    title = "No Data Found",
    description = "There is nothing to display here yet.",
    action,
    minHeight = 260,
}) {
    return (
        <Stack
            align="center"
            justify="center"
            gap="sm"
            ta="center"
            p="xl"
            style={{
                minHeight,
                fontFamily: "Geom, sans-serif",
            }}
        >
            <ThemeIcon
                size={76}
                radius="xl"
                variant="light"
                color="brand"
            >
                {icon || <IconInbox size={38} stroke={1.5} />}
            </ThemeIcon>

            <Text
                size="lg"
                fw={700}
                c="dark.7"
            >
                {title}
            </Text>

            <Text
                size="sm"
                c="dimmed"
                maw={380}
            >
                {description}
            </Text>

            {action && (
                <div style={{ marginTop: 8 }}>
                    {action}
                </div>
            )}
        </Stack>
    );
}

export default EmptyState;
