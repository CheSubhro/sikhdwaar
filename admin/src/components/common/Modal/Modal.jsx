

import { Modal as MantineModal } from "@mantine/core";

function Modal({
    opened,
    onClose,
    title,
    children,
    size = "lg",
    centered = true,
    closeOnClickOutside = false,
    ...props
}) {
    return (
        <MantineModal
            opened={opened}
            onClose={onClose}
            title={title}
            size={size}
            centered={centered}
            closeOnClickOutside={closeOnClickOutside}
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 2,
            }}
            radius="lg"
            styles={{
                title: {
                    fontFamily: "Geom, sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                },
                body: {
                    fontFamily: "Geom, sans-serif",
                },
                header: {
                    borderBottom: "1px solid #e5e7eb",
                },
            }}
            {...props}
        >
            {children}
        </MantineModal>
    );
}

export default Modal;
