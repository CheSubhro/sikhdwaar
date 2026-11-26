

import { Group, Stack, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

import Modal from "../Modal";
import Button from "../Button";

function ConfirmModal({
    opened,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to continue?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
    danger = false,
}) {
    const handleConfirm = async () => {
        await onConfirm?.();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            size="sm"
        >
            <Stack gap="lg">
                <Group align="flex-start" gap="sm" wrap="nowrap">
                    <IconAlertTriangle
                        size={24}
                        color={danger ? "#e03131" : "#e06538"}
                    />

                    <Text
                        size="sm"
                        c="dimmed"
                        style={{ fontFamily: "Geom, sans-serif" }}
                    >
                        {message}
                    </Text>
                </Group>

                <Group justify="flex-end" gap="sm">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>

                    <Button
                        variant={danger ? "danger" : "primary"}
                        onClick={handleConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}

export default ConfirmModal;
