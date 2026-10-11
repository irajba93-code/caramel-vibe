export default function ColibriLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0F0F11] text-neutral-100 antialiased selection:bg-neutral-800">
            {/* 
        This renders strictly the Colibri demo content. 
        Zero caramel-vibe headers, navbars, or footers will show here.
      */}
            <main>{children}</main>
        </div>
    );
}