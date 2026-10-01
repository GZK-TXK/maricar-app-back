export const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")

export const stripNewlines = (value = "") => String(value).replace(/[\r\n]+/g, " ").trim()

export const formatDate = (value) => new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
})

export const formatPrice = (value) => `${Number(value).toFixed(2)} €`