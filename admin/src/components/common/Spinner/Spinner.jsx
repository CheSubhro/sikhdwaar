

import { Center, Overlay, Stack, Text } from "@mantine/core";
import styles from "./Spinner.module.css";

function Spinner({
    size = 48,
    label,
    fullScreen = false,
    overlay = false,
    color = "#e06538",
    minHeight,
}) {
    const loader = (
        <Stack
            align="center"
            justify="center"
            gap="sm"
            style={{ minHeight: minHeight || undefined }}
        >
            <div
                className={styles.loader}
                style={{
                    width: size,
                    height: size,
                    "--spinner-color": color,
                }}
                role="status"
                aria-label={label || "Loading"}
            >
                <svg
                    viewBox="0 0 48 48"
                    className={styles.svg}
                    aria-hidden="true"
                >
                    <circle
                        className={styles.track}
                        cx="24"
                        cy="24"
                        r="19"
                    />

                    <circle
                        className={styles.progress}
                        cx="24"
                        cy="24"
                        r="19"
                    />

                    <circle
                        className={styles.innerTrack}
                        cx="24"
                        cy="24"
                        r="11"
                    />

                    <circle
                        className={styles.dot}
                        cx="24"
                        cy="24"
                        r="3"
                    />
                </svg>
            </div>

            {label && (
                <Text
                    size="sm"
                    fw={600}
                    c="dimmed"
                    style={{ fontFamily: "Geom, sans-serif" }}
                >
                    {label}
                </Text>
            )}
        </Stack>
    );

    if (fullScreen) {
        return (
            <Center className={styles.fullScreen}>
                {loader}
            </Center>
        );
    }

    if (overlay) {
        return (
            <div className={styles.overlayContainer}>
                <Overlay
                    backgroundOpacity={0.55}
                    color="#ffffff"
                    blur={1}
                    radius="md"
                />
                <Center className={styles.overlayContent}>
                    {loader}
                </Center>
            </div>
        );
    }

    return loader;
}

export default Spinner;
