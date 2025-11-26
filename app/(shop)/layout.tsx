export const metadata = {
  title: 'Wichithra',
};

export default function ShopFrontLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>

      <header>
        <h1>header</h1>
      </header>

      <main>
        {children}
      </main>

      <footer>
        <h1>footer</h1>
      </footer>

    </div>
  );
}
