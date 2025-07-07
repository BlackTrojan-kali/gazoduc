import React, { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { usePage } from '@inertiajs/react';
import Alert from './Alert'; // Import your custom Alert component

export default function ToastProvider() {
    const { flash } = usePage().props;
    useEffect(() => {
        // Define common toast options.
        // We'll set duration here, but other visual styles will come from Alert component.
        const defaultToastOptions = {
            duration: 5000, // Message visible for 5 seconds
            position: 'top-right', // Adjust as needed
            // Importantly, we don't define 'style' or 'icon' here,
            // as our custom Alert component will handle the visual aspects.
            ariaProps: {
                role: 'status',
                'aria-live': 'polite',
            },
        };

        const showCustomToast = (variant, title, message) => {
            toast.custom((t) => (
                <div
                    // Apply react-hot-toast's default styling for position/enter/exit animations
                    // You might need to adjust these or remove them if they conflict with Alert's styles
                    className={`${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-sm w-1/2 bg-white shadow-lg rounded-lg pointer-events-auto flex  ring-opacity-5`}
                    style={{
                        // Apply specific margin or other positioning adjustments if needed
                        // For instance, a margin-bottom to stack toasts
                        marginBottom: t.visible ? '10px' : '0',
                    }}
                >
                    <Alert
                        variant={variant}
                        title={title}
                        message={message}
                        // If you want to enable links in toasts, pass showLink, linkHref, linkText here
                        // For now, disabling them for a simple notification purpose
                        showLink={false}
                    />
                </div>
            ), defaultToastOptions);
        };


        if (flash.success) {
            showCustomToast('success', 'Success!', flash.success);
        } else if (flash.error) {
            showCustomToast('error', 'Error!', flash.error);
        } else if (flash.info) {
            showCustomToast('info', 'Information:', flash.info);
        } else if (flash.warning) {
            showCustomToast('warning', 'Warning!', flash.warning);
        }
    }, [flash]); // Re-run effect when flash prop changes

    return (
        // The Toaster component is crucial for react-hot-toast to render anything.
        // It's the "portal" for your toasts.
        <Toaster />
    );
}