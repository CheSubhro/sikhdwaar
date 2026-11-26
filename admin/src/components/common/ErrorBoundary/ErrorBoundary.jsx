

import { Component } from "react";
import { Center, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

import Button from "../Button";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError() {
        return {
            hasError: true,
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error("SikhDwaar UI Error:", error, errorInfo);

        this.props.onError?.(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false });
        this.props.onReset?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Center p="xl" mih={300}>
                    <Stack align="center" gap="md" ta="center">
                        <ThemeIcon
                            size={70}
                            radius="xl"
                            color="red"
                            variant="light"
                        >
                            <IconAlertTriangle size={36} />
                        </ThemeIcon>

                        <Text
                            size="xl"
                            fw={700}
                            style={{ fontFamily: "Geom, sans-serif" }}
                        >
                            Something went wrong!
                        </Text>

                        <Text
                            size="sm"
                            c="dimmed"
                            maw={400}
                            style={{ fontFamily: "Geom, sans-serif" }}
                        >
                            An unexpected error occurred while displaying
                            this section. Please try again.
                        </Text>

                        <Button
                            leftIcon={<IconRefresh size={16} />}
                            onClick={this.handleReset}
                        >
                            Try Again
                        </Button>
                    </Stack>
                </Center>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
