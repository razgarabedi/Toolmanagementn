export const getImageUrl = (path?: string) => {
    if (!path) {
        return null;
    }
    if (path.startsWith('http') || path.startsWith('/')) {
        return path;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/${path.replace(/\\/g, '/')}`;
}; 