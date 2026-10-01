export const getPagination = (query = {}) => {
    const { page: pageParam, limit: limitParam } = query
    const paginate = pageParam !== undefined || limitParam !== undefined
    const page = Math.max(1, parseInt(pageParam, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(limitParam, 10) || 10))
    return { paginate, page, limit }
}

export const buildPagination = (page, limit, total) => ({
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
})

export const noPagination = (count) => ({
    page: 1,
    limit: count,
    total: count,
    totalPages: 1,
})