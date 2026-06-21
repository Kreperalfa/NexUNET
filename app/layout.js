export const metadata = {
    title: 'RedUNET',
    description: 'Proyecto RedUNET',
}

export default function RootLayout({ children }) {
    return (
    <html lang="es">
        <body>{children}</body>
    </html>
    )
}
