import { useToast } from 'primevue/usetoast';

export const useToastNotifications = () => {

    const toast = useToast()

    const showToast = (severity, summary, detail, life = 3000) => toast.add({ severity, summary, detail, life })

    const showSuccessToast = (summary, detail, life) => showToast('success', summary, detail, life)

    const showErrorToast = (summary, detail, life) => showToast('error', summary, detail, life)

    const showInfoToast = (summary, detail, life) => showToast('info', summary, detail, life)

    const showWarnToast = (summary, detail, life) => showToast('warn', summary, detail, life)

    return { showSuccessToast, showErrorToast, showInfoToast, showWarnToast }
}
