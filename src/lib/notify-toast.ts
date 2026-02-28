/**
 * Notification-aware toast wrapper.
 * 
 * Drop-in replacement for `import { toast } from 'sonner'`.
 * Every call also stores the notification in localStorage so
 * the wallet Notifications panel can display it.
 */
import { toast as sonnerToast, ExternalToast } from 'sonner';
import { pushNotification } from '@/components/wallet/WalletPopup';

function extractDescription(opts?: ExternalToast): string | undefined {
    if (!opts) return undefined;
    if (typeof opts.description === 'string') return opts.description;
    return undefined;
}

export const notifyToast = {
    success(message: string, opts?: ExternalToast) {
        pushNotification('success', message, extractDescription(opts));
        return sonnerToast.success(message, opts);
    },
    error(message: string, opts?: ExternalToast) {
        pushNotification('error', message, extractDescription(opts));
        return sonnerToast.error(message, opts);
    },
    info(message: string, opts?: ExternalToast) {
        pushNotification('info', message, extractDescription(opts));
        return sonnerToast.info(message, opts);
    },
    warning(message: string, opts?: ExternalToast) {
        pushNotification('warning', message, extractDescription(opts));
        return sonnerToast.warning(message, opts);
    },
};
