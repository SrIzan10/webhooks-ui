export default async function copyToClipboard(text: string) {
    return await navigator.clipboard.writeText(text)
}